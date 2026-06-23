"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, truncate } from "@/lib/utils";
import { ComboBoxWithDescriptionProps } from "@/types/types";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

export const ComboBox = ({
  // Required Props
  items,
  value,
  onChange,
  //Optional Props
  placeholder = "Select an option",
  buttonClassName,
  disabled = false,
  displayAsBadge = false,
  popoverSideOffset = 4,
  commandGroupClassName,
  popoverContentClassName,
  searchPlaceholder,
  localSearch,
  align = "start",
  setLocalSearch,
}: ComboBoxWithDescriptionProps) => {
  const [open, setOpen] = React.useState(false);
  // Find the currently selected item from the list
  const selectedItem = items.find((item) => item.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              "justify-between cursor-pointer",
              !value && "font-normal text-muted-foreground",
              buttonClassName,
            )}
          >
            {selectedItem && displayAsBadge ? (
              <Badge variant="secondary">
                {truncate(selectedItem.label, 60)}
              </Badge>
            ) : (
              truncate(selectedItem?.label || "", 60) || placeholder
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      {/* Dropdown Menu */}
      <PopoverContent
        className={cn(
          "w-(--radix-popover-trigger-width) p-0",
          popoverContentClassName,
        )}
        sideOffset={popoverSideOffset}
        align={align}
      >
        <Command>
          {/* Search Field */}
          <CommandInput
            placeholder={searchPlaceholder || "Search..."}
            value={localSearch}
            onValueChange={(val: string) => {
              if (setLocalSearch) {
                setLocalSearch(val);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            {/* Option List */}

            <CommandGroup
              onWheel={(e) => e.stopPropagation()}
              className={cn(commandGroupClassName)}
            >
              {items.map((item, index) => {
                const commandItemContent = (
                  <>
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground whitespace-normal break-words">
                          {item.description}
                        </span>
                      )}{" "}
                    </div>
                    <div className="ml-auto h-6 w-6 flex items-center justify-center">
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value === item.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </div>
                  </>
                );

                return (
                  <CommandItem
                    key={`${item.value}-${index}`}
                    value={`${item.value} ${item.label}`}
                    onSelect={() => {
                      if (value === item.value) {
                        onChange("");
                      } else {
                        onChange(item.value);
                      }
                      setOpen(false);
                    }}
                    className="w-full cursor-pointer"
                  >
                    {commandItemContent}
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
