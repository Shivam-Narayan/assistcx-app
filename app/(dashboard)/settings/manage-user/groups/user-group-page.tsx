"use client";

import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleUserGroupEvents } from "@/redux/settings/user-group/user-group-events-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { DataTable } from "./data-table";
import { canEdit } from "@/lib/permissions";
import ManageUserLayout from "../../manage-user/manage-user-layout";

const UserGroupMainPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const handleAdd = () => {
    dispatch(handleUserGroupEvents("addUserGroup"));
    dispatch(handleSheetEvents(true));
  };

  const isCreateUpdateUser = canEdit(permissions, "user_management");

  return (
    <ManageUserLayout handleAdd={handleAdd} showAddButton={isCreateUpdateUser}>
      <DataTable />
    </ManageUserLayout>
  );
};

export default UserGroupMainPage;
