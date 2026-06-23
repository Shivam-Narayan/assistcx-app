"use client";

import ChatResetGuard from "@/components/assistant/chat-reset-guard";
import { setBackendUrl } from "@/redux/config/config-slice";
import { ReduxProvider } from "@/redux/provider";
import { store } from "@/redux/store";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
}

const Providers = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadBackendConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        store.dispatch(setBackendUrl(config.BACKEND_URL));
      } catch (error) {
        console.error("Failed to load backend URL configuration", error);
      }
    };

    // Load config and set mounted state
    loadBackendConfig().finally(() => {
      setMounted(true);
    });
  }, []);

  // Prevent hydration issues by not rendering anything until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ReduxProvider>
      <SessionProvider refetchInterval={2 * 60} refetchOnWindowFocus={true}>
        <ChatResetGuard />
        {children}
      </SessionProvider>
    </ReduxProvider>
  );
};

export default Providers;
