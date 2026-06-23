"use client";

import { ReactNode, useState } from "react";
import Nav from "@/components/sidenav";
import ScreenGuard from "@/components/screen-guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarCollapse, setSidebarCollapse] = useState(true);
  const isSidebarCollapsible = (is: boolean) => {
    setSidebarCollapse(is);
  };

  return (
    <div className="antialiased">
      <ScreenGuard />
      <Nav isSidebarCollapsible={isSidebarCollapsible} />
      <div
        className={`min-h-screen dark:bg-black ${isSidebarCollapse ? "pl-18" : "pl-56"
          }`}
      >
        {children}
      </div>
    </div>
  );
}
