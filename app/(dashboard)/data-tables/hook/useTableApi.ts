"use client";

import * as helperFun from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import type { AxiosInstance } from "axios";
import type {
  ApiAddColumnRequest,
  ApiDataTable,
  ColumnOptionInput,
  ColumnOptionItem,
  ApiTableConfig,
  ApiUpdateColumnRequest,
  ColumnType,
  DynamicTable,
  TableColumnDef,
  TableListQueryParams,
} from "../types/table-types";

function parseTablesListPayload(data: unknown): ApiDataTable[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object") {
    const record = data as Record<string, unknown>;
    const tables = record.data_tables ?? record.items ?? record.data;
    if (Array.isArray(tables)) return tables;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Transformers: API ↔ Frontend
// ---------------------------------------------------------------------------

function normalizeColumnOptions(options?: ColumnOptionInput[]) {
  return options
    ?.map((option) => (typeof option === "string" ? { value: option } : option))
    .filter((option): option is ColumnOptionItem => Boolean(option?.value));
}

export function apiTableToFrontend(api: ApiDataTable): DynamicTable {
  const columns: TableColumnDef[] = api.column_schema.map((col) => ({
    id: col.key,
    name: col.label,
    type: col.data_type,
    required: col.required ?? false,
    defaultValue: col.default != null ? String(col.default) : undefined,
    options: normalizeColumnOptions(col.options),
    allowCustomValues: col.allow_custom_values,
    precision: col.precision,
    currencyCode:
      col.data_type === "currency" && col.currency_code
        ? col.currency_code
        : undefined,
    description: col.description,
  }));

  return {
    id: api.id,
    name: api.name,
    icon: api.icon || "grid-table",
    description: api.description ?? "",
    availability: api.availability,
    columns,
    rows: [],
    rowCount: api.row_count,
    tableConfig: api.table_config,
    status: api.status,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

export function configToApiColumn(
  col: Pick<TableColumnDef, "name" | "type" | "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
): ApiAddColumnRequest {
  const payload: ApiAddColumnRequest = {
    label: col.name,
    data_type: col.type,
    required: col.required || false,
    description: col.description,
  };

  if (col.defaultValue != null && col.defaultValue !== "") {
    payload.default = col.defaultValue;
  }

  if (col.type === "select" || col.type === "multi_select") {
    payload.allow_custom_values = col.allowCustomValues || false;
    if (col.options?.length) {
      payload.options = col.options
        .map((option) => ({
          value: option.value,
          color: option.color || undefined,
        }))
        .filter((option) => option.value);
    }
  }

  if (col.type === "number" || col.type === "currency") {
    payload.precision = col.precision;
  }

  if (col.type === "currency" && col.currencyCode) {
    payload.currency_code = col.currencyCode;
  }

  return payload;
}

export function configToApiColumnUpdate(
  col: Pick<TableColumnDef, "name" | "type" | "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
): ApiUpdateColumnRequest {
  const payload = configToApiColumn(col);
  return {
    label: payload.label,
    data_type: payload.data_type,
    required: payload.required,
    default: payload.default ?? null,
    options: payload.options,
    allow_custom_values: payload.allow_custom_values,
    precision: payload.precision,
    currency_code: col.type === "currency" ? payload.currency_code : null,
    description: payload.description,
  };
}

// ---------------------------------------------------------------------------
// API functions (all take axiosAuth as first param)
// ---------------------------------------------------------------------------

export async function createTableApi(
  axiosAuth: AxiosInstance,
  name: string,
  description: string,
  icon: string,
  availability: string,
): Promise<DynamicTable | null> {
  try {
    const result = await axiosAuth.post(url.DATA_TABLES, {
      name,
      description,
      icon,
      availability,
    });
    if (result?.status === 200 || result?.status === 201) {
      return apiTableToFrontend(result.data);
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to create data table",
    );
    return null;
  }
}

const DEFAULT_TABLE_LIST_QUERY: Pick<
  TableListQueryParams,
  "sort_by" | "sort_order"
> = {
  sort_by: "updated_at",
  sort_order: "desc",
};

export async function getTablesApi(
  axiosAuth: AxiosInstance,
  params: TableListQueryParams,
): Promise<DynamicTable[]> {
  try {
    const result = await axiosAuth.get(url.DATA_TABLES, {
      params: { ...DEFAULT_TABLE_LIST_QUERY, ...params },
    });
    if (result?.status === 200) {
      const tables = parseTablesListPayload(result.data);
      return tables.map(apiTableToFrontend);
    }
    return [];
  } catch (error: any) {
    console.error("Failed to fetch data tables:", error);
    return [];
  }
}

export async function searchTablesApi(
  axiosAuth: AxiosInstance,
  keyword: string,
  params: TableListQueryParams,
): Promise<DynamicTable[]> {
  try {
    const result = await axiosAuth.get(url.DATA_TABLES_SEARCH, {
      params: {
        keyword: keyword.trim(),
        ...DEFAULT_TABLE_LIST_QUERY,
        ...params,
      },
    });
    if (result?.status === 200) {
      const tables = parseTablesListPayload(result.data);
      return tables.map(apiTableToFrontend);
    }
    return [];
  } catch (error: any) {
    console.error("Failed to search data tables:", error);
    return [];
  }
}

export async function getTableApi(
  axiosAuth: AxiosInstance,
  tableId: string,
): Promise<DynamicTable | null> {
  try {
    const result = await axiosAuth.get(`${url.DATA_TABLES}/${tableId}`);
    if (result?.status === 200) {
      return apiTableToFrontend(result.data);
    }
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to fetch data table",
    );
    return null;
  }
}

export async function updateTableApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    availability?: string;
    table_config?: ApiTableConfig;
  },
): Promise<DynamicTable | null> {
  try {
    const result = await axiosAuth.put(`${url.DATA_TABLES}/${tableId}`, data);
    if (result?.status === 200) {
      return apiTableToFrontend(result.data);
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to update data table",
    );
    return null;
  }
}

