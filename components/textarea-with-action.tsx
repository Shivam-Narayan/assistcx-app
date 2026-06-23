import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { CheckIcon, X } from "lucide-react";
import React from "react";
import { Control, FieldValues, Path } from "react-hook-form";

type BaseProps = {
  placeholder?: string;
  maxLength?: number;
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
  tipText?: string;
  actionLabel?: string;
};

type FormModeProps<T extends FieldValues> = BaseProps & {
  mode: "form";
  control: Control<T>;
  name: Path<T>;
};

type NormalModeProps = BaseProps & {
  mode: "normal";
  value: string;
  onChange: (val: string) => void;
};

type TextareaWithActionsProps<T extends FieldValues> =
  | FormModeProps<T>
  | NormalModeProps;

const FooterSection = ({
  currentLength,
  maxLength,
  onCancel,
  onSave,
  disabled,
  actionLabel,
}: {
  currentLength: number;
  maxLength: number;
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
  actionLabel?: string;
}) => {
  const isOverLimit = currentLength > maxLength;
  const isEmpty = currentLength === 0;
  return (
    <InputGroupAddon
      align="block-end"
      className="flex items-center justify-between bg-muted py-2.5"
    >
      <span className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
        <Kbd className="bg-background border">⌘ Enter</Kbd>
        to {actionLabel}
        <span className="text-base leading-none">·</span>
        <Kbd className="bg-background border">Esc</Kbd>
        to cancel
        <span className="text-base leading-none">·</span>
        <span
          className={`tabular-nums ${
            isOverLimit ? "text-red-500 font-medium" : ""
          }`}
        >
          {currentLength}/{maxLength}
        </span>
      </span>

      <div className="flex items-center gap-2">
        <InputGroupButton
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onCancel}
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </InputGroupButton>

        <InputGroupButton
          variant="default"
          size="sm"
          className="cursor-pointer"
          onClick={onSave}
          disabled={disabled || isOverLimit || isEmpty}
        >
          <CheckIcon className="w-3.5 h-3.5" />
          {actionLabel}
        </InputGroupButton>
      </div>
    </InputGroupAddon>
  );
};

const TextareaWithActions = <T extends FieldValues>(
  props: TextareaWithActionsProps<T>,
) => {
  const {
    placeholder = "Enter text...",
    onCancel,
    onSave,
    disabled = false,
    maxLength = 1000,
    actionLabel = "Save",
  } = props;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const currentLength =
      props.mode === "form"
        ? (props.control._formValues?.[props.name] as string)?.length || 0
        : props.value.length;

    const isOverLimit = currentLength > maxLength;

    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (isOverLimit) return;

      onSave();
    }
  };

  if (props.mode === "form") {
    return (
      <FormField
        control={props.control}
        name={props.name}
        render={({ field }) => (
          <FormItem>
            <InputGroup className="rounded-xl overflow-hidden bg-background has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20 has-[[data-slot=input-group-control]:focus-visible]:border-ring/40">
              <FormControl>
                <InputGroupTextarea
                  placeholder={placeholder}
                  {...field}
                  className="max-h-[260px] overflow-y-auto"
                  onKeyDown={handleKeyDown}
                />
              </FormControl>

              <FooterSection
                currentLength={field.value?.length || 0}
                maxLength={maxLength}
                onCancel={onCancel}
                onSave={onSave}
                disabled={disabled}
              />
            </InputGroup>
          </FormItem>
        )}
      />
    );
  }

  return (
    <InputGroup className="rounded-xl overflow-hidden bg-background has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20 has-[[data-slot=input-group-control]:focus-visible]:border-ring/40">
      <InputGroupTextarea
        placeholder={placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="max-h-[260px] overflow-y-auto"
        onKeyDown={handleKeyDown}
      />

      <FooterSection
        currentLength={props.value.length}
        maxLength={maxLength}
        onCancel={onCancel}
        onSave={onSave}
        disabled={disabled}
        actionLabel={actionLabel}
      />
    </InputGroup>
  );
};

export default TextareaWithActions;
