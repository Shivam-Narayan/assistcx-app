"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut, getSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";

const CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes
const REFRESH_TIMEOUT = 5000;

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { status, update } = useSession();
  const backendUrl = useSelector(
    (state: RootState) => state.configReducer.backendUrl
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run for authenticated users with backend URL
    if (status !== "authenticated" || !backendUrl) {
      return;
    }

    const checkSession = async () => {
      try {
        const currentSession = await getSession();
        if (!currentSession?.user?.accessToken) {
          return;
        }

        // Call /token API to validate session
        const response = await axios.post(
          `${backendUrl}/token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${currentSession.user.accessToken}`,
              "Content-Type": "application/json",
            },
            timeout: REFRESH_TIMEOUT,
          }
        );

        const { access_token, refresh_token, user_uuid } = response.data;

        if (access_token && refresh_token) {
          // Update session with new tokens
          await update({
            user: {
              ...currentSession.user,
              id: user_uuid,
              accessToken: access_token,
              refreshToken: refresh_token,
            },
          });
        }
      } catch (error) {
        // Token check failed - logout
        console.error("Session check failed, logging out...");
        await signOut({ callbackUrl: "/login", redirect: true });
      }
    };

    // Start interval
    intervalRef.current = setInterval(checkSession, CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, backendUrl, update]);

  return <>{children}</>;
};

