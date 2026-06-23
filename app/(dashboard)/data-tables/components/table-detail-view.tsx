"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { ConfirmationDialog } from "@/components/confirmation-modal";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import { formatNumberUS } from "@/helper/helper-function";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef as TanstackColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type {
  ColumnType,
  DataTableFilterCondition,
  DynamicTable,
  ImportResult,
  RowsQueryParams,
  TableColumnDef,
  TableRowData,
} from "../types/table-types";
import {
  DEFAULT_COLUMN_WIDTH,
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  isDataTableLocked,
} from "../types/table-types";
import { Lock } from "lucide-react";
import { serializeDataTableFilters } from "../utils/filter-helpers";
import { ActiveFilterChips } from "./active-filter-chips";
import AddColumnPopover from "./add-column-popover";
import { ColumnHeaderDropdown } from "./column-header-dropdown";
import EditableCell from "./editable-cell";
import { ImportExportDialog } from "./import-export-dialog";
import { RowSelectionBar } from "./row-selection-bar";
import { SortableHeader } from "./table-grid-header";
import { TableDetailToolbar } from "./table-detail-toolbar";
import TableFooter from "./table-footer";

interface TableDetailViewProps {
  table: DynamicTable;
  syncStatus?: import("../hook/useSyncQueue").SyncStatus;
  onBack: () => void;
  onConfigureTable: () => void;
  onCellUpdate: (
    rowId: string,
    columnId: string,
    value: string | number | string[],
  ) => void;
  onAddRow: () => void;
  onAddColumn: (
    name: string,
    type: ColumnType,
    colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
  ) => void;
  onDeleteColumn: (columnId: string) => void;
  onColumnResize: (columnId: string, width: number) => void;
  onDeleteRows: (rowIds: string[]) => void;
  onUpdateColumn: (
    columnId: string,
    name: string,
    type: ColumnType,
    colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
  ) => void;
  onDuplicateColumn: (columnId: string) => void;
  onInsertColumn: (
    refColumnId: string,
    side: "left" | "right",
    name: string,
    type: ColumnType,
    colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
  ) => void;
  onReorderColumns: (newOrder: string[]) => void;
  onImportData: (
    file: File,
    hasHeader: boolean,
    columnMap?: Record<string, string>,
  ) => Promise<ImportResult>;
  onImportWithColumnCreation?: (
    file: File,
    hasHeader: boolean,
    columnsToCreate: { sourceKey: string; name: string; type: ColumnType }[],
    onColumnsCreated?: () => void,
  ) => Promise<ImportResult>;
  onExportData: (params?: {
    row_ids?: string;
    filters?: string;
    search?: string;
  }) => Promise<Blob | null>;
  totalRows: number;
  currentPage: number;
  pageSize: number;
  isTableLoading?: boolean;
  isRowsLoading?: boolean;
  onRowsQueryChange: (params: RowsQueryParams) => void;
  onSetTableLock: (locked: boolean) => Promise<boolean>;
  canEdit?: boolean;
}

const TableDataCell = memo(function TableDataCell({
  rowId,
  column,
  value,
  onCellUpdate,
  readOnly,
}: {
  rowId: string;
  column: TableColumnDef;
  value: string | number | string[] | undefined;
  onCellUpdate: TableDetailViewProps["onCellUpdate"];
  readOnly: boolean;
}) {
  const handleSave = useCallback(
    (nextValue: string | number | string[]) => {
      onCellUpdate(rowId, column.id, nextValue);
    },
    [column.id, onCellUpdate, rowId],
  );

  return (
    <EditableCell
      value={value}
      column={column}
      onSave={handleSave}
      readOnly={readOnly}
    />
  );
});

const SELECT_COLUMN_WIDTH = 40;
const ROW_NUMBER_COLUMN_WIDTH = 40;
const ADD_COLUMN_WIDTH = 160;

function clampColumnWidth(width: number) {
  return Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, width));
}

