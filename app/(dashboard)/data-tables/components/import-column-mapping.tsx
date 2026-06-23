"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowRight, InfoIcon } from "lucide-react";
import type { ColumnType, TableColumnDef } from "../types/table-types";
import { COLUMN_TYPE_OPTIONS } from "../types/table-types";
import { getColumnLabel, getFileColumnMapKey } from "./import-export-helpers";

interface ColumnToCreate {
  sourceKey: string;
  name: string;
  type: ColumnType;
}

interface ColumnCreationPanelProps {
  columnsToCreate: ColumnToCreate[];
  isSubmitting: boolean;
  onUpdateColumn: (index: number, patch: Partial<ColumnToCreate>) => void;
}

/** Renders the column-creation list for empty tables during import. */
export function ColumnCreationPanel({
  columnsToCreate,
  isSubmitting,
  onUpdateColumn,
}: ColumnCreationPanelProps) {
  return (
    <div className="rounded-lg border">
      <div className="border-b bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            Columns to create ({columnsToCreate.length})
          </p>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Your data table has no columns yet. These will be created from your
          file before importing.
        </p>
      </div>

      <div className="grid grid-cols-3 items-center gap-x-2 border-b px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <span className="col-span-2">Column name</span>
        <span>Type</span>
      </div>

      <div className="max-h-64 space-y-1.5 overflow-y-auto p-3">
        {columnsToCreate.map((col, idx) => (
          <div
            key={col.sourceKey || getFileColumnMapKey(idx)}
            className="grid grid-cols-3 items-center gap-x-2"
          >
            <input
              type="text"
              value={col.name}
              disabled={isSubmitting}
              onChange={(e) => onUpdateColumn(idx, { name: e.target.value })}
              className="col-span-2 h-9 w-full truncate rounded-md border bg-background px-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
            <Select
              value={col.type}
              disabled={isSubmitting}
              onValueChange={(value) =>
                onUpdateColumn(idx, { type: value as ColumnType })
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMN_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-1.5">
                      <opt.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center gap-1">
        <InfoIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> You
        can rename columns and change types before importing.
      </div>
    </div>
  );
}

interface ColumnMappingPanelProps {
  previewColumns: string[];
  hasHeader: boolean;
  columnMap: Record<string, string>;
  tableColumns: TableColumnDef[];
  usedTableColumnIds: Set<string>;
  mappedCount: number;
  skippedCount: number;
  onMapChange: (mapKey: string, value: string | null) => void;
}

/** Renders the column mapping list for tables that already have columns. */
export function ColumnMappingPanel({
  previewColumns,
  hasHeader,
  columnMap,
  tableColumns,
  usedTableColumnIds,
  mappedCount,
  skippedCount,
  onMapChange,
}: ColumnMappingPanelProps) {
  return (
    <div className="rounded-lg border">
      <div className="border-b bg-muted/50 px-3 py-2">
        <p className="text-sm font-medium">Column mapping</p>
        <p className="text-xs text-muted-foreground">
          Map each file column to a data table column. Unmapped file columns
          will be skipped during import.
        </p>
      </div>

      <div className="flex items-center gap-x-2 border-b px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <span className="min-w-0 flex-1">File column</span>
        <span className="w-6 shrink-0" />
        <span className="min-w-0 flex-1">Data table column</span>
      </div>

      <div className="max-h-56 space-y-1.5 overflow-y-auto p-3">
        {previewColumns.map((fileColumn, idx) => {
          const mapKey = getFileColumnMapKey(idx);
          const isMapped = !!columnMap[mapKey];
          return (
            <div key={mapKey} className="flex items-center gap-x-2">
              <div
                className={cn(
                  "min-w-0 flex-1 truncate rounded-md border px-2.5 py-1.5 text-sm",
                  isMapped ? "border-primary/30 bg-primary/5" : "bg-muted/40",
                )}
              >
                {fileColumn}
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <Select
                  value={columnMap[mapKey] ?? "__skip__"}
                  onValueChange={(value) =>
                    onMapChange(mapKey, value === "__skip__" ? null : value)
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "h-9 w-full",
                      isMapped && "border-primary/30",
                    )}
                  >
                    <SelectValue placeholder="Do not import" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__">Do not import</SelectItem>
                    {tableColumns.map((column) => {
                      const selectedForThisRow =
                        columnMap[mapKey] === column.id;
                      const usedByAnotherRow =
                        usedTableColumnIds.has(column.id) &&
                        !selectedForThisRow;
                      return (
                        <SelectItem
                          key={column.id}
                          value={column.id}
                          disabled={usedByAnotherRow}
                        >
                          {getColumnLabel(column)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2 text-xs text-muted-foreground">
        <span>
          <strong className="text-foreground">{mappedCount}</strong> mapped
        </span>
        <span>·</span>
        <span>
          <strong className="text-foreground">{skippedCount}</strong> not
          imported
        </span>
      </div>
    </div>
  );
}
