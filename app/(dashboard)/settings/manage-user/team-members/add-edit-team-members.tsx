"use client";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomAlertDialog from "@/components/custom-alert-dialog";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import HeaderHoverCard from "@/components/header";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import { canDelete } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import { Loader2, Pencil, Power, PowerOff, Trash2, X } from "lucide-react";
import { ChangePassword } from "./change-password";
import CommonDetailsCard from "./components/common-details-card";
import DataAccessCard from "./components/data-access-card";
import { cellObject } from "./data-table";
import { useTeamMemberForm } from "./hook/useTeamMemberForm";

interface ReceivingComponentProps {
  loadTableData: (
    data: cellObject,
    type: PostActionStateSyncAction,
    changes?: Record<string, any>,
  ) => void;
  isCreateUpdateUser: boolean;
}

export function AddEditTeamMebers({
  loadTableData,
  isCreateUpdateUser,
}: ReceivingComponentProps) {
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const showDeleteUser = permissions
    ? canDelete(permissions, "user_management")
    : false;

  const {
    sheetOpen,
    setSheetOpen,
    handleResetForm,
    userEvents,
    teamMemberData,
    setOpenUserAction,
    handleEditTeamMember,
    loader,
    form,
    roleItems,
    userGroupItems,
    passwordShow,
    setPasswordShow,
    handleUpdatePassword,
    TeamMemeberInfo,
    sendUserRoleAPIModal,
    permissionList,
    permissionFormSchema,
    setUserRolesPermission,
    formType,
    cancleEdit,
    handleDeleteClick,
    variant,
    onClick,
    isLoading,
    label,
    passwordModalOpen,
    setPasswordModalOpen,
    openUserAction,
    activateDeactivateUser,
    isActivateLoading,
    openconfirmModel,
    setOpenconfirmModel,
    handleConfirmDelete,
    isDeleteLoading,
  } = useTeamMemberForm(loadTableData);

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          onCloseAutoFocus={handleResetForm}
          preventAutoClose={
            userEvents === "addTeamMember" || userEvents === "editTeamMember"
          }
          className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
        >
          <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
            <div className="w-full flex justify-start items-center space-x-2 divide-x">
              <SheetTitle className="sr-only">User</SheetTitle>
              <HeaderHoverCard
                title={
                  userEvents === "addTeamMember"
                    ? "Add User"
                    : userEvents === "editTeamMember"
                      ? "Edit User"
                      : "View User"
                }
                message="Manage platform users of the organization"
                type="sheet"
              />
            </div>

            {userEvents === "viewTeamMember" && isCreateUpdateUser && (
              <div className="flex gap-1">
                {teamMemberData?.account_status === "active" ? (
                  <ConditionalTooltip
                    content="Deactivate"
                    alwaysShow={true}
                    align="center"
                    showArrow={true}
                  >
                    <div
                      onClick={() => setOpenUserAction(true)}
                      className="p-2 rounded-md cursor-pointer hover:bg-secondary "
                    >
                      <PowerOff size={20} />
                    </div>
                  </ConditionalTooltip>
                ) : (
                  <ConditionalTooltip
                    content="Activate"
                    alwaysShow={true}
                    align="center"
                    showArrow={true}
                  >
                    <div
                      onClick={() => setOpenUserAction(true)}
                      className="p-2 rounded-md cursor-pointer hover:bg-secondary "
                    >
                      <Power size={20} />
                    </div>
                  </ConditionalTooltip>
                )}

                <ConditionalTooltip
                  content="Edit"
                  alwaysShow={true}
                  align="center"
                  showArrow={true}
                >
                  <div
                    onClick={handleEditTeamMember}
                    className="p-2 rounded-md cursor-pointer hover:bg-secondary "
                  >
                    <Pencil size={20} />
                  </div>
                </ConditionalTooltip>
              </div>
            )}
            <SheetClose asChild>
              <div
                className="p-2 rounded-md cursor-pointer hover:bg-secondary"
                onClick={handleResetForm}
              >
                <X className="h-5 w-5" />
              </div>
            </SheetClose>
          </SheetHeader>

          {loader == true ? (
            <Loader className="h-full" />
          ) : (
            <div className="grow">
              <div className="grid gap-5 px-4">
                <CommonDetailsCard
                  userEvents={userEvents}
                  form={form}
                  roleItems={roleItems}
                  userGroupItems={userGroupItems}
                  passwordShow={passwordShow}
                  setPasswordShow={setPasswordShow}
                  handleUpdatePassword={handleUpdatePassword}
                  isCreateUpdateUser={isCreateUpdateUser}
                  TeamMemeberInfo={TeamMemeberInfo}
                />

                <DataAccessCard
                  userEvents={userEvents}
                  sendUserRoleAPIModal={sendUserRoleAPIModal}
                  permissionList={permissionList}
                  permissionFormSchema={permissionFormSchema}
                  setUserRolesPermission={setUserRolesPermission}
                  formType={formType}
                />
              </div>
            </div>
          )}

          {userEvents != "viewTeamMember" && (
            <SheetFooter
              className={`${
                userEvents == "editTeamMember" && "justify-between!"
              } sticky z-10 p-3 border-t bg-background bottom-0`}
            >
              {userEvents == "editTeamMember" && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={cancleEdit}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>

                  {showDeleteUser && (
                    <ConditionalTooltip
                      content="Delete"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteClick}
                        className="cursor-pointer h-9 sm:h-9 w-9 sm:w-9 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 pr-2 pl-2"
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </ConditionalTooltip>
                  )}
                </div>
              )}
              <Button
                variant={variant}
                onClick={onClick}
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {label}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {passwordModalOpen && (
        <ChangePassword
          open={passwordModalOpen}
          onOpenChange={setPasswordModalOpen}
        />
      )}

      <CustomAlertDialog
        open={openUserAction}
        onOpenChange={setOpenUserAction}
        handleAlert={activateDeactivateUser}
        isLoading={isActivateLoading}
        title={
          teamMemberData?.account_status === "active"
            ? "Are you sure you want to inactivate this user?"
            : "Are you sure you want activate this user?"
        }
        description={
          teamMemberData?.account_status === "active"
            ? "This action will deactivate the user, revoking their access to the system"
            : "This action will activate the user, granting them access to the system"
        }
      />

      <CustomDeleteDialog
        open={openconfirmModel}
        onOpenChange={setOpenconfirmModel}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title={"Are you sure you want to remove this user?"}
        description={
          "This action cannot be undone and will permanently revoke the user’s access to the platform."
        }
      />
    </>
  );
}
