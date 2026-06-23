"use client";

import { errorMessageHandler } from "@/helper/helper-function";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ColumnType,
  DynamicTable,
  ImportResult,
} from "../types/table-types";
import {
  ImportProgressView,
  type ImportProgressState,
} from "./import-progress-view";
import {
  findBestMatchingColumn,
  getPreviewColumnsAsync,
  type PreviewColumnsResult,
} from "../utils/file-parsing-utils";
import {
  buildColumnMapPayload,
  DetectionInfoBox,
  ExportScopeCard,
  type ExportScope,
  getFileColumnMapKey,
  getLatestImportStatus,
  getPreviewColumnsForResult,
  isTerminalImportStatus,
  MappingPreparationState,
} from "./import-export-helpers";
import {
  ColumnCreationPanel,
  ColumnMappingPanel,
} from "./import-column-mapping";

type TransferMode = "import" | "export";
type ImportStep = "upload" | "mapping";

interface ColumnToCreate {
  sourceKey: string;
  name: string;
  type: ColumnType;
}

interface ImportExportDialogProps {
  open: boolean;
  mode: TransferMode;
  table: DynamicTable;
  selectedRowIds: string[];
  searchQuery: string;
  filtersQuery?: string;
  onOpenChange: (open: boolean) => void;
  onImport: (
    file: File,
    hasHeader: boolean,
    columnMap?: Record<string, string>,
  ) => Promise<ImportResult>;
  onImportWithColumnCreation?: (
    file: File,
    hasHeader: boolean,
    columnsToCreate: ColumnToCreate[],
    onColumnsCreated?: () => void,
  ) => Promise<ImportResult>;
  onExport: (params?: {
    row_ids?: string;
    filters?: string;
    search?: string;
  }) => Promise<Blob | null>;
}

