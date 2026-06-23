"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type {
  DataTableFilterCondition,
  TableColumnDef,
} from "../types/table-types";
import { getDataTableFilterParts } from "../utils/filter-helpers";

interface ActiveFilterChipsProps {
  conditions: DataTableFilterCondition[];
  columns: TableColumnDef[];
  onRemove: (filterId: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  conditions,
  columns,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (conditions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Active filters
      </span>

      {conditions.map((condition) => {
        const parts = getDataTableFilterParts(condition, columns);

        return (
          <div
            key={condition.id}
            className="inline-flex items-center gap-1.5 h-6.5 pl-2.5 pr-1 rounded-full border border-border bg-card text-xs font-medium"
          >
            <span className="max-w-24 truncate text-foreground text-xs">
              {parts.column}
            </span>
            <span className="rounded-full border border-border bg-muted px-1.5 py-px text-[11px] text-muted-foreground">
              {parts.operator}
            </span>
            {parts.value !== null && (
              <span className="max-w-32 truncate rounded-full border border-primary/20 bg-primary/10 px-1.5 py-px text-[11px] text-primary">
                {parts.value || "empty"}
              </span>
            )}
            <button
              type="button"
              className="flex items-center justify-center w-[18px] h-[18px] rounded-full text-muted-foreground hover:bg-muted hover:text-foreground shrink-0"
              onClick={() => onRemove(condition.id)}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-6.5 px-2.5 text-xs text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  );
}
