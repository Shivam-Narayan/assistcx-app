"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { EmptyState } from "@/components/empty-state/empty-state";
import HeaderHoverCard from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { SheetFooter } from "@/components/ui/sheet";
import {
  DataSchemaModalType,
  FormSchemaType,
  NestedFieldSchemaType,
} from "@/lib/schemas/settings/data-templates-schemas";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  FileBraces,
  Loader2,
  PlusCircleIcon,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import DataSchemaList from "../data-schema-list";
import DocumentInstructionInput from "../document-instruction-input";
import { AddEditHeader } from "./add-edit-header";
import { CommonDetailForm } from "./common-detail-form";
import { SchemaForm } from "./schema-form";

export interface NestedFieldData {
  fieldName: string;
  fieldDescription: string;
  dataType: string;
}

export interface DataSchemaData {
  id: number;
  fieldName: string;
  fieldDescription: string;
  dataType: string;
  keywords?: any;
  nestedFields?: NestedFieldData[];
}

export interface AddEditTemplateProps {
  userEvents: string;
  setIsImportModalOpen: (open: boolean) => void;
  handleResetForm: () => void;
  form: UseFormReturn<FormSchemaType>;
  showGenerateButton: boolean;
  dataSchemasList: DataSchemaData[];
  handleGenerateDataSchema: (promptValue: string) => Promise<void>;
  setOpenPrompt: (open: boolean) => void;
  dataSchemaLoader: boolean;
  onDragEnd: (event: any) => void;
  setEditDataSchemaHandler: (index: number) => void;
  removeDataSchemaHandler: (index: any) => void;
  openAddDataSchemaModal: boolean;
  editIndex: number | null;
  saveEditDataSchemaHandler: (
    index: number | null,
    editedDataSchema: DataSchemaData,
  ) => void;
  cancelUpdate: (index: number | null) => void;
  handleDeleteNestedField: (
    parentIndex: number,
    nestedFieldIndex: number,
  ) => void;
  addNewSchemaFormHandler: () => void;
  dataSchemaForm: UseFormReturn<DataSchemaModalType>;
  localError: string;
  setLocalError: (error: string) => void;
  listNestedFields: NestedFieldData[];
  handleDragEnd: (event: any) => void;
  handleEditNestedFieldClick: (index: number) => void;
  handleDeleteforsigleNestedField: (indexToDelete: number) => void;
  editNestedIndex: number | null;
  handleSaveNestedField: (data: any, index: number) => void;
  handleCancelEditNested: () => void;
  nestedFieldForm: UseFormReturn<NestedFieldSchemaType>;
  showAddNestedFieldForm: boolean;
  onSaveNestedField: (data: NestedFieldSchemaType) => void;
  onCancelNestedField: () => void;
  handleAddNestedField: () => void;
  closeModal: () => void;
  addSubmitSchemaHandler: (values: DataSchemaModalType) => void;
  cancleEdit: () => void;
  handleDeleteClick?: () => void;
  variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  onClick: () => void;
  label: string;
  isLoading: boolean;
}

