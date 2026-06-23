"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MultiSelectComboBoxProps } from "@/types/types";

export const MultiSelectComboBox = ({
  items,
  value,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder,
  buttonClassName,
  showClearButton = true,
  displayMode = "pills",
  localSearch,
  setLocalSearch,
}: MultiSelectComboBoxProps) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedValue: string) => {
    const newSelected = value.includes(selectedValue)
      ? value.filter((v: any) => v !== selectedValue)
      : [...value, selectedValue];
    onChange(newSelected);
  };

  const selectedItems = items.filter((item) => value.includes(item.value));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "cursor-pointer h-9 px-4 gap-2 font-medium shadow-xs rounded-md justify-between text-left overflow-hidden text-ellipsis whitespace-nowrap",
            buttonClassName,
          )}
        >
          <div className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
            {selectedItems?.length ? (
              selectedItems.map((val, i) => (
                <span
                  key={i}
                  className="inline-block px-2 py-1 mr-1 rounded-xl border bg-slate-200 text-xs font-medium"
                >
                  {items.find((items) => items.value === val.value)?.label}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0 mr-6">
        <Command>
          <CommandInput
            value={localSearch}
            onValueChange={(val: string) => {
              if (setLocalSearch) {
                setLocalSearch(val);
              }
            }}
            placeholder={searchPlaceholder || "Search..."}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {showClearButton && value.length > 0 && (
                <CommandItem
                  onSelect={() => onChange([])}
                  className="text-red-600 font-medium w-full cursor-pointer"
                >
                  Clear All
                </CommandItem>
              )}
              {items.map((item, index) => {
                const isSelected = value.includes(item.value);
                return (
                  <CommandItem
                    // key={item.value}
                    key={`${item.value}-${index}`}
                    value={`${item.value} ${item.label}`}
                    onSelect={() => handleSelect(item.value)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground whitespace-normal break-words">
                          {item.description}
                        </span>
                      )}
                    </div>

                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
