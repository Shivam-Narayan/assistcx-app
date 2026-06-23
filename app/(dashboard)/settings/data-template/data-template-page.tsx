"use client";

import { SettingCommonHeader } from "@/components/ui/setting-header";
import { useSettingHeaderStuck } from "@/lib/hook/useSettingHeaderStuck";
import { DataTable } from "./data-table";
import { handleDataTemplateEvents } from "@/redux/settings/data-template/data-template-events-slice";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { canEdit } from "@/lib/permissions";

const DataTemplateMainPage = () => {
  const { isStuck, sentinelRef } = useSettingHeaderStuck();
  const dispatch = useDispatch<AppDispatch>();

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole
  );

  const handleAdd = () => {
    dispatch(handleDataTemplateEvents("addDataTemplate"));
    dispatch(handleSheetEvents(true));
  };

  const isCreateUpdateUser = canEdit(permissions, "data_templates");

  return (
    <div className="py-6 flex flex-col gap-6 pt-0">
      <div ref={sentinelRef} />

      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isStuck ? "border-b border-border py-4" : ""
        }`}
      >
        <SettingCommonHeader
          title="Data Template"
          infoMessage="Configure data templates and define data schema to perform intelligent data extraction from different documents"
          buttonText="Add New"
          handleAdd={handleAdd}
          showAddButton={isCreateUpdateUser}
        />
      </div>

      <div className="px-6">
        <DataTable />
      </div>
    </div>
  );
};

export default DataTemplateMainPage;