const SUPPORTED_EXTENSIONS = [".csv", ".xlsx"];
const SUPPORTED_MIME_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export function ImportExportDialog({
  open,
  mode,
  table,
  selectedRowIds,
  searchQuery,
  filtersQuery,
  onOpenChange,
  onImport,
  onImportWithColumnCreation,
  onExport,
}: ImportExportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const importStatusBaselineRef = useRef(0);
  const [file, setFile] = useState<File | null>(null);
  const [importStep, setImportStep] = useState<ImportStep>("upload");
  const [previewResult, setPreviewResult] =
    useState<PreviewColumnsResult | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [columnsToCreate, setColumnsToCreate] = useState<ColumnToCreate[]>([]);
  const [isParsingFile, setParsingFile] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [importProgress, setImportProgress] =
    useState<ImportProgressState | null>(null);
  const [exportScope, setExportScope] = useState<ExportScope>(
    selectedRowIds.length > 0 ? "selected" : "all",
  );

  const isCsv = file?.name.toLowerCase().endsWith(".csv") ?? false;
  const isXlsx = file?.name.toLowerCase().endsWith(".xlsx") ?? false;
  const canPreviewMapping = (isCsv || isXlsx) && previewColumns.length > 0;
  const canProceedToMapping = !!file && !isParsingFile && !isSubmitting;
  const isEmptyTable = table.columns.length === 0;
  const hasFilteredView = !!searchQuery.trim() || !!filtersQuery;

  const mappedCount = Object.keys(columnMap).length;
  const skippedCount = previewColumns.length - mappedCount;
  const usedTableColumnIds = useMemo(
    () => new Set(Object.values(columnMap)),
    [columnMap],
  );
  const isImportReady =
    !!file &&
    !isParsingFile &&
    canPreviewMapping &&
    (isEmptyTable ? columnsToCreate.length > 0 : mappedCount > 0);

  const importBlockedReason = useMemo(() => {
    if (importStep !== "mapping" || isParsingFile || importProgress)
      return null;
    if (!file || isImportReady) return null;

    if (!canPreviewMapping || previewColumns.length === 0) {
      return "We could not detect any columns in this file. Fix the file or go back and try another upload.";
    }
    if (isEmptyTable) {
      return "There are no columns to create from this file, so there is nothing to import. Go back, check the header setting, or upload a different file.";
    }
    if (mappedCount === 0) {
      return "Map at least one file column to a column in this table to continue. Columns you leave on Skip are not imported.";
    }
    return null;
  }, [
    canPreviewMapping,
    file,
    importProgress,
    importStep,
    isEmptyTable,
    isImportReady,
    isParsingFile,
    mappedCount,
    previewColumns.length,
  ]);

  // Reset state on dialog open/close
  useEffect(() => {
    if (!open) {
      setFile(null);
      setImportStep("upload");
      setPreviewResult(null);
      setHasHeader(true);
      setPreviewColumns([]);
      setColumnMap({});
      setColumnsToCreate([]);
      setParsingFile(false);
      setSubmitting(false);
      setImportProgress(null);
      return;
    }
    setExportScope(
      selectedRowIds.length > 0 ? "selected" : hasFilteredView ? "view" : "all",
    );
  }, [hasFilteredView, open, selectedRowIds.length]);

  // Track backend import status for progress view
  useEffect(() => {
    if (importProgress?.phase !== "importing") return;
    const statusLength = table.status?.length ?? 0;
    if (statusLength <= importStatusBaselineRef.current) return;
    const latestStatus = getLatestImportStatus(table);
    if (!isTerminalImportStatus(latestStatus)) return;
    setImportProgress(null);
    onOpenChange(false);
  }, [importProgress?.phase, onOpenChange, table]);

  // Auto-match columns for tables that already have columns
  useEffect(() => {
    if (!canPreviewMapping || isEmptyTable) {
      setColumnMap({});
      return;
    }
    const nextMap: Record<string, string> = {};
    const usedColumnIds = new Set<string>();
    previewColumns.forEach((name, idx) => {
      const matchingColumn = findBestMatchingColumn(
        name,
        idx,
        table.columns,
        hasHeader,
      );
      const key = getFileColumnMapKey(idx);
      if (matchingColumn && !usedColumnIds.has(matchingColumn.id)) {
        nextMap[key] = matchingColumn.id;
        usedColumnIds.add(matchingColumn.id);
      }
    });
    setColumnMap(nextMap);
  }, [
    canPreviewMapping,
    isEmptyTable,
    hasHeader,
    previewColumns,
    table.columns,
  ]);

  // Build columns-to-create for empty tables
  useEffect(() => {
    if (!canPreviewMapping || !isEmptyTable) {
      setColumnsToCreate([]);
      return;
    }
    setColumnsToCreate(
      previewColumns.map((raw, idx) => ({
        sourceKey: getFileColumnMapKey(idx),
        name: raw,
        type: "text",
      })),
    );
  }, [canPreviewMapping, isEmptyTable, hasHeader, previewColumns]);

  const selectedBackendRowIds = useMemo(
    () => selectedRowIds.filter((id) => !id.startsWith("tmp_row_")),
    [selectedRowIds],
  );

  const handleFileSelect = async (nextFile?: File) => {
    if (!nextFile) return;
    const fileName = nextFile.name.toLowerCase();
    const isSupported =
      SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext)) ||
      SUPPORTED_MIME_TYPES.includes(nextFile.type);
    if (!isSupported) return;
    setFile(nextFile);
    setImportStep("upload");
    setPreviewResult(null);
    setPreviewColumns([]);
    setColumnMap({});
    setColumnsToCreate([]);
  };

  const handleHeaderToggle = (checked: boolean) => {
    setHasHeader(checked);
    if (previewResult) {
      setPreviewColumns(getPreviewColumnsForResult(previewResult, checked));
    }
  };

  const handleProceedToMapping = async () => {
    if (!file || isParsingFile) return;
    setImportStep("mapping");
    setPreviewResult(null);
    setPreviewColumns([]);
    setColumnMap({});
    setColumnsToCreate([]);
    setParsingFile(true);
    try {
      const result = await getPreviewColumnsAsync(file, hasHeader);
      setPreviewResult(result);
      setPreviewColumns(getPreviewColumnsForResult(result, hasHeader));
    } finally {
      setParsingFile(false);
    }
  };

  const handleBackToUpload = () => {
    if (isSubmitting) return;
    setImportStep("upload");
    setPreviewResult(null);
    setPreviewColumns([]);
    setColumnMap({});
    setColumnsToCreate([]);
  };

  const handleImport = async () => {
    if (!file || !isImportReady) return;
    setSubmitting(true);
    const needsColumnCreation =
      isEmptyTable && canPreviewMapping && !!onImportWithColumnCreation;
    importStatusBaselineRef.current = table.status?.length ?? 0;
    setImportProgress({
      phase: needsColumnCreation ? "creating_columns" : "importing",
      result: null,
    });

    try {
      let result: ImportResult;
      if (needsColumnCreation) {
        result = await onImportWithColumnCreation!(
          file,
          hasHeader,
          columnsToCreate,
          () => setImportProgress({ phase: "importing", result: null }),
        );
      } else {
        const mapToSend =
          canPreviewMapping && mappedCount > 0
            ? buildColumnMapPayload(columnMap)
            : undefined;
        result = await onImport(file, hasHeader, mapToSend);
      }

      const hasImportErrors = result.errors.length > 0 || result.failed > 0;
      if (hasImportErrors) {
        setImportProgress({
          phase: "done",
          result,
          columnCreationFailed:
            needsColumnCreation && result.errors[0]?.includes("columns"),
        });
        return;
      }

      if (result.inserted > 0) {
        onOpenChange(false);
        setImportProgress(null);
      } else {
        setImportProgress({ phase: "importing", result: null });
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    setSubmitting(true);
    try {
      const params =
        exportScope === "selected"
          ? { row_ids: selectedBackendRowIds.join(",") }
          : exportScope === "view" && hasFilteredView
            ? { search: searchQuery.trim() || undefined, filters: filtersQuery }
            : undefined;
      const blob = await onExport(params);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${table.name || "data-table"}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isImportMode = mode === "import";
  const title = isImportMode ? "Import Data" : "Export Data Table";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isImportMode && (file || isSubmitting)) return;
        if (!isSubmitting) onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => {
          if (isImportMode) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
        className={cn(
          "flex max-h-[calc(100vh-2rem)] flex-col gap-0 overflow-hidden p-0",
          isImportMode ? "sm:max-w-xl" : "sm:max-w-3xl",
        )}
      >
        <DialogHeader className="shrink-0 flex-row items-center justify-between space-y-0 border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold leading-none">
            {title}
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 cursor-pointer text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isImportMode && importProgress ? (
            <ImportProgressView
              state={importProgress}
              fileName={file?.name ?? ""}
              onBack={() => setImportProgress(null)}
            />
          ) : isImportMode ? (
            <div className="flex flex-col gap-4 px-4 py-4">
              {importStep === "upload" ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Upload your file</p>
                    <p className="text-xs text-muted-foreground">
                      Choose a CSV or XLSX file, then tell us whether the file
                      already has column headers. We will use that choice to
                      prepare the mapping in the next step.
                    </p>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        inputRef.current?.click();
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/60 px-4 py-8 text-center transition-colors hover:bg-muted",
                      file && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      onChange={(event) =>
                        handleFileSelect(event.target.files?.[0])
                      }
                    />
                    <div className="mb-3 rounded-full border border-dashed bg-background p-3">
                      <UploadCloud className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      {file ? file.name : "Choose a CSV or XLSX file"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Supported: .csv, .xlsx, max 100 MB
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-lg border bg-card px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium leading-snug">
                        File contains headers
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        On: the first row of your file has column names (for
                        example Name, Email). Off: every row is data — in the
                        next step we will show Column 1, Column 2, and so on.
                      </p>
                    </div>
                    <Switch
                      checked={hasHeader}
                      disabled={isSubmitting}
                      onCheckedChange={handleHeaderToggle}
                      className="mt-0.5 shrink-0 cursor-pointer"
                    />
                  </div>
                </>
              ) : (
                <>
                  {file && isParsingFile && <MappingPreparationState />}
                  {file && !isParsingFile && previewResult && (
                    <DetectionInfoBox result={previewResult} />
                  )}

                  {canPreviewMapping && isEmptyTable && (
                    <ColumnCreationPanel
                      columnsToCreate={columnsToCreate}
                      isSubmitting={isSubmitting}
                      onUpdateColumn={(idx, patch) => {
                        setColumnsToCreate((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], ...patch };
                          return next;
                        });
                      }}
                    />
                  )}

                  {canPreviewMapping && !isEmptyTable && (
                    <ColumnMappingPanel
                      previewColumns={previewColumns}
                      hasHeader={hasHeader}
                      columnMap={columnMap}
                      tableColumns={table.columns}
                      usedTableColumnIds={usedTableColumnIds}
                      mappedCount={mappedCount}
                      skippedCount={skippedCount}
                      onMapChange={(mapKey, value) => {
                        setColumnMap((prev) => {
                          const next = { ...prev };
                          if (value === null) delete next[mapKey];
                          else next[mapKey] = value;
                          return next;
                        });
                      }}
                    />
                  )}

                  {importBlockedReason ? (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <p className="leading-relaxed">{importBlockedReason}</p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : (
            <RadioGroup
              value={exportScope}
              onValueChange={(value) => setExportScope(value as ExportScope)}
              className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-3"
            >
              <ExportScopeCard
                value="all"
                title="Export whole data table"
                description={`Downloads all ${table.rowCount ?? 0} rows as CSV. Hidden rows are included in the exported file.`}
                checked={exportScope === "all"}
              />
              <ExportScopeCard
                value="selected"
                title={`Export selected rows (${selectedBackendRowIds.length})`}
                description="Only exports the rows you have checked in the grid."
                checked={exportScope === "selected"}
                disabled={selectedBackendRowIds.length === 0}
              />
              <ExportScopeCard
                value="view"
                title="Export filtered view"
                description={
                  hasFilteredView
                    ? "Exports rows matching the current search and filters. Hidden columns are included."
                    : "Apply a search or filter in the grid to use this option."
                }
                checked={exportScope === "view"}
                disabled={!hasFilteredView}
              />
            </RadioGroup>
          )}
        </div>

        {!importProgress && (
          <DialogFooter className="shrink-0 justify-between border-t px-4 py-3 sm:justify-between">
            <div>
              {isImportMode && importStep === "mapping" ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={handleBackToUpload}
                  className="cursor-pointer"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              {isImportMode && importStep === "upload" ? (
                <Button
                  type="button"
                  disabled={!canProceedToMapping}
                  onClick={handleProceedToMapping}
                  className="cursor-pointer"
                >
                  {isParsingFile && (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  )}
                  Proceed
                </Button>
              ) : (
                (!isImportMode || isImportReady) && (
                  <Button
                    type="button"
                    disabled={
                      isSubmitting ||
                      (isImportMode && !isImportReady) ||
                      (!isImportMode &&
                        exportScope === "selected" &&
                        selectedBackendRowIds.length === 0) ||
                      (!isImportMode &&
                        exportScope === "view" &&
                        !hasFilteredView)
                    }
                    onClick={isImportMode ? handleImport : handleExport}
                    className="cursor-pointer"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    )}
                    {isImportMode
                      ? isEmptyTable && canPreviewMapping
                        ? "Create columns & import"
                        : "Import data"
                      : "Export CSV"}
                  </Button>
                )
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
