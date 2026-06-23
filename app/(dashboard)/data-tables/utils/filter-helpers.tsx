import type {
  ColumnType,
  DataTableFilterCondition,
  DataTableFilterOperator,
  TableColumnDef,
} from "../types/table-types";

export const EMPTY_VALUE_OPERATORS: DataTableFilterOperator[] = [
  "is_null",
  "not_null",
];

export const OPERATOR_LABELS: Record<DataTableFilterOperator, string> = {
  contains: "contains",
  eq: "is",
  neq: "is not",
  gt: "is greater than",
  gte: "is greater than or equal to",
  lt: "is less than",
  lte: "is less than or equal to",
  in: "is any of",
  is_null: "is empty",
  not_null: "is not empty",
};

const DEFAULT_OPERATORS: DataTableFilterOperator[] = [
  "contains",
  "eq",
  "neq",
  "is_null",
  "not_null",
];

const NUMBER_OPERATORS: DataTableFilterOperator[] = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "is_null",
  "not_null",
];

const OPTION_OPERATORS: DataTableFilterOperator[] = [
  "eq",
  "neq",
  "is_null",
  "not_null",
];

const MULTI_SELECT_OPERATORS: DataTableFilterOperator[] = [
  "eq",
  "neq",
  "is_null",
  "not_null",
];

const CHECKBOX_OPERATORS: DataTableFilterOperator[] = [
  "eq",
  "neq",
  "is_null",
  "not_null",
];

export function createFilterId() {
  return `filter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getDefaultOperator(type: ColumnType): DataTableFilterOperator {
  if (type === "number" || type === "currency") return "eq";
  if (type === "date" || type === "datetime") return "eq";
  if (type === "checkbox") return "eq";
  if (type === "select") return "eq";
  if (type === "multi_select") return "eq";
  return "contains";
}

export function getOperators(type: ColumnType) {
  if (type === "number" || type === "currency") return NUMBER_OPERATORS;
  if (type === "date" || type === "datetime") return NUMBER_OPERATORS;
  if (type === "multi_select") return MULTI_SELECT_OPERATORS;
  if (type === "select") return OPTION_OPERATORS;
  if (type === "checkbox") return CHECKBOX_OPERATORS;
  return DEFAULT_OPERATORS;
}

export function requiresValue(operator: DataTableFilterOperator) {
  return !EMPTY_VALUE_OPERATORS.includes(operator);
}

export function getOperatorNote(operator: DataTableFilterOperator) {
  if (operator === "is_null" || operator === "not_null") {
    return "Blank cells count as empty; no value is sent for this filter.";
  }
  if (operator === "neq") {
    return "Blank cells are not included by the backend for not-equal filters.";
  }
  if (operator === "contains") {
    return "% and _ are treated as LIKE wildcards by the backend.";
  }
  return null;
}

export function getColumnById(columns: TableColumnDef[], columnId: string) {
  return columns.find((column) => column.id === columnId) ?? columns[0];
}

export function getDefaultValue(
  column: TableColumnDef,
  operator: DataTableFilterOperator = getDefaultOperator(column.type),
) {
  if (operator === "in") return [];
  if (column.type === "checkbox") return "true";
  return "";
}

export function buildCondition(
  column: TableColumnDef,
): DataTableFilterCondition {
  return {
    id: createFilterId(),
    column_key: column.id,
    op: getDefaultOperator(column.type),
    value: getDefaultValue(column),
  };
}

function normalizeValueForCondition(
  condition: DataTableFilterCondition,
  column: TableColumnDef,
) {
  const value = condition.value;

  if (condition.op === "in") {
    const values = Array.isArray(value)
      ? value
      : String(value ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    if (column.type === "number" || column.type === "currency") {
      return values.map((item) => {
        const numericValue = Number(item);
        return Number.isNaN(numericValue) ? item : numericValue;
      });
    }
    return values;
  }

  if (column.type === "number" || column.type === "currency") {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? value : numericValue;
  }

  if (column.type === "checkbox") {
    return value === true || value === "true";
  }

  return value;
}

export function isValidCondition(
  condition: DataTableFilterCondition,
  columns: TableColumnDef[],
) {
  const column = getColumnById(columns, condition.column_key);
  if (!column) return false;
  if (!requiresValue(condition.op)) return true;
  if (condition.op === "in") return true;
  if (Array.isArray(condition.value)) return condition.value.length > 0;
  return String(condition.value ?? "").trim() !== "";
}

/** Serializes filter conditions into a JSON string for the API query param. */
export function serializeDataTableFilters(
  filters: DataTableFilterCondition[],
  columns: TableColumnDef[],
) {
  const payload = filters
    .filter((condition) => isValidCondition(condition, columns))
    .map((condition) => {
      const column = getColumnById(columns, condition.column_key);
      const base = { column_key: condition.column_key, op: condition.op };
      if (!requiresValue(condition.op) || !column) return base;
      return { ...base, value: normalizeValueForCondition(condition, column) };
    });

  return payload.length > 0 ? JSON.stringify(payload) : undefined;
}

/** Returns structured display parts for a single filter condition. */
export function getDataTableFilterParts(
  condition: DataTableFilterCondition,
  columns: TableColumnDef[],
) {
  const column = getColumnById(columns, condition.column_key);
  const columnName = column?.name ?? "Unknown field";
  const operator = OPERATOR_LABELS[condition.op] ?? condition.op;
  const value = Array.isArray(condition.value)
    ? condition.value.join(", ")
    : String(condition.value ?? "");

  return {
    column: columnName,
    operator,
    value: requiresValue(condition.op) ? value : null,
  };
}
