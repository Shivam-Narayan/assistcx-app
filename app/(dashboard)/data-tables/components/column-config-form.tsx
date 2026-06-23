"use client";

import { DatePicker } from "@/components/date-picker";
import { InfoIconWithMessage } from "@/components/InfoIconWithMessage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY_SYMBOL,
  normalizeCurrencySymbol,
} from "@/lib/currency-options";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  COLUMN_TYPE_OPTIONS,
  type ColumnOptionItem,
  type ColumnType,
  type ColumnTypeOption,
  type TableColumnDef,
} from "../types/table-types";
import {
  DateTimePicker,
  parseDateValue,
  SelectOptionsEditor,
} from "./select-options-editor";
import {
  canAcceptCellDraft,
  canAcceptColumnLabelDraft,
  COLUMN_LABEL_MAX_LENGTH,
  validateColumnDefaultValue,
  validateColumnLabel,
  validateCurrencyCode,
  validateSelectOptionList,
} from "../utils/cell-validation";

export { COLUMN_NAME_PATTERN } from "../utils/cell-validation";
const NUMERIC_COLUMN_TYPES: ColumnType[] = ["number", "currency"];
const SELECT_COLUMN_TYPES: ColumnType[] = ["select", "multi_select"];
const DECIMAL_PLACE_OPTIONS = [
  { value: "0", label: "0 places", example: "50" },
  { value: "1", label: "1 place", example: "50.1" },
  { value: "2", label: "2 places", example: "50.12" },
  { value: "3", label: "3 places", example: "50.123" },
  { value: "4", label: "4 places", example: "50.1234" },
];

function handleNumericConfigChange(
  value: string,
  setValue: (value: string) => void,
) {
  if (/^-?\d*(\.\d*)?$/.test(value)) setValue(value);
}

export function EditColumnForm({
  column,
  onUpdate,
  onBack,
}: {
  column: TableColumnDef | null;
  onUpdate: (
    columnId: string,
    name: string,
    type: ColumnType,
    colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
  ) => void;
  onBack: () => void;
}) {
  const [typeOption, setTypeOption] = useState<ColumnTypeOption>(
    COLUMN_TYPE_OPTIONS[0],
  );
  const [fieldName, setFieldName] = useState("");
  const [required, setRequired] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");
  const [precision, setPrecision] = useState("2");
  const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY_SYMBOL);
  const [options, setOptions] = useState<ColumnOptionItem[]>([]);
  const [allowCustomValues, setAllowCustomValues] = useState(false);

  useEffect(() => {
    if (!column) return;
    setTypeOption(
      COLUMN_TYPE_OPTIONS.find((option) => option.value === column.type) ??
        COLUMN_TYPE_OPTIONS[0],
    );
    setFieldName(column.name);
    setRequired(column.required);
    setDefaultValue(column.defaultValue ?? "");
    setPrecision(column.precision?.toString() ?? "2");
    setCurrencyCode(normalizeCurrencySymbol(column.currencyCode));
    setOptions(column.options ?? []);
    setAllowCustomValues(column.allowCustomValues ?? false);
  }, [column]);

  const handleSubmit = () => {
    if (!column) return;
    const trimmedName = fieldName.trim();
    if (!trimmedName || !validateColumnLabel(trimmedName).valid) return;

    const type = typeOption.value;
    const hasDefaultValue =
      type === "checkbox"
        ? defaultValue === "0" || defaultValue === "1"
        : defaultValue.trim().length > 0;
    if (required && !hasDefaultValue) return;

    const defaultConfig = {
      options: SELECT_COLUMN_TYPES.includes(type) ? options : undefined,
      allowCustomValues: SELECT_COLUMN_TYPES.includes(type)
        ? allowCustomValues
        : undefined,
      precision: NUMERIC_COLUMN_TYPES.includes(type)
        ? Number(precision)
        : undefined,
      currencyCode: type === "currency" ? currencyCode : undefined,
    };
    if (!validateColumnDefaultValue(type, defaultValue, defaultConfig).valid) {
      return;
    }
    if (
      SELECT_COLUMN_TYPES.includes(type) &&
      !validateSelectOptionList(options).valid
    ) {
      return;
    }
    if (type === "currency" && !validateCurrencyCode(currencyCode).valid) {
      return;
    }

    const colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description"> = {
      required,
      defaultValue: defaultValue || undefined,
      options: SELECT_COLUMN_TYPES.includes(type) ? options : undefined,
      allowCustomValues: SELECT_COLUMN_TYPES.includes(type)
        ? allowCustomValues
        : undefined,
      precision: NUMERIC_COLUMN_TYPES.includes(type)
        ? Number(precision)
        : undefined,
      currencyCode: type === "currency" ? currencyCode : undefined,
    };

    onUpdate(column.id, trimmedName, type, colData);
    setCurrencyCode(DEFAULT_CURRENCY_SYMBOL);
    onBack();
  };

  return (
    <ConfigStep
      typeOption={typeOption}
      setTypeOption={setTypeOption}
      fieldName={fieldName}
      setFieldName={setFieldName}
      required={required}
      setRequired={setRequired}
      defaultValue={defaultValue}
      setDefaultValue={setDefaultValue}
      precision={precision}
      setPrecision={setPrecision}
      currencyCode={currencyCode}
      setCurrencyCode={setCurrencyCode}
      options={options}
      setOptions={setOptions}
      allowCustomValues={allowCustomValues}
      setAllowCustomValues={setAllowCustomValues}
      onBack={onBack}
      onSubmit={handleSubmit}
      submitLabel="Update field"
    />
  );
}

