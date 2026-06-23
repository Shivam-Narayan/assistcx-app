"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { decodeJWT } from "@/helper/helper-function";
import { parsePermissions } from "@/lib/permissions";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { getManageUserTabsForPermissions } from "./manage-user-tabs-config";

const ManageUserTabsList = () => {
  const { data: session, status } = useSession();

  const tabs = useMemo(() => {
    if (status !== "authenticated" || !session?.user?.accessToken) {
      return [];
    }

    const decodedToken: any = decodeJWT(session.user.accessToken);
    const permissions = parsePermissions(decodedToken["permissions"]);

    return getManageUserTabsForPermissions(permissions);
  }, [session, status]);

  return (
    <TabsList className="h-9 bg-primary/10 border border-primary/20">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="px-4 cursor-pointer transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ManageUserTabsList;
