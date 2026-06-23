"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  PlusCircleIcon,
  Trash2,
  Move,
  PencilIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import TextareaWithActions from "@/components/textarea-with-action";
import { AgentFormValues } from "../schemas/agent-schema";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/*  Sortable Wrapper  */

const SortableSuccessCriteriaItem = ({
  id,
  children,
}: {
  id: string;
  children: (props: {
    attributes: any;
    listeners: any;
    setActivatorNodeRef: (element: HTMLElement | null) => void;
  }) => React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners, setActivatorNodeRef })}
    </div>
  );
};

interface Props {
  isEditing: boolean;
}

const SuccessCriteriaSection = ({ isEditing }: Props) => {
  const { control, watch, setValue } = useFormContext<AgentFormValues>();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "identity.success_criteria",
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [originalValue, setOriginalValue] = useState<string>("");
  const successCriteria = watch("identity.success_criteria") ?? [];
  const justDraggedRef = useRef(false);
  const [isSuccessCriteriaExpanded, setIsSuccessCriteriaExpanded] =
    useState(true);

  /*  Drag Logic  */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 150);
      return;
    }

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    if (oldIndex === newIndex) return;

    if (oldIndex !== -1 && newIndex !== -1) {
      move(oldIndex, newIndex);
      // Keep edit/add mode on the same logical item after reorder
      setEditIndex((prev) => {
        if (prev === null) return null;
        if (prev === oldIndex) return newIndex;
        if (oldIndex < newIndex && prev > oldIndex && prev <= newIndex)
          return prev - 1;
        if (oldIndex > newIndex && prev >= newIndex && prev < oldIndex)
          return prev + 1;
        return prev;
      });
      setAddingIndex((prev) => {
        if (prev === null) return null;
        if (prev === oldIndex) return newIndex;
        if (oldIndex < newIndex && prev > oldIndex && prev <= newIndex)
          return prev - 1;
        if (oldIndex > newIndex && prev >= newIndex && prev < oldIndex)
          return prev + 1;
        return prev;
      });
    }

    justDraggedRef.current = true;
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 150);
  };

  /* Add Criteria */
  const handleAddCriteria = () => {
    append({ criterion: "" });
    setAddingIndex(fields.length);
  };

  /* Add multiple criteria */
  const handleAddMultipleCriteria = (commaSeparated: string) => {
    const parts = commaSeparated
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    parts.forEach((criterion) => append({ criterion }));
  };

  return (
    <div className="pt-8">
      <Card className="overflow-hidden shadow-none p-0 gap-0">
        <CardHeader
          className={`bg-muted px-4 py-4! flex flex-row items-center justify-between space-y-0 ${
            !isEditing ? "cursor-pointer" : ""
          } ${isEditing || isSuccessCriteriaExpanded ? "border-b" : ""}`}
          onClick={() =>
            !isEditing &&
            setIsSuccessCriteriaExpanded(!isSuccessCriteriaExpanded)
          }
        >
          <div>
            <h3 className="text-base font-semibold leading-none tracking-tight">
              Success Criteria
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Provide the success criteria and expected outcome for the AI agent
            </p>
          </div>

          {!isEditing && (
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isSuccessCriteriaExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </CardHeader>
        {(!isEditing ? isSuccessCriteriaExpanded : true) && (
          <CardContent className="p-4">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {fields.map((field, index) => (
                      <SortableSuccessCriteriaItem key={field.id} id={field.id}>
                        {({ attributes, listeners, setActivatorNodeRef }) => (
                          <>
                            {/* ADD MODE */}
                            {addingIndex === index ? (
                              <TextareaWithActions
                                mode="form"
                                control={control}
                                name={`identity.success_criteria.${index}.criterion`}
                                placeholder="Enter new success criteria"
                                maxLength={500}
                                onCancel={() => {
                                  remove(index);
                                  setAddingIndex(null);
                                }}
                                onSave={() => {
                                  const value =
                                    successCriteria[index]?.criterion?.trim() ??
                                    "";
                                  if (!value) {
                                    remove(index);
                                  } else if (value.includes(",")) {
                                    remove(index);
                                    handleAddMultipleCriteria(value);
                                  }
                                  setAddingIndex(null);
                                }}
                              />
                            ) : editIndex === index ? (
                              /* EDIT MODE */
                              <TextareaWithActions
                                mode="form"
                                control={control}
                                name={`identity.success_criteria.${index}.criterion`}
                                placeholder="Edit success criteria..."
                                maxLength={500}
                                onCancel={() => {
                                  setValue(
                                    `identity.success_criteria.${index}.criterion`,
                                    originalValue,
                                    { shouldDirty: true },
                                  );
                                  setEditIndex(null);
                                }}
                                onSave={() => setEditIndex(null)}
                              />
                            ) : (
                              /* VIEW MODE */
                              <Card className="shadow-none p-0 gap-0 w-full group bg-white">
                                <CardContent className="px-4 !py-4">
                                  <div className="relative">
                                    <p className="text-sm break-words">
                                      {successCriteria[index]?.criterion}
                                    </p>

                                    <div className="absolute top-1/2 right-2 -translate-y-1/2 bg-background border rounded-md shadow-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="p-2 cursor-pointer"
                                        onClick={() => {
                                          if (justDraggedRef.current) return;
                                          remove(index);
                                        }}
                                      >
                                        <Trash2 strokeWidth={1.5} size={18} />
                                      </Button>

                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="p-2 cursor-pointer"
                                        onClick={() => {
                                          if (justDraggedRef.current) return;
                                          setOriginalValue(
                                            successCriteria[index]?.criterion ??
                                              "",
                                          );
                                          setEditIndex(index);
                                        }}
                                      >
                                        <PencilIcon
                                          strokeWidth={1.5}
                                          size={18}
                                        />
                                      </Button>

                                      <Button
                                        ref={setActivatorNodeRef}
                                        type="button"
                                        variant="ghost"
                                        className="p-2 cursor-move"
                                        {...attributes}
                                        {...listeners}
                                      >
                                        <Move strokeWidth={1.5} size={18} />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </>
                        )}
                      </SortableSuccessCriteriaItem>
                    ))}
                  </SortableContext>
                </DndContext>

                {/* ADD BUTTON */}
                {addingIndex === null && (
                  <Card className="shadow-none p-0 gap-0 overflow-hidden">
                    <CardFooter className="flex items-center justify-center px-3 !py-2 bg-accent gap-2">
                      <div
                        className="flex justify-center items-center cursor-pointer font-medium hover:underline"
                        onClick={handleAddCriteria}
                      >
                        <PlusCircleIcon className="mr-2 h-4 w-4" />
                        Add New Criteria
                      </div>
                    </CardFooter>
                  </Card>
                )}
              </div>
            ) : (
              /* VIEW MODE */
              <>
                {successCriteria.length > 0 ? (
                  successCriteria.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-start mb-3 last:mb-0"
                    >
                      <span className="w-6 h-6 shrink-0 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-600 break-words leading-relaxed">
                          {item?.criterion}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="italic text-gray-500">No Criteria Provided</p>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SuccessCriteriaSection;
