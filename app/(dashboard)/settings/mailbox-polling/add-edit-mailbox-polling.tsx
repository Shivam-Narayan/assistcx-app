"use client";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomAlertDialog from "@/components/custom-alert-dialog";
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
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import { canDelete } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import DataStorageCard from "./component/data-storage-card";
import MailboxSettingsCard from "./component/mailbox-settings-card";
import PollingInformationCard from "./component/polling-information-card";
import useMailboxPolling from "./hook/useMailboxPolling";
interface ReceivingComponentProps {
  mountPaths: any[];
  loadTableData: (
    data: any,
    type: PostActionStateSyncAction,
    changes?: Record<string, any>,
  ) => void;
  isCreateUpdatePolling: boolean;
}
export function AddEditMailboxPolling({
  mountPaths,
  loadTableData,
  isCreateUpdatePolling,
}: ReceivingComponentProps) {
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const showDeletePolling = permissions
    ? canDelete(permissions, "mailbox_pollings")
    : false;

  const {
    sheetOpen,
    setSheetOpen,
    handleResetForm,
    userEvents,
    handleEditMailboxPolling,
    emailInfo,
    form,
    handleConfirmDelete,
    handleDeleteClick,
    openconfirmModel,
    setOpenconfirmModel,
    isDeleteLoading,
    isLoading,
    label,
    variant,
    onClick,
    cancleEdit,
    handleStopPolling,
    isCreateAgents,
    isDataParsingEnabled,
    isTaskFailureAlert,
    emailData,
    open,
    setOpen,
    notificationRecipientsEmails,
    storageFolder,
    storageBucket,
    storageType,
  } = useMailboxPolling(loadTableData);

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          onCloseAutoFocus={handleResetForm}
          preventAutoClose={
            userEvents === "addMailboxPolling" ||
            userEvents === "editMailboxPolling"
          }
          className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
        >
          <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
            <div className="w-full flex justify-start items-center space-x-2 divide-x">
              <SheetTitle className="sr-only">Mailbox polling</SheetTitle>
              <HeaderHoverCard
                title="Mailbox Polling"
                message="Configure mailboxes to fetch new incoming emails at regular interval and process them as agent tasks"
                type="sheet"
              />
            </div>

            {userEvents === "viewMailboxPolling" && isCreateUpdatePolling && (
              <>
                <div
                  onClick={handleEditMailboxPolling}
                  className="p-2 rounded-md cursor-pointer hover:bg-secondary"
                >
                  <Pencil size={20} />
                </div>
              </>
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
          <div className="grow">
            <div className="grid gap-5 px-4">
              <PollingInformationCard
                userEvents={userEvents}
                form={form}
                emailInfo={emailInfo}
              />

              <DataStorageCard
                userEvents={userEvents}
                form={form}
                mountPaths={mountPaths}
                storageFolder={storageFolder}
                storageBucket={storageBucket}
                storageType={storageType}
              />

              <MailboxSettingsCard
                userEvents={userEvents}
                form={form}
                isTaskFailureAlert={isTaskFailureAlert}
                isDataParsingEnabled={isDataParsingEnabled}
                emailData={emailData}
                notificationRecipientsEmails={notificationRecipientsEmails}
              />
            </div>
          </div>
          <SheetFooter
            className={`${
              userEvents == "editMailboxPolling" && "justify-between!"
            } sticky bottom-0 z-10 p-3 border-t bg-background`}
          >
            {userEvents == "editMailboxPolling" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={cancleEdit}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>

                {showDeletePolling && (
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

            {userEvents === "addMailboxPolling" ||
            userEvents === "editMailboxPolling" ? (
              <div className="flex gap-2">
                <Button
                  variant={variant}
                  onClick={onClick}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {label}
                </Button>
              </div>
            ) : null}

            {isCreateAgents && userEvents === "viewMailboxPolling" ? (
              emailData?.status === "RUNNING" ? (
                <Button
                  variant="destructive"
                  onClick={onClick}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Stop Polling
                </Button>
              ) : emailData?.status === "CREATED" ? (
                <Button
                  variant="default"
                  onClick={onClick}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Start Polling
                </Button>
              ) : emailData?.status === "STOPPED" ? (
                <Button
                  variant="default"
                  onClick={onClick}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Start Polling
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={onClick}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Mailbox Polling
                </Button>
              )
            ) : null}
          </SheetFooter>
          <CustomAlertDialog
            open={open}
            onOpenChange={setOpen}
            handleAlert={handleStopPolling}
            isLoading={isLoading}
            title={
              emailData?.status == "RUNNING"
                ? "Are you sure want to stop polling ?"
                : "Are you sure want to start polling ?"
            }
            description={
              emailData?.status == "RUNNING"
                ? "This action will stop mailbox polling and no new emails will be fetched from the mailbox"
                : "This action will start mailbox polling and periodically fetch new emails from the specified folder. You can optionally fetch existing emails from the past 1, 7, or 15 days, or start from now and only get new emails going forward."
            }
            isMailboxStart={emailData?.status !== "RUNNING"}
          />
        </SheetContent>
      </Sheet>

      <CustomDeleteDialog
        open={openconfirmModel}
        onOpenChange={setOpenconfirmModel}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title={"Are you sure you want to delete this polling configuration?"}
        description={
          "This action cannot be undone and will permanently remove the mailbox polling for this email."
        }
      />
    </>
  );
}
