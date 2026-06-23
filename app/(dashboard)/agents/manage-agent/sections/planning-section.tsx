"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { ConfirmationDialog } from "@/components/confirmation-modal";
import { EmptyState } from "@/components/empty-state/empty-state";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  Bolt,
  ChevronDownIcon,
  ChevronRightIcon,
  Lightbulb,
  Move,
  PencilIcon,
  Play,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import PlanningForm from "../components/planning-form";
import { AgentFormValues } from "../schemas/agent-schema";

function getOrCreateStepId(step: any): string {
  try {
    return step?.id != null && String(step.id).trim() !== ""
      ? String(step.id)
      : uuidv4();
  } catch {
    return `step-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

const PlanningSection = ({ isEditing }: { isEditing: boolean }) => {
  const { watch, setValue } = useFormContext<AgentFormValues>();
  const planningSteps = watch("planning") || [];
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addFirstStep = () => {
    setEditingIndex(null);
    setInsertAfterIndex(null);
    setShowForm(true);
  };

  const handleInlineAdd = (index: number) => {
    setInsertAfterIndex(index);
    setEditingIndex(null);
    setShowForm(true);
  };
  const handleSave = (step: any) => {
    const currentSteps = [...(planningSteps || [])];
    const existingStep =
      editingIndex !== null ? (currentSteps[editingIndex] as any) : null;
    const stepId =
      existingStep?.id != null && String(existingStep.id).trim() !== ""
        ? String(existingStep.id)
        : getOrCreateStepId(step);
    const newStep = {
      id: stepId,
      ...step,
    };

    if (editingIndex !== null) {
      currentSteps[editingIndex] = newStep;
    } else if (insertAfterIndex !== null) {
      currentSteps.splice(insertAfterIndex + 1, 0, newStep);
      setInsertAfterIndex(null);
    } else {
      currentSteps.push(newStep);
    }

    setValue("planning", currentSteps, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setShowForm(false);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index: number) => {
    const filtered = planningSteps.filter((_, i) => i !== index);
    setValue("planning", filtered, { shouldDirty: true });
  };

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = planningSteps.findIndex(
      (step: any, i: number) =>
        step?.id === active.id || active.id === `step-fallback-${i}`,
    );

    const newIndex = planningSteps.findIndex(
      (step: any, i: number) =>
        step?.id === over.id || over.id === `step-fallback-${i}`,
    );

    const reordered = arrayMove(planningSteps, oldIndex, newIndex);
    setValue("planning", reordered, { shouldDirty: true });
  };

  return (
    <div className="w-full px-4 py-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-start justify-between pb-2 gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Planning
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure workflow steps with instructions, objectives and tools for
            AI agent planning.
          </p>
        </div>
      </div>

      <div className="pt-3">
        <Suspense
          fallback={
            <main className="flex flex-1 items-center justify-center">
              <Loader className="h-10 w-10 animate-spin text-primary" />
            </main>
          }
        >
          {planningSteps.length === 0 ? (
            <EmptyState
              variant="card"
              compact
              icon={<Lightbulb />}
              title="No plan added"
              description="Add your first execution step below"
              className="bg-primary/10"
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md cursor-pointer"
                  onClick={addFirstStep}
                  disabled={!isEditing}
                >
                  <Plus className="h-4 w-4" /> New Planning
                </Button>
              }
            />
          ) : (
            <div
              className="space-y-0 bg-muted rounded-lg p-6"
              style={{
                backgroundImage:
                  "radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={planningSteps.map((step: any, i: number) => {
                    const id =
                      step?.id != null && String(step.id).trim() !== ""
                        ? String(step.id)
                        : `step-fallback-${i}`;
                    return id;
                  })}
                  strategy={verticalListSortingStrategy}
                >
                  {planningSteps.map((step: any, index) => {
                    const stepId =
                      step?.id != null && String(step.id).trim() !== ""
                        ? String(step.id)
                        : `step-fallback-${index}`;
                    return (
                      <StepCard
                        key={stepId}
                        id={stepId}
                        step={step}
                        index={index}
                        isEditable={isEditing}
                        onEdit={() => handleEdit(index)}
                        onRemove={() => handleDelete(index)}
                        isLast={index === planningSteps.length - 1}
                        onAdd={() => handleInlineAdd(index)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </Suspense>
      </div>

      {/* Global Sheet for Add & Edit */}
      <Suspense
        fallback={
          <main className="flex flex-1 items-center justify-center">
            <Loader className="h-10 w-10 animate-spin text-primary" />
          </main>
        }
      >
        {showForm && (
          <PlanningForm
            key={
              editingIndex !== null
                ? `edit-${editingIndex}`
                : insertAfterIndex !== null
                  ? `add-after-${insertAfterIndex}`
                  : "new"
            }
            open={showForm}
            mode={editingIndex !== null ? "edit" : "new"}
            initialData={
              editingIndex !== null ? planningSteps[editingIndex] : undefined
            }
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingIndex(null);
              setInsertAfterIndex(null);
            }}
          />
        )}
      </Suspense>
    </div>
  );
};
export default PlanningSection;

interface StepCardProps {
  id: string;
  step: any;
  index: number;
  isEditable: boolean;
  onEdit: () => void;
  onRemove: () => void;
  isLast: boolean;
  onAdd: () => void;
}

const StepCard: React.FC<StepCardProps> = ({
  id,
  isEditable,
  step,
  index,
  onEdit,
  onRemove,
  isLast,
  onAdd,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transform ? transition : undefined,
  };

  const tools = useMemo(() => {
    if (!step.tool) return [];
    return Array.isArray(step.tool) ? step.tool : [step.tool];
  }, [step.tool]);

  const actions = useMemo(() => {
    if (!step.action) return [];

    if (typeof step.action === "string") {
      return [step.action];
    }

    if (Array.isArray(step.action)) {
      return step.action;
    }

    return [];
  }, [step.action]);

  const handleConfirmDelete = () => {
    onRemove();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="w-full">
        <div className="relative">
          {/* Connector ABOVE card */}
          {index > 0 && (
            <div
              className={`absolute -top-4 left-1/2 -translate-x-1/2 w-[2px] h-4`}
              style={{
                background:
                  "repeating-linear-gradient(to bottom, #9ca3af 0px, #9ca3af 4px, transparent 4px, transparent 8px)",
                backgroundSize: "2px 8px",
                animation: "flow 0.6s linear infinite",
              }}
            ></div>
          )}

          {/* Card */}
          <Card
            ref={setNodeRef}
            style={style}
            className={cn(
              "gap-0 p-0 rounded-lg shadow-xs relative bg-white overflow-hidden border border-gray-200",
              !isLast || isEditable ? "mb-16" : "mb-0",
            )}
          >
            {/* Header Section */}
            <CardHeader
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-3 !py-3 bg-gray-50 m-0 gap-0 cursor-pointer group ${
                isExpanded ? "border-b border-gray-200" : ""
              }`}
            >
              {/* Hover Actions */}
              {isEditable && (
                <div
                  className="absolute right-1 top-1 flex bg-white border rounded-md shadow-xs xl:opacity-0 xl:group-hover:opacity-100 xl:transition-opacity z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="p-2 cursor-move touch-none"
                    {...attributes}
                    {...listeners}
                    disabled={!isEditable}
                  >
                    <Move strokeWidth={1.5} size={18} />
                  </Button>

                  <Button
                    type="button"
                    className="p-2 cursor-pointer"
                    variant="ghost"
                    onClick={onEdit}
                    disabled={!isEditable}
                  >
                    <PencilIcon strokeWidth={1.5} size={18} />
                  </Button>
                  <Button
                    type="button"
                    className="p-2 cursor-pointer"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={!isEditable}
                  >
                    <Trash2 strokeWidth={1.5} size={18} />
                  </Button>
                </div>
              )}
              <div className="flex items-center justify-between w-full">
                {/* Step index badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-sm font-medium leading-none">
                    {index + 1}
                  </div>

                  {/* Step name */}
                  {step.step_name && (
                    <span className="text-lg font-semibold text-gray-900">
                      {step.step_name}
                    </span>
                  )}

                  {/* Badges container - keeps badges together when wrapping */}
                  <div className="flex items-center gap-2">
                    {/* Tool badge */}
                    {tools.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-purple-300 bg-purple-100 text-purple-700 text-sm font-medium cursor-pointer hover:bg-purple-200">
                        {tools.length} {tools.length === 1 ? "Tool" : "Tools"}
                      </span>
                    )}

                    {/* Condition badge */}
                    {step.condition && step.condition.trim() !== "" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber-300 bg-amber-100 text-amber-700 text-sm font-medium">
                        <AlertCircle size={14} />
                        Conditional
                      </span>
                    )}
                  </div>
                </div>
                {/* Expanded icon */}
                <div className="flex items-center shrink-0 ml-2">
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-600 transition-transform duration-200" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-600 transition-transform duration-200" />
                  )}
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="gap-4 p-4 flex flex-col">
                {/* Tools (if they exist) */}
                {tools.length > 0 && (
                  <div className="">
                    <span className="text-sm font-medium flex items-center gap-1 mb-1">
                      <Bolt size={12} />
                      Tools
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {tools.map((tool: any, idx: number) => {
                        const toolName =
                          typeof tool === "string"
                            ? tool
                            : tool?.action || tool?.name || "";
                        return (
                          <span
                            key={`${id}-tool-${idx}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-purple-300 bg-purple-100 text-purple-700 text-sm font-medium"
                          >
                            <span className="truncate">{toolName}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Row 2: Condition (if exists) */}
                {step.condition && step.condition.trim() !== "" && (
                  <div className="">
                    <span className="text-sm font-medium flex items-center gap-1 mb-1">
                      <AlertCircle size={12} />
                      Condition
                    </span>
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-2 border-l-4 border-l-amber-500">
                      <p className="text-sm text-amber-900 break-words whitespace-pre-line leading-relaxed">
                        {step.condition}
                      </p>
                    </div>
                  </div>
                )}

                {/* Row 3: instructions (if they exist) */}
                {step.instructions && step.instructions.length > 0 && (
                  <div className="">
                    <span className="text-sm font-medium flex items-center gap-1 mb-1">
                      <Shield size={12} />
                      Instructions
                    </span>

                    <div className="space-y-2">
                      {step?.instructions.map(
                        (instruction: any, instructionIndex: number) => (
                          <p
                            key={`${id}-instruction-${instructionIndex}`}
                            className="text-sm bg-slate-50 dark:bg-slate-700/40 p-2 rounded-md border"
                          >
                            {instruction}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Timeline BELOW card - Hide on last card in view mode */}
          {(!isLast || isEditable) && (
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-[2px] h-14 flex flex-col items-center justify-between group/timeline z-10">
              {/* Top dot - overlaps with card bottom edge */}
              <div className="w-3 h-3 rounded-full bg-gray-400 border border-white relative -mt-1.5"></div>

              <div
                className={`w-[2px] flex-1 group-hover/timeline:transition-colors relative`}
                style={{
                  background:
                    "repeating-linear-gradient(to bottom, #9ca3af 0px, #9ca3af 4px, transparent 4px, transparent 8px)",
                  backgroundSize: "2px 8px",
                  animation: "flow 0.6s linear infinite",
                }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/timeline:opacity-100 transition-opacity">
                  {isEditable && (
                    <ConditionalTooltip
                      content="Add New Step"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                    >
                      <button
                        type="button"
                        onClick={onAdd}
                        className="cursor-pointer w-7 h-7 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg border-2 border-white relative"
                        disabled={!isEditable}
                      >
                        <Plus size={16} className="text-white" />
                      </button>
                    </ConditionalTooltip>
                  )}
                </div>
              </div>

              {/* Bottom dot - will be overlapped by next card's top dot */}
              <div className="w-3 h-3 rounded-full bg-gray-400 border border-white relative -mb-3"></div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationDialog
        open={showDeleteConfirm}
        confirm={handleConfirmDelete}
        cancel={() => setShowDeleteConfirm(false)}
        title={"Are you sure you want to remove this step?"}
        description={
          "Remove this step from the agent's workflow. The step will be removed from the agent plan when you publish your changes."
        }
      />
    </>
  );
};
