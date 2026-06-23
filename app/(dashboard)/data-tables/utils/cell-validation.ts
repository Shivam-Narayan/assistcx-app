import type {
  ColumnType,
  TableColumnDef,
} from "../types/table-types";
import { isKnownCurrencySymbol } from "@/lib/currency-options";

export type CellValue = string | number | string[] | undefined;

export interface CellValidationResult {
  valid: boolean;
  message?: string;
}

export const COLUMN_NAME_PATTERN = /^[a-zA-Z0-9 _-]*$/;
export const COLUMN_LABEL_MAX_LENGTH = 128;

/** Select option values (restricted punctuation). Text columns allow any characters. */
export const TEXT_PLAIN_VALUE_PATTERN = /^[a-zA-Z0-9 _.,'()-]*$/;
export const SELECT_OPTION_MAX_LENGTH = 128;

/** @deprecated Currency is chosen from {@link CURRENCY_OPTIONS}; kept for legacy values. */
export const CURRENCY_CODE_PATTERN = /^[\$€£¥₹A-Za-z]{1,4}$/;

export const COLUMN_NAME_INVALID_CHARS_MESSAGE =
  "Field name can only contain letters, numbers, spaces, hyphens, and underscores. No special characters.";

export const TEXT_PLAIN_VALUE_INVALID_MESSAGE =
  "Use letters, numbers, spaces, and basic punctuation only. No special characters.";

export const CURRENCY_CODE_INVALID_MESSAGE = "Select a currency symbol.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s\-()]{7,20}$/;

function isEmptyValue(value: CellValue) {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return String(value).trim() === "";
}

export function canAcceptColumnLabelDraft(value: string) {
  return (
    value.length <= COLUMN_LABEL_MAX_LENGTH && COLUMN_NAME_PATTERN.test(value)
  );
}

export function canAcceptSelectOptionDraft(value: string) {
  return (
    value.length <= SELECT_OPTION_MAX_LENGTH &&
    TEXT_PLAIN_VALUE_PATTERN.test(value)
  );
}

export function canAcceptCurrencyCodeDraft(value: string) {
  return isKnownCurrencySymbol(value);
}

export function canAcceptCellDraft(value: string, type: ColumnType) {
  if (type === "text") {
    return true;
  }

  if (type === "number" || type === "currency") {
    return /^-?\d*(\.\d*)?$/.test(value);
  }

  if (type === "email") {
    return /^[a-zA-Z0-9@._+-]*$/.test(value);
  }

  if (type === "url") {
    return /^[a-zA-Z0-9:/?#[\]@!$&'()*+,;=%._~-]*$/.test(value);
  }

  if (type === "phone") {
    return /^[\d+\-() ]*$/.test(value);
  }

  return true;
}

export function normalizeCellValue(value: string, column: TableColumnDef) {
  const trimmed = value.trim();

  if (trimmed === "") return "";

  if (column.type === "number" || column.type === "currency") {
    return trimmed;
  }

  if (column.type === "json") {
    return trimmed;
  }

  return value;
}

export function validateCellValue(
  value: CellValue,
  column: TableColumnDef,
): CellValidationResult {
  if (column.required && isEmptyValue(value)) {
    return { valid: false, message: "This field is required" };
  }

  if (isEmptyValue(value)) return { valid: true };

  if (column.type === "text") {
    return { valid: true };
  }

  const stringValue = String(value).trim();

  if (column.type === "email" && !EMAIL_PATTERN.test(stringValue)) {
    return { valid: false, message: "Enter a valid email address" };
  }

  if (column.type === "url") {
    if (
      !/^https?:\/\//i.test(stringValue) &&
      !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})/.test(
        stringValue,
      )
    ) {
      return {
        valid: false,
        message: "Enter a valid URL (e.g. https://example.com or example.com)",
      };
    }
    try {
      new URL(
        /^https?:\/\//i.test(stringValue)
          ? stringValue
          : `https://${stringValue}`,
      );
    } catch {
      return {
        valid: false,
        message: "Enter a valid URL (e.g. https://example.com or example.com)",
      };
    }
  }

  if (column.type === "phone" && !PHONE_PATTERN.test(stringValue)) {
    return { valid: false, message: "Enter a valid phone number" };
  }

  if (column.type === "number" || column.type === "currency") {
    const numericValue = Number(stringValue);
    if (Number.isNaN(numericValue)) {
      return { valid: false, message: "Enter a valid number" };
    }
  }

  if (
    column.type === "select" &&
    column.options?.length &&
    !column.allowCustomValues
  ) {
    if (!column.options.some((option) => option.value === stringValue)) {
      return { valid: false, message: "Select one of the configured options" };
    }
  }

  if (
    column.type === "multi_select" &&
    column.options?.length &&
    !column.allowCustomValues
  ) {
    const values = Array.isArray(value)
      ? value
      : stringValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    const hasInvalidOption = values.some(
      (item) => !column.options?.some((option) => option.value === item),
    );
    if (hasInvalidOption) {
      return { valid: false, message: "Use only configured options" };
    }
  }

  if (column.type === "json") {
    try {
      JSON.parse(stringValue);
    } catch {
      return { valid: false, message: "Enter valid JSON" };
    }
  }

  return { valid: true };
}

export function validateColumnLabel(label: string): CellValidationResult {
  if (!COLUMN_NAME_PATTERN.test(label)) {
    return {
      valid: false,
      message: COLUMN_NAME_INVALID_CHARS_MESSAGE,
    };
  }
  const trimmed = label.trim();
  if (!trimmed) {
    return { valid: false, message: "Field name is required" };
  }
  if (trimmed.length > COLUMN_LABEL_MAX_LENGTH) {
    return {
      valid: false,
      message: `String should have at most ${COLUMN_LABEL_MAX_LENGTH} characters`,
    };
  }
  return { valid: true };
}

export function validateSelectOptionValue(value: string): CellValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: "Option cannot be empty" };
  }
  if (trimmed.length > SELECT_OPTION_MAX_LENGTH) {
    return {
      valid: false,
      message: `String should have at most ${SELECT_OPTION_MAX_LENGTH} characters`,
    };
  }
  if (!TEXT_PLAIN_VALUE_PATTERN.test(trimmed)) {
    return { valid: false, message: TEXT_PLAIN_VALUE_INVALID_MESSAGE };
  }
  return { valid: true };
}

export function validateSelectOptionList(
  options: { value: string }[],
): CellValidationResult {
  for (const option of options) {
    const result = validateSelectOptionValue(option.value);
    if (!result.valid) return result;
  }
  return { valid: true };
}

export function validateCurrencyCode(code: string): CellValidationResult {
  if (!isKnownCurrencySymbol(code.trim())) {
    return { valid: false, message: CURRENCY_CODE_INVALID_MESSAGE };
  }
  return { valid: true };
}

export function validateColumnDefaultValue(
  type: ColumnType,
  defaultValue: string,
  opts: Pick<TableColumnDef, "options" | "allowCustomValues" | "precision" | "currencyCode">,
): CellValidationResult {
  if (defaultValue.trim() === "") {
    return { valid: true };
  }

  if (type === "text") {
    return { valid: true };
  }

  const column: TableColumnDef = {
    id: "_draft",
    name: "draft",
    type,
    required: false,
    options: opts.options,
    allowCustomValues: opts.allowCustomValues,
    precision: opts.precision,
    currencyCode: opts.currencyCode,
  };

  return validateCellValue(defaultValue, column);
}
