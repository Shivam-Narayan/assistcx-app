"use client";

import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import { useDataTemplateApi } from "./useDataTemplateApi";
import { useDataTemplateSchemaOps } from "./useDataTemplateSchemaOps";
import { useDataTemplateState } from "./useDataTemplateState";

export type {
  DataSchemaData,
  FileUploadType,
  IDataRow,
  IViewDataSchema,
  NestedFieldData,
} from "./data-template-types";

export const useDataTemplateOperations = (
  loadTableData: (data: any, type: PostActionStateSyncAction) => void,
) => {
  const state = useDataTemplateState();
  const schemaOps = useDataTemplateSchemaOps(state);
  const api = useDataTemplateApi(state, loadTableData);

  return {
    userEvents: state.userEvents,
    dataTemplate: state.dataTemplate,
    sheetEvent: state.sheetEvent,
    sheetOpen: state.sheetOpen,
    setSheetOpen: state.setSheetOpen,
    dataSchemasList: state.dataSchemasList,
    openAddDataSchemaModal: state.openAddDataSchemaModal,
    editIndex: state.editIndex,
    openconfirmModel: state.openconfirmModel,
    setOpenconfirmModel: state.setOpenconfirmModel,
    isLoading: state.isLoading,
    isImportLoading: state.isImportLoading,
    isDeleteLoading: state.isDeleteLoading,
    ViewDataSchemaJSON: state.ViewDataSchemaJSON,
    localError: state.localError,
    setLocalError: state.setLocalError,
    isImportModalOpen: state.isImportModalOpen,
    setIsImportModalOpen: state.setIsImportModalOpen,
    openConfirmation: state.openConfirmation,
    setOpenConfirmation: state.setOpenConfirmation,
    editNestedIndex: state.editNestedIndex,
    isCollapsed: state.isCollapsed,
    openPrompt: state.openPrompt,
    setOpenPrompt: state.setOpenPrompt,
    dataSchemaLoader: state.dataSchemaLoader,
    listNestedFields: state.listNestedFields,
    showAddNestedFieldForm: state.showAddNestedFieldForm,
    form: state.form,
    dataSchemaForm: state.dataSchemaForm,
    nestedFieldForm: state.nestedFieldForm,
    DataTemplateInfo: state.DataTemplateInfo,
    DataSchemaInfo: state.DataSchemaInfo,
    handleResetForm: state.handleResetForm,
    handleEditDataTemplate: state.handleEditDataTemplate,
    viewDataSchemaJeson: state.viewDataSchemaJeson,
    onSubmit: api.onSubmit,
    label: api.label,
    variant: api.variant,
    onClick: api.onClick,
    convertDataInJson: schemaOps.convertDataInJson,
    handleRestoreVersionData: api.handleRestoreVersionData,
    onDragEnd: schemaOps.onDragEnd,
    removeDataSchemaHandler: schemaOps.removeDataSchemaHandler,
    setEditDataSchemaHandler: schemaOps.setEditDataSchemaHandler,
    cancelUpdate: schemaOps.cancelUpdate,
    saveEditDataSchemaHandler: schemaOps.saveEditDataSchemaHandler,
    addNewSchemaFormHandler: schemaOps.addNewSchemaFormHandler,
    addSubmitSchemaHandler: schemaOps.addSubmitSchemaHandler,
    closeModal: schemaOps.closeModal,
    cancleEdit: schemaOps.cancleEdit,
    handleDeleteClick: api.handleDeleteClick,
    handleConfirmDelete: api.handleConfirmDelete,
    handleDeleteNestedField: schemaOps.handleDeleteNestedField,
    handleDeleteforsigleNestedField: schemaOps.handleDeleteforsigleNestedField,
    handleDragEnd: schemaOps.handleDragEnd,
    handleEditNestedFieldClick: schemaOps.handleEditNestedFieldClick,
    handleCancelEditNested: schemaOps.handleCancelEditNested,
    handleSaveNestedField: schemaOps.handleSaveNestedField,
    onSaveNestedField: schemaOps.onSaveNestedField,
    onCancelNestedField: schemaOps.onCancelNestedField,
    handleAddNestedField: schemaOps.handleAddNestedField,
    handleImportDataTemplate: api.handleImportDataTemplate,
    handleExportDataTemplate: api.handleExportDataTemplate,
    handleGenerateDataSchema: api.handleGenerateDataSchema,
    showGenerateButton: api.showGenerateButton,
  };
};
