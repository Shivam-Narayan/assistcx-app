import axios, { AxiosRequestConfig } from "axios";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRefreshToken } from "./useRefreshToken";

export const axiosAuth = axios.create({
  headers: { "Content-Type": "application/json" },
});

// Cache for the current session token
let currentAccessToken: string | null = null;
// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue for failed requests waiting for token refresh
let failedRequestsQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: AxiosRequestConfig;
}> = [];
// Flag to track if logout is in progress
let isLoggingOut = false;

const useAxiosAuth = () => {
  const { data: session } = useSession();
  const refreshToken = useRefreshToken();
  const [loading, setLoading] = useState(true);
  const backendUrl = useSelector(
    (state: RootState) => state.configReducer.backendUrl
  );

  useEffect(() => {
    if (!backendUrl || !session) {
      setLoading(true);
      return;
    }

    // Server-side refresh failed — sign out immediately
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login", redirect: true });
      return;
    }

    // Reset logout flag on valid session (e.g., after re-login)
    isLoggingOut = false;

    const requestIntercept = axiosAuth.interceptors.request.use(
      (config) => {
        // Cancel request if logout is in progress
        if (isLoggingOut) {
          const cancelError = new axios.Cancel("Logout in progress");
          return Promise.reject(cancelError);
        }

        // Use cached token if available, otherwise get from session
        if (!currentAccessToken && session?.user?.accessToken) {
          currentAccessToken = session.user.accessToken;
        }

        if (currentAccessToken) {
          config.headers["Authorization"] = `Bearer ${currentAccessToken}`;
          config.headers["ngrok-skip-browser-warning"] = "true";
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosAuth.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        // Ignore cancelled requests
        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        // If already logging out, reject immediately
        if (isLoggingOut) {
          return Promise.reject(new Error("Authentication session ended"));
        }

        if (error?.response?.status === 401 && !prevRequest?._retry) {
          prevRequest._retry = true;

          if (!isRefreshing) {
            isRefreshing = true;
            currentAccessToken = null;

            try {
              const result = await refreshToken();
              currentAccessToken = result.access_token;

              isRefreshing = false;

              // Retry all queued requests with the new token
              const queuedRequests = [...failedRequestsQueue];
              failedRequestsQueue = [];

              queuedRequests.forEach(({ resolve, config }) => {
                config.headers = config.headers || {};
                config.headers["Authorization"] = `Bearer ${currentAccessToken}`;
                resolve(axiosAuth(config));
              });

              // Retry the original request
              prevRequest.headers["Authorization"] = `Bearer ${currentAccessToken}`;
              return axiosAuth(prevRequest);
            } catch (refreshError) {
              isRefreshing = false;
              isLoggingOut = true;
              currentAccessToken = null;

              // Reject all queued requests
              failedRequestsQueue.forEach(({ reject }) => {
                reject(new Error("Authentication session ended"));
              });
              failedRequestsQueue = [];

              console.error("Token refresh failed:", refreshError);

              // Sign out immediately
              signOut({ callbackUrl: "/login", redirect: true });

              return Promise.reject(new Error("Authentication session ended"));
            }
          } else {
            // If refresh is already in progress, queue this request
            return new Promise((resolve, reject) => {
              failedRequestsQueue.push({
                resolve,
                reject,
                config: prevRequest,
              });
            });
          }
        }

        return Promise.reject(error);
      }
    );

    axiosAuth.defaults.baseURL = backendUrl;
    setLoading(false);

    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
      axiosAuth.interceptors.response.eject(responseIntercept);
      setLoading(true);
    };
  }, [session, backendUrl, refreshToken]);


  return { axiosAuth, loading };
};

export default useAxiosAuth;
