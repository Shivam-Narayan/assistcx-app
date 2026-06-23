"use client";

import { Button } from "@/components/ui/button";
import { Download, Trash2, X } from "lucide-react";

interface RowSelectionBarProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
  canDelete?: boolean;
}

export function RowSelectionBar({
  selectedCount,
  onExport,
  onDelete,
  onClear,
  canDelete = true,
}: RowSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex w-full max-w-md items-center justify-between gap-6 rounded-lg border border-primary/15 bg-background px-5 py-4 shadow-lg shadow-primary/10">
        <div className="flex min-w-0 shrink items-center gap-2.5">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-md border border-primary/20 bg-primary/10 px-1.5 text-xs font-semibold text-primary tabular-nums">
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {selectedCount === 1 ? "row" : "rows"} selected
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 px-4 py-1.5"
            onClick={onExport}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>

          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer gap-1.5 px-4 py-1.5"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}

          <button
            type="button"
            onClick={onClear}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-primary/60 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
