"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Columns2,
  Download,
  ListPlus,
  Loader2,
  Lock,
  LockOpen,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import type {
  ColumnType,
  DataTableFilterCondition,
  TableColumnDef,
} from "../types/table-types";
import AddColumnPopover from "./add-column-popover";
import { ColumnsVisibilityDropdown } from "./columns-visibility-dropdown";
import { DataTableFilterBuilder } from "./data-table-filter-builder";
import { SyncStatusIndicator } from "./sync-status-indicator";
import { TableLockDialog } from "./table-lock-dialog";
import type { SyncStatus } from "../hook/useSyncQueue";

interface TableDetailToolbarProps {
  tableName: string;
  syncStatus?: SyncStatus;
  isImportRunning: boolean;
  canEdit: boolean;
  isLocked: boolean;
  onLockChange: (locked: boolean) => Promise<boolean>;
  onBack: () => void;
  onConfigureTable: () => void;
  searchQuery: string;
  isSearchPending: boolean;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  orderedColumns: TableColumnDef[];
  filterConditions: DataTableFilterCondition[];
  filterPopoverOpen: boolean;
  requestedFilterColumnId: string | null;
  onFilterOpenChange: (open: boolean) => void;
  isFilterApplying: boolean;
  onApplyFilters: (filters: DataTableFilterCondition[]) => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onAddColumn: (
    name: string,
    type: ColumnType,
    colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
  ) => void;
  onAddRow: () => void;
  hiddenColumnIds: Set<string>;
  frozenColumnIds: Set<string>;
  onToggleColumnVisibility: (columnId: string) => void;
  onShowAllColumns: () => void;
  onHideAllColumns: () => void;
  onToggleColumnFreeze: (columnId: string) => void;
  onReorderColumns: (newOrder: string[]) => void;
}

export function TableDetailToolbar({
  tableName,
  syncStatus,
  isImportRunning,
  canEdit,
  isLocked,
  onLockChange,
  onBack,
  onConfigureTable,
  searchQuery,
  isSearchPending,
  onSearchChange,
  onSearchClear,
  orderedColumns,
  filterConditions,
  filterPopoverOpen,
  requestedFilterColumnId,
  onFilterOpenChange,
  isFilterApplying,
  onApplyFilters,
  onOpenImport,
  onOpenExport,
  onAddColumn,
  onAddRow,
  hiddenColumnIds,
  frozenColumnIds,
  onToggleColumnVisibility,
  onShowAllColumns,
  onHideAllColumns,
  onToggleColumnFreeze,
  onReorderColumns,
}: TableDetailToolbarProps) {
  const canAddRows = orderedColumns.length > 0;
  const editDisabled = !canEdit || isLocked;
  const [lockDialogOpen, setLockDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onBack}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-0 max-w-64 xl:max-w-sm">
          <ConditionalTooltip content={tableName} fullWidth>
            <button
              type="button"
              onClick={onConfigureTable}
              className="block max-w-full cursor-pointer truncate text-left text-2xl font-semibold tracking-tight hover:underline xl:text-3xl"
            >
              {tableName}
            </button>
          </ConditionalTooltip>
        </div>

        {/* Lock indicator */}
        <ConditionalTooltip
          content={
            isLocked
              ? "Table is locked — click to manage"
              : "Table is unlocked — click to manage"
          }
          alwaysShow
          align="center"
          sideOffset={6}
        >
          <button
            type="button"
            onClick={() => setLockDialogOpen(true)}
            className={cn(
              "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors",
              isLocked
                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {isLocked ? (
              <Lock className="h-5 w-5" />
            ) : (
              <LockOpen className="h-5 w-5" />
            )}
          </button>
        </ConditionalTooltip>

        {(syncStatus && syncStatus !== "idle") || isImportRunning ? (
          <SyncStatusIndicator
            status={
              isImportRunning ||
              syncStatus === "saving" ||
              syncStatus === "error"
                ? "saving"
                : "saved"
            }
            className="ml-1"
          />
        ) : null}

        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-48 shrink-0 lg:w-56">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="flex h-9 w-full items-center rounded-md border border-input bg-background pl-10 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
            placeholder="Search rows..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {isSearchPending ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : searchQuery ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClear}
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 cursor-pointer rounded-full p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        {/* Filter */}
        <DataTableFilterBuilder
          columns={orderedColumns}
          filters={filterConditions}
          open={filterPopoverOpen}
          requestedColumnId={requestedFilterColumnId}
          onOpenChange={onFilterOpenChange}
          isApplying={isFilterApplying}
          onApply={onApplyFilters}
        />

        {/* Import / Export */}
        <div className="flex items-center rounded-md border border-input bg-background shadow-xs">
          <ConditionalTooltip
            content={editDisabled ? "Unlock table to import" : "Import data"}
            alwaysShow
            align="center"
            sideOffset={6}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onOpenImport}
              disabled={editDisabled}
              className="h-9 w-9 cursor-pointer rounded-r-none border-r disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </ConditionalTooltip>
          <ConditionalTooltip
            content="Export as CSV"
            alwaysShow
            align="center"
            sideOffset={6}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onOpenExport}
              className="h-9 w-9 cursor-pointer rounded-l-none"
            >
              <Download className="h-4 w-4" />
            </Button>
          </ConditionalTooltip>
        </div>

        {/* Add Column / Add Row */}
        <div className="flex items-center rounded-md border border-input bg-background shadow-xs">
          <ConditionalTooltip
            content={
              editDisabled ? "Unlock table to add columns" : "Add column"
            }
            alwaysShow
            align="center"
            sideOffset={6}
          >
            {editDisabled ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled
                className="h-9 w-9 cursor-not-allowed rounded-r-none border-r opacity-50"
              >
                <Columns2 className="h-4 w-4" />
              </Button>
            ) : (
              <AddColumnPopover
                onAdd={onAddColumn}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 cursor-pointer rounded-r-none border-r"
                  >
                    <Columns2 className="h-4 w-4" />
                  </Button>
                }
              />
            )}
          </ConditionalTooltip>
          <ConditionalTooltip
            content={
              editDisabled
                ? "Unlock table to add rows"
                : canAddRows
                  ? "Add row"
                  : "Add a column before adding rows"
            }
            alwaysShow
            align="center"
            sideOffset={6}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onAddRow}
              disabled={editDisabled || !canAddRows}
              className="h-9 w-9 cursor-pointer rounded-l-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ListPlus className="h-4 w-4" />
            </Button>
          </ConditionalTooltip>
        </div>

        {/* Column Visibility */}
        <ColumnsVisibilityDropdown
          columns={orderedColumns}
          hiddenColumnIds={hiddenColumnIds}
          frozenColumnIds={frozenColumnIds}
          onToggleColumn={onToggleColumnVisibility}
          onShowAll={onShowAllColumns}
          onHideAll={onHideAllColumns}
          onToggleFreeze={onToggleColumnFreeze}
          onReorderColumns={onReorderColumns}
          canReorder={!editDisabled}
        />
      </div>

      <TableLockDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        isLocked={isLocked}
        onConfirm={onLockChange}
      />
    </>
  );
}
