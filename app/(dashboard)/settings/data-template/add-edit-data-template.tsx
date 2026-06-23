"use client";

import { ConfirmationDialog } from "@/components/confirmation-modal";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import { canDelete } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import { AddEditTemplate } from "./components/add-edit-template";
import { ImportModal } from "./components/import-modal";
import { ViewTemplate } from "./components/view-template";
import { DataSchemaDialog } from "./data-schema-dialog";
import { useDataTemplateOperations } from "./hook/useDataTemplateOperations";

interface ReceivingComponentProps {
  loadTableData: (data: any, type: PostActionStateSyncAction) => void;
  isCreateUpdateDataTemplate?: boolean;
}

export const dataTypeList = [
  { label: "String", value: "string" },
  { label: "Integer", value: "integer" },
  { label: "Decimal", value: "decimal" },
  { label: "List", value: "list" },
  { label: "Object", value: "object" },
  { label: "List[object]", value: "list[object]" },
];

export const NestedDataTypeList = [
  { label: "String", value: "string" },
  { label: "Integer", value: "integer" },
  { label: "Float", value: "float" },
  { label: "Boolean", value: "boolean" },
];

export function AddEditDataTemplate({
  loadTableData,
  isCreateUpdateDataTemplate,
}: ReceivingComponentProps) {
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const showDeleteDataTemplate = permissions
    ? canDelete(permissions, "data_templates")
    : false;

  const {
    userEvents,
    dataTemplate,
    sheetOpen,
    setSheetOpen,
    dataSchemasList,
    openAddDataSchemaModal,
    editIndex,
    openconfirmModel,
    setOpenconfirmModel,
    isLoading,
    isImportLoading,
    isDeleteLoading,
    ViewDataSchemaJSON,
    localError,
    setLocalError,
    isImportModalOpen,
    setIsImportModalOpen,
    openConfirmation,
    setOpenConfirmation,
    editNestedIndex,
    openPrompt,
    setOpenPrompt,
    dataSchemaLoader,
    listNestedFields,
    showAddNestedFieldForm,
    form,
    dataSchemaForm,
    nestedFieldForm,
    DataTemplateInfo,
    DataSchemaInfo,
    handleResetForm,
    handleEditDataTemplate,
    viewDataSchemaJeson,
    convertDataInJson,
    handleRestoreVersionData,
    onDragEnd,
    removeDataSchemaHandler,
    setEditDataSchemaHandler,
    cancelUpdate,
    saveEditDataSchemaHandler,
    addNewSchemaFormHandler,
    addSubmitSchemaHandler,
    closeModal,
    cancleEdit,
    handleDeleteClick,
    handleConfirmDelete,
    handleDeleteNestedField,
    handleDeleteforsigleNestedField,
    handleDragEnd,
    handleEditNestedFieldClick,
    handleCancelEditNested,
    handleSaveNestedField,
    onSaveNestedField,
    onCancelNestedField,
    handleAddNestedField,
    handleImportDataTemplate,
    handleExportDataTemplate,
    handleGenerateDataSchema,
    showGenerateButton,
    label,
    variant,
    onClick,
  } = useDataTemplateOperations(loadTableData);

  const isDataTemplateSheetActive =
    userEvents === "viewDataTemplate" ||
    userEvents === "addDataTemplate" ||
    userEvents === "editDataTemplate";

  return (
    <>
      <Sheet
        open={sheetOpen && isDataTemplateSheetActive}
        onOpenChange={setSheetOpen}
      >
        <SheetContent
          onCloseAutoFocus={handleResetForm}
          preventAutoClose={
            userEvents == "addDataTemplate" || userEvents == "editDataTemplate"
          }
          className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
        >
          {userEvents === "viewDataTemplate" && (
            <ViewTemplate
              dataTemplate={dataTemplate}
              handleRestoreVersionData={handleRestoreVersionData}
              convertDataInJson={convertDataInJson}
              isCreateUpdateDataTemplate={isCreateUpdateDataTemplate || false}
              handleEditDataTemplate={handleEditDataTemplate}
              handleResetForm={handleResetForm}
              DataTemplateInfo={DataTemplateInfo}
              DataSchemaInfo={DataSchemaInfo}
              setOpenConfirmation={setOpenConfirmation}
              form={form}
              userEvents={userEvents}
              ViewDataSchemaJSON={ViewDataSchemaJSON}
              viewDataSchemaJeson={viewDataSchemaJeson}
            />
          )}
          {(userEvents == "addDataTemplate" ||
            userEvents == "editDataTemplate") && (
            <AddEditTemplate
              userEvents={userEvents}
              setIsImportModalOpen={setIsImportModalOpen}
              handleResetForm={handleResetForm}
              form={form}
              showGenerateButton={showGenerateButton}
              dataSchemasList={dataSchemasList}
              handleGenerateDataSchema={handleGenerateDataSchema}
              setOpenPrompt={setOpenPrompt}
              dataSchemaLoader={dataSchemaLoader}
              onDragEnd={onDragEnd}
              setEditDataSchemaHandler={setEditDataSchemaHandler}
              removeDataSchemaHandler={removeDataSchemaHandler}
              openAddDataSchemaModal={openAddDataSchemaModal}
              editIndex={editIndex}
              saveEditDataSchemaHandler={saveEditDataSchemaHandler}
              cancelUpdate={cancelUpdate}
              handleDeleteNestedField={handleDeleteNestedField}
              addNewSchemaFormHandler={addNewSchemaFormHandler}
              dataSchemaForm={dataSchemaForm}
              localError={localError}
              setLocalError={setLocalError}
              listNestedFields={listNestedFields}
              handleDragEnd={handleDragEnd}
              handleEditNestedFieldClick={handleEditNestedFieldClick}
              handleDeleteforsigleNestedField={handleDeleteforsigleNestedField}
              editNestedIndex={editNestedIndex}
              handleSaveNestedField={handleSaveNestedField}
              handleCancelEditNested={handleCancelEditNested}
              nestedFieldForm={nestedFieldForm}
              showAddNestedFieldForm={showAddNestedFieldForm}
              onSaveNestedField={onSaveNestedField}
              onCancelNestedField={onCancelNestedField}
              handleAddNestedField={handleAddNestedField}
              closeModal={closeModal}
              addSubmitSchemaHandler={addSubmitSchemaHandler}
              cancleEdit={cancleEdit}
              handleDeleteClick={
                showDeleteDataTemplate ? handleDeleteClick : undefined
              }
              variant={variant ?? "default"}
              onClick={onClick ?? (() => {})}
              label={label ?? ""}
              isLoading={isLoading}
            />
          )}
        </SheetContent>
      </Sheet>

      <CustomDeleteDialog
        open={openconfirmModel}
        onOpenChange={setOpenconfirmModel}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title={"Are you sure you want to delete this Data Template?"}
        description={
          "This action cannot be undone and will permanently remove the selected template from the system."
        }
      />

      {isImportModalOpen && (
        <ImportModal
          isImportModalOpen={isImportModalOpen}
          setIsImportModalOpen={setIsImportModalOpen}
          handleImportDataTemplate={handleImportDataTemplate}
          isImportLoading={isImportLoading}
        />
      )}

      {openConfirmation && (
        <ConfirmationDialog
          open={openConfirmation}
          confirm={handleExportDataTemplate}
          cancel={() => setOpenConfirmation(false)}
          title="Are you sure you want to export this template?"
          description="This will download a JSON file containing the full data template configuration which you can use to deploy in any environment."
        />
      )}

      {openPrompt && (
        <DataSchemaDialog
          isLoading={dataSchemaLoader}
          openPrompt={openPrompt}
          setOpenPrompt={setOpenPrompt}
          handleGenerate={handleGenerateDataSchema}
        />
      )}
    </>
  );
}
