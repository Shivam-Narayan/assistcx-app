import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  BadgeDollarSign,
  Braces,
  Calendar,
  CalendarClock,
  CheckSquare,
  Hash,
  Link,
  List,
  ListChecks,
  Mail,
  Phone,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Column types & options
// ---------------------------------------------------------------------------

export type ColumnType =
  | "text"
  | "email"
  | "url"
  | "phone"
  | "select"
  | "multi_select"
  | "number"
  | "currency"
  | "checkbox"
  | "date"
  | "datetime"
  | "json";

export interface ColumnTypeOption {
  label: string;
  value: ColumnType;
  sqlType: string;
  icon: LucideIcon;
}

export const COLUMN_TYPE_OPTIONS: ColumnTypeOption[] = [
  { label: "Text", value: "text", sqlType: "TEXT", icon: AlignLeft },
  { label: "Email", value: "email", sqlType: "TEXT", icon: Mail },
  { label: "URL", value: "url", sqlType: "TEXT", icon: Link },
  { label: "Phone", value: "phone", sqlType: "TEXT", icon: Phone },
  { label: "Select", value: "select", sqlType: "TEXT", icon: List },
  {
    label: "Multi-select",
    value: "multi_select",
    sqlType: "TEXT",
    icon: ListChecks,
  },
  { label: "Number", value: "number", sqlType: "NUMERIC", icon: Hash },
  {
    label: "Currency",
    value: "currency",
    sqlType: "NUMERIC",
    icon: BadgeDollarSign,
  },
  {
    label: "Checkbox",
    value: "checkbox",
    sqlType: "INTEGER",
    icon: CheckSquare,
  },
  { label: "Date", value: "date", sqlType: "TEXT", icon: Calendar },
  {
    label: "Date time",
    value: "datetime",
    sqlType: "TEXT",
    icon: CalendarClock,
  },
  { label: "JSON", value: "json", sqlType: "TEXT", icon: Braces },
];

// ---------------------------------------------------------------------------
// Backend API types
// ---------------------------------------------------------------------------

export interface ColumnOptionItem {
  value: string;
  color?: string | null;
}

export type ColumnOptionInput = ColumnOptionItem | string;

export interface ApiColumnSchema {
  key: string;
  label: string;
  description?: string;
  data_type: ColumnType;
  required?: boolean;
  default?: string | number | null;
  options?: ColumnOptionInput[];
  allow_custom_values?: boolean;
  precision?: number;
  currency_code?: string | null;
}

export interface ApiTableConfig {
  column_order?: string[];
  hidden_columns?: string[];
  locked?: boolean;
}

export interface DataTableStatusEntry {
  status: string;
  timestamp?: string;
  filename?: string;
  inserted?: number;
  failed?: number;
  errors?: string[];
}

export interface ApiDataTable {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  availability?: string;
  column_schema: ApiColumnSchema[];
  row_count: number;
  table_config?: ApiTableConfig;
  status?: DataTableStatusEntry[];
  created_at: string;
  updated_at: string;
}

export interface ApiRowData {
  _row_id: number;
  [key: string]: string | number | string[] | null | undefined;
}

export interface ApiRowsResponse {
  rows: ApiRowData[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiAddColumnRequest {
  label: string;
  description?: string;
  data_type: ColumnType;
  required?: boolean;
  default?: string | number | null;
  options?: ColumnOptionItem[];
  allow_custom_values?: boolean;
  precision?: number;
  currency_code?: string | null;
}

export interface ApiUpdateColumnRequest {
  label?: string;
  description?: string;
  data_type?: ColumnType;
  required?: boolean;
  default?: string | number | null;
  options?: ColumnOptionItem[];
  allow_custom_values?: boolean;
  precision?: number;
  currency_code?: string | null;
}

export interface ApiInsertRowRequest {
  [columnKey: string]: string | number | string[] | null | undefined;
}

export interface ApiInsertRowsRequest {
  rows: ApiInsertRowRequest[];
}

export interface ApiUpdateRowRequest {
  [columnKey: string]: string | number | string[] | null | undefined;
}

export interface ApiUpdateRowPayload {
  data: ApiUpdateRowRequest;
}

// ---------------------------------------------------------------------------
// Frontend UI types (used by components)
// ---------------------------------------------------------------------------

export interface TableColumnDef {
  id: string;
  name: string;
  type: ColumnType;
  required: boolean;
  defaultValue?: string;
  options?: ColumnOptionItem[];
  allowCustomValues?: boolean;
  precision?: number;
  currencyCode?: string;
  description?: string;
  width?: number;
}

export interface TableRowData {
  id: string;
  [key: string]: string | number | string[] | undefined;
}

export interface DynamicTable {
  id: string;
  name: string;
  icon: string;
  description: string;
  availability?: string;
  columns: TableColumnDef[];
  rows: TableRowData[];
  rowCount: number;
  tableConfig?: ApiTableConfig;
  status?: DataTableStatusEntry[];
  createdAt: string;
  updatedAt: string;
}

export function isDataTableLocked(
  table?: Pick<DynamicTable, "tableConfig"> | null,
): boolean {
  return table?.tableConfig?.locked === true;
}

// ---------------------------------------------------------------------------
// Pagination & filter types
// ---------------------------------------------------------------------------

export const DATA_TABLE_LIST_PAGE_SIZE = 20;

export interface TableListQueryParams {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface RowsQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  filters?: string;
}

export type DataTableFilterOperator =
  | "contains"
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "is_null"
  | "not_null";

export interface DataTableFilterCondition {
  id: string;
  column_key: string;
  op: DataTableFilterOperator;
  value?: string | number | boolean | string[];
}

// ---------------------------------------------------------------------------
// Import result
// ---------------------------------------------------------------------------

export interface ImportResult {
  table_id: string;
  mode: string;
  inserted: number;
  failed: number;
  errors: string[];
  message: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PAGE_SIZE_OPTIONS = [50, 100, 200];
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_COLUMN_WIDTH = 180;
export const MIN_COLUMN_WIDTH = 100;
export const MAX_COLUMN_WIDTH = 500;

export const OPTION_COLORS = [
  "gray",
  "orange",
  "yellow",
  "green",
  "blue",
  "violet",
  "pink",
  "red",
] as const;

export type OptionColorName = (typeof OPTION_COLORS)[number];

export const OPTION_COLOR_HEX: Record<OptionColorName, string> = {
  gray: "#e5e7eb",
  orange: "#fed7aa",
  yellow: "#fef08a",
  green: "#bbf7d0",
  blue: "#bfdbfe",
  violet: "#ddd6fe",
  pink: "#fbcfe8",
  red: "#fecaca",
};
