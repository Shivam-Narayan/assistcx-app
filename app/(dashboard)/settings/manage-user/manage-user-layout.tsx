"use client";

import type { ReactNode } from "react";

import { SettingCommonHeader } from "@/components/ui/setting-header";
import { useSettingHeaderStuck } from "@/lib/hook/useSettingHeaderStuck";
import ManageUserTabsList from "./manage-user-tabs-list";

interface ManageUserLayoutProps {
  infoMessage?: string;
  handleAdd: () => void;
  children: ReactNode;
  tabsSlot?: ReactNode;
  showAddButton?: boolean;
  title?: string;
  buttonText?: string;
}

const ManageUserLayout = ({
  infoMessage = "Manage users, roles, and groups for your organization.",
  handleAdd,
  children,
  tabsSlot = <ManageUserTabsList />,
  showAddButton = true,
  title = "Manage User",
  buttonText = "Add New",
}: ManageUserLayoutProps) => {
  const { isStuck, sentinelRef } = useSettingHeaderStuck();

  return (
    <div className="py-6 flex flex-col gap-6 pt-0">
      <div ref={sentinelRef} />

      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isStuck ? "border-b border-border py-4" : ""
        }`}
      >
        <SettingCommonHeader
          title={title}
          infoMessage={infoMessage}
          buttonText={buttonText}
          handleAdd={handleAdd}
          showAddButton={showAddButton}
          tabsSlot={tabsSlot}
        />
      </div>

      <div className="px-6">{children}</div>
    </div>
  );
};

export default ManageUserLayout;
