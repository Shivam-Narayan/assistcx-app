"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import { formatNumberUS } from "@/helper/helper-function";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
} from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "../types/table-types";

interface TableFooterProps {
  rowSummary: string;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  currentPage: number;
  totalPages: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  onAddRow: () => void;
  canAddRow?: boolean;
  addRowDisabled?: boolean;
}

export default function TableFooter({
  rowSummary,
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  canPreviousPage,
  canNextPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onAddRow,
  canAddRow = true,
  addRowDisabled = false,
}: TableFooterProps) {
  const canFirstPage = canPreviousPage;
  const canLastPage = canNextPage;
  const navButtonClass =
    "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-t bg-card px-4 py-2">
      <div className="flex items-center gap-4">
        {canAddRow && (
          <ConditionalTooltip
            content={
              addRowDisabled
                ? "Unlock table or add a column to add rows"
                : "Add row"
            }
            alwaysShow
            align="center"
          >
            <Button
              variant="outline"
              onClick={onAddRow}
              disabled={addRowDisabled}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CirclePlus className="h-3.5 w-3.5" />
              Add Row
            </Button>
          </ConditionalTooltip>
        )}
        <span className="text-sm text-muted-foreground">{rowSummary}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 min-w-20 px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center overflow-hidden rounded-md border bg-background shadow-xs">
          <ConditionalTooltip content="First page" alwaysShow align="center">
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-r-none", navButtonClass)}
              disabled={!canFirstPage}
              onClick={onFirstPage}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </ConditionalTooltip>
          <ConditionalTooltip content="Previous page" alwaysShow align="center">
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-none border-l", navButtonClass)}
              disabled={!canPreviousPage}
              onClick={onPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </ConditionalTooltip>
          <div className="flex h-8 min-w-32 items-center justify-center border-x bg-muted/40 px-4 text-sm font-normal text-muted-foreground">
            Page {formatNumberUS(currentPage)} of{" "}
            {formatNumberUS(totalPages || 1)}
          </div>
          <ConditionalTooltip content="Next page" alwaysShow align="center">
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-none", navButtonClass)}
              disabled={!canNextPage}
              onClick={onNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </ConditionalTooltip>
          <ConditionalTooltip content="Last page" alwaysShow align="center">
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("rounded-l-none border-l", navButtonClass)}
              disabled={!canLastPage}
              onClick={onLastPage}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </ConditionalTooltip>
        </div>
      </div>
    </div>
  );
}
