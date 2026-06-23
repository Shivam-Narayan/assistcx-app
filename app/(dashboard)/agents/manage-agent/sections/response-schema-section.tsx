"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { ConfirmationDialog } from "@/components/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
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
import { displayNameToStrictSnakeName } from "@/lib/utils";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FolderOutput,
  Loader,
  Move,
  PencilIcon,
  Plus,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Suspense, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { dataTypeList } from "../constants/constants";
import { AgentFormValues } from "../schemas/agent-schema";
import { EmptyState } from "@/components/empty-state/empty-state";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { FormHeaderHeading } from "@/components/ui/form-header";

interface SortableItemProps {
  id: string;
  children: any;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ listeners, attributes })}
    </div>
  );
};

const ResponseSchemaSection = ({ isEditing }: { isEditing: boolean }) => {
  const { control, watch, setValue, trigger, getValues } =
    useFormContext<AgentFormValues>();
  const responseSchemaList = watch("response_schema") || [];
  const [showResponseSchemaForm, setShowResponseSchemaForm] =
    useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [backup, setBackup] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showConfrimation, setShowConfrimation] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "response_schema",
  });

  const handleAddResponseSchema = () => {
    append({
      name: "",
      data_type: "",
      description: "",
    });
    setShowResponseSchemaForm(true);
    setEditIndex(fields.length);
    setIsAdding(true);
  };

  const handleSaveResponseSchema = async () => {
    if (editIndex === null) return;

    const isValid = await trigger([
      `response_schema.${editIndex}.name`,
      `response_schema.${editIndex}.data_type`,
      `response_schema.${editIndex}.description`,
    ]);

    if (!isValid) return;

    const currentName = responseSchemaList[editIndex]?.name
      ?.trim()
      .toLowerCase();

    const isDuplicate = responseSchemaList.some(
      (item, i) =>
        i !== editIndex && item?.name?.trim().toLowerCase() === currentName,
    );

    if (isDuplicate) {
      toast.error("Duplicate field name not allowed");
      return;
    }

    setShowResponseSchemaForm(false);
    setEditIndex(null);
    setIsAdding(false);
  };
  const handleCancel = () => {
    if (editIndex === null) return;

    if (isAdding) {
      remove(editIndex);
    } else if (backup) {
      setValue(`response_schema.${editIndex}`, backup);
    }

    setEditIndex(null);
    setShowResponseSchemaForm(false);
    setIsAdding(false);
    setBackup(null);
  };
  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setShowConfrimation(true);
    // remove(index);
  };

  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
    }

    setDeleteIndex(null);
    setShowConfrimation(false);
  };
  const handleEdit = (index: number) => {
    const originalList = structuredClone(getValues(`response_schema.${index}`));

    setBackup({ ...originalList });
    setEditIndex(index);
    setShowResponseSchemaForm(true);
    setIsAdding(false);
  };
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    move(oldIndex, newIndex);
  };

  const shouldStickButton = responseSchemaList.length > 2;

  return (
    <div className="relative overflow-x-hidden">
      <div className="w-full px-4 py-4 overflow-x-hidden">
        <FormHeaderHeading
          title="Output"
          subtitle="Customize how your agent's results are captured and displayed by setting field names, data types, and descriptions."
          isRequired={false}
        />

        {/* Content */}
        <div className="pt-5">
          <Suspense
            fallback={
              <main className="flex flex-1 items-center justify-center">
                <Loader className="h-10 w-10 animate-spin text-primary" />
              </main>
            }
          >
            {responseSchemaList.length === 0 && !showResponseSchemaForm ? (
              <EmptyState
                variant="card"
                compact
                icon={<FolderOutput />}
                title="No output fields added"
                description="Add fields to define what your agent returns when a task completes."
                className="bg-primary/10"
                action={
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-md cursor-pointer"
                    onClick={handleAddResponseSchema}
                    disabled={!isEditing}
                  >
                    <Plus className="h-4 w-4" /> Add field
                  </Button>
                }
              />
            ) : (
              <>
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="pt-2 pb-2 grow space-y-3 overflow-y-auto overflow-x-hidden">
                      {responseSchemaList.map((field, index) => {
                        const item = responseSchemaList[index];

                        if (editIndex !== index && !item?.name?.trim())
                          return null;

                        /* EDIT FORM */
                        if (editIndex === index) {
                          return (
                            <Card
                              key={fields[index].id}
                              className="p-0 gap-0 flex flex-col overflow-hidden"
                            >
                              <CardHeader className="border-b space-y-0 gap-0 text-left p-4 py-4!">
                                <CardTitle>
                                  {isAdding ? "Add field" : "Edit field"}
                                </CardTitle>
                              </CardHeader>

                              <CardContent className="px-4 py-4 flex flex-col gap-4">
                                {/* Name */}
                                <FormField
                                  control={control}
                                  name={`response_schema.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-foreground">
                                        Field Name{" "}
                                        <span className="text-destructive">
                                          *
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter field name"
                                          {...field}
                                          autoComplete="off"
                                          onChange={(e) => {
                                            field.onChange(
                                              displayNameToStrictSnakeName(
                                                e.target.value,
                                              ),
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Data type */}
                                <FormField
                                  control={control}
                                  name={`response_schema.${index}.data_type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-foreground">
                                        Data Type{" "}
                                        <span className="text-destructive">
                                          *
                                        </span>
                                      </FormLabel>

                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                                            <SelectValue placeholder="Select data type" />
                                          </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                          {dataTypeList.map((item) => (
                                            <SelectItem
                                              key={item.value}
                                              value={item.value}
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

                                {/* Description */}
                                <FormField
                                  control={control}
                                  name={`response_schema.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-foreground">
                                        Field Description{" "}
                                        <span className="text-destructive">
                                          *
                                        </span>
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
                              </CardContent>

                              <CardFooter className="flex justify-between px-4 py-3 bg-accent">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleCancel}
                                  className="cursor-pointer"
                                >
                                  Cancel
                                </Button>

                                <Button
                                  className="cursor-pointer"
                                  type="button"
                                  onClick={handleSaveResponseSchema}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                  Save field
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        }

                        /* NORMAL CARD */
                        return (
                          <SortableItem
                            key={fields[index].id}
                            id={fields[index].id}
                          >
                            {({ listeners, attributes }: any) => (
                              <Card className="shadow-none p-0 gap-0 group bg-white">
                                <CardContent className="py-4! px-4!">
                                  <div className="space-y-3">
                                    <div className="relative flex items-center gap-2">
                                      <ConditionalTooltip
                                        content={item.name}
                                        showArrow={true}
                                      >
                                        <Badge
                                          variant="outline"
                                          className="max-w-[300px] text-sm"
                                        >
                                          <span className="truncate block max-w-[250px]">
                                            {item.name}
                                          </span>
                                        </Badge>
                                      </ConditionalTooltip>

                                      {item.data_type && (
                                        <Badge variant="secondary">
                                          {item.data_type}
                                        </Badge>
                                      )}

                                      {isEditing && (
                                        <div className="absolute right-0 top-0 flex bg-background border rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button
                                            className="cursor-pointer"
                                            type="button"
                                            variant="ghost"
                                            onClick={() => handleDelete(index)}
                                          >
                                            <Trash2 size={20} />
                                          </Button>

                                          <Button
                                            className="cursor-pointer"
                                            type="button"
                                            variant="ghost"
                                            onClick={() => handleEdit(index)}
                                          >
                                            <PencilIcon size={20} />
                                          </Button>

                                          <Button
                                            type="button"
                                            {...attributes}
                                            {...listeners}
                                            variant="ghost"
                                            className="cursor-move"
                                          >
                                            <Move size={20} />
                                          </Button>
                                        </div>
                                      )}
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                      {item.description}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </SortableItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
                {!showResponseSchemaForm && isEditing && (
                  <div
                    className={`${
                      shouldStickButton
                        ? "fixed bottom-0 left-35 w-full py-3 z-50"
                        : "mt-4"
                    }`}
                  >
                    <div className="flex justify-center">
                      <div className="flex flex-row gap-2 backdrop-blur-sm rounded-lg p-2 shadow-lg border bg-primary/20">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-[6px] whitespace-nowrap cursor-pointer"
                          onClick={handleAddResponseSchema}
                          disabled={!isEditing}
                        >
                          <Plus className="h-4 w-4" /> Add field(s)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Suspense>
        </div>
      </div>

      <ConfirmationDialog
        open={showConfrimation}
        confirm={handleConfirmDelete}
        cancel={() => {
          setShowConfrimation(false);
          setDeleteIndex(null);
        }}
        title="Remove this output field?"
        description="This field will be removed from the agent output."
      />
    </div>
  );
};

export default ResponseSchemaSection;
