"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type ReactNode, useState } from "react";
import {
  COLUMN_TYPE_OPTIONS,
  type ColumnOptionItem,
  type ColumnType,
  type ColumnTypeOption,
  type TableColumnDef,
} from "../types/table-types";
import { ConfigStep } from "./column-config-form";
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/currency-options";
import {
  validateColumnDefaultValue,
  validateColumnLabel,
  validateCurrencyCode,
  validateSelectOptionList,
} from "../utils/cell-validation";
import { CirclePlus } from "lucide-react";

interface AddColumnPopoverProps {
  onAdd: (name: string, type: ColumnType, colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">) => void;
  trigger?: ReactNode;
}

type Step = "type-list" | "config";

const TEXT_COLUMN_TYPES: ColumnType[] = ["text", "email", "url", "phone"];
const NUMERIC_COLUMN_TYPES: ColumnType[] = ["number", "currency"];
const SELECT_COLUMN_TYPES: ColumnType[] = ["select", "multi_select"];

export default function AddColumnPopover({
  onAdd,
  trigger,
}: AddColumnPopoverProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("type-list");
  const [selectedType, setSelectedType] = useState<ColumnTypeOption | null>(
    null,
  );

  const [fieldName, setFieldName] = useState("");
  const [required, setRequired] = useState(false);

  const [defaultValue, setDefaultValue] = useState("");
  const [precision, setPrecision] = useState("2");
  const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY_SYMBOL);

  const [selectOptions, setSelectOptions] = useState<ColumnOptionItem[]>([]);
  const [allowCustomValues, setAllowCustomValues] = useState(false);

  const reset = () => {
    setStep("type-list");
    setSelectedType(null);
    setFieldName("");
    setRequired(false);
    setDefaultValue("");
    setPrecision("2");
    setCurrencyCode(DEFAULT_CURRENCY_SYMBOL);
    setSelectOptions([]);
    setAllowCustomValues(false);
  };

  const handleSelectType = (typeOption: ColumnTypeOption) => {
    setSelectedType(typeOption);
    setStep("config");
  };

  const handleBack = () => reset();

  const handleSubmit = () => {
    const trimmedName = fieldName.trim();
    if (!selectedType || !validateColumnLabel(trimmedName).valid) {
      return;
    }

    const t = selectedType.value;
    const defaultConfig = {
      options: selectOptions,
      allowCustomValues,
      precision: NUMERIC_COLUMN_TYPES.includes(t)
        ? Number(precision)
        : undefined,
      currencyCode: t === "currency" ? currencyCode : undefined,
    };
    if (!validateColumnDefaultValue(t, defaultValue, defaultConfig).valid) {
      return;
    }
    if (
      SELECT_COLUMN_TYPES.includes(t) &&
      !validateSelectOptionList(selectOptions).valid
    ) {
      return;
    }
    if (t === "currency" && !validateCurrencyCode(currencyCode).valid) {
      return;
    }

    const colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description"> = {
      required,
    };
    const hasDefaultValue =
      t === "checkbox"
        ? defaultValue === "0" || defaultValue === "1"
        : defaultValue.trim().length > 0;
    if (required && !hasDefaultValue) return;

    if (TEXT_COLUMN_TYPES.includes(t)) {
      if (defaultValue) colData.defaultValue = defaultValue;
    }

    if (NUMERIC_COLUMN_TYPES.includes(t)) {
      colData.precision = Number(precision);
      if (t === "currency") colData.currencyCode = currencyCode;
      if (defaultValue) colData.defaultValue = defaultValue;
    }

    if (SELECT_COLUMN_TYPES.includes(t)) {
      colData.options = selectOptions;
      colData.allowCustomValues = allowCustomValues;
      if (defaultValue) colData.defaultValue = defaultValue;
    }

    if (t === "checkbox" || t === "date" || t === "datetime" || t === "json") {
      if (defaultValue) colData.defaultValue = defaultValue;
    }

    onAdd(trimmedName, selectedType.value, colData);
    reset();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <PopoverTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            Add Column
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-80 overflow-hidden p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {step === "type-list" && <TypeListStep onSelect={handleSelectType} />}
        {step === "config" && selectedType && (
          <ConfigStep
            typeOption={selectedType}
            setTypeOption={setSelectedType}
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
            options={selectOptions}
            setOptions={setSelectOptions}
            allowCustomValues={allowCustomValues}
            setAllowCustomValues={setAllowCustomValues}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function TypeListStep({
  onSelect,
}: {
  onSelect: (t: ColumnTypeOption) => void;
}) {
  return (
    <div className="p-1.5">
      <div className="flex flex-col">
        {COLUMN_TYPE_OPTIONS.map((opt) => {
          const Icon = opt.icon;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
