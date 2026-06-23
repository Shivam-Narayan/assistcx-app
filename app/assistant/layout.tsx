"use client";
import { AppSidebar } from "@/components/assistant/app-sidebar";
import ChatResetGuard from "@/components/assistant/chat-reset-guard";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/lib/hook/useMobile";

import { AlignJustify } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarCollapse, setSidebarCollapse] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if device is mobile
  const isMobile = useIsMobile(); // Use the custom hook

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setSidebarCollapse(!isSidebarCollapse);
    }
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      <main className="antialiased h-full w-full flex flex-row bg-muted">
        {/* Mobile overlay */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={handleOverlayClick}
          />
        )}
        {/* Sidebar - always render but positioned differently on mobile */}
        <AppSidebar
          isSidebarCollapse={isSidebarCollapse}
          setSidebarCollapse={setSidebarCollapse}
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          onToggle={handleSidebarToggle}
        />
        <div
          className={`h-dvh flex-1 flex flex-col grow md:py-2 md:pr-2 transition-all duration-300 ${
            isMobile ? "w-full" : ""
          }`}
        >
          {isMobile && (
            <div className="fixed top-0 bg-white left-0 right-0 flex items-center justify-between px-4 py-2.5 border-b border-border z-10 md:hidden">
              <Button
                onClick={handleSidebarToggle}
                className="rounded-lg cursor-pointer bg-muted text-foreground hover:bg-primary/20"
                aria-label="Toggle sidebar"
              >
                <AlignJustify className="w-5 h-5" />
              </Button>
              <Link href="/" className="flex items-center">
                <Image
                  src="/icon.svg"
                  priority={false}
                  width={20}
                  height={20}
                  sizes="100vh"
                  alt="Logo"
                  className="h-7 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-ring"
                />
                <Image
                  src="/logo.svg"
                  priority={false}
                  width={100}
                  height={20}
                  sizes="100vh"
                  alt="Logo Text"
                  className="ml-2 h-7 w-auto"
                />
              </Link>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          )}
          <div className="bg-background flex-1 z-5 overflow-y-auto md:shadow-sm md:rounded-lg">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
