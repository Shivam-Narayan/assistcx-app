import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { EmptyState } from "@/components/empty-state/empty-state";
import HeaderHoverCard from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Move,
  PencilIcon,
  PlusCircleIcon,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

type FormSchema = {
  name: string;
  templateClass: string;
  description?: string;
  document_instructions: { value?: string }[];
};

interface DocumentInstructionInputProps {
  userEvents: string;
}

const DocumentInstructionInput = ({
  userEvents,
}: DocumentInstructionInputProps) => {
  const { control, setValue, getValues } = useFormContext<FormSchema>();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [instructionValue, setInstructionValue] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "document_instructions",
  });

  const watchedItems = useWatch({ control, name: "document_instructions" });

  const areAllFieldsFilled = fields.every((field, index) =>
    getValues(`document_instructions.${index}.value`)?.trim(),
  );

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id === over.id) {
      return;
    }
    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    // Get all current values
    const currentValues = fields.map((_, index) =>
      getValues(`document_instructions.${index}.value`),
    );

    // Reorder the values
    const reorderedValues = arrayMove(currentValues, oldIndex, newIndex);

    // Update form with reordered values
    reorderedValues.forEach((value, index) => {
      setValue(`document_instructions.${index}.value`, value);
    });
  };

  return (
    <Card className="p-0 gap-0 h-full max-h-full w-full max-w-full flex flex-col shrink-0 shadow-none snap-center overflow-hidden">
      <CardHeader
        className={`border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0 ${
          userEvents === "viewDataTemplate" ? "cursor-pointer" : ""
        }`}
        onClick={() => {
          if (userEvents === "viewDataTemplate") {
            setIsCollapsed((prev) => !prev);
          }
        }}
      >
        <HeaderHoverCard
          title="Document Instruction"
          message="Document level instructions used to guide the AI during data extraction."
          type="card"
          isRequired={false}
        />
        {userEvents === "viewDataTemplate" && (
          <>
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            )}
          </>
        )}
      </CardHeader>
      {userEvents !== "viewDataTemplate" && (
        <>
          <CardContent
            className={`flex grow flex-col gap-4 overflow-wrap-anywhere ${fields.length > 0 && "p-2 px-4 pb-4 py-6"}`}
          >
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={fields}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <SortableInstructionItem
                    key={field.id}
                    field={field}
                    index={index}
                    editIndex={editIndex}
                    instructionValue={instructionValue}
                    watchedItems={watchedItems}
                    control={control}
                    setInstructionValue={setInstructionValue}
                    setValue={setValue}
                    setEditIndex={setEditIndex}
                    remove={remove}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>

          {fields.length === 0 && (
            <CardContent className="p-4">
              <EmptyState
                variant="card"
                compact
                icon={<FileText />}
                title="No Document Instructions Added"
                description="Add instructions to guide how the system should interpret and extract information from documents.
             Clear instructions improve AI accuracy and output consistency."
                action={
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      append({ value: "" });
                      setEditIndex(fields.length);
                      setInstructionValue("");
                    }}
                  >
                    <PlusCircleIcon className="h-4 w-4" /> Add New Instruction
                  </Button>
                }
              />
            </CardContent>
          )}
          {areAllFieldsFilled && fields.length !== 0 && (
            <CardFooter className="flex items-center justify-center px-4 py-3 bg-accent gap-2 rounded-b-md">
              <div
                className="flex justify-center items-center cursor-pointer font-medium hover:underline"
                onClick={() => {
                  append({ value: "" }); // Append a new empty instruction
                  setEditIndex(fields.length); // Set the new item to edit mode
                  setInstructionValue(""); // Clear instructionValue value for new item
                }}
              >
                <PlusCircleIcon className="mr-2 h-4 w-4" />{" "}
                <span>Add New Instruction</span>
              </div>
            </CardFooter>
          )}
        </>
      )}

      {userEvents === "viewDataTemplate" && !isCollapsed && (
        <>
          <CardContent
            className={`flex grow flex-col gap-4 overflow-wrap-anywhere ${fields.length > 0 && "p-2 px-4 pb-4 py-6"}`}
          >
            {fields?.map((data, i) => (
              <div key={i} className="p-4 border rounded-md relative text-sm">
                {data.value}
              </div>
            ))}
          </CardContent>
          {fields.length === 0 && (
            <CardContent className="p-4">
              <EmptyState
                variant="card"
                compact
                icon={<FileText />}
                title="No Document Instructions Added"
                description="Add instructions to guide how the system should interpret and extract information from documents.
             Clear instructions improve AI accuracy and output consistency."
              />
            </CardContent>
          )}
        </>
      )}
    </Card>
  );
};

export default DocumentInstructionInput;

interface SortableInstructionItemProps {
  field: any;
  index: number;
  editIndex: number | null;
  instructionValue: string;
  watchedItems: any;
  control: any;
  setInstructionValue: (value: string) => void;
  setValue: any;
  setEditIndex: (index: number | null) => void;
  remove: (index: number) => void;
}

const SortableInstructionItem = ({
  field,
  index,
  editIndex,
  instructionValue,
  watchedItems,
  control,
  setInstructionValue,
  setValue,
  setEditIndex,
  remove,
}: SortableInstructionItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });
  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-md relative group bg-white"
    >
      {editIndex === index ? (
        // Edit Mode
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <FormField
              control={control}
              name={`document_instructions.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AutoGrowingTextarea
                      placeholder="Enter document instruction"
                      value={instructionValue}
                      maxLength={480}
                      maxHeight={150}
                      onChange={(e) => setInstructionValue(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-2">
            <span
              className={`${!instructionValue.trim() && "cursor-not-allowed"}`}
            >
              <Button
                variant="ghost"
                onClick={() => {
                  setValue(
                    `document_instructions.${index}.value`,
                    instructionValue,
                  );
                  setEditIndex(null);
                }}
                disabled={!instructionValue.trim()}
                className={`p-2 cursor-pointer ${
                  !instructionValue.trim() && "cursor-not-allowed"
                }`}
              >
                <CheckCircle strokeWidth={1.5} size={20} />
              </Button>
            </span>

            <Button
              variant="ghost"
              className="p-2 cursor-pointer"
              onClick={() => {
                if (!watchedItems[index]?.value?.trim()) {
                  remove(index);
                } else {
                  setInstructionValue("");
                  setEditIndex(null);
                }
              }}
            >
              <XCircle strokeWidth={1.5} size={20} />
            </Button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="relative">
          {watchedItems[index]?.value?.trim() ? (
            <div className="w-full">
              <p className="text-sm">{watchedItems[index]?.value}</p>
            </div>
          ) : (
            <div className="w-full text-destructive">
              <p>Please provide instruction</p>
            </div>
          )}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 flex gap-2 bg-background border rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              className="p-2 cursor-pointer"
              onClick={() => remove(index)}
              disabled={editIndex !== null}
            >
              <Trash2 strokeWidth={1.5} size={20} />
            </Button>
            <Button
              variant="ghost"
              className="p-2 cursor-pointer"
              onClick={() => {
                setInstructionValue(watchedItems[index]?.value || "");
                setEditIndex(index);
              }}
              disabled={editIndex !== null}
            >
              <PencilIcon strokeWidth={1.5} size={20} />
            </Button>

            <Button
              {...attributes}
              {...listeners}
              variant="ghost"
              className="p-2 cursor-move"
              disabled={editIndex !== null}
            >
              <Move strokeWidth={1.5} size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
