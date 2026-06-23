"use client";

import { SettingCommonHeader } from "@/components/ui/setting-header";
import { canEdit } from "@/lib/permissions";
import { useSettingHeaderStuck } from "@/lib/hook/useSettingHeaderStuck";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleUserEvents } from "@/redux/settings/mailbox-polling/mailbox-events-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { DataTable } from "./data-table";

const MailboxPolingMainPage = () => {
  const { isStuck, sentinelRef } = useSettingHeaderStuck();
  const dispatch = useDispatch<AppDispatch>();

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole
  );

  const isCreateAgents = canEdit(permissions, "mailbox_pollings");

  const handleAdd = () => {
    dispatch(handleUserEvents("addMailboxPolling"));
    dispatch(handleSheetEvents(true));
  };

  return (
    <div className="py-6 flex flex-col gap-6 pt-0">
      <div ref={sentinelRef} />

      <div
        className={`px-6 sticky top-0 bg-background z-10 ${isStuck ? "border-b border-border py-4" : ""
          }`}
      >
        <SettingCommonHeader
          title="Mailbox Polling"
          infoMessage="Configure mailboxes to fetch new incoming emails at regular interval and process them as agent tasks"
          buttonText="Add New"
          handleAdd={handleAdd}
          showAddButton={isCreateAgents}
        />
      </div>

      <div className="px-6">
        <DataTable />
      </div>
    </div>
  );
};
export default MailboxPolingMainPage;
