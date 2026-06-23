"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import {
  getIconsData,
  getIconSvg,
} from "@/components/icon-manager/icon-render-component";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  canAcceptDataTableNameDraft,
  createTableSchema,
  DATA_TABLE_NAME_MAX_LENGTH,
  type CreateTableSchemaType,
} from "@/lib/schemas/table-schemas";
import { IconPicker } from "@/components/ui/icon-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { DynamicTable } from "../types/table-types";
import {
  normalizeTableAvailability,
  TableAvailabilityTabs,
} from "./table-availability-tabs";

interface CreateTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    name: string,
    description: string,
    icon: string,
    availability: string,
  ) => Promise<string> | string;
  mode?: "create" | "edit";
  table?: DynamicTable | null;
  onUpdate?: (
    tableId: string,
    name: string,
    description: string,
    icon: string,
    availability: string,
  ) => Promise<void | boolean> | void | boolean;
  onDelete?: (tableId: string) => Promise<void | boolean> | void | boolean;
  existingNames: string[];
}

const TABLE_DEFAULT_ICON = "grid-table";
const TABLE_CREATE_DEFAULT_VALUES: CreateTableSchemaType = {
  icon: TABLE_DEFAULT_ICON,
  name: "",
  description: "",
  availability: "UNLISTED",
};

export default function CreateTableDialog({
  open,
  onOpenChange,
  onCreate,
  mode = "create",
  table,
  onUpdate,
  onDelete,
  existingNames,
}: CreateTableDialogProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const form = useForm<CreateTableSchemaType>({
    resolver: zodResolver(createTableSchema),
    defaultValues: TABLE_CREATE_DEFAULT_VALUES,
    mode: "onChange",
  });
  const dataTableIcons = getIconsData("data_table_icons");
  const defaultIcon = getIconSvg(TABLE_DEFAULT_ICON, "data_table_icons");
  const isEditMode = mode === "edit" && !!table;
  const isFormValid = form.formState.isValid;

  useEffect(() => {
    if (!open) return;

    if (isEditMode && table) {
      form.reset({
        icon: table.icon || TABLE_DEFAULT_ICON,
        name: table.name,
        description: table.description ?? "",
        availability: normalizeTableAvailability(table.availability),
      });
      return;
    }

    form.reset(TABLE_CREATE_DEFAULT_VALUES);
  }, [form, isEditMode, open, table]);

  const handleSubmit = async (values: CreateTableSchemaType) => {
    if (isSubmitting) return;
    const trimmedName = values.name.trim();

    if (
      existingNames.some(
        (n) =>
          n.toLowerCase() === trimmedName.toLowerCase() &&
          (!isEditMode || n.toLowerCase() !== table?.name.toLowerCase()),
      )
    ) {
      form.setError("name", {
        message: "A data table with this name already exists",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && table && onUpdate) {
        const success = await onUpdate(
          table.id,
          trimmedName,
          values.description?.trim() ?? "",
          values.icon || TABLE_DEFAULT_ICON,
          values.availability,
        );
        if (success === false) return;
        form.reset(TABLE_CREATE_DEFAULT_VALUES);
        onOpenChange(false);
        return;
      }

      const newId = await onCreate(
        trimmedName,
        values.description?.trim() ?? "",
        values.icon || TABLE_DEFAULT_ICON,
        values.availability,
      );
      if (!newId) return;
      form.reset(TABLE_CREATE_DEFAULT_VALUES);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    form.reset(TABLE_CREATE_DEFAULT_VALUES);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!table || !onDelete) return;
    await onDelete(table.id);
    setDeleteConfirmOpen(false);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (isSubmitting) return;
        if (!v) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold leading-none">
            {isEditMode ? "Edit Data Table" : "Create Data Table"}
          </DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 cursor-pointer text-muted-foreground"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col"
          >
            <div className="flex flex-col gap-4 px-4 py-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <IconPicker
                    label="Icon"
                    icons={dataTableIcons}
                    field={{
                      ...field,
                      value: field.value || TABLE_DEFAULT_ICON,
                    }}
                    defaultIcon={defaultIcon}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. deals, contacts, inventory"
                        autoFocus
                        disabled={isSubmitting}
                        maxLength={DATA_TABLE_NAME_MAX_LENGTH}
                        {...field}
                        onChange={(event) => {
                          const next = event.target.value;
                          if (canAcceptDataTableNameDraft(next)) {
                            field.onChange(next);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <AutoGrowingTextarea
                        placeholder="Briefly describe what this data table is for..."
                        className="resize-none"
                        rows={3}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex w-full flex-row items-center gap-5">
                      <FormLabel className="mb-0 w-28 shrink-0 text-sm font-medium leading-none">
                        Availability
                      </FormLabel>
                      <FormControl className="min-w-0 flex-1">
                        <TableAvailabilityTabs
                          value={field.value ?? "UNLISTED"}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="px-4 pb-4 sm:justify-between gap-2 sm:gap-2">
              <div>
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                    disabled={isSubmitting}
                    className="cursor-pointer border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete data table"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="cursor-pointer"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update" : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <CustomDeleteDialog
        open={deleteConfirmOpen}
        title="Delete data table"
        description="This will permanently delete this data table, its columns, and all rows. This action cannot be undone."
        onOpenChange={setDeleteConfirmOpen}
        handleAlert={handleDelete}
      />
    </Dialog>
  );
}