export function AddEditTemplate({
  userEvents,
  setIsImportModalOpen,
  handleResetForm,
  form,
  showGenerateButton,
  dataSchemasList,
  handleGenerateDataSchema,
  setOpenPrompt,
  dataSchemaLoader,
  onDragEnd,
  setEditDataSchemaHandler,
  removeDataSchemaHandler,
  openAddDataSchemaModal,
  editIndex,
  saveEditDataSchemaHandler,
  cancelUpdate,
  handleDeleteNestedField,
  addNewSchemaFormHandler,
  dataSchemaForm,
  localError,
  setLocalError,
  listNestedFields,
  handleDragEnd,
  handleEditNestedFieldClick,
  handleDeleteforsigleNestedField,
  editNestedIndex,
  handleSaveNestedField,
  handleCancelEditNested,
  nestedFieldForm,
  showAddNestedFieldForm,
  onSaveNestedField,
  onCancelNestedField,
  handleAddNestedField,
  closeModal,
  addSubmitSchemaHandler,
  cancleEdit,
  handleDeleteClick,
  variant,
  onClick,
  label,
  isLoading,
}: AddEditTemplateProps) {
  return (
    <>
      <AddEditHeader
        setIsImportModalOpen={setIsImportModalOpen}
        handleResetForm={handleResetForm}
      />
      <div className="grow">
        <div className="grid gap-5 px-4 pb-4">
          <CommonDetailForm form={form} userEvents={userEvents} />
          <FormProvider {...form}>
            <DocumentInstructionInput userEvents={userEvents} />
          </FormProvider>

          <Card className="p-0 shadow-none gap-0 h-full max-h-full w-full max-w-full flex flex-col shrink-0 snap-center overflow-hidden">
            <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
              <HeaderHoverCard
                title="Data Schema"
                message={`Data fields for AI agents to extract data from the document. Provide proper field names, descriptions and data types.<br><br>
                      Data type could be: String, Integer, Decimal, List. Object.<br><br>
                      For object or list of objects, use description to provide the field names enclosed in angle brackets (&lt;field_name&gt;) followed by the description. Mention the data type in the description as 'integer type' or 'decimal type' etc.`}
                type="card"
                isRequired={true}
              />
              {showGenerateButton && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (dataSchemasList?.length <= 0) {
                      handleGenerateDataSchema("");
                    } else {
                      setOpenPrompt(true);
                    }
                  }}
                  size="sm"
                  className="cursor-pointer"
                  disabled={dataSchemaLoader ? true : false}
                >
                  {dataSchemasList?.length <= 0 && dataSchemaLoader ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate
                </Button>
              )}
            </CardHeader>

            {dataSchemasList.length != 0 && (
              <CardContent className="p-4 grow space-y-3 overflow-y-auto">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={dataSchemasList}
                    strategy={verticalListSortingStrategy}
                  >
                    {dataSchemasList.map((item: any, parentIndex: number) => (
                      <DataSchemaList
                        index={parentIndex}
                        key={parentIndex + item.fieldName}
                        dataSchemaCard={item}
                        setEditDataSchemaHandler={setEditDataSchemaHandler}
                        removeDataSchemaHandler={removeDataSchemaHandler}
                        openAddSchemaModal={openAddDataSchemaModal}
                        editIndex={editIndex}
                        saveEditDataSchemaHandler={saveEditDataSchemaHandler}
                        cancelUpdate={cancelUpdate}
                        handleDeleteNestedField={handleDeleteNestedField}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </CardContent>
            )}

            {dataSchemasList.length == 0 && openAddDataSchemaModal == false && (
              <CardContent className="p-4">
                <EmptyState
                  variant="card"
                  compact
                  icon={<FileBraces />}
                  title="No Data Schema Configured"
                  description="Add data fields to structure the information extracted from documents.
               Each field defines the expected output format and data type."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addNewSchemaFormHandler}
                      className="cursor-pointer"
                    >
                      <PlusCircleIcon className="h-4 w-4" /> Add New Data Field
                    </Button>
                  }
                />
              </CardContent>
            )}

            {openAddDataSchemaModal == false &&
              editIndex == null &&
              dataSchemasList.length !== 0 && (
                <CardFooter className="flex items-center justify-center px-4 py-3 bg-accent gap-2 rounded-b-md">
                  <div
                    className="flex justify-center items-center cursor-pointer font-medium hover:underline"
                    onClick={addNewSchemaFormHandler}
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" />{" "}
                    <span>Add New Data Field</span>
                  </div>
                </CardFooter>
              )}

            {openAddDataSchemaModal && (
              <SchemaForm
                dataSchemaForm={dataSchemaForm}
                localError={localError}
                setLocalError={setLocalError}
                listNestedFields={listNestedFields}
                editNestedIndex={editNestedIndex}
                nestedFieldForm={nestedFieldForm}
                showAddNestedFieldForm={showAddNestedFieldForm}
                onSaveNestedField={onSaveNestedField}
                onCancelNestedField={onCancelNestedField}
                handleAddNestedField={handleAddNestedField}
                handleDragEnd={handleDragEnd}
                handleEditNestedFieldClick={handleEditNestedFieldClick}
                handleDeleteforsigleNestedField={
                  handleDeleteforsigleNestedField
                }
                handleSaveNestedField={handleSaveNestedField}
                handleCancelEditNested={handleCancelEditNested}
                closeModal={closeModal}
                addSubmitSchemaHandler={addSubmitSchemaHandler}
              />
            )}
          </Card>
        </div>
      </div>
      <SheetFooter
        className={`${
          userEvents == "editDataTemplate" && "justify-between!"
        } z-10 p-3 border-t bg-background sticky bottom-0`}
      >
        {userEvents == "editDataTemplate" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={cancleEdit}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            {handleDeleteClick && (
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
          className="cursor-pointer"
          variant={variant}
          onClick={onClick}
          disabled={
            isLoading ||
            openAddDataSchemaModal ||
            editIndex != null ||
            dataSchemasList.length == 0
          }
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {label}
        </Button>
      </SheetFooter>
    </>
  );
}
