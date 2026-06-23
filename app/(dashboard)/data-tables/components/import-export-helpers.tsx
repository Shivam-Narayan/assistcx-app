"use client";

import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { AlertTriangle, InfoIcon } from "lucide-react";
import type { DynamicTable, TableColumnDef } from "../types/table-types";
import { FileScanIllustration } from "../constants/illustrations";
import {
  STRUCTURE_SCAN_ROW_LIMIT,
  type PreviewColumnsResult,
} from "../utils/file-parsing-utils";

export type ExportScope = "all" | "selected" | "view";

export function getColumnLabel(column: TableColumnDef) {
  return `${column.name} (${column.type})`;
}

export function getPreviewColumnsForResult(
  result: PreviewColumnsResult,
  hasHeader: boolean,
) {
  if (hasHeader) return result.columns;
  return result.columns.map((_, index) => `Column ${index + 1}`);
}

/** Stable unique key for import column_map / UI (file column index). */
export function getFileColumnMapKey(columnIndex: number): string {
  return String(columnIndex);
}

export function buildColumnMapPayload(columnMap: Record<string, string>) {
  return { ...columnMap };
}

export function getLatestImportStatus(table: DynamicTable) {
  const latestStatus = table.status?.[table.status.length - 1]?.status;
  return latestStatus ? latestStatus.toUpperCase() : null;
}

export function isTerminalImportStatus(status: string | null) {
  return (
    status === "IMPORT_COMPLETED" ||
    status === "IMPORT_SUCCESS" ||
    status === "SUCCESSFUL" ||
    status === "COMPLETED" ||
    status === "IMPORT_FAILED" ||
    status === "FAILED" ||
    status === "ERROR" ||
    status === "CANCELLED"
  );
}

export function ExportScopeCard({
  value,
  title,
  description,
  checked,
  disabled,
}: {
  value: ExportScope;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex h-full min-h-32 cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50",
        checked && "border-primary bg-primary/5",
        disabled && "cursor-not-allowed opacity-50 hover:bg-card",
      )}
    >
      <RadioGroupItem
        value={value}
        disabled={disabled}
        className="mt-0.5 cursor-pointer"
      />
      <span className="min-w-0 space-y-1">
        <span className="block text-sm font-medium leading-5">{title}</span>
        <span className="block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

export function MappingPreparationState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-4 py-5 text-center">
      <FileScanIllustration />
      <p className="mt-2 text-sm font-medium">Analyzing file structure</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Scanning the first {STRUCTURE_SCAN_ROW_LIMIT} rows to find where the
        table data starts.
      </p>
    </div>
  );
}

export function DetectionInfoBox({ result }: { result: PreviewColumnsResult }) {
  if (result.columns.length === 0) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <p className="font-medium">Could not find table data</p>
          <p className="mt-1">
            We scanned the first {STRUCTURE_SCAN_ROW_LIMIT} rows but could not
            find a usable table. Remove long intro text or notes and upload the
            file again.
          </p>
        </div>
      </div>
    );
  }

  if ((result.detectedRowNumber ?? 1) <= 1) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
      <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>
        <p className="font-medium">
          Structured data detected at row {result.detectedRowNumber}
        </p>
        <p className="mt-1">
          Rows before row {result.detectedRowNumber} will not be used for column
          mapping. Keep the header toggle off because row 1 is not the
          column-name row.
        </p>
      </div>
    </div>
  );
}
