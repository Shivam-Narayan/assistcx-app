"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DatePickerFormFieldProps } from "./types";

export function DatePicker({
  label,
  field,
  className,
  disabled = false,
  placeholder = "Select date",
  disabledPastDate,
  toYear,
}: DatePickerFormFieldProps) {
  const [open, setOpen] = useState(false);
  const parsedDate = field.value ? parseISO(field.value) : undefined;
  const isDateValid = parsedDate && isValid(parsedDate);

  return (
    <FormItem className={cn("flex-1", className)}>
      {label && <FormLabel>{label}</FormLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full cursor-pointer justify-between font-normal text-left text-sm",
                !field.value && "text-muted-foreground",
              )}
              disabled={disabled}
            >
              {isDateValid ? format(parsedDate!, "PPP") : placeholder}
              <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={1}
          className="w-auto p-0 overflow-hidden shadow-md border"
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={isDateValid ? parsedDate : undefined}
            onSelect={(date) => {
              if (date) {
                field.onChange(format(date, "yyyy-MM-dd"));
                setOpen(false); // ✅ close popover on select
              }
            }}
            initialFocus
            disabled={
              disabledPastDate ? (date) => date < startOfDay(new Date()) : false
            }
            toYear={toYear}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
