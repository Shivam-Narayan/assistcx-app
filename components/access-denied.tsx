"use client";
import { Button } from "@/components/ui/button";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { LOGIN } from "@/lib/urls";
import { Loader2, TriangleAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import { successMessageHandler } from "@/helper/helper-function";
import { useState } from "react";

export default function AccessDeniedPage() {
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logoutUser = async () => {
    if (!loading && !isLoggingOut) {
      setIsLoggingOut(true);
      try {
        const result = await axiosAuth.post(url.LOGOUT);
        if (result?.status === 200) {
          successMessageHandler(messages.logout_successfully);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.removeItem("teams_auth_done");
          signOut({ callbackUrl: LOGIN });
        }, 100);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-screen p-4 mx-auto justify-center gap-8 xl:w-4/5">
      <div className="relative">
        <div className="relative bg-linear-to-br from-primary/10 to-primary/5 p-6 rounded-2xl border border-primary/20">
          <TriangleAlert
            strokeWidth={1.5}
            className="md:w-12 md:h-12 w-8 h-8 text-red-500 animate-pulse"
          />
        </div>
      </div>

      <div className="text-center space-y-2 max-w-xl">
        <h1 className="md:text-4xl text-xl leading-normal font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Access Required
        </h1>
        <p className="md:text-lg text-sm text-muted-foreground leading-relaxed">
          You do not have permission to view this page. Please contact your
          administrator for access.
        </p>
      </div>

      <div className="flex justify-center items-center">
        <Button
          className="cursor-pointer"
          onClick={logoutUser}
          disabled={isLoggingOut}
        >
          {isLoggingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <span className="text-lg">Logout</span>
        </Button>
      </div>
    </div>
  );
}
