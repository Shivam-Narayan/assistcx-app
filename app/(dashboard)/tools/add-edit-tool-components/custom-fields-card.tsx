"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { EmptyState } from "@/components/empty-state/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { displayNameToIdentifierKey } from "@/lib/utils";
import { Pencil, PlusCircleIcon, Settings2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CUSTOM_FIELD_TYPES, CustomFieldDef } from "./tool-interfaces";
import { useAppSelector } from "@/redux/store";
import { getTypeIcon, getTypeLabel } from "@/helper/helper-function";

interface CustomFieldsCardProps {
  customFields: CustomFieldDef[];
  setCustomFields: (fields: CustomFieldDef[]) => void;
  userEvents: string;
}

type CustomFieldFormData = Omit<CustomFieldDef, "type"> & {
  type: CustomFieldDef["type"] | "";
};

const customFieldSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  key: z
    .string()
    .trim()
    .min(1, "Key is required")
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Field key must be a valid identifier"),
  description: z.string().trim().min(1, "Description is required"),
  type: z.enum(["string", "integer", "number", "boolean"], {
    errorMap: () => ({ message: "Type is required" }),
  }),
  required: z.boolean(),
});

const EMPTY_FIELD: CustomFieldFormData = {
  name: "",
  key: "",
  type: "",
  description: "",
  required: false,
};

export function CustomFieldsCard({
  customFields,
  setCustomFields,
  userEvents,
}: CustomFieldsCardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CustomFieldFormData>(EMPTY_FIELD);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CustomFieldFormData, string>>
  >({});
  const toolsData = useAppSelector(
    (state) => state?.toolsDataReducer?.toolsDataReducer?.value,
  );
  const isReadOnly = userEvents === "viewTool";

  const handleAddNew = () => {
    setFormData({ ...EMPTY_FIELD });
    setEditingIndex(null);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = (index: number) => {
    setFormData({ ...customFields[index] });
    setEditingIndex(index);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleDelete = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingIndex(null);
    setFormData({ ...EMPTY_FIELD });
    setFormErrors({});
  };

  const handleNameChange = (value: string) => {
    const formattedKey = displayNameToIdentifierKey(value.trim()).replace(
      /[^A-Za-z0-9_]/g,
      "",
    );
    const key = /^[A-Za-z_]/.test(formattedKey)
      ? formattedKey
      : formattedKey
        ? `field_${formattedKey}`
        : "";
    setFormData((prev) => ({ ...prev, name: value, key }));
  };

  const handleFieldSave = () => {
    const result = customFieldSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFormErrors({
        name: errors.name?.[0],
        description: errors.description?.[0],
        type: errors.type?.[0],
        key: errors.key?.[0],
      });
      return;
    }

    const isDuplicate = customFields.some(
      (f, i) =>
        f.key.toLowerCase() === result.data.key.toLowerCase() &&
        i !== editingIndex,
    );
    if (isDuplicate) {
      setFormErrors({ name: "A field with this name already exists" });
      return;
    }

    if (editingIndex !== null) {
      const updated = [...customFields];
      updated[editingIndex] = result.data;
      setCustomFields(updated);
    } else {
      setCustomFields([...customFields, result.data]);
    }

    handleCancel();
  };

  useEffect(() => {
    if (userEvents === "viewTool") {
      handleCancel();
      setCustomFields(
        Array.isArray(toolsData.custom_fields) ? toolsData.custom_fields : [],
      );
    }
  }, [userEvents]);

  const renderFieldForm = () => (
    <div className="p-4 border rounded-lg bg-background space-y-4">
      <div className="space-y-1.5">
        <Label className="text-foreground required">Name</Label>
        <Input
          placeholder="Enter field name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          autoFocus
        />
        {formErrors.name ? (
          <p className="text-[0.8rem] font-medium text-destructive">
            {formErrors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground required">Description</Label>
        <AutoGrowingTextarea
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          maxLength={500}
          rows={3}
          className="min-h-[100px]"
        />
        {formErrors.description ? (
          <p className="text-[0.8rem] font-medium text-destructive">
            {formErrors.description}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-foreground required">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                type: val as CustomFieldDef["type"],
              }))
            }
          >
            <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_FIELD_TYPES.map((item) => (
                <SelectItem
                  value={item.value}
                  key={item.value}
                  className="cursor-pointer"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.type ? (
            <p className="text-[0.8rem] font-medium text-destructive">
              {formErrors.type}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label className="invisible">Is Required?</Label>
          <div className="flex h-9 items-center justify-between gap-3 rounded-md border px-3">
            <Label className="text-sm text-foreground">Is Required?</Label>
            <Switch
              className="cursor-pointer"
              checked={formData.required}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, required: checked }))
              }
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleFieldSave}
          className="cursor-pointer"
        >
          {editingIndex !== null ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="shadow-none p-0 gap-0">
      <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between">
        <CardTitle className="flex gap-3 text-lg font-medium text-foreground/80">
          Custom Fields
        </CardTitle>

        {!isReadOnly && customFields.length > 0 && !isFormOpen && (
          <Button
            className="cursor-pointer"
            size="sm"
            type="button"
            variant="outline"
            onClick={handleAddNew}
          >
            Add New
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex grow flex-col p-4 space-y-4 overflow-y-auto">
        {customFields.length === 0 && !isFormOpen ? (
          <EmptyState
            variant="card"
            compact
            icon={<Settings2 />}
            title="No custom fields added"
            description="Define custom fields that the agent will fill when invoking this tool."
            action={
              !isReadOnly ? (
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNew}
                >
                  <PlusCircleIcon className="h-4 w-4" /> Add Field
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {customFields.map((field, index) =>
              isFormOpen && editingIndex === index ? (
                <div
                  key={`edit-${index}`}
                  className="border rounded-lg p-4 bg-muted/30 border-dashed"
                >
                  {renderFieldForm()}
                </div>
              ) : (
                <div
                  key={field.key + index}
                  className="group flex gap-2 flex-col rounded-xl p-3 border border-border bg-muted"
                >
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center bg-primary/10 rounded-md p-1.5">
                          {getTypeIcon(field)}
                        </div>

                        <span className="text-base font-medium text-foreground/80">
                          {field.name}
                          {field.required && (
                            <span className="text-destructive text-base">
                              &nbsp;*
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {getTypeLabel(field)}
                        </span>
                      </div>
                    </div>

                    {field.description && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {field.description}
                      </div>
                    )}

                    {!isReadOnly && (
                      <div className="absolute top-0 right-0 flex items-center gap-1 bg-background border rounded-md shadow-xs opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                        <ConditionalTooltip
                          content="Edit"
                          alwaysShow={true}
                          align="center"
                          showArrow={true}
                        >
                          <Button
                            onClick={() => handleEdit(index)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </ConditionalTooltip>
                        <ConditionalTooltip
                          content="Delete"
                          alwaysShow={true}
                          align="center"
                          showArrow={true}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(index)}
                            className="h-8 w-8 p-0 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </ConditionalTooltip>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}

            {isFormOpen && editingIndex === null && (
              <div className="border rounded-lg p-4 bg-muted/30 border-dashed">
                {renderFieldForm()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
