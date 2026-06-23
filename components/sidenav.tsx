"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  decodeJWT,
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canView, parsePermissions } from "@/lib/permissions";
import {
  AGENTS,
  CONNECTIONS,
  DASHBOARD,
  DATA_TABLES,
  INBOX,
  ISSUES,
  KNOWLEDGE,
  LOGIN,
  MAILBOX_POLLINGS,
  PROFILE,
  TOOLS,
} from "@/lib/urls";
import { getDefaultSettingsRoute } from "@/proxy";
import { handlePermissionRole } from "@/redux/common/conditional-permissions-slice";
import { handleUserDetails } from "@/redux/common/user-details-slice";
import { AppDispatch } from "@/redux/store";
import {
  Bolt,
  BookText,
  Bot,
  BotMessageSquare,
  ChevronLeftCircleIcon,
  ChevronRightCircleIcon,
  ExternalLink,
  Files,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Plug,
  Settings,
  ShieldAlert,
  Table2,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSelectedLayoutSegments,
} from "next/navigation";
import { ReactNode, Suspense, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import ConditionalTooltip from "./conditional-tooltip-renderer";

export interface INavProps {
  isSidebarCollapsible(is: boolean): void;
}

function SidebarTooltip({
  collapsed,
  tooltip,
  icon,
  children,
}: {
  collapsed: boolean;
  tooltip: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  if (collapsed) {
    return (
      <ConditionalTooltip
        content={tooltip}
        alwaysShow={true}
        align="center"
        showArrow={true}
        side="right"
        sideOffset={20}
        className="z-50"
      >
        <span>{icon}</span>
      </ConditionalTooltip>
    );
  }
  return <>{children}</>;
}

export default function Nav(props: INavProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const segments = useSelectedLayoutSegments();
  const { id } = useParams() as { id?: string };
  const [isSidebarCollapsible, setSidebarCollapsible] = useState(true);
  const { data: session, status } = useSession();
  const { axiosAuth, loading } = useAxiosAuth();
  const [initials, setInitials] = useState<string | null>();
  const pathname = usePathname();
  const path =
    pathname != undefined && pathname.includes("settings")
      ? pathname?.split("/").pop()
      : MAILBOX_POLLINGS;
  const [currentVersion, setCurrentVersion] = useState<String | null>("");

  const decodedToken = useMemo(() => {
    if (!session?.user?.accessToken) return null;
    return decodeJWT(session.user.accessToken) as Record<string, any>;
  }, [session?.user?.accessToken]);

  const permissions = useMemo(
    () => (decodedToken ? parsePermissions(decodedToken["permissions"]) : null),
    [decodedToken],
  );

  const accessControl: string[] = decodedToken?.["access_control"] || [];
  const isRootUser = permissions?.isRoot ?? false;
  const isSessionReady =
    status === "authenticated" && !!session?.user?.accessToken;

  const showLaunchAssistant =
    isSessionReady &&
    (isRootUser || (permissions ? canView(permissions, "assistant") : false));

  const getUserDetails = async (userUUID: any) => {
    if (!loading && userUUID) {
      try {
        let result = await axiosAuth.get(`${url.USER_DETAILS}`);
        if (result?.status === 200) {
          let userInfo = result?.data;
          dispatch(handleUserDetails(userInfo));
          if (userInfo?.first_name != null && userInfo?.last_name != null) {
            const contactInitials = userInfo.first_name.charAt(0).toUpperCase();
            setInitials(contactInitials);
          } else {
            const contactInitials = userInfo.email.charAt(0).toUpperCase();
            setInitials(contactInitials);
          }
        }
      } catch (error) {
        console.log(error);
        errorMessageHandler(error);
      }
    }
  };

  async function getCurrentVersion() {
    if (!loading) {
      try {
        const result = await axiosAuth.get(url.CURRENT_VERSION);
        if (result?.status === 200) {
          const version = result?.data?.version;
          setCurrentVersion(version);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    if (session && session?.user?.id != undefined) {
      getUserDetails(session?.user?.id);
      getCurrentVersion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const menuItems = useMemo(() => {
    const sideBarList = [
      {
        name: "Dashboard",
        href: DASHBOARD,
        isActive: segments && segments[0] === "(dashboard)",
        icon: (
          <LayoutDashboard
            strokeWidth={1.5}
            width={isSidebarCollapsible ? 24 : 20}
          />
        ),
      },
      {
        name: "Inbox",
        href: INBOX,
        isActive: segments && segments[0] === "inbox",
        icon: (
          <Inbox strokeWidth={1.5} width={isSidebarCollapsible ? 24 : 20} />
        ),
      },
      {
        name: "Agents",
        href: AGENTS,
        isActive: segments && segments[0] === "agents",
        icon: <Bot strokeWidth={1.5} width={isSidebarCollapsible ? 24 : 22} />,
      },
      {
        name: "Tools",
        href: TOOLS,
        isActive: segments && segments[0] === "tools",
        icon: <Bolt strokeWidth={1.5} width={isSidebarCollapsible ? 24 : 22} />,
      },
      {
        name: "Knowledge",
        href: KNOWLEDGE,
        isActive: segments && segments[0] === "knowledge",
        icon: (
          <BookText strokeWidth={1.5} width={isSidebarCollapsible ? 24 : 20} />
        ),
      },
      {
        name: "Data Tables",
        href: DATA_TABLES,
        isActive: segments && segments[0] === "data-tables",
        icon: (
          <Table2 strokeWidth={1.5} width={isSidebarCollapsible ? 24 : 20} />
        ),
      },
      {
        name: "Issues",
        href: ISSUES,
        isActive: segments && segments[0] === "issues",
        icon: (
          <ShieldAlert
            strokeWidth={1.5}
            width={isSidebarCollapsible ? 24 : 20}
          />
        ),
      },
      {
        name: "Connections",
        href: CONNECTIONS,
        isActive: segments && segments[0] === "connections",
        icon: <Plug strokeWidth={1.5} width={isSidebarCollapsible ? 24 : 22} />,
      },
      {
        name: "Settings",
        href: getDefaultSettingsRoute(accessControl),
        isActive: segments && segments[0] === "settings",
        icon: (
          <Settings strokeWidth={1.5} width={isSidebarCollapsible ? 24 : 20} />
        ),
      },
    ];

    if (!isSessionReady) {
      return [];
    }

    if (isRootUser) {
      return sideBarList;
    }

    return sideBarList.filter((item) => {
      if (item.name === "Settings") {
        const hasSettingsRoute = accessControl.some(
          (route) => route === "/settings" || route.startsWith("/settings/"),
        );
        if (!hasSettingsRoute) return false;

        const defaultRoute = getDefaultSettingsRoute(accessControl);
        if (defaultRoute) {
          item.href = defaultRoute;
          return true;
        }

        return false;
      }

      return accessControl.includes(item.href);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments, id, isSessionReady, accessControl, isRootUser]);

  const docsItems = useMemo(() => {
    const items: any[] = [];
    if (currentVersion) {
      items.push({
        name: `v${currentVersion}`,
        href: "/docs/changelog",
        icon: <Layers width={16} />,
      });
    }
    items.push({
      name: "Documentation",
      tooltipName: "Documentation",
      href: "/docs",
      icon: <Files width={16} />,
    });
    return items;
  }, [currentVersion]);

  const setSidebarcollpase = (is: boolean) => {
    setSidebarCollapsible(is);
    props.isSidebarCollapsible(is);
  };

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
          // Clear Teams auth flag so silent auth can re-run on login page
          sessionStorage.removeItem("teams_auth_done");
          signOut({ callbackUrl: LOGIN });
        }, 100);
      }
    }
  };

  useEffect(() => {
    if (permissions) {
      dispatch(handlePermissionRole(permissions));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions]);

  return (
    <div className="relative">
      <div
        className={`transform translate-x-0 ${
          isSidebarCollapsible ? "w-18" : "w-56"
        } fixed z-50 flex h-full flex-col justify-between border-r border-border bg-muted px-3 py-4 transition-all dark:border-border dark:bg-muted sm:translate-x-0`}
      >
        <div className="grid gap-4">
          <div
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
              isSidebarCollapsible ? "justify-center" : "justify-between"
            } relative`}
          >
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
              {!isSidebarCollapsible && (
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
            {isSidebarCollapsible ? (
              <ChevronRightCircleIcon
                strokeWidth={1}
                color="rgb(156 163 175)"
                width={20}
                className="xl:block hidden absolute -right-6 cursor-pointer text-xs"
                onClick={() => setSidebarcollpase(false)}
                fill="white"
              />
            ) : (
              <ChevronLeftCircleIcon
                strokeWidth={1}
                color="rgb(156 163 175)"
                width={20}
                className="xl:block hidden absolute -right-6 cursor-pointer"
                onClick={() => setSidebarcollpase(true)}
                fill="white"
              />
            )}
          </div>

          {/* Navigation menu */}
          <div className="grid gap-1">
            {menuItems.map(({ name, href, isActive, icon }) => (
              <Link
                key={name}
                href={href}
                className={`flex items-center space-x-3 group relative rounded-lg px-2 py-2 transition-all duration-150 ease-in-out hover:bg-border active:bg-border dark:text-white dark:hover:bg-border dark:active:bg-border ${
                  isActive
                    ? "cursor-pointer bg-primary/10 text-primary hover:bg-primary/10 active:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/10 dark:active:bg-primary/10"
                    : "text-foreground/75"
                } ${isSidebarCollapsible ? "justify-center" : ""}`}
              >
                <SidebarTooltip
                  collapsed={isSidebarCollapsible}
                  tooltip={name}
                  icon={icon}
                >
                  {icon} <span className="text-base">{name}</span>
                </SidebarTooltip>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {/* Changelog & Docs */}
          <div className="rounded-lg bg-muted/50 flex flex-col gap-2 mb-2">
            {docsItems.map(({ name, tooltipName, href, icon }: any) => (
              <Link key={name} href={href} target="_blank">
                <div
                  className={`flex items-center space-x-3 group rounded-md text-foreground/70 px-2 py-1 transition-all duration-150 ease-in-out hover:bg-border active:bg-border dark:hover:bg-border dark:active:bg-border ${
                    isSidebarCollapsible ? "justify-center" : "justify-between"
                  }`}
                >
                  <SidebarTooltip
                    collapsed={isSidebarCollapsible}
                    tooltip={tooltipName || name}
                    icon={icon}
                  >
                    <div className="flex items-center space-x-3">
                      {icon}
                      <span className="text-sm">{name}</span>
                    </div>
                    <ExternalLink
                      width={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    />
                  </SidebarTooltip>
                </div>
              </Link>
            ))}
          </div>

          {/* Assistant Button */}
          {showLaunchAssistant && (
            <div
              onClick={() => router.push("/assistant")}
              className={`w-full flex items-center space-x-3 group relative rounded-lg px-3 py-2 overflow-hidden transition-all duration-200 ease-in-out bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/40 hover:shadow-sm hover:shadow-primary/10 active:bg-primary/20 cursor-pointer ${
                isSidebarCollapsible ? "justify-center" : ""
              }`}
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-primary/10 to-transparent" />
              <SidebarTooltip
                collapsed={isSidebarCollapsible}
                tooltip="Assistant"
                icon={<BotMessageSquare width={22} />}
              >
                <BotMessageSquare
                  width={22}
                  strokeWidth={1.5}
                  className="relative z-10"
                />
                <span className="relative z-10 text-base font-medium">
                  Assistant
                </span>
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
                  } ${isSidebarCollapsible ? "justify-center" : ""} rounded-lg px-3 py-2 transition-all duration-150 ease-in-out hover:bg-foreground/10 active:bg-foreground/15 dark:hover:bg-foreground/10 dark:active:bg-foreground/15`}
                >
                  <Avatar className="h-6 w-6 text-sm font-medium">
                    <AvatarFallback className="bg-primary text-secondary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {isSidebarCollapsible ? null : (
                    <span className="truncate text-sm">My Account</span>
                  )}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className={`${!isSidebarCollapsible ? "w-56" : "w-10"}`}
              >
                <Link href={PROFILE}>
                  <DropdownMenuItem className="h-8 cursor-pointer">
                    <User width={20} />
                    <DropdownMenuLabel>Profile</DropdownMenuLabel>
                  </DropdownMenuItem>
                </Link>

                {!sessionStorage.getItem("teams_auth_done") && (
                  <>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={logoutUser}
                      disabled={isLoggingOut}
                      className="h-8 cursor-pointer"
                    >
                      <LogOut width={20} />
                      <DropdownMenuLabel>Log out</DropdownMenuLabel>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