interface ConfigStepProps {
  typeOption: ColumnTypeOption;
  setTypeOption: (typeOption: ColumnTypeOption) => void;
  fieldName: string;
  setFieldName: (v: string) => void;
  required: boolean;
  setRequired: (v: boolean) => void;
  defaultValue: string;
  setDefaultValue: (v: string) => void;
  precision: string;
  setPrecision: (v: string) => void;
  currencyCode: string;
  setCurrencyCode: (v: string) => void;
  options: ColumnOptionItem[];
  setOptions: (value: ColumnOptionItem[]) => void;
  allowCustomValues: boolean;
  setAllowCustomValues: (v: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  /** When true, default value inputs use the same rules as grid cells (add column). */
  validateDefaultValues?: boolean;
}

export function ConfigStep({
  typeOption,
  setTypeOption,
  fieldName,
  setFieldName,
  required,
  setRequired,
  defaultValue,
  setDefaultValue,
  precision,
  setPrecision,
  currencyCode,
  setCurrencyCode,
  options,
  setOptions,
  allowCustomValues,
  setAllowCustomValues,
  onBack,
  onSubmit,
  submitLabel = "Add field",
  validateDefaultValues = true,
}: ConfigStepProps) {
  const t = typeOption.value;
  const fieldNameValidation = validateColumnLabel(fieldName);
  const isFieldNameValid = fieldNameValidation.valid;
  const fieldNameError =
    fieldName.length > 0 && !isFieldNameValid
      ? fieldNameValidation.message
      : undefined;

  const defaultConfig = {
    options,
    allowCustomValues,
    precision: NUMERIC_COLUMN_TYPES.includes(t) ? Number(precision) : undefined,
    currencyCode: t === "currency" ? currencyCode : undefined,
  };
  const defaultValueValidation = validateDefaultValues
    ? validateColumnDefaultValue(t, defaultValue, defaultConfig)
    : { valid: true as const };
  const defaultValueError =
    validateDefaultValues &&
    defaultValue.length > 0 &&
    !defaultValueValidation.valid
      ? defaultValueValidation.message
      : undefined;

  const selectOptionsValidation = SELECT_COLUMN_TYPES.includes(t)
    ? validateSelectOptionList(options)
    : { valid: true as const };
  const selectOptionsError =
    SELECT_COLUMN_TYPES.includes(t) &&
    options.length > 0 &&
    !selectOptionsValidation.valid
      ? selectOptionsValidation.message
      : undefined;

  const currencyValidation =
    t === "currency"
      ? validateCurrencyCode(currencyCode)
      : { valid: true as const };

  const hasRequiredDefault =
    !required ||
    (t === "checkbox"
      ? defaultValue === "0" || defaultValue === "1"
      : defaultValue.trim().length > 0);

  return (
    <div className="flex max-h-[min(70vh,28rem)] flex-col overflow-hidden py-3">
      {/* Header with back */}
      <div className="shrink-0 px-4 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer hover:text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {typeOption.label}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 px-4 pb-4">
          {/* Field name */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Field name</Label>
              <InfoIconWithMessage content="Letters, numbers, spaces, hyphen, and underscore only. Max 128 characters. No special characters." />
            </div>
            <Input
              placeholder="Enter field name"
              value={fieldName}
              maxLength={COLUMN_LABEL_MAX_LENGTH}
              onChange={(e) => {
                const next = e.target.value;
                if (canAcceptColumnLabelDraft(next)) {
                  setFieldName(next);
                }
              }}
              autoFocus
              aria-invalid={!!fieldNameError}
            />
            {fieldNameError && (
              <p className="text-xs text-destructive">{fieldNameError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Column type</Label>
            <Select
              value={t}
              onValueChange={(value) => {
                const nextType = COLUMN_TYPE_OPTIONS.find(
                  (option) => option.value === value,
                );
                if (!nextType) return;
                if (nextType.value !== t) {
                  setDefaultValue("");
                  if (t === "currency" || nextType.value === "currency") {
                    setCurrencyCode(DEFAULT_CURRENCY_SYMBOL);
                  }
                }
                setTypeOption(nextType);
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMN_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">Required field</Label>
                <InfoIconWithMessage content="Users must provide a value for this column. When enabled, a default value is required." />
              </div>
              <Switch
                checked={required}
                onCheckedChange={(checked) => {
                  setRequired(checked);
                  if (checked && t === "checkbox" && defaultValue === "") {
                    setDefaultValue("0");
                  }
                }}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Text default — any characters */}
          {t === "text" && (
            <div className="space-y-1.5">
              <Label
                className={cn("text-sm font-medium", required && "required")}
              >
                Default value
              </Label>
              <Input
                placeholder="Enter default value"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                aria-invalid={!!defaultValueError}
              />
              {defaultValueError && (
                <p className="text-xs text-destructive">{defaultValueError}</p>
              )}
            </div>
          )}

          {/* Email / URL / phone defaults — type-specific rules */}
          {(["email", "url", "phone"] as const).includes(
            t as "email" | "url" | "phone",
          ) && (
            <div className="space-y-1.5">
              <Label
                className={cn("text-sm font-medium", required && "required")}
              >
                Default value
              </Label>
              <Input
                placeholder="Enter default value"
                value={defaultValue}
                onChange={(e) => {
                  const next = e.target.value;
                  if (canAcceptCellDraft(next, t)) {
                    setDefaultValue(next);
                  }
                }}
                aria-invalid={!!defaultValueError}
              />
              {defaultValueError && (
                <p className="text-xs text-destructive">{defaultValueError}</p>
              )}
            </div>
          )}

          {/* Number / Currency specific */}
          {NUMERIC_COLUMN_TYPES.includes(t) && (
            <>
              {t === "currency" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Currency</Label>
                  <Select value={currencyCode} onValueChange={setCurrencyCode}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue>
                        {CURRENCY_OPTIONS.find(
                          (option) => option.value === currencyCode,
                        )?.description ?? currencyCode}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span className="font-medium tabular-nums">
                              {option.value}
                            </span>
                            <span className="text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Decimal places</Label>
                <Select value={precision} onValueChange={setPrecision}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue>
                      {
                        DECIMAL_PLACE_OPTIONS.find(
                          (option) => option.value === precision,
                        )?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DECIMAL_PLACE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col items-start">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            Example: {option.example}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label
                  className={cn("text-sm font-medium", required && "required")}
                >
                  Default value
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter default value"
                  value={defaultValue}
                  onChange={(e) =>
                    handleNumericConfigChange(e.target.value, setDefaultValue)
                  }
                  aria-invalid={!!defaultValueError}
                />
                {defaultValueError && (
                  <p className="text-xs text-destructive">
                    {defaultValueError}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Select/Multi-select specific */}
          {SELECT_COLUMN_TYPES.includes(t) && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Options{" "}
                  {t === "select"
                    ? "(users select one)"
                    : "(users can select multiple)"}
                </Label>
                <SelectOptionsEditor
                  options={options}
                  onChange={(nextOptions) => {
                    setOptions(nextOptions);
                    if (
                      defaultValue &&
                      !nextOptions.some(
                        (option) => option.value === defaultValue,
                      ) &&
                      t === "select"
                    ) {
                      setDefaultValue("");
                    }
                  }}
                />
                {selectOptionsError && (
                  <p className="text-xs text-destructive">
                    {selectOptionsError}
                  </p>
                )}
              </div>
              {/* <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={allowCustomValues}
                onCheckedChange={(v) => setAllowCustomValues(!!v)}
                className="cursor-pointer"
              />
              Allow custom values
            </label> */}
              <div className="space-y-1.5">
                <Label
                  className={cn("text-sm font-medium", required && "required")}
                >
                  Default value
                </Label>
                <Select value={defaultValue} onValueChange={setDefaultValue}>
                  <SelectTrigger
                    className="h-9 w-full"
                    aria-invalid={!!defaultValueError}
                  >
                    <SelectValue placeholder="No default" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.length === 0 ? (
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        Add options first.
                      </div>
                    ) : (
                      options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full border"
                              style={{
                                backgroundColor: option.color || "transparent",
                              }}
                            />
                            {option.value}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {defaultValueError && (
                  <p className="text-xs text-destructive">
                    {defaultValueError}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Date / DateTime specific */}
          {(t === "date" || t === "datetime") && (
            <div className="space-y-1.5">
              <Label
                className={cn("text-sm font-medium", required && "required")}
              >
                Default value
              </Label>
              {t === "date" ? (
                <DatePicker
                  selectedDate={parseDateValue(defaultValue)}
                  onSelectDate={(date) =>
                    setDefaultValue(date ? format(date, "yyyy-MM-dd") : "")
                  }
                  triggerLabel="Pick a date"
                />
              ) : (
                <DateTimePicker
                  value={defaultValue}
                  onChange={setDefaultValue}
                />
              )}
            </div>
          )}

          {t === "checkbox" && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={defaultValue === "1"}
                onCheckedChange={(v) => setDefaultValue(v ? "1" : "0")}
                className="cursor-pointer"
              />
              <span className={cn(required && "required")}>
                Checked by default
              </span>
            </label>
          )}

          {t === "json" && (
            <div className="space-y-1.5">
              <Label
                className={cn("text-sm font-medium", required && "required")}
              >
                Default JSON
              </Label>
              <Input
                placeholder='e.g., {"key":"value"}'
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                aria-invalid={!!defaultValueError}
              />
              {defaultValueError && (
                <p className="text-xs text-destructive">{defaultValueError}</p>
              )}
            </div>
          )}
          {!hasRequiredDefault && (
            <p className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">
              Add a default value for required fields.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-t bg-background px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onBack();
          }}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={
            !isFieldNameValid ||
            !hasRequiredDefault ||
            !defaultValueValidation.valid ||
            !selectOptionsValidation.valid ||
            !currencyValidation.valid
          }
          className="cursor-pointer"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
