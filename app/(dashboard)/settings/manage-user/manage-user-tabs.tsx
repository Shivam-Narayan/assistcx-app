"use client";

import { decodeJWT } from "@/helper/helper-function";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { parsePermissions } from "@/lib/permissions";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { getManageUserTabsForPermissions } from "./manage-user-tabs-config";

const ManageUserTabs = () => {
  const { data: session, status } = useSession();

  const tabs = useMemo(() => {
    if (status !== "authenticated" || !session?.user?.accessToken) {
      return [];
    }

    const decodedToken: any = decodeJWT(session.user.accessToken);
    const permissions = parsePermissions(decodedToken["permissions"]);

    return getManageUserTabsForPermissions(permissions);
  }, [session, status]);

  const defaultTab = tabs[0]?.value;

  if (!defaultTab) {
    return null;
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <tab.Component />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ManageUserTabs;
