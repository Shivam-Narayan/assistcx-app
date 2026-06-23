import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDateRange } from "@/helper/helper-function";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { FilterGroupProps, quickDateOptions } from "../dashboard-filter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  icon,
  options,
  filterType,
  addFilter,
  activeFilters,
  setActiveFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeOptionsForGroup = activeFilters
    .filter((filter: string) => filter.startsWith(`${filterType}:`))
    .map((filter: string) =>
      filter.replace(`${filterType}:`, "").trim().toLowerCase(),
    );

  // Check if any filter of this type is active
  const hasActiveFilters = activeFilters.some((filter: string) =>
    filter.startsWith(`${filterType}:`),
  );

  const iconClassName =
    icon.props && typeof icon.props.className === "string"
      ? icon.props.className
      : "";
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Determine the currently selected quick date option for RadioGroup value

  let currentQuickDateValue = "";

  if (filterType === "Date") {
    const activeDateFilter = activeFilters.find((f) => f.startsWith("Date:"));
    if (activeDateFilter) {
      const activeValue = activeDateFilter.substring("Date: ".length).trim();

      if (quickDateOptions.includes(activeValue)) {
        currentQuickDateValue = activeValue;
      } else if (activeValue.includes("to")) {
        const [fromStr, toStr] = activeValue.split("to").map((s) => s.trim());
        quickDateOptions.forEach((option) => {
          const range = getDateRange(option);
          if (range && range.from === fromStr && range.to === toStr) {
            currentQuickDateValue = option;
          }
        });
      }
    }
  }

  const handleQuickDateSelect = (value: string) => {
    addFilter(filterType, value);
    const range = getDateRange(value);
    if (range) {
      setDateRange({
        from: parseDateLocal(range.from),
        to: parseDateLocal(range.to),
      });
    }
  };

  function parseDateLocal(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  useEffect(() => {
    if (filterType === "Date") {
      const activeDateFilter = activeFilters.find((f) => f.startsWith("Date:"));

      if (!activeDateFilter) {
        setDateRange(undefined);
        return;
      }

      const value = activeDateFilter.replace("Date:", "").trim();

      if (value.includes("to")) {
        const [fromStr, toStr] = value.split("to").map((s) => s.trim());

        const parsedFrom = parseDateLocal(fromStr);
        const parsedTo = parseDateLocal(toStr);

        if (!isNaN(parsedFrom.getTime()) && !isNaN(parsedTo.getTime())) {
          setDateRange({
            from: parsedFrom,
            to: parsedTo,
          });
        }
      } else {
        if (quickDateOptions.includes(value)) {
          const range = getDateRange(value);

          if (range) {
            setDateRange({
              from: parseDateLocal(range.from),
              to: parseDateLocal(range.to),
            });
          }
        }
      }
    }
  }, [activeFilters, filterType]);

  useEffect(() => {
    if (filterType !== "Date") return;

    if (!dateRange?.from && !dateRange?.to) {
      const existingDateFilter = activeFilters.find((f) =>
        f.startsWith("Date:"),
      );
      if (existingDateFilter) addFilter("Date", "", true);
      return;
    }

    if (dateRange?.from && dateRange?.to) {
      const fromDateStr = format(dateRange.from, "yyyy-MM-dd");
      const toDateStr = format(dateRange.to, "yyyy-MM-dd");

      const formattedRange = `${fromDateStr} to ${toDateStr}`;

      const existingDateFilter = activeFilters.find((f) =>
        f.startsWith("Date:"),
      );

      if (!existingDateFilter || !existingDateFilter.includes(formattedRange)) {
        addFilter("Date", formattedRange);
      }
    }
  }, [dateRange]);

  return (
    <div className="pb-4 mb-4 border-b border-gray-200 dark:border-slate-700 last:border-b-0 last:mb-0 last:pb-0">
      {/* Group header with expand/collapse */}
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {React.cloneElement(icon, {
            className: `${iconClassName} h-5 w-5 text-gray-500 dark:text-slate-400`,
          })}
          <span className="ml-2 font-medium text-gray-800 dark:text-slate-200">
            {title}
          </span>
          {hasActiveFilters && (
            <span
              className={cn(
                "ml-2 rounded-full w-5 h-5 flex items-center justify-center text-xs bg-primary/80 text-primary-foreground",
              )}
            >
              {
                activeFilters.filter((filter: string) =>
                  filter.startsWith(`${filterType}:`),
                ).length
              }
            </span>
          )}
        </div>
      </button>

      <div className="mt-3">
        {/* Filter options */}
        {filterType === "Date" ? (
          <div className="space-y-3 pl-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {dateRange?.from ? (
                    dateRange?.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      Pick a date range
                    </span>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                  }}
                  numberOfMonths={2}
                  disabled={{
                    after: new Date(),
                  }}
                />
              </PopoverContent>
            </Popover>
            <div className="my-3 space-y-1.5">
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">
                Quick select:
              </p>
              <RadioGroup
                value={currentQuickDateValue}
                onValueChange={handleQuickDateSelect}
                className="grid grid-cols-2 gap-2"
              >
                {["Today", "Yesterday", "Last 7 days", "Last 30 days"].map(
                  (option) => {
                    const itemId = `${filterType}-quick-${option}`.replace(
                      /\s+/g,
                      "-",
                    );
                    return (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={itemId}
                          className="border-muted-foreground cursor-pointer"
                        />
                        <Label
                          htmlFor={itemId}
                          className="text-sm font-medium text-muted-foreground cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    );
                  },
                )}
              </RadioGroup>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 mt-2 pl-2">
            {options.map((option: string) => {
              const isChecked = activeOptionsForGroup.includes(
                option.toLowerCase(),
              );

              return (
                <div key={option} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`${filterType}-${option}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      addFilter(filterType, option, !checked);
                    }}
                    className="mr-2 border-muted-foreground"
                  />
                  <Label
                    htmlFor={`${filterType}-${option}`}
                    className="text-sm font-medium text-muted-foreground cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
