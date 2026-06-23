"use client";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import HeaderHoverCard from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import Loader from "@/components/loader";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import DataAccessCard from "./components/data-access-card";
import UserGroupCard from "./components/user-group-card";
import useUserGroupLogic from "./hook/useUserGroupLogic";

interface ReceivingComponentProps {
  loadTableData: (data: any, type: PostActionStateSyncAction) => void;
}

export function AddEditUserGroup({ loadTableData }: ReceivingComponentProps) {
  const {
    userEvents,
    form,
    isLoading,
    loader,
    sheetOpen,
    setSheetOpen,
    openconfirmModel,
    permissionFormSchema,
    permissionList,
    formType,
    isCreateUpdateUser,
    isDeleteUser,
    setUserRolesPermission,
    userGroupInfo,
    handleResetForm,
    handleEditUserGroup,
    label,
    variant,
    onClick,
    cancleEdit,
    handleDeleteClick,
    handleConfirmDelete,
    sendUserRoleAPIModal,
    userGroupData,
    setOpenconfirmModel,
    isDeleteLoading,
  } = useUserGroupLogic(loadTableData);

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          onCloseAutoFocus={handleResetForm}
          preventAutoClose={
            userEvents === "editUserGroup" || userEvents === "addUserGroup"
          }
          className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
        >
          <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
            <div className="w-full flex justify-start items-center space-x-2 divide-x">
              <SheetTitle className="sr-only">User Group</SheetTitle>
              <HeaderHoverCard
                title="User Group"
                message="Manage groups to organize and control access for different sets of users within the application."
                type="sheet"
              />
            </div>

            {userEvents === "viewUserGroup" && isCreateUpdateUser && (
              <div
                onClick={handleEditUserGroup}
                className="p-2 rounded-md cursor-pointer hover:bg-secondary "
              >
                <Pencil size={20} />
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
          {loader ? (
            <Loader className="h-full" />
          ) : (
            <div className="grow">
              <div className="grid gap-5 px-4">
                <UserGroupCard
                  userEvents={userEvents}
                  form={form}
                  userGroupInfo={userGroupInfo}
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
          {userEvents != "viewUserGroup" && (
            <SheetFooter
              className={`${
                userEvents == "editUserGroup" && "justify-between!"
              } sticky z-10 p-3 border-t bg-background bottom-0`}
            >
              {userEvents == "editUserGroup" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={cancleEdit}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  {isDeleteUser && (
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
              {isCreateUpdateUser && (
                <Button
                  variant={variant}
                  onClick={onClick}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {label}
                </Button>
              )}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <CustomDeleteDialog
        open={openconfirmModel}
        onOpenChange={setOpenconfirmModel}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title={"Are you sure you want to delete this User Group?"}
        description={
          "This action cannot be undone and will permanently delete the user group."
        }
      />
    </>
  );
}
