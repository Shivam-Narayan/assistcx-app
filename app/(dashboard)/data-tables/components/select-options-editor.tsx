"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { CalendarIcon, GripVertical, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  canAcceptSelectOptionDraft,
  TEXT_PLAIN_VALUE_INVALID_MESSAGE,
  validateSelectOptionValue,
} from "../utils/cell-validation";
import {
  OPTION_COLOR_HEX,
  OPTION_COLORS,
  type ColumnOptionInput,
  type ColumnOptionItem,
  type OptionColorName,
} from "../types/table-types";

const DEFAULT_OPTION_COLOR: OptionColorName = "gray";

function normalizeOption(option: ColumnOptionInput): ColumnOptionItem | null {
  const normalized = typeof option === "string" ? { value: option } : option;

  return normalized.value ? normalized : null;
}

export function SelectOptionsEditor({
  options,
  onChange,
}: {
  options: ColumnOptionInput[];
  onChange: (options: ColumnOptionItem[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const normalizedOptions = options
    .map(normalizeOption)
    .filter((option): option is ColumnOptionItem => Boolean(option));
  const draftTrimmed = draft.trim();
  const canAddDraft =
    draftTrimmed.length > 0 &&
    validateSelectOptionValue(draft).valid &&
    !normalizedOptions.some(
      (option) => option.value.toLowerCase() === draftTrimmed.toLowerCase(),
    );
  const draftError =
    draft.length > 0 && !canAcceptSelectOptionDraft(draft)
      ? TEXT_PLAIN_VALUE_INVALID_MESSAGE
      : undefined;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const addOption = () => {
    const value = draft.trim();
    if (
      !value ||
      !validateSelectOptionValue(draft).valid ||
      normalizedOptions.some(
        (option) => option.value.toLowerCase() === value.toLowerCase(),
      )
    ) {
      return;
    }
    onChange([
      ...normalizedOptions,
      { value, color: OPTION_COLOR_HEX[DEFAULT_OPTION_COLOR] },
    ]);
    setDraft("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const nextOptions = [...normalizedOptions];
    const oldIndex = nextOptions.findIndex(
      (option) => option.value === String(active.id),
    );
    const newIndex = nextOptions.findIndex(
      (option) => option.value === String(over.id),
    );
    if (oldIndex === -1 || newIndex === -1) return;
    nextOptions.splice(oldIndex, 1);
    nextOptions.splice(newIndex, 0, normalizedOptions[oldIndex]);
    onChange(nextOptions);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => {
            const next = event.target.value;
            if (canAcceptSelectOptionDraft(next)) {
              setDraft(next);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addOption();
            }
          }}
          placeholder="Add option"
          aria-invalid={!!draftError}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          disabled={!canAddDraft}
          className="h-9 cursor-pointer"
        >
          Add
        </Button>
      </div>
      {draftError && <p className="text-xs text-destructive">{draftError}</p>}
      {normalizedOptions.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={normalizedOptions.map((option) => option.value)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {normalizedOptions.map((option) => (
                <SortableOptionRow
                  key={option.value}
                  option={option}
                  onColorChange={(color) =>
                    onChange(
                      normalizedOptions.map((item) =>
                        item.value === option.value ? { ...item, color } : item,
                      ),
                    )
                  }
                  onRemove={() =>
                    onChange(
                      normalizedOptions.filter(
                        (item) => item.value !== option.value,
                      ),
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export function SortableOptionRow({
  option,
  onColorChange,
  onRemove,
}: {
  option: ColumnOptionItem;
  onColorChange: (color: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: option.value });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5"
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={`Drag ${option.value}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <OptionColorPicker
        color={option.color}
        onChange={onColorChange}
        displayText={option.value}
      />
      <span className="min-w-0 flex-1 truncate text-sm">{option.value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function OptionColorPicker({
  color,
  onChange,
  displayText,
}: {
  color?: string | null;
  onChange: (color: string) => void;
  displayText: string;
}) {
  const selectedColor = color || OPTION_COLOR_HEX[DEFAULT_OPTION_COLOR];
  const showText =
    displayText.length > 3 ? `${displayText.slice(0, 3)}…` : displayText;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-5 w-5 shrink-0 rounded-full shadow-sm transition-transform duration-200 hover:scale-110"
          style={{
            backgroundColor: selectedColor,
            border: `2px solid ${selectedColor}`,
            filter: "saturate(1.9) brightness(0.95)",
          }}
          aria-label="Choose option color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-4 gap-1.5">
          {OPTION_COLORS.map((colorName) => {
            const swatch = OPTION_COLOR_HEX[colorName];
            const isSelected = swatch === selectedColor;

            return (
              <button
                key={colorName}
                type="button"
                className={cn(
                  "relative h-7 min-w-[52px] max-w-[52px] cursor-pointer rounded-full transition-transform duration-200 hover:scale-110 flex items-center justify-center",
                  isSelected && "scale-110 border",
                )}
                style={{
                  backgroundColor: swatch,
                  filter: "saturate(1.9) brightness(0.95)",
                  border: isSelected ? `1px solid ` : "none",
                }}
                onClick={() => onChange(swatch)}
                aria-label={`Use ${colorName} option color`}
              >
                <span className="block text-xs leading-none tracking-wide">
                  {showText}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function parseDateValue(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export function parseDateTimeValue(value: string) {
  if (!value) return undefined;
  const [datePart, timePart = "00:00"] = value.split("T");
  const date = parseDateValue(datePart);
  if (!date) return undefined;
  const [hours = 0, minutes = 0] = timePart.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function formatDateTimeValue(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function DateTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateTimeValue(value);
  const hours = selectedDate ? format(selectedDate, "HH") : "00";
  const minutes = selectedDate ? format(selectedDate, "mm") : "00";

  const updateDateTime = (
    nextDate: Date,
    nextHours = hours,
    nextMinutes = minutes,
  ) => {
    const updated = new Date(nextDate);
    updated.setHours(Number(nextHours), Number(nextMinutes), 0, 0);
    onChange(formatDateTimeValue(updated));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP p") : "Pick date and time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) updateDateTime(date);
          }}
          initialFocus
        />
        <div className="flex items-center gap-2 border-t p-3">
          <Select
            value={hours}
            onValueChange={(nextHours) => {
              updateDateTime(selectedDate ?? new Date(), nextHours, minutes);
            }}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, idx) => {
                const value = String(idx).padStart(2, "0");
                return (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">:</span>
          <Select
            value={minutes}
            onValueChange={(nextMinutes) => {
              updateDateTime(selectedDate ?? new Date(), hours, nextMinutes);
            }}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }, (_, idx) => {
                const value = String(idx).padStart(2, "0");
                return (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
