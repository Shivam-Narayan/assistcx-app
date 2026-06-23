"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { InfoIconWithMessage } from "@/components/InfoIconWithMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataSchemaModalType,
  NestedFieldSchemaType,
} from "@/lib/schemas/settings/data-templates-schemas";
import {
  displayNameToStrictSnakeName,
  handleSpaceValidation,
} from "@/lib/utils";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { dataTypeList } from "../add-edit-data-template";
import { AliasInput } from "../alias-input";
import { NestedFieldFormFields } from "./nested-field-form";
import { SortableNestedSchema } from "./sortable-nested-schema";

interface NestedField {
  fieldName: string;
  fieldDescription: string;
  dataType: string;
}

interface EditDataSchemaProps {
  index: number;
  dataSchemaUpdateForm: UseFormReturn<DataSchemaModalType>;
  nestedFieldForm: UseFormReturn<NestedFieldSchemaType>;
  selectedDataType: string;
  nestedFields: NestedField[];
  isNestedFormOpen: boolean;
  editNestedIndex: number | null;
  localError: string;
  setLocalError: (error: string) => void;
  onNestedDragEnd: (event: any) => void;
  onNestedSubmit: (data: NestedFieldSchemaType) => void;
  handleAddNestedFieldClick: () => void;
  handleCancelNestedField: () => void;
  handleEditNestedFieldClick: (nestedIndex: number) => void;
  handleDeleteNestedFieldLocal: (nestedIndex: number) => void;
  cancelUpdate: (index: number) => void;
  SaveUpdate: (index: number) => void;
}

const EditDataSchema = ({
  index,
  dataSchemaUpdateForm,
  nestedFieldForm,
  selectedDataType,
  nestedFields,
  isNestedFormOpen,
  editNestedIndex,
  localError,
  setLocalError,
  onNestedDragEnd,
  onNestedSubmit,
  handleAddNestedFieldClick,
  handleCancelNestedField,
  handleEditNestedFieldClick,
  handleDeleteNestedFieldLocal,
  cancelUpdate,
  SaveUpdate,
}: EditDataSchemaProps) => {
  return (
    <div className="p-4 border rounded-lg bg-background">
      <Form {...dataSchemaUpdateForm}>
        <form className="space-y-4">
          <div className="space-y-4">
            <FormField
              control={dataSchemaUpdateForm.control}
              name="fieldName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground required">
                    <div className="flex items-center gap-1">
                      <span>Field Name</span>

                      <InfoIconWithMessage
                        content={`Field name must be unique and contain only lowercase letters, numbers and underscores. Spaces and hyphens are replaced with underscores; other special characters are removed.`}
                      />
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter field name"
                      {...field}
                      maxLength={80}
                      autoFocus={false}
                      autoComplete="off"
                      onChange={(e) => {
                        field.onChange(
                          displayNameToStrictSnakeName(e.target.value),
                        );
                      }}
                      onKeyDown={handleSpaceValidation}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={dataSchemaUpdateForm.control}
              name="dataType"
              render={({ field: { onChange, value, name } }) => (
                <FormItem>
                  <FormLabel className="text-foreground required">
                    <div className="flex items-center gap-1">
                      <span>Data Type</span>

                      <InfoIconWithMessage
                        content={`Choose the data type from the dropdown.`}
                      />
                    </div>
                  </FormLabel>
                  <Select
                    onValueChange={onChange}
                    defaultValue={value}
                    value={value}
                    name={name}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dataTypeList.map((item, i) => (
                        <SelectItem
                          value={item.value}
                          key={i}
                          className="cursor-pointer"
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={dataSchemaUpdateForm.control}
              name="keywords"
              render={() => (
                <FormItem>
                  <FormLabel className="text-foreground ">
                    <div className="flex items-center gap-1">
                      <span>Keywords</span>
                      <InfoIconWithMessage content="Type a word and press Enter or a Comma to make it into a keyword." />
                    </div>
                  </FormLabel>
                  <FormControl>
                    <AliasInput
                      name="keywords"
                      control={dataSchemaUpdateForm.control as any}
                      localError={localError}
                      setLocalError={setLocalError}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={dataSchemaUpdateForm.control}
              name="fieldDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground required">
                    <div className="flex items-center gap-1">
                      <span>Field Description</span>
                      <InfoIconWithMessage
                        content={`This helps others understand the Field's purpose and expected content.`}
                      />
                    </div>
                  </FormLabel>
                  <FormControl>
                    <AutoGrowingTextarea
                      placeholder="Enter description"
                      {...field}
                      maxLength={1800}
                      autoFocus={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(selectedDataType === "object" ||
              selectedDataType === "list[object]") && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {
                  dataSchemaUpdateForm.formState.errors.nestedFields
                    ?.message as string
                }
              </p>
            )}
          </div>
        </form>
      </Form>

      {(selectedDataType === "object" ||
        selectedDataType === "list[object]") && (
        <Card className="mt-4 border border-dashed p-0 gap-0">
          <CardHeader className="p-4 gap-0">
            <CardTitle className="text-md flex items-center gap-x-1">
              Nested Fields <span className="text-destructive text-lg">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 pt-0">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={onNestedDragEnd}
            >
              <SortableContext
                items={(nestedFields || []).map(
                  (field, i) => `${field.fieldName}-${i}`,
                )}
                strategy={verticalListSortingStrategy}
              >
                {(nestedFields || []).map((row, nestedIndex) =>
                  isNestedFormOpen && editNestedIndex === nestedIndex ? (
                    <Form {...nestedFieldForm} key={`form-${nestedIndex}`}>
                      <form
                        onSubmit={nestedFieldForm.handleSubmit(onNestedSubmit)}
                        className="p-4 border rounded-lg bg-background space-y-4"
                      >
                        <NestedFieldFormFields
                          nestedFieldForm={nestedFieldForm}
                          onSubmit={onNestedSubmit}
                          onCancel={handleCancelNestedField}
                        />
                      </form>
                    </Form>
                  ) : (
                    <SortableNestedSchema
                      key={`${row.fieldName}-${nestedIndex}`}
                      id={`${row.fieldName}-${nestedIndex}`}
                      row={row}
                      nestedIndex={nestedIndex}
                      handleDeleteNestedFieldLocal={
                        handleDeleteNestedFieldLocal
                      }
                      handleEditNestedFieldClick={handleEditNestedFieldClick}
                    />
                  ),
                )}
              </SortableContext>
            </DndContext>

            {isNestedFormOpen && editNestedIndex === null && (
              <Form {...nestedFieldForm}>
                <form
                  onSubmit={nestedFieldForm.handleSubmit(onNestedSubmit)}
                  className="border p-4 rounded-md bg-muted/50 space-y-4"
                >
                  <NestedFieldFormFields
                    nestedFieldForm={nestedFieldForm}
                    onSubmit={onNestedSubmit}
                    onCancel={handleCancelNestedField}
                  />
                </form>
              </Form>
            )}

            {!isNestedFormOpen && (
              <Button
                variant="outline"
                type="button"
                onClick={handleAddNestedFieldClick}
                className="cursor-pointer"
              >
                + Add Nested Field
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => cancelUpdate(index)}
        >
          <span>Cancel</span>
        </Button>
        <Button
          type="submit"
          className="cursor-pointer"
          onClick={dataSchemaUpdateForm.handleSubmit(() => SaveUpdate(index))}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Save field</span>
        </Button>
      </div>
    </div>
  );
};

export default EditDataSchema;
