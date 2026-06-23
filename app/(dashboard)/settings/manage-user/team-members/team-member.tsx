"use client";

import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { DataTable } from "./data-table";
import { handleTeamMembersEvents } from "@/redux/settings/team-members/team-members-event-slice";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { canEdit } from "@/lib/permissions";
import ManageUserLayout from "../manage-user-layout";

const TeamMembersMainPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const handleAdd = () => {
    dispatch(handleTeamMembersEvents("addTeamMember"));
    dispatch(handleSheetEvents(true));
  };

  const isCreateUpdateUser = canEdit(permissions, "user_management");

  return (
    <ManageUserLayout handleAdd={handleAdd} showAddButton={isCreateUpdateUser}>
      <DataTable isCreateUpdateUser={isCreateUpdateUser} />
    </ManageUserLayout>
  );
};
export default TeamMembersMainPage;