export default function TableDetailView({
  table,
  syncStatus,
  onBack,
  onConfigureTable,
  onCellUpdate,
  onAddRow,
  onAddColumn,
  onDeleteColumn,
  onColumnResize,
  onDeleteRows,
  onUpdateColumn,
  onDuplicateColumn,
  onInsertColumn,
  onReorderColumns,
  onImportData,
  onImportWithColumnCreation,
  onExportData,
  totalRows,
  currentPage,
  pageSize,
  isTableLoading = false,
  isRowsLoading = false,
  onRowsQueryChange,
  onSetTableLock,
  canEdit = true,
}: TableDetailViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterConditions, setFilterConditions] = useState<
    DataTableFilterCondition[]
  >([]);
  const [isSearchPending, setSearchPending] = useState(false);
  const [isFilterApplying, setFilterApplying] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [requestedFilterColumnId, setRequestedFilterColumnId] = useState<
    string | null
  >(null);
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  const resizeLatestWidth = useRef(0);
  const resizeFrame = useRef<number | null>(null);
  const filterApplySawLoading = useRef(false);

  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  const [deleteColumnConfirm, setDeleteColumnConfirm] = useState<string | null>(
    null,
  );
  const [hiddenColumnIds, setHiddenColumnIds] = useState<Set<string>>(
    new Set(),
  );
  const [frozenColumnIds, setFrozenColumnIds] = useState<Set<string>>(
    new Set(),
  );
  const [transferDialog, setTransferDialog] = useState<
    "import" | "export" | null
  >(null);

  const isLocked = isDataTableLocked(table);
  const effectiveCanEdit = canEdit && !isLocked;

  const orderedColumns = useMemo(() => {
    const order = table.tableConfig?.column_order;
    if (!order?.length) return table.columns;

    const columnById = new Map(
      table.columns.map((column) => [column.id, column]),
    );
    const ordered = order
      .map((columnId) => columnById.get(columnId))
      .filter(Boolean) as TableColumnDef[];
    const orderedIds = new Set(ordered.map((column) => column.id));
    const unlisted = table.columns.filter(
      (column) => !orderedIds.has(column.id),
    );

    return [...ordered, ...unlisted];
  }, [table.columns, table.tableConfig?.column_order]);

  const visibleColumns = useMemo(() => {
    const visible = orderedColumns.filter(
      (column) => !hiddenColumnIds.has(column.id),
    );
    const frozen = visible.filter((column) => frozenColumnIds.has(column.id));
    const regular = visible.filter((column) => !frozenColumnIds.has(column.id));
    return [...frozen, ...regular];
  }, [orderedColumns, hiddenColumnIds, frozenColumnIds]);

  const activeFiltersQuery = useMemo(
    () => serializeDataTableFilters(filterConditions, orderedColumns),
    [filterConditions, orderedColumns],
  );

  useEffect(() => {
    if (isRowsLoading) return;
    setSearchPending(false);
  }, [isRowsLoading]);

  useEffect(() => {
    if (!isFilterApplying) return;
    if (isRowsLoading) {
      filterApplySawLoading.current = true;
      return;
    }
    if (!filterApplySawLoading.current) return;
    filterApplySawLoading.current = false;
    setFilterApplying(false);
    setFilterPopoverOpen(false);
  }, [isFilterApplying, isRowsLoading]);

  const frozenColumnOffsets = useMemo(() => {
    const offsets = new Map<string, number>();
    let left = SELECT_COLUMN_WIDTH + ROW_NUMBER_COLUMN_WIDTH;

    visibleColumns.forEach((column) => {
      if (!frozenColumnIds.has(column.id)) return;
      offsets.set(column.id, left);
      left += clampColumnWidth(
        columnWidths[column.id] ?? column.width ?? DEFAULT_COLUMN_WIDTH,
      );
    });

    return offsets;
  }, [visibleColumns, frozenColumnIds, columnWidths]);

  const getSortQuery = (sortState: SortingState): RowsQueryParams => {
    const activeSort = sortState[0];
    if (!activeSort) return { sort_by: undefined, sort_order: undefined };
    return {
      sort_by: activeSort.id,
      sort_order: activeSort.desc ? "desc" : "asc",
    };
  };

  const latestTableStatus = table.status?.at(-1)?.status?.toUpperCase() ?? null;
  const isImportRunning =
    latestTableStatus === "IMPORT_STARTED" ||
    latestTableStatus === "IMPORTING" ||
    latestTableStatus === "IMPORT_IN_PROGRESS" ||
    latestTableStatus === "PROCESSING";

  const buildRowsQuery = (
    params: RowsQueryParams = {},
    sortState: SortingState = sorting,
    filtersQuery: string | undefined = activeFiltersQuery,
  ): RowsQueryParams => ({
    page: currentPage,
    page_size: pageSize,
    search: searchQuery.trim() || undefined,
    ...getSortQuery(sortState),
    filters: filtersQuery,
    ...params,
  });

  const queryRows = (params: RowsQueryParams) => {
    onRowsQueryChange(params);
    setSelectedRowIds(new Set());
  };

  const searchRows = useDebouncedCallback((value: string) => {
    queryRows(
      buildRowsQuery({
        page: 1,
        page_size: pageSize,
        search: value.trim() || undefined,
      }),
    );
  }, 300);

  const allRowIds = useMemo(() => table.rows.map((r) => r.id), [table.rows]);
  const allSelected =
    allRowIds.length > 0 && allRowIds.every((id) => selectedRowIds.has(id));

  const toggleRow = (rowId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(allRowIds));
    }
  };

  const toggleColumnVisibility = (columnId: string) => {
    setHiddenColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  };

  const toggleColumnFreeze = (columnId: string) => {
    setFrozenColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  };

  const getColumnWidth = useCallback(
    (column: TableColumnDef) =>
      clampColumnWidth(
        columnWidths[column.id] ?? column.width ?? DEFAULT_COLUMN_WIDTH,
      ),
    [columnWidths],
  );

  const tableWidth = useMemo(
    () =>
      SELECT_COLUMN_WIDTH +
      ROW_NUMBER_COLUMN_WIDTH +
      visibleColumns.reduce((sum, column) => sum + getColumnWidth(column), 0) +
      (canEdit ? ADD_COLUMN_WIDTH : 0),
    [canEdit, getColumnWidth, visibleColumns],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, colId: string, currentWidth: number) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingCol(colId);
      resizeStartX.current = e.clientX;
      resizeStartWidth.current = currentWidth;
      resizeLatestWidth.current = currentWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const diff = moveEvent.clientX - resizeStartX.current;
        const newWidth = clampColumnWidth(resizeStartWidth.current + diff);
        resizeLatestWidth.current = newWidth;

        if (resizeFrame.current !== null) return;
        resizeFrame.current = window.requestAnimationFrame(() => {
          resizeFrame.current = null;
          setColumnWidths((prev) => {
            if (prev[colId] === resizeLatestWidth.current) return prev;
            return { ...prev, [colId]: resizeLatestWidth.current };
          });
        });
      };

      const handleMouseUp = () => {
        if (resizeFrame.current !== null) {
          window.cancelAnimationFrame(resizeFrame.current);
          resizeFrame.current = null;
        }
        const finalWidth = resizeLatestWidth.current;
        setColumnWidths((prev) => {
          if (prev[colId] === finalWidth) return prev;
          return { ...prev, [colId]: finalWidth };
        });
        if (finalWidth !== currentWidth) {
          onColumnResize(colId, finalWidth);
        }
        setResizingCol(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [onColumnResize],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const columnIds = useMemo(
    () => visibleColumns.map((c) => c.id),
    [visibleColumns],
  );
  const allColumnIds = useMemo(
    () => orderedColumns.map((column) => column.id),
    [orderedColumns],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!effectiveCanEdit) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const newOrder = [...allColumnIds];
    const oldIdx = newOrder.indexOf(String(active.id));
    const newIdx = newOrder.indexOf(String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    newOrder.splice(oldIdx, 1);
    newOrder.splice(newIdx, 0, String(active.id));
    onReorderColumns(newOrder);
  };

  const handleSortChange = (
    columnId: string,
    direction: "asc" | "desc" | null,
  ) => {
    const nextSorting: SortingState = direction
      ? [{ id: columnId, desc: direction === "desc" }]
      : [];
    setSorting(nextSorting);
    queryRows(
      buildRowsQuery(
        {
          page: 1,
          page_size: pageSize,
        },
        nextSorting,
      ),
    );
  };

  const handleOpenColumnFilter = (columnId: string) => {
    setRequestedFilterColumnId(columnId);
    // Delay opening so the column header dropdown fully closes first;
    // otherwise Radix focus management can immediately close the filter popover.
    setTimeout(() => setFilterPopoverOpen(true), 0);
  };

  const handleApplyFilters = (nextFilters: DataTableFilterCondition[]) => {
    const nextFiltersQuery = serializeDataTableFilters(
      nextFilters,
      orderedColumns,
    );
    setFilterConditions(nextFilters);
    filterApplySawLoading.current = false;
    setFilterApplying(true);
    queryRows(
      buildRowsQuery(
        {
          page: 1,
          page_size: pageSize,
          filters: nextFiltersQuery,
        },
        sorting,
        nextFiltersQuery,
      ),
    );
  };

  const handleRemoveFilter = (filterId: string) => {
    const nextFilters = filterConditions.filter(
      (condition) => condition.id !== filterId,
    );
    handleApplyFilters(nextFilters);
  };

  const tanstackColumns: TanstackColumnDef<TableRowData>[] = useMemo(() => {
    const checkCol: TanstackColumnDef<TableRowData> = {
      id: "_select",
      header: () => (
        <Checkbox
          checked={allSelected}
          onCheckedChange={toggleAll}
          className="cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRowIds.has(row.original.id)}
          onCheckedChange={() => toggleRow(row.original.id)}
          className="cursor-pointer"
        />
      ),
      size: 40,
      enableSorting: false,
      enableResizing: false,
    };

    const rowNumCol: TanstackColumnDef<TableRowData> = {
      id: "_rownum",
      header: () => (
        <span className="text-xs text-muted-foreground font-medium">#</span>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {(currentPage - 1) * pageSize + row.index + 1}
        </span>
      ),
      size: 40,
      enableSorting: false,
      enableResizing: false,
    };

    const dataCols: TanstackColumnDef<TableRowData>[] = visibleColumns.map(
      (col: TableColumnDef) => ({
        id: col.id,
        accessorKey: col.id,
        header: () => (
          <ColumnHeaderDropdown
            column={col}
            onUpdate={onUpdateColumn}
            onSortAsc={() => handleSortChange(col.id, "asc")}
            onSortDesc={() => handleSortChange(col.id, "desc")}
            onClearSort={() => handleSortChange(col.id, null)}
            onInsertLeft={() =>
              onInsertColumn(col.id, "left", "New Column", "text", {
                required: false,
              })
            }
            onInsertRight={() =>
              onInsertColumn(col.id, "right", "New Column", "text", {
                required: false,
              })
            }
            onDuplicate={() => onDuplicateColumn(col.id)}
            onHide={() => toggleColumnVisibility(col.id)}
            onFilter={() => handleOpenColumnFilter(col.id)}
            isFrozen={frozenColumnIds.has(col.id)}
            onToggleFreeze={() => toggleColumnFreeze(col.id)}
            onDelete={() => setDeleteColumnConfirm(col.id)}
            canEdit={effectiveCanEdit}
          />
        ),
        cell: ({ row }) => (
          <TableDataCell
            rowId={row.original.id}
            value={row.original[col.id]}
            column={col}
            onCellUpdate={onCellUpdate}
            readOnly={!effectiveCanEdit}
          />
        ),
        size: getColumnWidth(col),
        minSize: MIN_COLUMN_WIDTH,
        maxSize: MAX_COLUMN_WIDTH,
        enableSorting: false,
      }),
    );

    return [checkCol, rowNumCol, ...dataCols];
  }, [
    visibleColumns,
    onCellUpdate,
    getColumnWidth,
    selectedRowIds,
    allSelected,
    onDuplicateColumn,
    onInsertColumn,
    frozenColumnIds,
    frozenColumnOffsets,
    effectiveCanEdit,
    currentPage,
    pageSize,
  ]);

  const reactTable = useReactTable({
    data: table.rows,
    columns: tanstackColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);
  const rowSummary =
    totalRows === 0
      ? "No rows"
      : totalRows === 1
        ? "1 row"
        : `Showing ${formatNumberUS(startRow)}-${formatNumberUS(endRow)} of ${formatNumberUS(totalRows)}`;

  const handlePageSizeChange = (size: number) => {
    queryRows(
      buildRowsQuery({
        page: 1,
        page_size: size,
      }),
    );
  };

  const handleAddRow = () => {
    if (orderedColumns.length === 0) return;
    onAddRow();
  };

  const handleBulkDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    onDeleteRows(Array.from(selectedRowIds));
    setSelectedRowIds(new Set());
    setDeleteConfirmOpen(false);
  };

  const downloadExportBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const confirmSelectedRowsExport = async () => {
    const rowIds = Array.from(selectedRowIds);
    if (rowIds.length === 0) {
      setExportConfirmOpen(false);
      return;
    }

    const blob = await onExportData({ row_ids: rowIds.join(",") });
    if (!blob) return;

    downloadExportBlob(blob, `${table.name || "data-table"}-selected.csv`);
    setExportConfirmOpen(false);
  };

  const confirmColumnDelete = () => {
    if (deleteColumnConfirm) {
      onDeleteColumn(deleteColumnConfirm);
      setHiddenColumnIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteColumnConfirm);
        return next;
      });
      setFrozenColumnIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteColumnConfirm);
        return next;
      });
      setDeleteColumnConfirm(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <TableDetailToolbar
        tableName={table.name}
        syncStatus={syncStatus}
        isImportRunning={isImportRunning}
        canEdit={canEdit}
        isLocked={isLocked}
        onLockChange={onSetTableLock}
        onBack={onBack}
        onConfigureTable={onConfigureTable}
        searchQuery={searchQuery}
        isSearchPending={isSearchPending}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setSearchPending(true);
          searchRows(value);
        }}
        onSearchClear={() => {
          setSearchQuery("");
          setSearchPending(false);
          searchRows.cancel();
          queryRows(
            buildRowsQuery({ page: 1, page_size: pageSize, search: undefined }),
          );
        }}
        orderedColumns={orderedColumns}
        filterConditions={filterConditions}
        filterPopoverOpen={filterPopoverOpen}
        requestedFilterColumnId={requestedFilterColumnId}
        onFilterOpenChange={(open) => {
          setFilterPopoverOpen(open);
          if (!open) setRequestedFilterColumnId(null);
        }}
        isFilterApplying={isFilterApplying}
        onApplyFilters={handleApplyFilters}
        onOpenImport={() => setTransferDialog("import")}
        onOpenExport={() => setTransferDialog("export")}
        onAddColumn={onAddColumn}
        onAddRow={handleAddRow}
        hiddenColumnIds={hiddenColumnIds}
        frozenColumnIds={frozenColumnIds}
        onToggleColumnVisibility={toggleColumnVisibility}
        onShowAllColumns={() => setHiddenColumnIds(new Set())}
        onHideAllColumns={() =>
          setHiddenColumnIds(new Set(orderedColumns.map((c) => c.id)))
        }
        onToggleColumnFreeze={toggleColumnFreeze}
        onReorderColumns={onReorderColumns}
      />

      <ActiveFilterChips
        conditions={filterConditions}
        columns={orderedColumns}
        onRemove={handleRemoveFilter}
        onClearAll={() => handleApplyFilters([])}
      />

      <Card className="flex flex-col flex-1 min-h-0 p-0 gap-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
          >
            <table
              className="table-fixed border-collapse"
              style={{ width: tableWidth, minWidth: tableWidth }}
            >
              <colgroup>
                <col
                  style={{
                    width: SELECT_COLUMN_WIDTH,
                    minWidth: SELECT_COLUMN_WIDTH,
                    maxWidth: SELECT_COLUMN_WIDTH,
                  }}
                />
                <col
                  style={{
                    width: ROW_NUMBER_COLUMN_WIDTH,
                    minWidth: ROW_NUMBER_COLUMN_WIDTH,
                    maxWidth: ROW_NUMBER_COLUMN_WIDTH,
                  }}
                />
                {visibleColumns.map((column) => {
                  const width = getColumnWidth(column);
                  return (
                    <col
                      key={column.id}
                      style={{
                        width,
                        minWidth: width,
                        maxWidth: width,
                      }}
                    />
                  );
                })}
                {canEdit && (
                  <col
                    style={{
                      width: ADD_COLUMN_WIDTH,
                      minWidth: ADD_COLUMN_WIDTH,
                      maxWidth: ADD_COLUMN_WIDTH,
                    }}
                  />
                )}
              </colgroup>
              <thead className="sticky top-0 z-50 bg-muted">
                {reactTable.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    <SortableContext
                      items={columnIds}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => {
                        const isUtil =
                          header.id === "_select" || header.id === "_rownum";
                        const colWidth =
                          header.id === "_select"
                            ? SELECT_COLUMN_WIDTH
                            : header.id === "_rownum"
                              ? ROW_NUMBER_COLUMN_WIDTH
                              : clampColumnWidth(
                                  header.column.columnDef.size ??
                                    DEFAULT_COLUMN_WIDTH,
                                );

                        if (!isUtil) {
                          const frozenLeft = frozenColumnOffsets.get(
                            header.column.id,
                          );
                          return (
                            <SortableHeader
                              key={header.id}
                              id={header.column.id}
                              width={colWidth}
                              isFrozen={frozenLeft !== undefined}
                              frozenLeft={frozenLeft}
                              resizingCol={resizingCol}
                              canReorder={effectiveCanEdit}
                              onResizeStart={(e) =>
                                handleResizeStart(e, header.column.id, colWidth)
                              }
                              sortIndicator={
                                sorting.length > 0 &&
                                sorting[0].id === header.column.id
                                  ? sorting[0].desc
                                    ? "↓"
                                    : "↑"
                                  : null
                              }
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </SortableHeader>
                          );
                        }

                        return (
                          <th
                            key={header.id}
                            className={cn(
                              "sticky z-50 overflow-hidden border-b border-r bg-muted px-2 py-2 text-center font-medium whitespace-nowrap",
                              header.id === "_select" && "left-0",
                              header.id === "_rownum" && "left-10",
                            )}
                            style={{
                              width: colWidth,
                              minWidth: colWidth,
                              maxWidth: colWidth,
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </th>
                        );
                      })}
                    </SortableContext>
                    {canEdit && (
                      <th
                        className="relative z-40 border-b border-r bg-muted px-4 py-2 text-center w-40 min-w-40"
                        style={{
                          width: ADD_COLUMN_WIDTH,
                          minWidth: ADD_COLUMN_WIDTH,
                          maxWidth: ADD_COLUMN_WIDTH,
                        }}
                      >
                        {effectiveCanEdit ? (
                          <ConditionalTooltip
                            content="Add a new column to this table"
                            alwaysShow
                            align="center"
                            sideOffset={6}
                          >
                            <AddColumnPopover onAdd={onAddColumn} />
                          </ConditionalTooltip>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
                            <Lock className="h-3.5 w-3.5" />
                            Locked
                          </span>
                        )}
                      </th>
                    )}
                  </tr>
                ))}
              </thead>
              <tbody>
                {reactTable.getRowModel().rows.map((row) => {
                  const isSelected = selectedRowIds.has(row.original.id);
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "group",
                        isSelected ? "bg-primary/5" : "hover:bg-muted/30",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isUtil =
                          cell.column.id === "_select" ||
                          cell.column.id === "_rownum";
                        const colWidth =
                          cell.column.id === "_select"
                            ? SELECT_COLUMN_WIDTH
                            : cell.column.id === "_rownum"
                              ? ROW_NUMBER_COLUMN_WIDTH
                              : clampColumnWidth(
                                  cell.column.columnDef.size ??
                                    DEFAULT_COLUMN_WIDTH,
                                );
                        const frozenLeft = frozenColumnOffsets.get(
                          cell.column.id,
                        );
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              "border-b border-r px-2 py-1.5 overflow-hidden",
                              isUtil &&
                                "sticky z-20 bg-card text-center after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border after:content-['']",
                              cell.column.id === "_select" && "left-0",
                              cell.column.id === "_rownum" && "left-10",
                              frozenLeft !== undefined &&
                                "sticky z-10 bg-card after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border after:content-['']",
                            )}
                            style={{
                              width: colWidth,
                              minWidth: colWidth,
                              maxWidth: colWidth,
                              left: frozenLeft,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      })}
                      {canEdit && (
                        <td
                          className="border-b border-r w-40 min-w-40"
                          style={{
                            width: ADD_COLUMN_WIDTH,
                            minWidth: ADD_COLUMN_WIDTH,
                            maxWidth: ADD_COLUMN_WIDTH,
                          }}
                        />
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DndContext>
        </div>

        <TableFooter
          rowSummary={rowSummary}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          totalPages={totalPages}
          canPreviousPage={currentPage > 1 && !isRowsLoading}
          canNextPage={currentPage < totalPages && !isRowsLoading}
          onFirstPage={() => {
            queryRows(
              buildRowsQuery({
                page: 1,
                page_size: pageSize,
              }),
            );
          }}
          onPreviousPage={() => {
            queryRows(
              buildRowsQuery({
                page: Math.max(1, currentPage - 1),
                page_size: pageSize,
              }),
            );
          }}
          onNextPage={() => {
            queryRows(
              buildRowsQuery({
                page: Math.min(totalPages, currentPage + 1),
                page_size: pageSize,
              }),
            );
          }}
          onLastPage={() => {
            queryRows(
              buildRowsQuery({
                page: totalPages,
                page_size: pageSize,
              }),
            );
          }}
          onAddRow={handleAddRow}
          canAddRow={canEdit}
          addRowDisabled={!effectiveCanEdit || orderedColumns.length === 0}
        />
      </Card>

      <RowSelectionBar
        selectedCount={selectedRowIds.size}
        onExport={() => setExportConfirmOpen(true)}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedRowIds(new Set())}
        canDelete={effectiveCanEdit}
      />

      <ImportExportDialog
        open={transferDialog !== null}
        mode={transferDialog ?? "import"}
        table={table}
        selectedRowIds={Array.from(selectedRowIds)}
        searchQuery={searchQuery}
        filtersQuery={activeFiltersQuery}
        onOpenChange={(open) => {
          if (!open) setTransferDialog(null);
        }}
        onImport={onImportData}
        onImportWithColumnCreation={onImportWithColumnCreation}
        onExport={onExportData}
      />

      <CustomDeleteDialog
        open={deleteConfirmOpen}
        title="Delete selected rows"
        description={`This will permanently delete ${selectedRowIds.size} selected ${selectedRowIds.size === 1 ? "row" : "rows"}. This action cannot be undone.`}
        onOpenChange={setDeleteConfirmOpen}
        handleAlert={confirmBulkDelete}
      />

      <ConfirmationDialog
        open={exportConfirmOpen}
        title="Export selected rows"
        description={`Export ${selectedRowIds.size} selected ${selectedRowIds.size === 1 ? "row" : "rows"} as a CSV file?`}
        cancel={() => setExportConfirmOpen(false)}
        confirm={confirmSelectedRowsExport}
      />

      <CustomDeleteDialog
        open={!!deleteColumnConfirm}
        title="Delete column"
        description="This will permanently delete this column and all its data from every row. This action cannot be undone."
        onOpenChange={(v) => {
          if (!v) setDeleteColumnConfirm(null);
        }}
        handleAlert={confirmColumnDelete}
      />
    </div>
  );
}
