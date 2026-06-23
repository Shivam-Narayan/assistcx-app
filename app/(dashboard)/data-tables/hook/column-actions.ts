"use client";

import type { AxiosInstance } from "axios";
import type React from "react";
import type {
  ApiTableConfig,
  ColumnType,
  DynamicTable,
  TableColumnDef,
  TableRowData,
} from "../types/table-types";
import {
  addColumnApi,
  apiTableToFrontend,
  configToApiColumnUpdate,
  deleteColumnApi,
  updateColumnApi,
  updateTableApi,
} from "./useTableApi";
import type { SyncMutation } from "./useSyncQueue";
import { getNewRowCellValue } from "../utils/column-row-defaults";

let tempIdCounter = 0;

export function generateTempId(prefix: string): string {
  return `tmp_${prefix}_${++tempIdCounter}_${Date.now().toString(36)}`;
}

export function createColumnActions(deps: {
  setTable: React.Dispatch<React.SetStateAction<DynamicTable | null>>;
  setRows: React.Dispatch<React.SetStateAction<TableRowData[]>>;
  enqueue: (mutation: SyncMutation) => void;
  axiosRef: React.MutableRefObject<AxiosInstance>;
  tableIdRef: React.MutableRefObject<string | null>;
  table: DynamicTable | null;
}) {
  const { setTable, setRows, enqueue, axiosRef, tableIdRef, table } = deps;

  const addColumn = (
    name: string,
    type: ColumnType,
    colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
  ) => {
    if (!tableIdRef.current) return;
    const tid = tableIdRef.current;
    const tempKey = generateTempId("col");

    const newCol: TableColumnDef = {
      id: tempKey,
      name,
      type,
      ...colData,
    };

    setTable((prev) => {
      if (!prev) return prev;
      return { ...prev, columns: [...prev.columns, newCol] };
    });
    setRows((prev) =>
      prev.map((r) => {
        const defaultVal = getNewRowCellValue(newCol);
        return { ...r, [tempKey]: defaultVal };
      }),
    );

    enqueue({
      id: `add_col_${tempKey}`,
      execute: () => addColumnApi(axiosRef.current, tid, newCol),
      onSuccess: (result) => {
        if (!result) return;
        const updated = apiTableToFrontend(result);
        const serverCol = updated.columns[updated.columns.length - 1];
        if (serverCol && serverCol.id !== tempKey) {
          const realKey = serverCol.id;
          setTable((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              columns: prev.columns.map((c) =>
                c.id === tempKey ? { ...c, id: realKey } : c,
              ),
            };
          });
          setRows((prev) =>
            prev.map((r) => {
              const { [tempKey]: val, ...rest } = r;
              return { ...rest, [realKey]: val } as TableRowData;
            }),
          );
        }
      },
      revert: () => {
        setTable((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.filter((c) => c.id !== tempKey),
          };
        });
        setRows((prev) =>
          prev.map((r) => {
            const { [tempKey]: _, ...rest } = r;
            return rest as TableRowData;
          }),
        );
      },
    });
  };

  const renameColumn = (columnKey: string, newName: string) => {
    if (!tableIdRef.current) return;
    const tid = tableIdRef.current;
    let oldName = "";

    setTable((prev) => {
      if (!prev) return prev;
      const col = prev.columns.find((c) => c.id === columnKey);
      if (col) oldName = col.name;
      return {
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === columnKey ? { ...c, name: newName } : c,
        ),
      };
    });

    enqueue({
      id: `rename_col_${columnKey}_${Date.now()}`,
      dedupKey: `rename_col_${columnKey}`,
      execute: () =>
        updateColumnApi(axiosRef.current, tid, columnKey, { label: newName }),
      revert: () => {
        setTable((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.map((c) =>
              c.id === columnKey ? { ...c, name: oldName } : c,
            ),
          };
        });
      },
    });
  };

  const updateColumn = (
    columnKey: string,
    name: string,
    type: ColumnType,
    colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
  ) => {
    if (!tableIdRef.current) return;
    const tid = tableIdRef.current;
    let previousColumn: TableColumnDef | undefined;

    setTable((prev) => {
      if (!prev) return prev;
      previousColumn = prev.columns.find((c) => c.id === columnKey);
      return {
        ...prev,
        columns: prev.columns.map((column) =>
          column.id === columnKey
            ? { ...column, name, type, ...colData }
            : column,
        ),
      };
    });

    enqueue({
      id: `update_col_${columnKey}_${Date.now()}`,
      dedupKey: `update_col_${columnKey}`,
      execute: () =>
        updateColumnApi(
          axiosRef.current,
          tid,
          columnKey,
          configToApiColumnUpdate({ name, type, ...colData }),
        ),
      onSuccess: (result) => {
        if (result) setTable(apiTableToFrontend(result));
      },
      revert: () => {
        if (!previousColumn) return;
        setTable((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.map((column) =>
              column.id === columnKey ? previousColumn! : column,
            ),
          };
        });
      },
    });
  };

  const deleteColumn = (columnKey: string) => {
    if (!tableIdRef.current) return;
    const tid = tableIdRef.current;
    let stashedCol: TableColumnDef | undefined;
    let stashedColIndex = -1;
    let stashedRowData: Map<string, any> = new Map();

    setTable((prev) => {
      if (!prev) return prev;
      stashedColIndex = prev.columns.findIndex((c) => c.id === columnKey);
      stashedCol = prev.columns[stashedColIndex];
      return {
        ...prev,
        columns: prev.columns.filter((c) => c.id !== columnKey),
      };
    });
    setRows((prev) =>
      prev.map((r) => {
        stashedRowData.set(r.id, r[columnKey]);
        const { [columnKey]: _, ...rest } = r;
        return rest as TableRowData;
      }),
    );

    enqueue({
      id: `delete_col_${columnKey}`,
      execute: () => deleteColumnApi(axiosRef.current, tid, columnKey),
      revert: () => {
        if (!stashedCol) return;
        setTable((prev) => {
          if (!prev) return prev;
          const cols = [...prev.columns];
          cols.splice(stashedColIndex, 0, stashedCol!);
          return { ...prev, columns: cols };
        });
        setRows((prev) =>
          prev.map((r) => ({ ...r, [columnKey]: stashedRowData.get(r.id) })),
        );
      },
    });
  };

  const duplicateColumn = (columnKey: string) => {
    if (!tableIdRef.current || !table) return;
    const tid = tableIdRef.current;
    const src = table.columns.find((c) => c.id === columnKey);
    if (!src) return;

    const tempKey = generateTempId("col");
    const copyName = `${src.name} (copy)`;
    const newCol: TableColumnDef = { ...src, id: tempKey, name: copyName };

    setTable((prev) => {
      if (!prev) return prev;
      const idx = prev.columns.findIndex((c) => c.id === columnKey);
      const cols = [...prev.columns];
      cols.splice(idx + 1, 0, newCol);
      return { ...prev, columns: cols };
    });
    setRows((prev) => prev.map((r) => ({ ...r, [tempKey]: r[columnKey] })));

    enqueue({
      id: `dup_col_${tempKey}`,
      execute: () =>
        addColumnApi(axiosRef.current, tid, { ...src, name: copyName }),
      onSuccess: (result) => {
        if (!result) return;
        const updated = apiTableToFrontend(result);
        const serverCol = updated.columns[updated.columns.length - 1];
        if (serverCol && serverCol.id !== tempKey) {
          const realKey = serverCol.id;
          setTable((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              columns: prev.columns.map((c) =>
                c.id === tempKey ? { ...c, id: realKey } : c,
              ),
            };
          });
          setRows((prev) =>
            prev.map((r) => {
              const { [tempKey]: val, ...rest } = r;
              return { ...rest, [realKey]: val } as TableRowData;
            }),
          );
        }
      },
      revert: () => {
        setTable((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.filter((c) => c.id !== tempKey),
          };
        });
        setRows((prev) =>
          prev.map((r) => {
            const { [tempKey]: _, ...rest } = r;
            return rest as TableRowData;
          }),
        );
      },
    });
  };

  const insertColumn = (
    refColumnKey: string,
    side: "left" | "right",
    name: string,
    type: ColumnType,
    colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
  ) => {
    if (!tableIdRef.current) return;
    const tid = tableIdRef.current;
    const tempKey = generateTempId("col");
    const newCol: TableColumnDef = {
      id: tempKey,
      name,
      type,
      ...colData,
    };

    setTable((prev) => {
      if (!prev) return prev;
      const idx = prev.columns.findIndex((c) => c.id === refColumnKey);
      const insertIdx = side === "left" ? idx : idx + 1;
      const cols = [...prev.columns];
      cols.splice(insertIdx, 0, newCol);

      const currentOrder =
        prev.tableConfig?.column_order ?? prev.columns.map((c) => c.id);
      const refIdx = currentOrder.indexOf(refColumnKey);
      const orderInsertIdx =
        refIdx === -1
          ? currentOrder.length
          : side === "left"
            ? refIdx
            : refIdx + 1;
      const newOrder = [...currentOrder];
      newOrder.splice(orderInsertIdx, 0, tempKey);

      return {
        ...prev,
        columns: cols,
        tableConfig: { ...prev.tableConfig, column_order: newOrder },
      };
    });
    setRows((prev) => {
      const defaultVal = getNewRowCellValue(newCol);
      return prev.map((r) => ({ ...r, [tempKey]: defaultVal }));
    });

    enqueue({
      id: `insert_col_${tempKey}`,
      execute: async () => {
        const result = await addColumnApi(axiosRef.current, tid, newCol);
        if (result) {
          const updated = apiTableToFrontend(result);
          const serverCol = updated.columns[updated.columns.length - 1];
          if (serverCol) {
            const currentOrder =
              table?.tableConfig?.column_order ??
              table?.columns.map((c) => c.id) ??
              [];
            const refIdx = currentOrder.indexOf(refColumnKey);
            const insertIdx = side === "left" ? refIdx : refIdx + 1;
            const newOrder = currentOrder.filter((k) => k !== tempKey);
            newOrder.splice(insertIdx, 0, serverCol.id);
            await updateTableApi(axiosRef.current, tid, {
              table_config: { ...table?.tableConfig, column_order: newOrder },
            });
          }
        }
        return result;
      },
      onSuccess: (result) => {
        if (!result) return;
        const updated = apiTableToFrontend(result);
        const serverCol = updated.columns[updated.columns.length - 1];
        if (serverCol && serverCol.id !== tempKey) {
          const realKey = serverCol.id;
          setTable((prev) => {
            if (!prev) return prev;
            const columnOrder = prev.tableConfig?.column_order?.map((key) =>
              key === tempKey ? realKey : key,
            );
            return {
              ...prev,
              columns: prev.columns.map((c) =>
                c.id === tempKey ? { ...c, id: realKey } : c,
              ),
              tableConfig: columnOrder
                ? { ...prev.tableConfig, column_order: columnOrder }
                : prev.tableConfig,
            };
          });
          setRows((prev) =>
            prev.map((r) => {
              const { [tempKey]: val, ...rest } = r;
              return { ...rest, [realKey]: val } as TableRowData;
            }),
          );
        }
      },
      revert: () => {
        setTable((prev) => {
          if (!prev) return prev;
          const columnOrder = prev.tableConfig?.column_order?.filter(
            (key) => key !== tempKey,
          );
          return {
            ...prev,
            columns: prev.columns.filter((c) => c.id !== tempKey),
            tableConfig: columnOrder
              ? { ...prev.tableConfig, column_order: columnOrder }
              : prev.tableConfig,
          };
        });
        setRows((prev) =>
          prev.map((r) => {
            const { [tempKey]: _, ...rest } = r;
            return rest as TableRowData;
          }),
        );
      },
    });
  };

  const reorderColumns = (newColumnOrder: string[]) => {
    if (!tableIdRef.current || !table) return;
    const tid = tableIdRef.current;
    const oldConfig = table.tableConfig;
    const newConfig: ApiTableConfig = {
      ...oldConfig,
      column_order: newColumnOrder,
    };

    setTable((prev) => (prev ? { ...prev, tableConfig: newConfig } : prev));

    enqueue({
      id: `reorder_cols_${Date.now()}`,
      dedupKey: "reorder_cols",
      execute: () =>
        updateTableApi(axiosRef.current, tid, { table_config: newConfig }),
      revert: () => {
        setTable((prev) => (prev ? { ...prev, tableConfig: oldConfig } : prev));
      },
    });
  };

  const updateColumnWidth = (columnKey: string, width: number) => {
    setTable((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === columnKey ? { ...c, width } : c,
        ),
      };
    });
  };

  const updateTableDetails = (
    name: string,
    description: string,
    icon: string,
    availability: string,
  ) => {
    if (!tableIdRef.current) return Promise.resolve(false);
    const tid = tableIdRef.current;
    const oldTable = table;

    setTable((prev) =>
      prev ? { ...prev, name, description, icon, availability } : prev,
    );

    enqueue({
      id: `update_table_${Date.now()}`,
      dedupKey: "update_table_details",
      execute: () =>
        updateTableApi(axiosRef.current, tid, {
          name,
          description,
          icon,
          availability,
        }),
      revert: () => {
        if (oldTable) {
          setTable((prev) =>
            prev
              ? {
                  ...prev,
                  name: oldTable.name,
                  description: oldTable.description,
                  icon: oldTable.icon,
                  availability: oldTable.availability,
                }
              : prev,
          );
        }
      },
    });

    return Promise.resolve(true);
  };

  return {
    addColumn,
    renameColumn,
    updateColumn,
    deleteColumn,
    duplicateColumn,
    insertColumn,
    reorderColumns,
    updateColumnWidth,
    updateTableDetails,
  };
}
