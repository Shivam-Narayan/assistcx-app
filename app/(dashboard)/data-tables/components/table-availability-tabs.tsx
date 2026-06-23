"use client";

import { cn } from "@/lib/utils";
import type { CreateTableSchemaType } from "@/lib/schemas/table-schemas";

type Availability = CreateTableSchemaType["availability"];

interface TableAvailabilityTabsProps {
  value: Availability;
  onChange: (value: Availability) => void;
  disabled?: boolean;
}

const OPTIONS: { value: Availability; label: string }[] = [
  { value: "UNLISTED", label: "Unlisted" },
  { value: "PUBLISHED", label: "Published" },
];

export function TableAvailabilityTabs({
  value,
  onChange,
  disabled = false,
}: TableAvailabilityTabsProps) {
  const isPublished = value === "PUBLISHED";

  return (
    <div
      role="tablist"
      aria-label="Table availability"
      className={cn(
        "relative grid h-9 w-full min-w-0 grid-cols-2 rounded-full p-[3px]",
        "transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isPublished
          ? "bg-emerald-500/20 dark:bg-emerald-500/25"
          : "bg-amber-500/20 dark:bg-amber-500/25",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {/* Sliding thumb */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-[3px] bottom-[3px] w-[calc(50%-3px)] rounded-full",
          "shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isPublished
            ? "left-[calc(50%)] bg-emerald-500 shadow-emerald-600/30 dark:bg-emerald-600 dark:shadow-none"
            : "left-[3px] bg-amber-500 shadow-amber-600/30 dark:bg-amber-600 dark:shadow-none",
        )}
      />

      {OPTIONS.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 cursor-pointer rounded-full text-xs font-semibold",
              "transition-colors duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed",
              active
                ? "text-white dark:text-white"
                : "text-foreground/60 hover:text-foreground/80",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function normalizeTableAvailability(value?: string): Availability {
  return value?.toUpperCase() === "PUBLISHED" ? "PUBLISHED" : "UNLISTED";
}
