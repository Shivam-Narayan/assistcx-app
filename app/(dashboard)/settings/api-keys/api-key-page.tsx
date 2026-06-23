"use client";
import { SettingCommonHeader } from "@/components/ui/setting-header";
import { canDelete, canEdit } from "@/lib/permissions";
import { useSettingHeaderStuck } from "@/lib/hook/useSettingHeaderStuck";
import { useAppSelector } from "@/redux/store";
import { useState } from "react";
import ApiKeyDialog from "./app-key-dialog";
import { DataTable } from "./data-table";
import useGetApiKeyData from "./hook/useGetApiKeyData";

const ApiKeyPage = () => {
  const { isStuck, sentinelRef } = useSettingHeaderStuck();
  const [open, setOpen] = useState(false);
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const { loading, isLoading, cellData, loadTableData } = useGetApiKeyData();

  const handleAdd = () => {
    setOpen(true);
  };

  const isFullAccess = permissions ? canDelete(permissions, "api_keys") : false;
  const isEditAccess = permissions ? canEdit(permissions, "api_keys") : false;

  return (
    <div className="py-6 flex flex-col gap-6 pt-0">
      <div ref={sentinelRef} />
      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isStuck ? "border-b border-border py-4" : ""
        }`}
      >
        <SettingCommonHeader
          title="API Keys"
          infoMessage="Configure API keys to connect external systems to AssistCX."
          buttonText="New API Key"
          handleAdd={handleAdd}
          showAddButton={isFullAccess}
        />
      </div>

      <div className="px-6">
        <DataTable
          loading={loading}
          isLoading={isLoading}
          cellData={cellData}
          loadTableData={loadTableData}
          isFullAccess={isFullAccess}
          isEditAccess={isEditAccess}
        />
      </div>
      <ApiKeyDialog
        mode="add"
        open={open}
        setOpen={setOpen}
        onClose={() => setOpen(false)}
        loadTableData={loadTableData}
      />
    </div>
  );
};
export default ApiKeyPage;
