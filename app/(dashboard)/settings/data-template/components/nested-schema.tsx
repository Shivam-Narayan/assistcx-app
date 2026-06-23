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
import { NestedFieldSchemaType } from "@/lib/schemas/settings/data-templates-schemas";
import {
  displayNameToStrictSnakeName,
  handleSpaceValidation,
} from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { UseFormReturn } from "react-hook-form";
import { NestedDataTypeList } from "../add-edit-data-template";
import { SortableNestedCard } from "../sortable-nested-card";
import type { NestedFieldData } from "./add-edit-template";

export interface NestedSchemaProps {
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
}

export function NestedSchema({
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
}: NestedSchemaProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <Card className="mt-4 border border-dashed p-0 gap-0">
      <CardHeader className="p-4 gap-0">
        <CardTitle className="text-md flex items-center gap-x-1">
          Nested Fields
          <span className="text-destructive text-lg">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex flex-col space-y-4 pt-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={listNestedFields.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col space-y-3">
              {listNestedFields.map((row, nestedIndex) => (
                <SortableNestedCard
                  key={nestedIndex.toString()}
                  id={nestedIndex.toString()}
                  row={row}
                  index={nestedIndex}
                  handleEditNestedFieldClick={handleEditNestedFieldClick}
                  handleDeleteforsigleNestedField={
                    handleDeleteforsigleNestedField
                  }
                  isEditing={editNestedIndex === nestedIndex}
                  handleSaveNestedField={handleSaveNestedField}
                  handleCancelEditNested={handleCancelEditNested}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {showAddNestedFieldForm && (
          <Form {...nestedFieldForm}>
            <form
              onSubmit={nestedFieldForm.handleSubmit(onSaveNestedField)}
              className="border p-4 rounded-md bg-muted/50 space-y-4"
            >
              <FormField
                control={nestedFieldForm.control}
                name="fieldName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
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
                        placeholder="Nested Field Name"
                        {...field}
                        maxLength={80}
                        autoComplete="off"
                        onKeyDown={handleSpaceValidation}
                        onChange={(event) =>
                          nestedFieldForm.setValue(
                            "fieldName",
                            event.target.value != null &&
                              event.target.value != undefined
                              ? displayNameToStrictSnakeName(event.target.value)
                              : "",
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={nestedFieldForm.control}
                name="dataType"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-foreground required">
                      <div className="flex items-center gap-1">
                        <span>Data Type</span>

                        <InfoIconWithMessage
                          content={`Choose the data type from the dropdown.`}
                        />
                      </div>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NestedDataTypeList.map((o) => (
                          <SelectItem
                            key={o.value}
                            value={o.value}
                            className="cursor-pointer"
                          >
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={nestedFieldForm.control}
                name="fieldDescription"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
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
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={onCancelNestedField}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Save Nested Field
                </Button>
              </div>
            </form>
          </Form>
        )}
        {!showAddNestedFieldForm && (
          <Button
            variant="outline"
            type="button"
            onClick={handleAddNestedField}
            className="cursor-pointer"
          >
            + Add Nested Field
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
