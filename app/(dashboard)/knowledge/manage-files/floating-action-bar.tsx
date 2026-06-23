"use client";

import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trash2, X } from "lucide-react";

interface FloatingActionBarProps {
  selectedCount: number;
  onDeleteAll: () => void;
  onReindexAll: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export default function FloatingActionBar({
  selectedCount,
  onDeleteAll,
  onReindexAll,
  onClearSelection,
  isLoading = false,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex w-[min(92vw,32rem)] max-w-full items-center justify-between gap-6 rounded-lg border border-primary/15 bg-background px-6 py-3 shadow-lg shadow-primary/10 box-border">
        <div className="flex min-w-0 shrink items-center gap-2.5">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-md border border-primary/20 bg-primary/10 px-1.5 text-xs font-semibold text-primary tabular-nums">
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {selectedCount === 1 ? "file" : "files"} selected
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 border-primary/20 px-4 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={onReindexAll}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Re-Index
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer gap-1.5 px-4"
            onClick={onDeleteAll}
            disabled={isLoading}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>

          <button
            type="button"
            onClick={onClearSelection}
            disabled={isLoading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-primary/60 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
