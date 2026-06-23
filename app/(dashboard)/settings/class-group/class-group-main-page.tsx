"use client";

import { SettingCommonHeader } from "@/components/ui/setting-header";
import { canEdit } from "@/lib/permissions";
import { useSettingHeaderStuck } from "@/lib/hook/useSettingHeaderStuck";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleClassGroupEvents } from "@/redux/settings/class-group/classgroup-events-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { DataTable } from "./data-table";

const ClassGroupMainPage = () => {
  const { isStuck, sentinelRef } = useSettingHeaderStuck();
  const dispatch = useDispatch<AppDispatch>();

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole
  );

  const isCreateClass = canEdit(permissions, "class_groups");

  const handleAdd = () => {
    dispatch(handleClassGroupEvents("addClassGroup"));
    dispatch(handleSheetEvents(true));
  };

  return (
    <div className="py-6 flex flex-col gap-6 pt-0">
      <div ref={sentinelRef} />

      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isStuck ? "border-b border-border py-4" : ""
        }`}
      >
        <SettingCommonHeader
          title="Class Group"
          infoMessage="A Class Group is a collection that organizes multiple class labels under a shared name and description, typically used to group related categories for AI model training."
          buttonText="Add New"
          handleAdd={handleAdd}
          showAddButton={isCreateClass}
        />
      </div>

      <div className="px-6">
        <DataTable />
      </div>
    </div>
  );
};
export default ClassGroupMainPage;
