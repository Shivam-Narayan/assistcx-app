"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ColumnOptionItem, TableColumnDef } from "../types/table-types";
import {
  canAcceptCellDraft,
  normalizeCellValue,
  validateCellValue,
} from "../utils/cell-validation";
import { CellValidationHint } from "./cell-validation-hint";
import { DateCell } from "./date-cell";

function getValidationMessage(
  value: string | number | string[] | undefined,
  column: TableColumnDef,
) {
  const result = validateCellValue(value, column);
  return result.valid ? null : (result.message ?? "Invalid value");
}

interface EditableCellProps {
  value: string | number | string[] | undefined;
  column: TableColumnDef;
  onSave: (value: string | number | string[]) => void;
  readOnly?: boolean;
}

const DEFAULT_OPTION_COLOR =
  "bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/15";

function getSelectOptions(column: TableColumnDef) {
  return column.options?.filter((option) => option.value) ?? [];
}

function getOptionValue(option: ColumnOptionItem) {
  return option.value;
}

function getOptionColor(value: string, column: TableColumnDef) {
  return getSelectOptions(column).find((option) => option.value === value)
    ?.color;
}

function getSingleSelectValue(
  value: string | number | string[] | undefined,
  column: TableColumnDef,
) {
  const options = getSelectOptions(column);
  if (Array.isArray(value)) return value[0] ?? "";

  const rawValue = String(value ?? "").trim();
  if (!rawValue) return "";
  const exactValue = options.find((option) => option.value === rawValue);
  if (exactValue) return getOptionValue(exactValue);

  const caseMatchedValue = options.find(
    (option) => option.value.toLowerCase() === rawValue.toLowerCase(),
  );
  return caseMatchedValue ? getOptionValue(caseMatchedValue) : rawValue;
}

function getMultiSelectValues(
  value: string | number | string[] | undefined,
  column: TableColumnDef,
) {
  const options = getSelectOptions(column);
  const rawValues = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return rawValues.map((rawValue) => {
    const exactValue = options.find((option) => option.value === rawValue);
    if (exactValue) return getOptionValue(exactValue);

    const caseMatchedValue = options.find(
      (option) => option.value.toLowerCase() === rawValue.toLowerCase(),
    );
    return caseMatchedValue ? getOptionValue(caseMatchedValue) : rawValue;
  });
}

function SelectPill({
  value,
  muted = false,
  fullWidth = false,
  withChevron = false,
  color,
}: {
  value: string;
  muted?: boolean;
  fullWidth?: boolean;
  withChevron?: boolean;
  color?: string | null;
}) {
  return (
    <Badge
      variant="secondary"
      style={
        !muted && color
          ? {
              backgroundColor: color,
              borderColor: color,
              color: "#111827",
            }
          : undefined
      }
      className={cn(
        "max-w-full rounded-md border px-2 py-1 text-xs font-medium shadow-none",
        fullWidth && "w-full justify-start",
        muted
          ? "border-border bg-muted text-muted-foreground"
          : !color && DEFAULT_OPTION_COLOR,
      )}
    >
      <span className="min-w-0 flex-1 truncate text-left">{value}</span>
      {withChevron && (
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" />
      )}
    </Badge>
  );
}

function SelectPlaceholder({
  label = "Select...",
  fullWidth = false,
}: {
  label?: string;
  fullWidth?: boolean;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground shadow-none",
        fullWidth && "w-full justify-start",
      )}
    >
      {label}
    </Badge>
  );
}

