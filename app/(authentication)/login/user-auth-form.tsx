"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DASHBOARD } from "@/lib/urls";
import { decodeJWT, getFirstAvailableRoute } from "@/proxy";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

const PROVIDER_ICONS: Record<string, string> = {
  microsoft: "/microsoft.svg",
  google: "/google.svg",
};

const toastStyle = {
  borderRadius: "10px",
  background: "#333",
  color: "#fff",
};

const emailSchema = z.object({
  email: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(1, "Email address is required")
        .email("Enter a valid email address"),
    ),
});

const passwordSchema = z.object({
  password: z.string().nonempty("Password is required"),
});

type AuthStep =
  | "email"
  | "discovering"
  | "password"
  | "sso_redirect"
  | "flexible";

interface DiscoverResult {
  auth_method: "password" | "sso" | "flexible";
  sso_provider?: string;
  sso_provider_name?: string;
}

// Detect iframe synchronously to avoid login page flash
const isInIframe = typeof window !== "undefined" && window.self !== window.top;

const UserAuthForm = () => {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [discoverResult, setDiscoverResult] = useState<DiscoverResult | null>(
    null,
  );
  const [passwordShow, setPasswordShow] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");
  const [isTeamsAuth, setIsTeamsAuth] = useState(isInIframe);
  const teamsAttemptedRef = useRef(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || DASHBOARD;
  const errorParam = searchParams?.get("error");

  // Load backend URL from config.json (same pattern as Providers.tsx)
  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((config) => setBackendUrl(config.BACKEND_URL))
      .catch(() => {});
  }, []);

  // Teams silent auth — detect if running inside Teams and authenticate automatically
  useEffect(() => {
    if (teamsAttemptedRef.current) return;
    teamsAttemptedRef.current = true;

    // Prevent auth loop — if we already completed Teams auth, don't retry
    if (sessionStorage.getItem("teams_auth_done")) {
      console.log("[TeamsSSO] Already authenticated, skipping");
      return;
    }

    let cancelled = false;

    async function tryTeamsAuth() {
      try {
        if (!isInIframe) return;

        console.log("[TeamsSSO] Step 1: importing SDK");
        const microsoftTeams = await import("@microsoft/teams-js");

        console.log("[TeamsSSO] Step 2: calling initialize()");
        await microsoftTeams.app.initialize();
        console.log("[TeamsSSO] Step 3: initialized OK");
        console.log("[TeamsSSO] Step 4: calling getAuthToken()...");
        const tokenPromise = microsoftTeams.authentication.getAuthToken();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("getAuthToken() timed out after 10s")),
            10000,
          ),
        );

        let teamsToken: string;
        try {
          teamsToken = await Promise.race([tokenPromise, timeoutPromise]);
        } catch (tokenError) {
          console.error("[Teams Auth] 5. getAuthToken() FAILED:", tokenError);
          if (!cancelled) setIsTeamsAuth(false);
          return;
        }

        console.log("[Teams Auth] 5. Got token, length:", teamsToken?.length);

        // Only show loading spinner AFTER we have the token
        if (!cancelled) setIsTeamsAuth(true);

        console.log("[Teams Auth] 6. Calling signIn with teams_token...");
        const result: any = await signIn("credentials", {
          teams_token: teamsToken,
          redirect: false,
        });
        console.log("[Teams Auth] 7. signIn result:", JSON.stringify(result));

        if (result?.ok) {
          const sessionRes = await fetch("/api/auth/session");
          const session = await sessionRes.json();
          console.log("[Teams Auth] 8. Session data:", JSON.stringify(session));
          if (session?.user?.accessToken) {
            const decoded = decodeJWT(session.user.accessToken);
            const accessControl: string[] = decoded["access_control"] || [];
            const route = getFirstAvailableRoute(accessControl, decoded);
            console.log("[Teams Auth] 9. Success — redirecting to:", route);
            sessionStorage.setItem("teams_auth_done", "true");
            window.location.href = route || "/";
            return;
          }
        }

        console.log(
          "[Teams Auth] 8. Auth failed — session missing accessToken",
        );
        if (!cancelled) setIsTeamsAuth(false);
      } catch (error) {
        console.error("[Teams Auth] Error:", error);
        if (!cancelled) setIsTeamsAuth(false);
      }
    }

    tryTeamsAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Handle error from SSO redirect or query param
  useEffect(() => {
    if (errorParam) {
      toast.error(errorParam, { style: toastStyle });
    }
  }, [errorParam]);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
    mode: "onChange",
  });

  const handleDiscover = async (values: z.infer<typeof emailSchema>) => {
    const trimmedEmail = values.email.toLowerCase();
    setEmail(trimmedEmail);
    setStep("discovering");

    try {
      const res = await fetch(`${backendUrl}/auth/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!res.ok) {
        toast.error(
          "Account not found. Contact your administrator for access.",
          {
            style: toastStyle,
          },
        );
        setStep("email");
        return;
      }

      const data: DiscoverResult = await res.json();
      setDiscoverResult(data);

      if (data.auth_method === "sso") {
        setStep("sso_redirect");
        // Auto-redirect to backend SSO authorize endpoint
        window.location.href = `${backendUrl}/auth/sso/authorize?provider=${data.sso_provider}&email=${encodeURIComponent(trimmedEmail)}`;
      } else if (data.auth_method === "flexible") {
        setStep("flexible");
      } else {
        setStep("password");
      }
    } catch {
      toast.error("Something went wrong. Please try again.", {
        style: toastStyle,
      });
      setStep("email");
    }
  };

  const handlePasswordLogin = async (
    values: z.infer<typeof passwordSchema>,
  ) => {
    setLoading(true);

    try {
      const result: any = await signIn("credentials", {
        email: email.trim(),
        password: values.password.trim(),
        redirect: false,
      });

      if (result.status === 200) {
        toast.success("Logged in successfully", { style: toastStyle });
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.accessToken) {
          const decodeToken = decodeJWT(sessionData.user.accessToken);
          const accessControl: string[] = decodeToken["access_control"] || [];
          const defaultRedirectUrl = getFirstAvailableRoute(
            accessControl,
            decodeToken,
          );
          const finalRedirectUrl =
            callbackUrl === "/" || callbackUrl === DASHBOARD
              ? defaultRedirectUrl
              : callbackUrl;
          router.push(finalRedirectUrl);
        }
      } else {
        toast.error("Invalid Credentials", { style: toastStyle });
      }
    } catch {
      toast.error("Something went wrong. Please try again.", {
        style: toastStyle,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSSORedirect = useCallback(() => {
    if (!discoverResult?.sso_provider || !backendUrl) return;
    window.location.href = `${backendUrl}/auth/sso/authorize?provider=${discoverResult.sso_provider}&email=${encodeURIComponent(email)}`;
  }, [discoverResult, backendUrl, email]);

  const handleBack = () => {
    setStep("email");
    setDiscoverResult(null);
    passwordForm.reset();
  };

  // Teams silent auth in progress
  if (isTeamsAuth) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Signing in to Teams...</p>
      </div>
    );
  }

  return (
    <AlertDialog>
      <div className="grid gap-6">
        {/* Email step */}
        {(step === "email" || step === "discovering") && (
          <div className="grid gap-2">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleDiscover)}>
                <div className="space-y-3 pb-3">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter email address"
                            {...field}
                            maxLength={120}
                            autoFocus={false}
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={step === "discovering"}
                  className="cursor-pointer w-full bg-black text-white hover:bg-black/90 disabled:bg-black/50"
                >
                  {step === "discovering" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Continue
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* SSO redirect step */}
        {step === "sso_redirect" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Redirecting to{" "}
              {discoverResult?.sso_provider_name || "SSO provider"}...
            </p>
          </div>
        )}

        {/* Password step (or both) */}
        {(step === "password" || step === "flexible") && (
          <div className="grid gap-4">
            {/* Email chip with back button */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0 ml-3"
              >
                <ArrowLeft size={12} />
                Change
              </button>
            </div>

            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)}>
                <div className="space-y-3 pb-3">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Password
                        </FormLabel>
                        <div className="relative flex group">
                          <FormControl>
                            <Input
                              type={passwordShow ? "text" : "password"}
                              placeholder="Enter password"
                              maxLength={120}
                              {...field}
                              autoComplete="off"
                              autoFocus
                            />
                          </FormControl>
                          <div
                            className="absolute right-0 p-2 cursor-pointer text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              setPasswordShow(!passwordShow);
                            }}
                          >
                            {!passwordShow ? (
                              <Eye size={20} />
                            ) : (
                              <EyeOff size={20} />
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex w-full font-medium justify-end pb-3 cursor-pointer hover:underline">
                  <AlertDialogTrigger asChild>
                    <h3>Forgot Password</h3>
                  </AlertDialogTrigger>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer w-full bg-black text-white hover:bg-black/90 disabled:bg-black/50"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign in
                </Button>
              </form>
            </Form>

            {step === "flexible" && discoverResult?.sso_provider_name && (
              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>
            )}

            {step === "flexible" && discoverResult?.sso_provider_name && (
              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                onClick={handleSSORedirect}
              >
                {discoverResult?.sso_provider &&
                PROVIDER_ICONS[discoverResult.sso_provider] ? (
                  <Image
                    src={PROVIDER_ICONS[discoverResult.sso_provider]}
                    alt={discoverResult.sso_provider_name}
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Sign in with {discoverResult.sso_provider_name}
              </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialogContent className="gap-2">
        <AlertDialogHeader>
          <AlertDialogTitle>Forgot Password</AlertDialogTitle>
          <AlertDialogDescription>
            Please contact your system administrator for further assistance in
            resetting your password and account access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserAuthForm;