export async function setTableLockApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  locked: boolean,
): Promise<DynamicTable | null> {
  try {
    const result = await axiosAuth.put(`${url.DATA_TABLES}/${tableId}/lock`, {
      locked,
    });
    if (result?.status === 200) {
      const updated = apiTableToFrontend(result.data);
      helperFun.successMessageHandler(
        locked ? "Table locked successfully" : "Table unlocked successfully",
      );
      return updated;
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to update table lock",
    );
    return null;
  }
}

export async function deleteTableApi(
  axiosAuth: AxiosInstance,
  tableId: string,
): Promise<boolean> {
  try {
    const result = await axiosAuth.delete(`${url.DATA_TABLES}/${tableId}`);
    if (result?.status === 200) {
      helperFun.successMessageHandler(
        result.data?.message || "Data table deleted successfully",
      );
      return true;
    }
    helperFun.errorMessageHandler(result);
    return false;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to delete data table",
    );
    return false;
  }
}

// ---------------------------------------------------------------------------
// Column CRUD
// ---------------------------------------------------------------------------

export async function bulkCreateColumnsApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  columns: ApiAddColumnRequest[],
): Promise<ApiDataTable | null> {
  try {
    const result = await axiosAuth.post(
      `${url.DATA_TABLES}/${tableId}/columns`,
      columns,
    );
    if (result?.status === 200 || result?.status === 201) {
      return result.data;
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to create columns",
    );
    return null;
  }
}

export async function addColumnApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  col: Pick<TableColumnDef, "name" | "type" | "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
): Promise<ApiDataTable | null> {
  try {
    const payload = configToApiColumn(col);
    const result = await axiosAuth.post(
      `${url.DATA_TABLES}/${tableId}/columns`,
      payload,
    );
    if (result?.status === 200 || result?.status === 201) {
      return result.data;
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to add column",
    );
    return null;
  }
}

export async function updateColumnApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  columnKey: string,
  data: ApiUpdateColumnRequest,
): Promise<ApiDataTable | null> {
  try {
    const result = await axiosAuth.put(
      `${url.DATA_TABLES}/${tableId}/columns/${columnKey}`,
      data,
    );
    if (result?.status === 200) {
      return result.data;
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to update column",
    );
    return null;
  }
}

export async function deleteColumnApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  columnKey: string,
): Promise<ApiDataTable | null> {
  try {
    const result = await axiosAuth.delete(
      `${url.DATA_TABLES}/${tableId}/columns/${columnKey}`,
    );
    if (result?.status === 200) {
      return result.data;
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to delete column",
    );
    return null;
  }
}