function CustomSelectValueInput({
  placeholder = "Add custom value",
  onAdd,
}: {
  placeholder?: string;
  onAdd: (value: string) => void;
}) {
  const [customValue, setCustomValue] = useState("");

  const submit = () => {
    const trimmedValue = customValue.trim();
    if (!trimmedValue) return;
    onAdd(trimmedValue);
    setCustomValue("");
  };

  return (
    <div
      className="mt-1 flex gap-1 border-t pt-1.5"
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Input
        value={customValue}
        onChange={(event) => setCustomValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="h-8 text-xs"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={submit}
        className="h-8 shrink-0 px-2 text-xs"
      >
        Add
      </Button>
    </div>
  );
}

export default function EditableCell({
  value,
  column,
  onSave,
  readOnly = false,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(String(value ?? ""));
    }
    setError(null);
  }, [editing, value]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const next = normalizeCellValue(draft, column);
    const validation = validateCellValue(next, column);
    if (!validation.valid) {
      setError(validation.message ?? "Invalid value");
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setEditing(false);
    if (next !== value) onSave(next);
  };

  if (readOnly) {
    const displayValue = formatDisplayValue(value, column);

    if (column.type === "select") {
      const selectedValue = getSingleSelectValue(value, column);
      return selectedValue ? (
        <SelectPill
          value={selectedValue}
          color={getOptionColor(selectedValue, column)}
          fullWidth
        />
      ) : (
        <SelectPlaceholder fullWidth />
      );
    }

    if (column.type === "multi_select") {
      const selectedValues = getMultiSelectValues(value, column);
      return (
        <div className="flex min-w-0 items-center gap-1 overflow-hidden px-1">
          {selectedValues.length > 0 ? (
            <>
              {selectedValues.slice(0, 2).map((item) => (
                <SelectPill
                  key={item}
                  value={item}
                  color={getOptionColor(item, column)}
                  fullWidth={selectedValues.length === 1}
                />
              ))}
              {selectedValues.length > 2 && (
                <SelectPill value={`+${selectedValues.length - 2}`} muted />
              )}
            </>
          ) : (
            <SelectPlaceholder fullWidth />
          )}
        </div>
      );
    }

    const readOnlyInvalidMessage = getValidationMessage(value, column);
    if (readOnlyInvalidMessage) {
      return (
        <CellValidationHint message={readOnlyInvalidMessage} fullWidth>
          <div className="block min-h-7 w-full min-w-0 truncate px-1 leading-7 text-destructive">
            {displayValue}
          </div>
        </CellValidationHint>
      );
    }

    return (
      <ConditionalTooltip content={displayValue} fullWidth>
        <div className="block min-h-7 w-full min-w-0 truncate px-1 leading-7">
          {displayValue}
        </div>
      </ConditionalTooltip>
    );
  }

  if (column.type === "select") {
    const options = getSelectOptions(column);
    const selectedValue = getSingleSelectValue(value, column);
    const storedInvalidMessage = getValidationMessage(value, column);

    const selectControl = (
      <Select
        value={selectedValue}
        onValueChange={(v) => {
          const validation = validateCellValue(v, column);
          if (!validation.valid) {
            setError(validation.message ?? "Invalid value");
            return;
          }
          setError(null);
          onSave(v);
        }}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-full min-w-0 justify-start border-none bg-transparent px-1 shadow-none hover:bg-muted/70 focus:ring-0",
            (error || storedInvalidMessage) &&
              "ring-1 ring-inset ring-destructive/60",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center justify-start">
            {selectedValue ? (
              <SelectPill
                value={selectedValue}
                color={getOptionColor(selectedValue, column)}
                fullWidth
              />
            ) : (
              <SelectPlaceholder fullWidth />
            )}
          </div>
        </SelectTrigger>
        <SelectContent align="start" className="min-w-44">
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              No options configured
            </div>
          ) : (
            options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <SelectPill value={opt.value} color={opt.color} />
              </SelectItem>
            ))
          )}
          {column.allowCustomValues && (
            <CustomSelectValueInput
              onAdd={(customValue) => {
                const validation = validateCellValue(customValue, column);
                if (!validation.valid) {
                  setError(validation.message ?? "Invalid value");
                  return;
                }
                setError(null);
                onSave(customValue);
              }}
            />
          )}
        </SelectContent>
      </Select>
    );

    const tooltipMessage = error ?? storedInvalidMessage;
    if (tooltipMessage) {
      return (
        <CellValidationHint message={tooltipMessage} fullWidth>
          {selectControl}
        </CellValidationHint>
      );
    }

    return selectControl;
  }

  if (column.type === "multi_select") {
    return <MultiSelectCell value={value} column={column} onSave={onSave} />;
  }

  if (column.type === "checkbox") {
    const checked = value === 1 || value === "1" || value === "true";

    return (
      <button
        type="button"
        onClick={() => onSave(checked ? 0 : 1)}
        className="flex min-h-7 items-center px-1"
      >
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-sm border",
            checked && "border-primary bg-primary text-primary-foreground",
          )}
        >
          {checked ? "✓" : ""}
        </span>
      </button>
    );
  }

  if (column.type === "date" || column.type === "datetime") {
    return (
      <DateCell
        value={String(value ?? "")}
        column={column}
        type={column.type}
        onSave={onSave}
      />
    );
  }

  if (editing) {
    const input = (
      <Input
        ref={inputRef}
        type="text"
        inputMode={
          column.type === "number" || column.type === "currency"
            ? "decimal"
            : undefined
        }
        value={draft}
        onChange={(e) => {
          const next = e.target.value;
          if (
            column.type !== "text" &&
            !canAcceptCellDraft(next, column.type)
          ) {
            return;
          }
          setError(null);
          setDraft(next);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(String(value ?? ""));
            setError(null);
            setEditing(false);
          }
        }}
        className={cn(
          "h-7 px-1.5 py-0 text-sm",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
    );

    return error ? (
      <CellValidationHint message={error} fullWidth>
        {input}
      </CellValidationHint>
    ) : (
      input
    );
  }

  const displayValue = formatDisplayValue(value, column);
  const invalidMessage = getValidationMessage(value, column);

  const displayCell = (
    <div
      onClick={() => setEditing(true)}
      className={cn(
        "block min-h-7 w-full min-w-0 cursor-text truncate px-1 leading-7",
        invalidMessage && "text-destructive",
      )}
    >
      {displayValue}
    </div>
  );

  if (invalidMessage) {
    return (
      <CellValidationHint message={invalidMessage} fullWidth>
        {displayCell}
      </CellValidationHint>
    );
  }

  return (
    <ConditionalTooltip content={displayValue} fullWidth>
      {displayCell}
    </ConditionalTooltip>
  );
}

