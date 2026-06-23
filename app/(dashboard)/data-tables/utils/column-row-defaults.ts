import type { ColumnType } from "../types/table-types";

type ColumnDefaultSource = {
  type: ColumnType;
  defaultValue?: string;
};

export function resolveCheckboxRowValue(defaultValue?: string): 0 | 1 {
  return defaultValue === "1" ? 1 : 0;
}

function resolveMultiSelectDefault(defaultValue?: string): string[] {
  if (!defaultValue?.trim()) return [];
  const trimmed = defaultValue.trim();

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v)).filter(Boolean);
      }
    } catch {
      // fall through
    }
  }

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [trimmed];
}

export function getNewRowCellValue(
  col: ColumnDefaultSource,
): string | number | string[] {
  if (col.type === "multi_select") {
    return resolveMultiSelectDefault(col.defaultValue);
  }
  if (col.type === "checkbox") {
    return resolveCheckboxRowValue(col.defaultValue);
  }
  return col.defaultValue ?? "";
}

export function getNewRowInsertPayloadValue(
  col: ColumnDefaultSource,
): string | number | string[] | undefined {
  if (col.type === "multi_select") {
    const values = resolveMultiSelectDefault(col.defaultValue);
    return values.length > 0 ? values : undefined;
  }
  if (col.type === "checkbox") {
    return resolveCheckboxRowValue(col.defaultValue);
  }
  if (col.defaultValue == null || col.defaultValue === "") {
    return undefined;
  }
  return col.defaultValue;
}
