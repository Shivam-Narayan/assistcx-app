"use client";

import { decodeJWT } from "@/helper/helper-function";
import { parsePermissions } from "@/lib/permissions";
import {
  SETTINGS_CLASS_GROUP,
  SETTINGS_ACCOUNTS,
  SETTINGS_DATA_TEMPLATE,
  SETTINGS_MAILBOX_POLLINGS,
  SETTINGS_MANAGE_USER,
  SETTINGS_API_KEYS,
  SETTINGS_LLM_PROVIDERS,
} from "@/lib/urls";
import { Inbox, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export interface ISettingMenusProps {}

export default function SettingMenus(props: ISettingMenusProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const onMenuClickHandler = (id: string, name: string) => {};

  const tabs = useMemo(() => {
    let tabs = [
      {
        id: "MAILBOXMIUY761",
        name: "Mailbox Polling",
        href: SETTINGS_MAILBOX_POLLINGS,
        icon: <LayoutDashboard width={20} />,
      },
      {
        id: "DATASCHMIUY761",
        name: "Data Template",
        href: SETTINGS_DATA_TEMPLATE,
        icon: <Inbox width={20} />,
      },
      {
        id: "CLASS761",
        name: "Class Group",
        href: SETTINGS_CLASS_GROUP,
        icon: <Inbox width={20} />,
      },
      {
        id: "USER761",
        name: "Manage User",
        href: SETTINGS_MANAGE_USER,
        icon: <Inbox width={20} />,
      },
      {
        id: "LLM761",
        name: "LLM Providers",
        href: SETTINGS_LLM_PROVIDERS,
        icon: <Inbox width={20} />,
      },

      {
        id: "APIKEYS761",
        name: "API Keys",
        href: SETTINGS_API_KEYS,
        icon: <Inbox width={20} />,
      },
      {
        id: "ACOUNTHMIUY761",
        name: "Account",
        href: SETTINGS_ACCOUNTS,
        icon: <Inbox width={20} />,
      },
    ];

    if (status !== "authenticated" || !session?.user?.accessToken) {
      return [];
    }

    const decodedToken: any = decodeJWT(session.user.accessToken);
    const accessControl: string[] = decodedToken["access_control"] || [];
    const permissions = parsePermissions(decodedToken["permissions"]);

    if (accessControl.length === 0) {
      if (permissions.isRoot) return tabs;
      return [];
    }

    return tabs.filter((tab) => accessControl.includes(tab.href));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  return (
    <div className="sticky top-0 h-full overflow-y-auto">
      <div className="w-full flex flex-col justify-between transition-all sm:translate-x-0">
        <div>
          <div className="flex items-center justify-between py-5 px-4 font-medium text-muted-foreground">
            <span className="text-sm tracking-tight font-bold">Settings</span>
          </div>

          <div className="flex flex-col gap-2 px-4">
            {tabs.map(({ id, name, href }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={id}
                  href={href}
                  onClick={() => onMenuClickHandler(id, name)}
                  className={`
                flex flex-col px-3 py-2 rounded-lg cursor-pointer transition-colors
                ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground"
                }
              `}
                >
                  <div
                    className={`text-sm font-medium ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
