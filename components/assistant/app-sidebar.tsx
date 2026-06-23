"use client";
import { DASHBOARD, PROFILE } from "@/lib/assistant-urls";

import {
  CircleArrowRight01Icon,
  DashboardSquare01Icon,
  Logout01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { useSidebar } from "@/lib/hook/useSidebar";
import { SidebarTooltip } from "./sidebar-tooltip";
import { NavProps } from "./types";

export function AppSidebar({
  isSidebarCollapse,
  setSidebarCollapse,
  isMobile = false,
  isSidebarOpen = false,
  onToggle,
}: NavProps) {
  const {
    sidebarPosition,
    sidebarWidth,
    mobileShadow,
    isCollapsed,
    tabs,
    initials,
    isSessionReady,
    assistantOnlyUser,
    router,
    logoutUser,
    resetChatState,
    segments,
    pathname,
  } = useSidebar({ isMobile, isSidebarCollapse, isSidebarOpen });

  return (
    <>
      <div
        className={`${sidebarPosition} ${sidebarWidth} ${mobileShadow} flex min-h-dvh z-50 md:z-0 h-full flex-col bg-muted p-4 transition-all duration-300 will-change-transform dark:border-border dark:bg-muted`}
      >
        {/* Logo section */}
        <div
          className={`flex items-center rounded-lg px-1 py-1.5 ${
            isCollapsed ? "justify-center" : "justify-between"
          } relative`}
        >
          <div className={`flex items-center ${isCollapsed ? "mx-auto" : ""}`}>
            <Link href={`${DASHBOARD}`} className="flex items-center">
              <Image
                src="/icon.svg"
                priority={false}
                width={20}
                height={20}
                sizes="100vh"
                alt="Logo"
                className="h-7 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-ring"
              />
              {(!isSidebarCollapse || isMobile) && (
                <Image
                  src="/logo.svg"
                  priority={false}
                  width={100}
                  height={20}
                  sizes="100vh"
                  alt="Logo Text"
                  className="ml-2 h-7 w-auto"
                />
              )}
            </Link>
          </div>

          {isMobile && (
            <button
              onClick={onToggle}
              className="absolute top-2 right-0 p-1 rounded-lg hover:bg-border"
              aria-label="Close sidebar"
              aria-expanded={isSidebarOpen}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <div
          className={`flex flex-col mt-4 ${
            isSidebarCollapse ? "gap-3" : "gap-2"
          }`}
        >
          <div className="grid gap-2">
            {tabs.map(({ name, href, isActive, icon }) => (
              <Link
                key={name}
                href={href}
                className={`flex items-center space-x-3 group relative rounded-lg px-2 py-2 transition-all duration-150 ease-in-out hover:bg-border active:bg-border dark:text-white dark:hover:bg-border dark:active:bg-border ${
                  isActive
                    ? "cursor-pointer bg-primary/10 text-primary hover:bg-primary/10 active:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/10 dark:active:bg-primary/10"
                    : "text-foreground/80"
                } ${isCollapsed ? "justify-center" : ""}`}
                onClick={() => {
                  if (href === DASHBOARD) {
                    resetChatState();
                  }
                  isMobile && onToggle?.();
                }}
                aria-label={name}
              >
                <SidebarTooltip
                  collapsed={isCollapsed}
                  tooltip={name}
                  icon={icon}
                >
                  {icon} <span className="text-base">{name}</span>
                </SidebarTooltip>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-auto space-y-3">
          {isSessionReady && !assistantOnlyUser && (
            <div
              onClick={() => router.push("/")}
              className={`w-full flex items-center space-x-3 group relative rounded-lg px-3 py-2 transition-all duration-200 ease-in-out bg-linear-to-r from-primary/90 to-primary text-primary-foreground hover:brightness-110 hover:shadow-md active:brightness-95 cursor-pointer ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <SidebarTooltip
                collapsed={isCollapsed}
                tooltip="Dashboard"
                icon={<HugeiconsIcon icon={DashboardSquare01Icon} size={18} />}
              >
                <HugeiconsIcon icon={DashboardSquare01Icon} size={18} />
                <span className="text-sm font-medium">Dashboard</span>
              </SidebarTooltip>
            </div>
          )}

          {/* Account dropdown */}
          <Suspense fallback={<>Loading...</>}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={`cursor-pointer flex items-center space-x-3 ${
                    (segments && segments[0] === "profile") ||
                    pathname === "/profile"
                      ? "bg-border text-foreground dark:bg-border"
                      : "bg-foreground/5"
                  } ${isCollapsed ? "justify-center" : ""} rounded-lg px-3 py-2 transition-all duration-150 ease-in-out hover:bg-foreground/10 active:bg-foreground/15 dark:hover:bg-foreground/10 dark:active:bg-foreground/15`}
                >
                  <Avatar className="h-6 w-6 text-sm font-medium">
                    <AvatarFallback className="bg-primary text-secondary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {isCollapsed ? null : (
                    <span className="truncate text-sm">My Account</span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={`${
                  !isSidebarCollapse && !isMobile ? "w-56" : "w-10"
                }`}
              >
                <Link href={PROFILE} onClick={() => isMobile && onToggle?.()}>
                  <DropdownMenuItem className="h-8 cursor-pointer">
                    <HugeiconsIcon icon={UserIcon} size={20} />
                    <DropdownMenuLabel>Profile</DropdownMenuLabel>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logoutUser}
                  className="h-8 cursor-pointer"
                >
                  <HugeiconsIcon icon={Logout01Icon} size={20} />
                  <DropdownMenuLabel>Log out</DropdownMenuLabel>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Suspense>
        </div>
      </div>

      {/* Chevron button positioned outside sidebar for higher z-index */}
      {!isMobile && (
        <div
          className={`fixed top-8.5 -translate-y-1/2 z-30 transition-all duration-300 ${
            isSidebarCollapse ? "left-16" : "left-50"
          }`}
        >
          <div
            onClick={() => setSidebarCollapse(!isSidebarCollapse)}
            aria-label={
              isSidebarCollapse ? "Expand sidebar" : "Collapse sidebar"
            }
            className={`cursor-pointer transition-transform duration-300 text-gray-400 bg-background rounded-full ${
              isSidebarCollapse ? "rotate-0" : "rotate-180"
            }`}
          >
            <HugeiconsIcon
              icon={CircleArrowRight01Icon}
              size={20}
              strokeWidth={1.5}
            />
          </div>
        </div>
      )}
    </>
  );
}
