"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon as LucideCalendarIcon } from "lucide-react";
import { PropsBase } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  triggerLabel?: string;
  triggerClassName?: string;
  popoverAlign?: "start" | "center" | "end";
  calendarProps?: Omit<PropsBase, "mode" | "selected" | "onSelect"> & {
    disabled?: PropsBase["disabled"];
  };
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  buttonDisabled?: boolean;
  triggerId?: string;
}

export function DatePicker({
  selectedDate,
  onSelectDate,
  triggerLabel = "Pick a date",
  triggerClassName,
  popoverAlign = "start",
  calendarProps,
  buttonVariant = "outline",
  buttonDisabled = false,
  triggerId,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={triggerId}
          variant={buttonVariant}
          disabled={buttonDisabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            triggerClassName
          )}
        >
          <LucideCalendarIcon className="h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP")
          ) : (
            <span>{triggerLabel}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align={popoverAlign}
        data-datepicker-popover-content="true"
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selectedDate}
          onSelect={(date) => {
            onSelectDate(date);
            setIsOpen(false);
          }}
          initialFocus
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}
