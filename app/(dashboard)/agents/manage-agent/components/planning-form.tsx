import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import HeaderHoverCard from "@/components/header";
import { ToolSelectorDropdownStyle } from "@/components/tool-selectors/dropdown-tool-selector";
import useToolList from "@/components/tool-selectors/Hook/useToolList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Move, PlusCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { planningStepSchema } from "../schemas/agent-schema";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SortableInstructionItem } from "./sortable-instruction-item";

type StepFormValues = z.infer<typeof planningStepSchema>;

const defaultStepValues: StepFormValues = {
  step_name: "",
  condition: "",
  tool: [],
  instructions: [""],
};

function normalizeStepData(data: any): StepFormValues {
  if (!data) return defaultStepValues;

  const toolObjects = Array.isArray(data.tool)
    ? data.tool
        .map((val: any) => {
          if (typeof val === "string") {
            return { action: val, name: val };
          }

          return {
            action: val?.action || val?.value || "",
            name: val?.name || val?.label || val?.action || "",
          };
        })
        .filter((val: any) => val.action)
    : [];

  return {
    step_name: data.step_name ?? "",
    condition: data.condition ?? "",
    tool: toolObjects,
    instructions: Array.isArray(data.instructions)
      ? data.instructions.length
        ? data.instructions
        : [""]
      : data.instructions
        ? [data.instructions]
        : [""],
  };
}

export type StepFormMode = "add" | "new" | "edit";

interface Props {
  mode: string;
  open: boolean;
  initialData?: any;
  onSave: (step: any) => void;
  onCancel: () => void;
}

