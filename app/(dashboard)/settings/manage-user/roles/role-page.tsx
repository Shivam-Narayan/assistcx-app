"use client";

import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { DataTable } from "./data-table";
import { handleRolesEvents } from "@/redux/settings/roles/role-event-slice";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { canEdit } from "@/lib/permissions";
import ManageUserLayout from "../manage-user-layout";

const RoleMainPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const handleAdd = () => {
    dispatch(handleRolesEvents("addRoles"));
    dispatch(handleSheetEvents(true));
  };

  const isCreateUpdateUser = canEdit(permissions, "user_management");

  return (
    <ManageUserLayout handleAdd={handleAdd} showAddButton={isCreateUpdateUser}>
      <DataTable />
    </ManageUserLayout>
  );
};

export default RoleMainPage;
