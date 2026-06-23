"use client";

import CommonHeader from "@/components/common-header";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";
import { canEdit } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import CreateTableDialog from "./components/create-table-dialog";
import TableCards from "./components/table-cards";
import TableDetailView from "./components/table-detail-view";
import { useTableList } from "./hook/useTableList";
import { useTableStore } from "./hook/useTableStore";
import type {
  ColumnType,
  DynamicTable,
  RowsQueryParams,
  TableColumnDef,
} from "./types/table-types";

interface DataTablesMainPageProps {
  initialTableId?: string | null;
}

export default function DataTablesMainPage({
  initialTableId = null,
}: DataTablesMainPageProps) {
  const isHeaderStuck = useHeaderStuck();
  const router = useRouter();
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const canEditDataTables = permissions
    ? canEdit(permissions, "data_tables")
    : false;
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    initialTableId,
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTable, setEditingTable] = useState<DynamicTable | null>(null);

  const {
    tables,
    isListLoading,
    isFetchingMore,
    hasMore,
    loading: isAxiosLoading,
    searchText,
    setSearchText,
    createTable,
    updateTable,
    deleteTable,
    fetchTables,
    loadMoreTables,
  } = useTableList({ enabled: !selectedTableId });

  const {
    table,
    rows,
    totalRows,
    page,
    pageSize,
    isLoading,
    isRowsLoading,
    syncStatus,
    fetchRows,
    addColumn,
    updateColumn,
    deleteColumn,
    duplicateColumn,
    insertColumn,
    reorderColumns,
    updateColumnWidth,
    addRow,
    updateCell,
    deleteRows,
    updateTableDetails,
    importData,
    importDataWithColumnCreation,
    exportData,
    setTableLock,
  } = useTableStore(selectedTableId);

  const tableWithRows = useMemo(() => {
    if (!table) return undefined;
    return { ...table, rows };
  }, [table, rows]);

  const handleCreate = async (
    name: string,
    description: string,
    icon: string,
    availability: string,
  ) => {
    const newId = await createTable(name, description, icon, availability);
    if (newId) {
      router.push(`/data-tables/${newId}`);
    }
    return newId ?? "";
  };

  const handleUpdate = async (
    tableId: string,
    name: string,
    description: string,
    icon: string,
    availability: string,
  ) => {
    if (selectedTableId === tableId) {
      const success = await updateTableDetails(
        name,
        description,
        icon,
        availability,
      );
      if (!success) return false;
    } else {
      const success = await updateTable(
        tableId,
        name,
        description,
        icon,
        availability,
      );
      if (!success) return false;
    }
    await fetchTables();
    setEditingTable(null);
    return true;
  };

  const handleDeleteTable = async (tableId: string) => {
    const success = await deleteTable(tableId);
    if (success) {
      setEditingTable(null);
      if (selectedTableId === tableId) {
        setSelectedTableId(null);
      }
    }
  };

  const openCreateDialog = () => {
    setEditingTable(null);
    setShowCreateDialog(true);
  };

  const openEditDialog = (tableToEdit: DynamicTable) => {
    setEditingTable(tableToEdit);
    setShowCreateDialog(true);
  };

  const handleBack = () => {
    setSelectedTableId(null);
    router.push("/data-tables");
  };

  const handleSelectTable = useCallback(
    (tableId: string) => {
      router.push(`/data-tables/${tableId}`);
    },
    [router],
  );

  const handleConfigureSelectedTable = useCallback(() => {
    if (tableWithRows) openEditDialog(tableWithRows);
  }, [openEditDialog, tableWithRows]);

  const handleCellUpdate = useCallback(
    (rowId: string, colId: string, val: string | number | string[]) => {
      updateCell(rowId, colId, val);
    },
    [updateCell],
  );

  const handleAddRow = useCallback(() => {
    addRow();
  }, [addRow]);

  const handleAddColumn = useCallback(
    (name: string, type: ColumnType, colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">) => {
      addColumn(name, type, colData);
    },
    [addColumn],
  );

  const handleDeleteColumn = useCallback(
    (colId: string) => {
      deleteColumn(colId);
    },
    [deleteColumn],
  );

  const handleColumnResize = useCallback(
    (colId: string, width: number) => {
      updateColumnWidth(colId, width);
    },
    [updateColumnWidth],
  );

  const handleDeleteRows = useCallback(
    (rowIds: string[]) => {
      deleteRows(rowIds);
    },
    [deleteRows],
  );

  const handleUpdateColumn = useCallback(
    (
      colId: string,
      name: string,
      type: ColumnType,
      colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
    ) => {
      updateColumn(colId, name, type, colData);
    },
    [updateColumn],
  );

  const handleDuplicateColumn = useCallback(
    (colId: string) => {
      duplicateColumn(colId);
    },
    [duplicateColumn],
  );

  const handleInsertColumn = useCallback(
    (
      refColId: string,
      side: "left" | "right",
      name: string,
      type: ColumnType,
      colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
    ) => {
      insertColumn(refColId, side, name, type, colData);
    },
    [insertColumn],
  );

  const handleReorderColumns = useCallback(
    (newOrder: string[]) => {
      reorderColumns(newOrder);
    },
    [reorderColumns],
  );

  const handleImportData = useCallback(
    (file: File, hasHeader: boolean, columnMap?: Record<string, string>) =>
      importData(file, hasHeader, columnMap),
    [importData],
  );

  const handleImportWithColumnCreation = useCallback(
    (
      file: File,
      hasHeader: boolean,
      columnsToCreate: { sourceKey: string; name: string; type: ColumnType }[],
      onColumnsCreated?: () => void,
    ) =>
      importDataWithColumnCreation(
        file,
        hasHeader,
        columnsToCreate,
        onColumnsCreated,
      ),
    [importDataWithColumnCreation],
  );

  const handleExportData = useCallback(
    (params?: { row_ids?: string; filters?: string; search?: string }) =>
      exportData(params),
    [exportData],
  );

  const handleSetTableLock = useCallback(
    (locked: boolean) => setTableLock(locked),
    [setTableLock],
  );

  const handleRowsQueryChange = useCallback(
    (params: RowsQueryParams) => {
      fetchRows(params);
    },
    [fetchRows],
  );

  if (selectedTableId && !tableWithRows) {
    return <TableDetailSkeleton />;
  }

  if (tableWithRows) {
    return (
      <div className="flex h-screen min-h-0 flex-col overflow-hidden p-6">
        <TableDetailView
          table={tableWithRows}
          syncStatus={syncStatus}
          onBack={handleBack}
          onConfigureTable={handleConfigureSelectedTable}
          onCellUpdate={handleCellUpdate}
          onAddRow={handleAddRow}
          onAddColumn={handleAddColumn}
          onDeleteColumn={handleDeleteColumn}
          onColumnResize={handleColumnResize}
          onDeleteRows={handleDeleteRows}
          onUpdateColumn={handleUpdateColumn}
          onDuplicateColumn={handleDuplicateColumn}
          onInsertColumn={handleInsertColumn}
          onReorderColumns={handleReorderColumns}
          onImportData={handleImportData}
          onImportWithColumnCreation={handleImportWithColumnCreation}
          onExportData={handleExportData}
          totalRows={totalRows}
          currentPage={page}
          pageSize={pageSize}
          isTableLoading={isLoading}
          isRowsLoading={isRowsLoading}
          onRowsQueryChange={handleRowsQueryChange}
          onSetTableLock={handleSetTableLock}
          canEdit={canEditDataTables}
        />
        <CreateTableDialog
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) setEditingTable(null);
          }}
          mode={editingTable ? "edit" : "create"}
          table={editingTable}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDeleteTable}
          existingNames={tables.map((t) => t.name)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div
        className={`sticky top-0 z-10 bg-background px-6 ${
          isHeaderStuck ? "border-b bg-background py-4" : ""
        }`}
      >
        <CommonHeader
          title="Data Tables"
          onCreateClick={openCreateDialog}
          buttonText="Add New"
          searchPlaceholder="Search..."
          permission={canEditDataTables}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </div>
      <div className="px-6">
        <TableCards
          tables={tables}
          isLoading={isListLoading || isAxiosLoading}
          isFetchingMore={isFetchingMore}
          hasMore={hasMore}
          searchQuery={searchText}
          onSelect={handleSelectTable}
          onConfigure={openEditDialog}
          onLoadMore={loadMoreTables}
          canConfigure={canEditDataTables}
        />
      </div>

      <CreateTableDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setEditingTable(null);
        }}
        mode={editingTable ? "edit" : "create"}
        table={editingTable}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDeleteTable}
        existingNames={tables.map((t) => t.name)}
      />
    </div>
  );
}

function TableDetailSkeleton() {
  return (
    <div className="flex h-screen min-h-0 flex-col gap-4 overflow-hidden p-6">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-md bg-card-foreground/20 dark:bg-card-foreground/10" />
          <div className="h-8 w-56 animate-pulse rounded bg-card-foreground/20 dark:bg-card-foreground/10" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-64 animate-pulse rounded-md bg-card-foreground/20 dark:bg-card-foreground/10" />
          <div className="h-9 w-9 animate-pulse rounded-md bg-card-foreground/20 dark:bg-card-foreground/10" />
          <div className="h-9 w-32 animate-pulse rounded-md bg-card-foreground/20 dark:bg-card-foreground/10" />
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card">
        <div className="grid grid-cols-5 border-b bg-muted">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border-r px-4 py-3">
              <div className="h-3 w-24 animate-pulse rounded bg-card-foreground/20 dark:bg-card-foreground/10" />
            </div>
          ))}
        </div>
        <div className="flex-1">
          {Array.from({ length: 12 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 border-b">
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <div key={colIndex} className="border-r px-4 py-3">
                  <div className="h-3 w-full animate-pulse rounded bg-card-foreground/20 dark:bg-card-foreground/10" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
