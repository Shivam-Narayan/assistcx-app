"use client";

import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ColumnType,
  DataTableStatusEntry,
  DynamicTable,
  ImportResult,
  RowsQueryParams,
  TableRowData,
} from "../types/table-types";
import { DEFAULT_PAGE_SIZE } from "../types/table-types";
import {
  bulkCreateColumnsApi,
  getTableApi,
  setTableLockApi,
} from "./useTableApi";
import {
  apiRowsToFrontend,
  exportDataApi,
  getRowsApi,
  importDataApi,
} from "./useTableApiRows";
import { useSyncQueue } from "./useSyncQueue";
import { createColumnActions } from "./column-actions";
import { createRowActions } from "./row-actions";

/**
 * Manages state for a single table's detail view.
 * All mutations are **optimistic** — UI updates instantly,
 * API calls run in a background sync queue.
 */
export function useTableStore(tableId: string | null) {
  const { axiosAuth, loading } = useAxiosAuth();
  const { status: syncStatus, enqueue } = useSyncQueue();

  const [table, setTable] = useState<DynamicTable | null>(null);
  const [rows, setRows] = useState<TableRowData[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [isRowsLoading, setIsRowsLoading] = useState(false);

  const abortRef = useRef(false);
  const importPollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const importPollCountRef = useRef(0);
  const axiosRef = useRef(axiosAuth);
  axiosRef.current = axiosAuth;
  const latestRowsQueryRef = useRef<RowsQueryParams>({
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
  });

  const tableIdRef = useRef(tableId);
  tableIdRef.current = tableId;

  const pendingTempRowValuesRef = useRef<Map<string, Record<string, any>>>(
    new Map(),
  );
  const submittedTempRowValuesRef = useRef<Map<string, string>>(new Map());

  const stopImportPolling = useCallback(() => {
    if (importPollTimeoutRef.current) {
      clearTimeout(importPollTimeoutRef.current);
      importPollTimeoutRef.current = null;
    }
    importPollCountRef.current = 0;
  }, []);

  const getLatestImportStatus = (status?: DataTableStatusEntry[]) => {
    if (!Array.isArray(status) || status.length === 0) return null;
    const latestStatus = status[status.length - 1]?.status;
    return latestStatus ? latestStatus.toUpperCase() : null;
  };

  const isImportRunning = (status: string | null) =>
    status === "IMPORT_STARTED" ||
    status === "IMPORTING" ||
    status === "IMPORT_IN_PROGRESS" ||
    status === "PROCESSING";

  const isImportComplete = (status: string | null) =>
    status === "IMPORT_COMPLETED" ||
    status === "IMPORT_SUCCESS" ||
    status === "SUCCESSFUL" ||
    status === "COMPLETED";

  const isImportTerminal = (status: string | null) =>
    isImportComplete(status) ||
    status === "IMPORT_FAILED" ||
    status === "FAILED" ||
    status === "ERROR" ||
    status === "CANCELLED";

  const fetchTable = useCallback(async () => {
    if (!tableId || loading) return null;
    setIsLoading(true);
    try {
      const result = await getTableApi(axiosAuth, tableId);
      if (result && !abortRef.current) {
        setTable(result);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [tableId, loading, axiosAuth]);

  const fetchRows = useCallback(
    async (params?: RowsQueryParams) => {
      if (!tableId || loading) return;
      setIsRowsLoading(true);
      try {
        const previousQuery = latestRowsQueryRef.current;
        const queryParams: RowsQueryParams = {
          ...previousQuery,
          page: params?.page ?? previousQuery.page ?? page,
          page_size: params?.page_size ?? previousQuery.page_size ?? pageSize,
          ...params,
        };
        latestRowsQueryRef.current = queryParams;

        const result = await getRowsApi(axiosAuth, tableId, queryParams);
        if (result && !abortRef.current) {
          setRows(apiRowsToFrontend(result.rows));
          setTotalRows(result.total);
          if (queryParams.page) setPage(queryParams.page);
          if (queryParams.page_size) setPageSize(queryParams.page_size);
        }
      } finally {
        setIsRowsLoading(false);
      }
    },
    [tableId, loading, axiosAuth, page, pageSize],
  );

  const startImportPolling = useCallback(() => {
    stopImportPolling();

    const pollTableStatus = async () => {
      if (!tableIdRef.current || abortRef.current) return;

      const result = await getTableApi(axiosRef.current, tableIdRef.current);
      if (!result || abortRef.current) return;

      setTable(result);
      const latestStatus = getLatestImportStatus(result.status);

      if (isImportComplete(latestStatus)) {
        stopImportPolling();
        successMessageHandler("Import completed successfully.");
        await fetchRows({ page: 1, page_size: pageSize });
        return;
      }

      if (isImportTerminal(latestStatus)) {
        stopImportPolling();
        const lastEntry = result.status?.[result.status.length - 1];
        errorMessageHandler(
          lastEntry?.errors?.[0] || "Import failed. Please try again.",
        );
        return;
      }

      if (!isImportRunning(latestStatus)) {
        stopImportPolling();
        return;
      }

      importPollCountRef.current += 1;
      const nextDelay = 3000 + importPollCountRef.current * 2000;
      importPollTimeoutRef.current = setTimeout(pollTableStatus, nextDelay);
    };

    importPollTimeoutRef.current = setTimeout(pollTableStatus, 3000);
  }, [fetchRows, pageSize, stopImportPolling]);

  useEffect(() => {
    abortRef.current = false;
    if (tableId && !loading) {
      latestRowsQueryRef.current = { page: 1, page_size: pageSize };
      fetchTable();
      fetchRows({ page: 1, page_size: pageSize });
    } else if (!tableId) {
      stopImportPolling();
      setTable(null);
      setRows([]);
      setTotalRows(0);
      setPage(1);
    }
    return () => {
      abortRef.current = true;
      stopImportPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, loading]);

  const columnActions = useMemo(
    () =>
      createColumnActions({
        setTable,
        setRows,
        enqueue,
        axiosRef,
        tableIdRef,
        table,
      }),
    [enqueue, table],
  );

  const rowActions = useMemo(
    () =>
      createRowActions({
        setRows,
        setTotalRows,
        enqueue,
        axiosRef,
        tableIdRef,
        table,
        pendingTempRowValuesRef,
        submittedTempRowValuesRef,
      }),
    [enqueue, table],
  );

  const goToPage = useCallback(
    (newPage: number) => {
      fetchRows({ page: newPage, page_size: pageSize });
    },
    [fetchRows, pageSize],
  );

  const changePageSize = useCallback(
    (newSize: number) => {
      fetchRows({ page: 1, page_size: newSize });
    },
    [fetchRows],
  );

  const importData = useCallback(
    async (
      file: File,
      hasHeader: boolean,
      columnMap?: Record<string, string>,
    ): Promise<ImportResult> => {
      if (!tableIdRef.current) {
        return {
          table_id: "",
          mode: "inline",
          inserted: 0,
          failed: 0,
          errors: ["No data table selected"],
          message: null,
        };
      }
      const result = await importDataApi(
        axiosRef.current,
        tableIdRef.current,
        file,
        hasHeader,
        columnMap,
      );
      await fetchTable();
      if (result.inserted > 0) {
        successMessageHandler(
          result.message || `${result.inserted} rows imported successfully.`,
        );
        await fetchRows({ page: 1, page_size: pageSize });
      } else if (result.errors.length === 0) {
        successMessageHandler(
          "Import initiated. We'll notify you when it finishes.",
        );
        startImportPolling();
      }
      return result;
    },
    [fetchRows, fetchTable, pageSize, startImportPolling],
  );

  const importDataWithColumnCreation = useCallback(
    async (
      file: File,
      hasHeader: boolean,
      columnsToCreate: { sourceKey: string; name: string; type: ColumnType }[],
      onColumnsCreated?: () => void,
    ): Promise<ImportResult> => {
      const emptyResult: ImportResult = {
        table_id: tableIdRef.current ?? "",
        mode: "inline",
        inserted: 0,
        failed: 0,
        errors: [],
        message: null,
      };
      if (!tableIdRef.current) {
        return { ...emptyResult, errors: ["No data table selected"] };
      }

      const knownColumnKeys = new Set(
        table?.columns.map((column) => column.id) ?? [],
      );
      const columnPayload = columnsToCreate.map((col) => ({
        label: col.name,
        data_type: col.type,
        required: false,
      }));

      const tableResult = await bulkCreateColumnsApi(
        axiosRef.current,
        tableIdRef.current,
        columnPayload,
      );

      if (!tableResult) {
        return {
          ...emptyResult,
          errors: [
            "Failed to create columns. Check your column configuration.",
          ],
        };
      }

      onColumnsCreated?.();

      const createdColumns = tableResult.column_schema.filter(
        (schemaColumn) => !knownColumnKeys.has(schemaColumn.key),
      );
      const columnMap: Record<string, string> = {};

      columnsToCreate.forEach((col, index) => {
        const createdColumn = createdColumns[index];

        if (createdColumn?.key) {
          columnMap[col.sourceKey] = createdColumn.key;
        }
      });

      if (Object.keys(columnMap).length === 0) {
        return {
          ...emptyResult,
          errors: [
            "Columns were created, but no import mapping could be built.",
          ],
        };
      }

      const importResult = await importDataApi(
        axiosRef.current,
        tableIdRef.current!,
        file,
        hasHeader,
        columnMap,
      );

      await fetchTable();
      if (importResult.inserted > 0) {
        successMessageHandler(
          importResult.message ||
            `${importResult.inserted} rows imported successfully.`,
        );
        await fetchRows({ page: 1, page_size: pageSize });
      } else if (importResult.errors.length === 0) {
        successMessageHandler(
          "Import initiated. We'll notify you when it finishes.",
        );
        startImportPolling();
      }
      return importResult;
    },
    [fetchRows, fetchTable, pageSize, startImportPolling],
  );

  const exportData = useCallback(
    async (params?: {
      row_ids?: string;
      filters?: string;
      search?: string;
    }) => {
      if (!tableIdRef.current) return null;
      return exportDataApi(axiosRef.current, tableIdRef.current, params);
    },
    [],
  );

  const setTableLock = useCallback(
    async (locked: boolean) => {
      if (!tableId || loading) return false;
      const updated = await setTableLockApi(axiosAuth, tableId, locked);
      if (updated) {
        setTable(updated);
        return true;
      }
      return false;
    },
    [tableId, loading, axiosAuth],
  );

  return {
    table,
    rows,
    totalRows,
    page,
    pageSize,
    isLoading,
    isRowsLoading,
    syncStatus,
    fetchTable,
    fetchRows,
    ...columnActions,
    ...rowActions,
    goToPage,
    changePageSize,
    importData,
    importDataWithColumnCreation,
    exportData,
    setTableLock,
  };
}