const PlanningForm = ({ mode, open, initialData, onSave, onCancel }: Props) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hasCondition, setHasCondition] = useState(!!initialData?.condition);

  const stepForm = useForm<StepFormValues>({
    resolver: zodResolver(planningStepSchema) as Resolver<StepFormValues>,
    defaultValues: defaultStepValues,
  });

  const {
    toolsItems,
    toolsSearch,
    setToolsSearch,
    hasMore,
    isFetchingMore,
    isLoading: isToolsLoading,
    loadMoreTools,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    toolIcons,
    defaultIcon,
  } = useToolList();

  useEffect(() => {
    setSheetOpen(open);
  }, [open]);

  useEffect(() => {
    if (open) {
      const stepData = normalizeStepData(initialData);
      stepForm.reset(stepData);
      setHasCondition(!!stepData.condition?.trim());
    }
  }, [open, initialData]);

  const handleOpenChange = (openState: boolean) => {
    setSheetOpen(openState);
    if (!openState) onCancel();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleSave = () => {
    const step = stepForm.getValues();
    if (!step.step_name?.trim()) {
      stepForm.setError("step_name", { message: "Step name is required" });
      return;
    }

    const validInstructions = (step.instructions || []).filter((i) =>
      i?.trim(),
    );
    if (validInstructions.length === 0) {
      stepForm.setError("instructions", {
        message: "At least one instruction is required",
      });
      return;
    }

    onSave({
      ...step,
      tool: step.tool,
      instructions: validInstructions,
    });
    setSheetOpen(false);
  };

  const addInstruction = () => {
    const instructions = stepForm.getValues("instructions") || [];
    stepForm.setValue("instructions", [...instructions, ""]);
  };
  const isEdit = mode === "edit";

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 h-[100dvh] overflow-hidden">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="w-full flex justify-start items-center space-x-2 divide-x">
            <SheetTitle className="sr-only">
              {isEdit ? "Edit Step" : "Add New Step"}
            </SheetTitle>

            <HeaderHoverCard
              title={isEdit ? "Edit Step" : "Add New Step"}
              message="Configure workflow steps with instructions and tools"
              type="sheet"
            />
          </div>

          <SheetClose asChild>
            <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
              <X className="h-5 w-5" />
            </div>
          </SheetClose>
        </SheetHeader>
        <Form {...stepForm}>
          <form className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="grid gap-5 px-4">
                {/* Condition Toggle */}
                <Card className="shadow-none gap-0 p-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-8">
                      <div className="space-y-0.5">
                        <div className="text-foreground font-medium">
                          Conditional step
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Execute when the defined conditions are met. Add one
                          or more conditions and resepective tools to perform
                          the desired actions.
                        </p>
                      </div>
                      <Switch
                        id="conditional-step-switch"
                        className="cursor-pointer"
                        checked={hasCondition}
                        onCheckedChange={(val) => {
                          setHasCondition(val);
                          if (!val) stepForm.setValue("condition", "");
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* STEP FORM */}
                <Card className="shadow-none p-0 gap-0">
                  <CardContent className="p-4 space-y-4 flex flex-col">
                    {/* Step Name */}
                    <FormField
                      control={stepForm.control}
                      name="step_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            Step Name{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>

                          <FormControl>
                            <Input
                              placeholder="Enter step name..."
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Condition */}
                    {hasCondition && (
                      <FormField
                        control={stepForm.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>

                            <FormControl>
                              <AutoGrowingTextarea
                                placeholder="Describe condition..."
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Tool */}
                    <FormField
                      control={stepForm.control}
                      name="tool"
                      render={({ field }) => {
                        const resolvedValue = hasCondition
                          ? (field.value || []).map((val: any) => ({
                              value: val.action,
                              label: val.name,
                            }))
                          : field.value?.[0]
                            ? {
                                value: field.value[0].action,
                                label: field.value[0].name,
                              }
                            : null;
                        return (
                          <FormItem>
                            <FormLabel className="text-foreground">
                              Tool
                            </FormLabel>

                            <ToolSelectorDropdownStyle
                              maxRows={3}
                              items={toolsItems}
                              selectionMode={
                                hasCondition ? "multiple" : "single"
                              }
                              value={resolvedValue}
                              onChange={(val: any) => {
                                if (hasCondition) {
                                  field.onChange(
                                    (val || []).map((ele: any) => ({
                                      action: ele.value,
                                      name: ele.label,
                                    })),
                                  );
                                } else {
                                  field.onChange(
                                    val
                                      ? [{ action: val.value, name: val.label }]
                                      : [],
                                  );
                                }
                              }}
                              placeholder={
                                hasCondition ? "Select Tools" : "Select a tool"
                              }
                              searchPlaceholder={
                                hasCondition ? "Search Tools" : "Search a tool"
                              }
                              buttonClassName="w-full"
                              showClearButton
                              displayMode={hasCondition ? "pills" : "text"}
                              localSearch={toolsSearch}
                              setLocalSearch={setToolsSearch}
                              hasMore={hasMore}
                              isFetchingMore={isFetchingMore}
                              loadMoreTools={loadMoreTools}
                              filterOptions={filterOptions}
                              selectedFilter={selectedFilter}
                              setSelectedFilter={setSelectedFilter}
                              icons={toolIcons}
                              defaultIcon={defaultIcon}
                              isLoading={isToolsLoading}
                            />

                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={stepForm.control}
                      name="instructions"
                      render={({ field }) => {
                        const instructions = field.value || [];

                        const handleDragEnd = (event: any) => {
                          const { active, over } = event;

                          if (!over || active.id === over.id) return;

                          const oldIndex = instructions.findIndex(
                            (_, i) => `instruction-${i}` === active.id,
                          );
                          const newIndex = instructions.findIndex(
                            (_, i) => `instruction-${i}` === over.id,
                          );

                          const newInstructions = arrayMove(
                            instructions,
                            oldIndex,
                            newIndex,
                          );
                          field.onChange(newInstructions);
                        };

                        return (
                          <FormItem>
                            <FormLabel className="text-foreground">
                              Instructions{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>

                            <DndContext
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                            >
                              <SortableContext
                                items={instructions.map(
                                  (_, i) => `instruction-${i}`,
                                )}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="space-y-2">
                                  {instructions.map((instruction, index) => (
                                    <SortableInstructionItem
                                      key={`instruction-${index}`}
                                      id={`instruction-${index}`}
                                      instruction={instruction}
                                      index={index}
                                      onChange={(val) => {
                                        const updated = [...instructions];
                                        updated[index] = val;
                                        field.onChange(updated);
                                      }}
                                      onRemove={() => {
                                        const updated = instructions.filter(
                                          (_, i) => i !== index,
                                        );
                                        field.onChange(updated);
                                      }}
                                      onBlur={(val) => {
                                        const updated = [...instructions];
                                        updated[index] = val;
                                        field.onChange(updated);
                                      }}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>

                            {instructions.length < 5 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addInstruction}
                                className="w-full p-4 hover:underline cursor-pointer"
                              >
                                <PlusCircle className="h-4 w-4" />
                                Add Instruction
                              </Button>
                            )}

                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
        <SheetFooter className="sticky bottom-0 z-10 flex !justify-between p-3 border-t bg-background">
          <Button
            className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            className="cursor-pointer"
            type="button"
            onClick={stepForm.handleSubmit(handleSave, (errors) =>
              console.log("Validation errors:", errors),
            )}
          >
            {isEdit ? "Save Changes" : "Add Step"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PlanningForm;

// Sortable Rule Item Component
interface SortableRuleItemProps {
  rule: string;
  index: number;
  id: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onBlur: (value: string) => void;
}

export const SortableRuleItem: React.FC<SortableRuleItemProps> = ({
  rule,
  index,
  id,
  onChange,
  onRemove,
  onBlur,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group bg-white">
      <AutoGrowingTextarea
        id={`rule-${id}`}
        name={`rule-${id}`}
        value={rule}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur(e.target.value.trim())}
        placeholder="Enter rule..."
        maxLength={2000}
        autoFocus={false}
        maxHeight={280}
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background border rounded-md shadow-xs flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="px-1 h-6 w-6 cursor-pointer"
        >
          <X className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          {...attributes}
          {...listeners}
          className="px-1 h-6 w-6 cursor-move"
        >
          <Move strokeWidth={1.5} size={16} />
        </Button>
      </div>
    </div>
  );
};

//sortable actions item component
interface SortableActionItemProps {
  action: string;
  index: number;
  id: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onBlur: (value: string) => void;
}

export const SortableActionItem: React.FC<SortableActionItemProps> = ({
  action,
  index,
  id,
  onChange,
  onRemove,
  onBlur,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group bg-white">
      <AutoGrowingTextarea
        id={`action-${id}`}
        name={`action-${id}`}
        value={action}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur(e.target.value.trim())}
        placeholder="Enter action..."
        maxLength={2000}
        autoFocus={false}
        maxHeight={280}
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background border rounded-md shadow-xs flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="px-1 h-6 w-6 cursor-pointer"
        >
          <X className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          {...attributes}
          {...listeners}
          className="px-1 h-6 w-6 cursor-move"
        >
          <Move strokeWidth={1.5} size={16} />
        </Button>
      </div>
    </div>
  );
};
