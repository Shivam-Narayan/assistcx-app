"use client";

import { decodeJWT, getFirstAvailableRoute } from "@/proxy";
import { DASHBOARD } from "@/lib/urls";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  user_not_found: "Account not found. Contact your administrator for access.",
  email_mismatch: "Email mismatch. Please try again.",
  sso_not_configured: "SSO is not configured for your organization.",
  invalid_state: "Sign-in session expired. Please try again.",
  token_exchange_failed: "Sign-in failed. Please try again.",
  account_inactive: "Your account is inactive. Contact your administrator.",
  no_email: "Could not retrieve email from identity provider.",
  sso_exchange_failed: "Sign-in failed. Please try again.",
};

export default function SSOCompleteHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const processedRef = useRef(false);

  const code = params?.get("code");
  const error = params?.get("error");

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    if (error) {
      const message =
        ERROR_MESSAGES[error] || "Sign-in failed. Please try again.";
      router.push(`/login?error=${encodeURIComponent(message)}`);
      return;
    }

    if (!code) {
      router.push("/login");
      return;
    }

    signIn("credentials", { sso_code: code, redirect: false }).then(
      (result) => {
        if (result?.ok) {
          fetch("/api/auth/session")
            .then((res) => res.json())
            .then((session) => {
              if (session?.user?.accessToken) {
                const decoded = decodeJWT(session.user.accessToken);
                const accessControl: string[] =
                  decoded["access_control"] || [];
                router.push(getFirstAvailableRoute(accessControl, decoded));
              } else {
                router.push(DASHBOARD);
              }
            });
        } else {
          router.push(
            `/login?error=${encodeURIComponent(ERROR_MESSAGES.sso_exchange_failed)}`,
          );
        }
      },
    );
  }, [code, error, router]);

  return (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Signing in...</p>
    </div>
  );
}
