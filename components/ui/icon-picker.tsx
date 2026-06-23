import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { IconPickerProps } from "@/types/types";
import { useState } from "react";

export const IconPicker = ({
  label,
  icons,
  field,
  disabled = false,
  defaultIcon = "",
}: IconPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedIcon = field.value
    ? icons?.[field.value] || defaultIcon
    : defaultIcon;

  return (
    <FormItem className="flex flex-col space-y-2">
      <FormLabel className="text-foreground required">{label}</FormLabel>

      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          if (!disabled) setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={`Select ${label}`}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            className={cn(
              "flex items-center w-20 h-20 bg-background border border-border rounded-md",
              disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer",
            )}
          >
            {selectedIcon ? (
              <span
                className="w-20 h-20 p-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-[1.5]"
                dangerouslySetInnerHTML={{
                  __html: selectedIcon,
                }}
              />
            ) : (
              <span className="text-muted-foreground text-sm">Icon</span>
            )}
          </button>
        </PopoverTrigger>

        {icons && (
          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={4}
            className="w-max max-h-64 overflow-auto p-2 bg-background border-border shadow-lg"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div
              role="listbox"
              aria-label={`${label} options`}
              className="grid grid-cols-5 gap-2"
            >
              {Object.entries(icons).map(([key, svg]) => {
                const isSelected =
                  field.value === key ||
                  field.value === svg ||
                  (!field.value && defaultIcon === svg);

                return (
                  <div
                    key={key}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 cursor-pointer rounded-md border transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:bg-muted",
                    )}
                    onClick={() => {
                      field.onChange(key);
                      setIsOpen(false);
                    }}
                  >
                    <div
                      className="w-6 h-6 [&>svg]:stroke-[1.5]"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        )}
      </Popover>

      <FormMessage />
    </FormItem>
  );
};