function MultiSelectCell({
  value,
  column,
  onSave,
}: {
  value: string | number | string[] | undefined;
  column: TableColumnDef;
  onSave: (value: string | number | string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const options = getSelectOptions(column);
  const selectedValues = getMultiSelectValues(value, column);
  const storedInvalidMessage = getValidationMessage(value, column);
  const triggerError = error ?? storedInvalidMessage;

  const updateSelection = (option: string) => {
    const exists = selectedValues.includes(option);
    const nextValues = exists
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option];
    const validation = validateCellValue(nextValues, column);

    if (!validation.valid) {
      setError(validation.message ?? "Invalid value");
      return;
    }

    setError(null);
    onSave(nextValues);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerError ? (
          <CellValidationHint message={triggerError} fullWidth>
            <MultiSelectTrigger
              selectedValues={selectedValues}
              column={column}
            />
          </CellValidationHint>
        ) : (
          <MultiSelectTrigger selectedValues={selectedValues} column={column} />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1.5" align="start">
        <div className="mb-1 flex items-center justify-between px-1 py-1">
          <span className="text-xs font-medium text-muted-foreground">
            {selectedValues.length} selected
          </span>
          {selectedValues.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onSave([])}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto">
          {options.length === 0 ? (
            <div className="rounded-md px-2 py-3 text-center text-xs text-muted-foreground">
              No options configured
            </div>
          ) : (
            options.map((option) => {
              const checked = selectedValues.includes(option.value);

              return (
                <div
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
                  onClick={() => updateSelection(option.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      updateSelection(option.value);
                    }
                  }}
                >
                  <Checkbox checked={checked} className="pointer-events-none" />
                  <div className="min-w-0 flex-1">
                    <SelectPill value={option.value} color={option.color} />
                  </div>
                  {checked && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
              );
            })
          )}
        </div>

        {column.allowCustomValues && (
          <CustomSelectValueInput
            placeholder="Add custom option"
            onAdd={(customValue) => {
              if (selectedValues.includes(customValue)) return;
              const nextValues = [...selectedValues, customValue];
              const validation = validateCellValue(nextValues, column);
              if (!validation.valid) {
                setError(validation.message ?? "Invalid value");
                return;
              }
              setError(null);
              onSave(nextValues);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function MultiSelectTrigger({
  selectedValues,
  column,
}: {
  selectedValues: string[];
  column: TableColumnDef;
}) {
  return (
    <button
      type="button"
      className="flex min-h-8 w-full min-w-0 items-center justify-between gap-1.5 rounded-sm px-1 text-left hover:bg-muted/70"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {selectedValues.length > 0 ? (
          <>
            {selectedValues.slice(0, 2).map((item) => (
              <SelectPill
                key={item}
                value={item}
                color={getOptionColor(item, column)}
                fullWidth={selectedValues.length === 1}
                withChevron={selectedValues.length === 1}
              />
            ))}
            {selectedValues.length > 2 && (
              <SelectPill value={`+${selectedValues.length - 2}`} muted />
            )}
          </>
        ) : (
          <SelectPlaceholder fullWidth />
        )}
      </div>
      {selectedValues.length !== 1 && (
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}

function formatDisplayValue(
  value: string | number | string[] | undefined,
  column: TableColumnDef,
) {
  if (value === undefined || value === "") return "";
  if (column.type !== "number" && column.type !== "currency") {
    return String(value);
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return String(value);

  const precision = column.precision ?? 2;
  const formatted = numericValue.toFixed(precision);
  return column.type === "currency"
    ? `${column.currencyCode ?? "$"}${formatted}`
    : formatted;
}
