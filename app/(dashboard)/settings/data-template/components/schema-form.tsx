"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { InfoIconWithMessage } from "@/components/InfoIconWithMessage";
import { Button } from "@/components/ui/button";
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
import { PlusCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { dataTypeList } from "../add-edit-data-template";
import { AliasInput } from "../alias-input";
import type { NestedFieldData } from "./add-edit-template";
import { NestedSchema } from "./nested-schema";

export interface SchemaFormProps {
  dataSchemaForm: UseFormReturn<DataSchemaModalType>;
  localError: string;
  setLocalError: (error: string) => void;
  listNestedFields: NestedFieldData[];
  editNestedIndex: number | null;
  nestedFieldForm: UseFormReturn<NestedFieldSchemaType>;
  showAddNestedFieldForm: boolean;
  onSaveNestedField: (data: NestedFieldSchemaType) => void;
  onCancelNestedField: () => void;
  handleAddNestedField: () => void;
  handleDragEnd: (event: any) => void;
  handleEditNestedFieldClick: (index: number) => void;
  handleDeleteforsigleNestedField: (indexToDelete: number) => void;
  handleSaveNestedField: (data: any, index: number) => void;
  handleCancelEditNested: () => void;
  closeModal: () => void;
  addSubmitSchemaHandler: (values: DataSchemaModalType) => void;
}

export function SchemaForm({
  dataSchemaForm,
  localError,
  setLocalError,
  listNestedFields,
  editNestedIndex,
  nestedFieldForm,
  showAddNestedFieldForm,
  onSaveNestedField,
  onCancelNestedField,
  handleAddNestedField,
  handleDragEnd,
  handleEditNestedFieldClick,
  handleDeleteforsigleNestedField,
  handleSaveNestedField,
  handleCancelEditNested,
  closeModal,
  addSubmitSchemaHandler,
}: SchemaFormProps) {
  return (
    <div className="p-4 grow overflow-y-auto">
      <div className="border rounded-lg p-4 bg-muted/30 border-dashed">
        <div className="p-4 border rounded-lg bg-background">
          <Form {...dataSchemaForm}>
            <form className="space-y-4">
              <div className="flex-1 space-y-4">
                <FormField
                  control={dataSchemaForm.control}
                  name="fieldName"
                  render={({ field }) => (
                    <FormItem className="">
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
                  control={dataSchemaForm.control}
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
                        onValueChange={(val) => onChange(val)}
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
                  control={dataSchemaForm.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        <div className="flex items-center gap-1">
                          <span>Keywords</span>
                          <InfoIconWithMessage content="Type a word and press Enter or a Comma to make it into a keyword." />
                        </div>
                      </FormLabel>

                      <FormControl>
                        <AliasInput
                          name="keywords"
                          control={dataSchemaForm.control}
                          localError={localError}
                          setLocalError={setLocalError}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={dataSchemaForm.control}
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
                          placeholder="Enter field description"
                          {...field}
                          maxLength={1800}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {dataSchemaForm.formState.errors.nestedFields && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {
                      dataSchemaForm.formState.errors.nestedFields
                        .message as string
                    }
                  </p>
                )}
              </div>
            </form>
          </Form>

          {(() => {
            const dataTypeValue = dataSchemaForm.watch("dataType");
            return (
              dataTypeValue === "object" || dataTypeValue === "list[object]"
            );
          })() && (
            <NestedSchema
              listNestedFields={listNestedFields}
              editNestedIndex={editNestedIndex}
              nestedFieldForm={nestedFieldForm}
              showAddNestedFieldForm={showAddNestedFieldForm}
              onSaveNestedField={onSaveNestedField}
              onCancelNestedField={onCancelNestedField}
              handleAddNestedField={handleAddNestedField}
              handleDragEnd={handleDragEnd}
              handleEditNestedFieldClick={handleEditNestedFieldClick}
              handleDeleteforsigleNestedField={handleDeleteforsigleNestedField}
              handleSaveNestedField={handleSaveNestedField}
              handleCancelEditNested={handleCancelEditNested}
            />
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={closeModal}
            >
              <span>Cancel</span>
            </Button>

            <Button
              className="cursor-pointer"
              onClick={dataSchemaForm.handleSubmit(addSubmitSchemaHandler)}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Save field</span>{" "}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
