import { getSession, signOut, useSession } from "next-auth/react";
import { useCallback } from "react";

let refreshTokenPromise: Promise<any> | null = null;

export const useRefreshToken = () => {
  const { update } = useSession();

  const refreshToken = useCallback(async () => {
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }

    refreshTokenPromise = (async () => {
      try {
        // Re-fetch session — this triggers the JWT callback which
        // handles server-side token refresh automatically.
        const refreshedSession = await getSession();

        // If server-side refresh failed, session will have an error
        if (refreshedSession?.error === "RefreshAccessTokenError") {
          throw new Error("Server-side token refresh failed");
        }

        if (!refreshedSession?.user?.accessToken) {
          throw new Error("No access token after session refresh");
        }

        return {
          access_token: refreshedSession.user.accessToken,
          refresh_token: refreshedSession.user.refreshToken,
        };
      } catch (error) {
        console.error("Token refresh failed:", error);
        await signOut({ callbackUrl: "/login", redirect: true });
        throw error;
      }
    })().finally(() => {
      queueMicrotask(() => {
        refreshTokenPromise = null;
      });
    });

    return refreshTokenPromise;
  }, [update]);

  return refreshToken;
};
