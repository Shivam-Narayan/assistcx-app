import { canView, UserPermissions } from "@/lib/permissions";
import UserGroupMainPage from "./groups/user-group-page";
import RoleMainPage from "./roles/role-page";
import TeamMembersMainPage from "./team-members/team-member";

export const MANAGE_USER_TABS = [
  {
    value: "users",
    label: "Users",
    Component: TeamMembersMainPage,
  },
  {
    value: "roles",
    label: "Roles",
    Component: RoleMainPage,
  },
  {
    value: "groups",
    label: "Groups",
    Component: UserGroupMainPage,
  },
] as const;

export const getManageUserTabsForPermissions = (
  permissions?: UserPermissions | null,
) => {
  if (!permissions) {
    return [];
  }

  if (permissions.isRoot || canView(permissions, "user_management")) {
    return MANAGE_USER_TABS;
  }
  return [];
};
