"use client";

import * as helperFun from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import type { AxiosInstance } from "axios";
import type {
  ApiInsertRowRequest,
  ApiInsertRowsRequest,
  ApiRowsResponse,
  ApiUpdateRowPayload,
  ApiUpdateRowRequest,
  ImportResult,
  RowsQueryParams,
  TableRowData,
} from "../types/table-types";

export function apiRowsToFrontend(
  apiRows: ApiRowsResponse["rows"],
): TableRowData[] {
  return apiRows.map((row) => {
    const { _row_id, ...rest } = row;
    const frontendRow: TableRowData = { id: String(_row_id) };
    for (const [key, value] of Object.entries(rest)) {
      if (value === null) {
        frontendRow[key] = undefined;
      } else if (typeof value === "string" && value.startsWith("[")) {
        try {
          frontendRow[key] = JSON.parse(value);
        } catch {
          frontendRow[key] = value;
        }
      } else {
        frontendRow[key] = value as string | number | string[];
      }
    }
    return frontendRow;
  });
}

export async function getRowsApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  params?: RowsQueryParams,
): Promise<ApiRowsResponse | null> {
  try {
    const result = await axiosAuth.get(`${url.DATA_TABLES}/${tableId}/rows`, {
      params,
    });
    if (result?.status === 200) {
      return result.data;
    }
    return null;
  } catch (error: any) {
    console.error("Failed to fetch rows:", error);
    return null;
  }
}

export async function insertRowApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  rowData: ApiInsertRowRequest,
): Promise<any | null> {
  try {
    const payload: ApiInsertRowsRequest = { rows: [rowData] };
    const result = await axiosAuth.post(
      `${url.DATA_TABLES}/${tableId}/rows`,
      payload,
    );
    if (result?.status === 200 || result?.status === 201) {
      return result.data;
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to insert row",
    );
    return null;
  }
}

export async function updateRowApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  rowId: string,
  data: ApiUpdateRowRequest,
): Promise<any | null> {
  try {
    const payload: ApiUpdateRowPayload = { data };
    const result = await axiosAuth.put(
      `${url.DATA_TABLES}/${tableId}/rows/${rowId}`,
      payload,
    );
    if (result?.status === 200) {
      return result.data;
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to update row",
    );
    return null;
  }
}

export async function deleteRowApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  rowId: string,
): Promise<boolean> {
  try {
    const result = await axiosAuth.delete(
      `${url.DATA_TABLES}/${tableId}/rows/${rowId}`,
    );
    if (result?.status === 200) {
      return true;
    }
    helperFun.errorMessageHandler(result);
    return false;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to delete row",
    );
    return false;
  }
}

export async function bulkDeleteRowsApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  rowIds: string[],
): Promise<boolean> {
  try {
    const result = await axiosAuth.post(
      `${url.DATA_TABLES}/${tableId}/rows/delete`,
      { row_ids: rowIds.map(Number) },
    );
    if (result?.status === 200) {
      return true;
    }
    helperFun.errorMessageHandler(result);
    return false;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to delete rows",
    );
    return false;
  }
}

export async function importDataApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  file: File,
  hasHeader: boolean = true,
  columnMap?: Record<string, string>,
): Promise<ImportResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("has_header", String(hasHeader));
    if (columnMap) {
      formData.append("column_map", JSON.stringify(columnMap));
    }
    const result = await axiosAuth.post(
      `${url.DATA_TABLES}/${tableId}/import`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    if (result?.status === 200 || result?.status === 202) {
      return {
        table_id: tableId,
        mode: result.data?.mode ?? "inline",
        inserted: result.data?.inserted ?? 0,
        failed: result.data?.failed ?? 0,
        errors: result.data?.errors ?? [],
        message: result.data?.message ?? null,
      };
    }
    return {
      table_id: tableId,
      mode: "inline",
      inserted: 0,
      failed: 0,
      errors: ["Import failed with an unexpected status."],
      message: null,
    };
  } catch (error: any) {
    const status = error.response?.status;
    const errorData = error.response?.data;

    if (status === 413) {
      return {
        table_id: tableId,
        mode: "inline",
        inserted: 0,
        failed: 0,
        errors: [
          "File is too large to upload. Please reduce the file size or contact your administrator to increase the upload limit.",
        ],
        message: null,
      };
    }

    if (errorData?.errors) {
      return {
        table_id: tableId,
        mode: errorData.mode ?? "inline",
        inserted: errorData.inserted ?? 0,
        failed: errorData.failed ?? 0,
        errors: errorData.errors ?? [],
        message: errorData.message ?? null,
      };
    }

    const detail = errorData?.detail;
    return {
      table_id: tableId,
      mode: "inline",
      inserted: 0,
      failed: 0,
      errors: [typeof detail === "string" ? detail : "Failed to import data"],
      message: null,
    };
  }
}

export async function exportDataApi(
  axiosAuth: AxiosInstance,
  tableId: string,
  params?: { row_ids?: string; filters?: string; search?: string },
): Promise<Blob | null> {
  try {
    const result = await axiosAuth.get(`${url.DATA_TABLES}/${tableId}/export`, {
      params,
      responseType: "blob",
    });
    if (result?.status === 200) {
      return result.data;
    }
    helperFun.errorMessageHandler(result);
    return null;
  } catch (error: any) {
    helperFun.errorMessageHandler(
      error.response?.data?.detail || "Failed to export data",
    );
    return null;
  }
}
