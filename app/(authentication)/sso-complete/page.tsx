import { Suspense } from "react";
import { Metadata } from "next";
import SSOCompleteHandler from "./sso-complete";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Signing in...",
};

export default function SSOCompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Signing in...</p>
          </div>
        }
      >
        <SSOCompleteHandler />
      </Suspense>
    </div>
  );
}
