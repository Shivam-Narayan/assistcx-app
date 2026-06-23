"use client";

import type { AxiosInstance } from "axios";
import type React from "react";
import type { DynamicTable, TableRowData } from "../types/table-types";
import {
  bulkDeleteRowsApi,
  insertRowApi,
  updateRowApi,
} from "./useTableApiRows";
import type { SyncMutation } from "./useSyncQueue";
import { generateTempId } from "./column-actions";
import {
  getNewRowCellValue,
  getNewRowInsertPayloadValue,
} from "../utils/column-row-defaults";

function isTempRowId(rowId: string): boolean {
  return rowId.startsWith("tmp_row_");
}

function extractInsertedRowId(result: any): string | null {
  const candidates = [
    result?.inserted_rows?.[0],
    result?.rows?.[0],
    result?.row_ids?.[0],
    result?.inserted_row_ids?.[0],
    result?.row,
    result?.data?.[0],
    result,
  ];

  for (const candidate of candidates) {
    if (candidate == null) continue;
    if (typeof candidate === "number" || typeof candidate === "string") {
      return String(candidate);
    }
    const rowId =
      candidate._row_id ??
      candidate.row_id ??
      candidate.id ??
      candidate.inserted_id ??
      candidate.inserted_row_id;
    if (rowId != null) return String(rowId);
  }

  return null;
}

export function createRowActions(deps: {
  setRows: React.Dispatch<React.SetStateAction<TableRowData[]>>;
  setTotalRows: React.Dispatch<React.SetStateAction<number>>;
  enqueue: (mutation: SyncMutation) => void;
  axiosRef: React.MutableRefObject<AxiosInstance>;
  tableIdRef: React.MutableRefObject<string | null>;
  table: DynamicTable | null;
  pendingTempRowValuesRef: React.MutableRefObject<
    Map<string, Record<string, any>>
  >;
  submittedTempRowValuesRef: React.MutableRefObject<Map<string, string>>;
}) {
  const {
    setRows,
    setTotalRows,
    enqueue,
    axiosRef,
    tableIdRef,
    table,
    pendingTempRowValuesRef,
    submittedTempRowValuesRef,
  } = deps;

  const addRow = () => {
    if (!tableIdRef.current || !table) return;
    const tid = tableIdRef.current;
    const tempId = generateTempId("row");

    const newRow: TableRowData = { id: tempId };
    const rowPayload: Record<string, any> = {};
    for (const col of table.columns) {
      if (col.id.startsWith("tmp_")) continue;
      newRow[col.id] = getNewRowCellValue(col);
      const payloadValue = getNewRowInsertPayloadValue(col);
      if (payloadValue !== undefined) {
        rowPayload[col.id] = payloadValue;
      }
    }

    pendingTempRowValuesRef.current.set(tempId, { ...rowPayload });
    setRows((prev) => [newRow, ...prev]);
    setTotalRows((prev) => prev + 1);

    enqueue({
      id: `add_row_${tempId}`,
      execute: () => {
        const pendingPayload = pendingTempRowValuesRef.current.get(tempId);
        if (!pendingPayload) return Promise.resolve({ skipped: true });
        submittedTempRowValuesRef.current.set(
          tempId,
          JSON.stringify(pendingPayload),
        );
        return insertRowApi(axiosRef.current, tid, pendingPayload);
      },
      onSuccess: (result) => {
        if (!result) return;
        if (result.skipped) {
          submittedTempRowValuesRef.current.delete(tempId);
          return;
        }
        const serverRowId = extractInsertedRowId(result);
        if (serverRowId && serverRowId !== tempId) {
          setRows((prev) =>
            prev.map((r) => (r.id === tempId ? { ...r, id: serverRowId } : r)),
          );
          const latestPayload = pendingTempRowValuesRef.current.get(tempId);
          const submittedPayload =
            submittedTempRowValuesRef.current.get(tempId);
          if (
            latestPayload &&
            submittedPayload &&
            JSON.stringify(latestPayload) !== submittedPayload
          ) {
            enqueue({
              id: `sync_new_row_${serverRowId}_${Date.now()}`,
              dedupKey: `row:${serverRowId}`,
              execute: () =>
                updateRowApi(axiosRef.current, tid, serverRowId, latestPayload),
            });
          }
        }
        pendingTempRowValuesRef.current.delete(tempId);
        submittedTempRowValuesRef.current.delete(tempId);
      },
      revert: () => {
        pendingTempRowValuesRef.current.delete(tempId);
        submittedTempRowValuesRef.current.delete(tempId);
        setRows((prev) => prev.filter((r) => r.id !== tempId));
        setTotalRows((prev) => prev - 1);
      },
    });
  };

  const updateCell = (
    rowId: string,
    columnKey: string,
    value: string | number | string[],
  ) => {
    if (!tableIdRef.current) return;
    const tid = tableIdRef.current;
    let oldValue: any;
    let rowFound = false;

    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          rowFound = true;
          oldValue = r[columnKey];
          return { ...r, [columnKey]: value };
        }
        return r;
      }),
    );

    if (isTempRowId(rowId)) {
      if (!rowFound) return;
      const pending = pendingTempRowValuesRef.current.get(rowId) ?? {};
      pendingTempRowValuesRef.current.set(rowId, {
        ...pending,
        [columnKey]: value,
      });
      return;
    }

    enqueue({
      id: `cell_${rowId}_${columnKey}_${Date.now()}`,
      dedupKey: `cell:${rowId}:${columnKey}`,
      execute: () =>
        updateRowApi(axiosRef.current, tid, rowId, { [columnKey]: value }),
      revert: () => {
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, [columnKey]: oldValue } : r,
          ),
        );
      },
    });
  };

  const deleteRows = (rowIds: string[]) => {
    if (!tableIdRef.current) return;
    const tid = tableIdRef.current;
    const stashedPersistedRows: TableRowData[] = [];

    setRows((prev) => {
      const remaining: TableRowData[] = [];
      for (const r of prev) {
        if (rowIds.includes(r.id)) {
          if (!isTempRowId(r.id)) stashedPersistedRows.push(r);
        } else {
          remaining.push(r);
        }
      }
      return remaining;
    });
    setTotalRows((prev) => prev - rowIds.length);

    const persistedRowIds = rowIds.filter((id) => !isTempRowId(id));
    const tempRowIds = rowIds.filter(isTempRowId);
    tempRowIds.forEach((id) => {
      pendingTempRowValuesRef.current.delete(id);
      submittedTempRowValuesRef.current.delete(id);
    });

    if (persistedRowIds.length === 0) return;

    enqueue({
      id: `delete_rows_${Date.now()}`,
      execute: () => bulkDeleteRowsApi(axiosRef.current, tid, persistedRowIds),
      revert: () => {
        setRows((prev) => [...stashedPersistedRows, ...prev]);
        setTotalRows((prev) => prev + stashedPersistedRows.length);
      },
    });
  };

  return { addRow, updateCell, deleteRows };
}
