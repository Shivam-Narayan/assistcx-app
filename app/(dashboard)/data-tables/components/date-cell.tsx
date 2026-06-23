"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { TableColumnDef } from "../types/table-types";
import { validateCellValue } from "../utils/cell-validation";
import { CellValidationHint } from "./cell-validation-hint";

function parseDateValue(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  if (value.includes("T")) {
    const [, timePart = "00:00"] = value.split("T");
    const [hours = 0, minutes = 0] = timePart.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

export function formatCellDate(value: string, type: "date" | "datetime") {
  const date = parseDateValue(value);
  if (!date) return "";
  return type === "date"
    ? format(date, "MMM dd, yyyy")
    : format(date, "MMM dd, yyyy hh:mm a");
}

function formatDateValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function formatDateTimeValue(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function DateCell({
  value,
  column,
  type,
  onSave,
}: {
  value: string;
  column: TableColumnDef;
  type: "date" | "datetime";
  onSave: (value: string | number | string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedDate = parseDateValue(value);
  const hours = selectedDate ? format(selectedDate, "HH") : "00";
  const minutes = selectedDate ? format(selectedDate, "mm") : "00";

  const handleDateSelect = (date?: Date) => {
    const nextValue = date
      ? type === "date"
        ? formatDateValue(date)
        : formatDateTimeValue(
            new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              Number(hours),
              Number(minutes),
              0,
              0,
            ),
          )
      : "";
    const validation = validateCellValue(nextValue, column);
    if (!validation.valid) {
      setError(validation.message ?? "Invalid value");
      return;
    }
    setError(null);

    if (!date) {
      onSave("");
      return;
    }

    if (type === "date") {
      onSave(formatDateValue(date));
      setOpen(false);
      return;
    }

    const next = new Date(date);
    next.setHours(Number(hours), Number(minutes), 0, 0);
    onSave(formatDateTimeValue(next));
  };

  const updateTime = (nextHours = hours, nextMinutes = minutes) => {
    const next = selectedDate ?? new Date();
    next.setHours(Number(nextHours), Number(nextMinutes), 0, 0);
    const nextValue = formatDateTimeValue(next);
    const validation = validateCellValue(nextValue, column);
    if (!validation.valid) {
      setError(validation.message ?? "Invalid value");
      return;
    }
    setError(null);
    onSave(nextValue);
  };

  const displayValue = formatCellDate(value, type);
  const storedInvalidMessage = (() => {
    const result = validateCellValue(value, column);
    return result.valid ? null : (result.message ?? "Invalid value");
  })();
  const validationMessage = error ?? storedInvalidMessage;

  const triggerLabel = (
    <span
      className={cn(
        "block min-h-7 w-full min-w-0 cursor-text truncate px-1 text-left leading-7",
        validationMessage && "text-destructive",
      )}
    >
      {displayValue}
    </span>
  );

  const triggerButton = (
    <button type="button" className="w-full text-left">
      {validationMessage ? (
        <CellValidationHint message={validationMessage} fullWidth>
          {triggerLabel}
        </CellValidationHint>
      ) : (
        <ConditionalTooltip content={displayValue} fullWidth>
          {triggerLabel}
        </ConditionalTooltip>
      )}
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        {type === "datetime" && (
          <div className="flex items-center gap-2 border-t p-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <Select
              value={hours}
              onValueChange={(nextHours) => updateTime(nextHours, minutes)}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, idx) => {
                  const option = String(idx).padStart(2, "0");
                  return (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">:</span>
            <Select
              value={minutes}
              onValueChange={(nextMinutes) => updateTime(hours, nextMinutes)}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, idx) => {
                  const option = String(idx).padStart(2, "0");
                  return (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="ml-auto h-8 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
