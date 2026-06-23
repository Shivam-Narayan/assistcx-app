"use client";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { ConfirmationDialog } from "@/components/confirmation-modal";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import FileUpload from "@/components/file-upload";
import HeaderHoverCard from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import VersionHistory from "@/components/version-history/version-history-page";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import { canDelete, canEdit } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import { Download, Loader2, Pencil, Trash2, Upload, X } from "lucide-react";
import ClassGroupCard from "./component/class-group-card";
import ClassLabelCard from "./component/class-label-card";
import { useClassGroupLogic } from "./hook/useClassGroupOperations";
import { cellObject } from "./hook/useGetClassGroupData";

interface ReceivingComponentProps {
  loadTableData: (data: cellObject, type: PostActionStateSyncAction) => void;
  isCreateClass: boolean;
}

export function AddEditClassGroup({
  loadTableData,
  isCreateClass,
}: ReceivingComponentProps) {
  const {
    userEvents,
    classGroupData,
    setSheetOpen,
    isLoading,
    isDeleteLoading,
    sheetOpen,
    openconfirmModel,
    showClassLabelForm,
    dataFields,
    mainForm,
    classLabelForm,
    handleClassGroupField,
    onSubmitClassLabel,
    ClassGroupInfo,
    handleResetForm,
    handleEditClassGroup,
    label,
    variant,
    onClick,
    cancleEdit,
    removeDataField,
    handleDeleteClick,
    handleConfirmDelete,
    setShowClassLabelForm,
    setOpenconfirmModel,
    editDataField,
    moveDataField,
    editingIndex,
    setEditingIndex,
    isAdding,
    setIsAdding,
    isImportModalOpen,
    setIsImportModalOpen,
    handleImportClassGroup,
    openConfirmation,
    setOpenConfirmation,
    handleExportClassGroup,
    handleRestoreVersionData,
    isImportLoading,
  } = useClassGroupLogic(loadTableData);

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const showDeleteClassGroup = permissions
    ? canDelete(permissions, "class_groups")
    : false;
  const allowRestoreVersion = permissions
    ? canEdit(permissions, "class_groups")
    : false;

  const isClassGroupSheetActive =
    userEvents === "viewClassGroup" ||
    userEvents === "addClassGroup" ||
    userEvents === "editClassGroup";

  return (
    <>
      <Sheet
        open={sheetOpen && isClassGroupSheetActive}
        onOpenChange={setSheetOpen}
      >
        <SheetContent
          onCloseAutoFocus={handleResetForm}
          preventAutoClose={
            userEvents === "editClassGroup" || userEvents === "addClassGroup"
          }
          className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
        >
          <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
            <div className="w-full flex justify-start items-center space-x-2 divide-x">
              <SheetTitle className="sr-only">Class Group</SheetTitle>
              <HeaderHoverCard
                title="Class Group"
                message="A Class Group is a collection that organizes multiple class labels under a shared name and description, typically used to group related categories for AI model training."
                type="sheet"
              />
            </div>

            {/* Version History */}
            {userEvents === "viewClassGroup" && (
              <div className="flex items-center gap-2">
                <VersionHistory
                  currentJson={classGroupData}
                  entityType="class_group"
                  entityId={classGroupData?.id}
                  isRestoreVersionAllowed={allowRestoreVersion}
                  handleRestoreVersionData={handleRestoreVersionData}
                />
              </div>
            )}

            {(userEvents == "addClassGroup" ||
              userEvents == "editClassGroup") && (
              <ConditionalTooltip
                content="Import"
                alwaysShow={true}
                align="center"
                showArrow={true}
              >
                <div
                  onClick={() => setIsImportModalOpen(true)}
                  className="p-2 rounded-md cursor-pointer hover:bg-secondary"
                >
                  <Upload className="h-5 w-5" />
                </div>
              </ConditionalTooltip>
            )}

            {userEvents === "viewClassGroup" && isCreateClass && (
              <>
                <ConditionalTooltip
                  content="Export"
                  alwaysShow={true}
                  align="center"
                  showArrow={true}
                >
                  <div
                    onClick={() => setOpenConfirmation(true)}
                    className="p-2 rounded-md cursor-pointer hover:bg-secondary"
                  >
                    <Download className="h-5 w-5" />
                  </div>
                </ConditionalTooltip>
                <ConditionalTooltip
                  content="Edit"
                  alwaysShow={true}
                  align="center"
                  showArrow={true}
                >
                  <div
                    onClick={handleEditClassGroup}
                    className="p-2 rounded-md cursor-pointer hover:bg-secondary"
                  >
                    <Pencil className="h-5 w-5" />
                  </div>
                </ConditionalTooltip>
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
            <div className="grid gap-5 px-4 pb-4">
              <ClassGroupCard
                userEvents={userEvents}
                mainForm={mainForm}
                handleClassGroupField={handleClassGroupField}
                ClassGroupInfo={ClassGroupInfo}
              />

              <ClassLabelCard
                userEvents={userEvents}
                dataFields={dataFields}
                showClassLabelForm={showClassLabelForm}
                setShowClassLabelForm={setShowClassLabelForm}
                removeDataField={removeDataField}
                classLabelForm={classLabelForm}
                onSubmitClassLabel={onSubmitClassLabel}
                editDataField={editDataField}
                moveDataField={moveDataField}
                editingIndex={editingIndex}
                setEditingIndex={setEditingIndex}
                isAdding={isAdding}
                setIsAdding={setIsAdding}
              />
            </div>
          </div>

          {userEvents != "viewClassGroup" && (
            <SheetFooter
              className={`${
                userEvents == "editClassGroup" && "justify-between!"
              } sticky z-10 p-3 border-t bg-background bottom-0`}
            >
              {userEvents == "editClassGroup" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={cancleEdit}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  {showDeleteClassGroup && (
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

      {/* Import */}
      {isImportModalOpen && (
        <>
          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogContent className="flex flex-col p-0 overflow-auto gap-2 sm:max-w-xl">
              <DialogHeader className="sticky top-0 z-10 flex px-4 pt-3 flex-row justify-between items-center space-y-0 bg-background">
                <div className="w-full">
                  <DialogTitle>Import Class Group</DialogTitle>
                </div>
                <DialogClose>
                  <div
                    className="p-1 rounded-md cursor-pointer hover:bg-secondary"
                    onClick={(setIsImportModalOpen) => !setIsImportModalOpen}
                  >
                    <X />
                  </div>
                </DialogClose>
              </DialogHeader>
              <DialogDescription className="px-4 pb-2">
                Upload a JSON file containing the template configuration to
                deploy it in the environment.
              </DialogDescription>
              <div className="px-5 pb-5">
                {
                  <FileUpload
                    text={"Drag and drop your file here or click to browse."}
                    subText={"Click to upload file (file should be JSON)"}
                    multiple={false}
                    accept={{ "application/json": [] }}
                    handleImportAgent={handleImportClassGroup}
                    isLoading={isImportLoading}
                    buttonText={"Import Class Group"}
                  />
                }
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Export  */}
      {openConfirmation && (
        <ConfirmationDialog
          open={openConfirmation}
          confirm={handleExportClassGroup}
          cancel={() => setOpenConfirmation(false)}
          title="Are you sure you want to export this class group?"
          description="This will download a JSON file containing the full class group configuration which you can use to deploy in any environment."
        />
      )}

      {/* Remove */}
      <CustomDeleteDialog
        open={openconfirmModel}
        onOpenChange={setOpenconfirmModel}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title={"Are you sure you want to delete this Class Group?"}
        description={
          "This action cannot be undone and will permanently delete the class group and its associated intent classes."
        }
      />
    </>
  );
}
