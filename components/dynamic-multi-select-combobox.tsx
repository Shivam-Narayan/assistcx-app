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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface DynamicMultiSelectProps {
  items: any[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  buttonClassName?: string;
  maxRows?: number;
  enableInfiniteScroll?: boolean;
  setPage?: Dispatch<SetStateAction<number>>;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  setIsFetchingMore?: (v: boolean) => void;
  addFilter?: any;
  filterType?: any;
  localSearch?: string;
  setLocalSearch?: any;
  loading?: boolean;
  disabled?: boolean;
  showClearButton?: boolean;
  allowCreate?: boolean;
}

export const DynamicMultiSelectCombobox = ({
  items,
  value,
  maxRows = 3,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder,
  buttonClassName,
  addFilter,
  filterType,
  localSearch,
  setLocalSearch,
  loading,
  setPage,
  hasMore,
  isFetchingMore,
  setIsFetchingMore,
  disabled,
  showClearButton = false,
  allowCreate = false,
}: DynamicMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const listScrollRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(1);

  // Fixed selectedItems logic
  const selectedItems = (() => {
    if (!value || value.length === 0) return [];

    const sourceItems = items;

    const itemsMap = new Map(
      sourceItems.map((item: any) => [item.value, item]),
    );

    const allSelectedItems = value
      .map((v) => {
        const foundItem = itemsMap.get(v);

        if (!foundItem) {
          return {
            value: v,
            label: v,
            color: undefined,
          };
        }
        return foundItem;
      })
      .filter(Boolean);
    return allSelectedItems;
  })();

  useEffect(() => setMounted(true), []);

  const handleSelect = (selectedValue: string) => {
    const newSelected = value.includes(selectedValue)
      ? value.filter((v) => v !== selectedValue)
      : [...value, selectedValue];

    onChange(newSelected);

    if (value.includes(selectedValue)) {
      addFilter?.(filterType, selectedValue, true);
    } else {
      addFilter?.(filterType, selectedValue);
    }
  };

  const handleRemove = (val: string) => {
    const newSelected = value.filter((v) => v !== val);
    onChange(newSelected);

    addFilter?.(filterType, val, true);
  };

  const calculateVisibleItems = () => {
    if (!containerRef.current || !measureRef.current) return;

    const badges = measureRef.current.querySelectorAll("[data-badge]");

    const rows = new Map<number, number>();
    let count = 0;

    badges.forEach((badge) => {
      const top = (badge as HTMLElement).offsetTop;

      if (!rows.has(top)) {
        rows.set(top, 1);
      }

      if (rows.size <= maxRows) {
        count++;
      }
    });

    setVisibleCount(Math.max(1, count));
  };

  useEffect(() => {
    calculateVisibleItems();

    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      calculateVisibleItems();
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [value, items, maxRows]);

  const searchValue = localSearch ?? internalSearch;
  const setSearchValue = setLocalSearch ?? setInternalSearch;

  const filteredItems = searchValue
    ? items.filter((item) =>
        item.label.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : items;

  const createValue = searchValue.trim();
  const canCreate =
    allowCreate &&
    createValue.length > 0 &&
    !items.some(
      (item) =>
        item.value.toLowerCase() === createValue.toLowerCase() ||
        item.label.toLowerCase() === createValue.toLowerCase(),
    ) &&
    !value.some(
      (selected) => selected.toLowerCase() === createValue.toLowerCase(),
    );

  const handleCreate = () => {
    if (!canCreate) return;
    onChange([...value, createValue]);
    setSearchValue("");
  };

  const visibleItems = selectedItems.slice(0, visibleCount);
  const hiddenCount = selectedItems.length - visibleCount;

  const showClear = showClearButton && selectedItems?.length > 0;

  return (
    <>
      {/* this is hidden badge for measurement container don’t removed this div */}
      <div
        ref={measureRef}
        style={{ width: containerRef.current?.offsetWidth }}
        className="absolute left-0 top-0 invisible pointer-events-none flex flex-wrap gap-2"
      >
        {selectedItems.map((item: any) => (
          <Badge
            key={item.value}
            data-badge
            className="px-3 py-1 rounded-full text-sm"
          >
            {item.label}
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "cursor-pointer h-auto min-h-10 px-3 gap-2 font-medium shadow-xs rounded-lg  border transition-all duration-200 flex items-start justify-between",
              buttonClassName,
            )}
          >
            <div
              ref={containerRef}
              className="flex flex-wrap items-start gap-2 flex-1 pr-2"
            >
              {selectedItems?.length ? (
                <>
                  {visibleItems.map((item: any) => (
                    <Badge
                      key={item.value}
                      className="relative  flex items-center justify-center group !text-black px-3 py-1 rounded-full font-normal text-sm shadow-none cursor-pointer"
                      style={{
                        backgroundColor: item.color || "#e5e7eb",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="truncate max-w-36">{item.label}</span>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.value);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        <X
                          className="h-[1.1em] w-[1.1em] cursor-pointer
      text-muted-foreground opacity-0 group-hover:opacity-100
      hover:text-red-500 transition rounded-full bg-white/80 p-[2px] shadow-sm"
                        />
                      </div>
                    </Badge>
                  ))}

                  {/* +N more badge */}
                  {hiddenCount > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge
                          className="shrink-0 relative flex items-center justify-center !text-black px-3 py-1 rounded-full font-normal text-sm shadow-none cursor-pointer"
                          style={{ backgroundColor: "#e5e7eb" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          +{hiddenCount} more
                        </Badge>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="start"
                        className="p-2 mr-2 flex flex-wrap gap-2 max-w-[300px] max-h-60 overflow-auto"
                      >
                        {selectedItems.slice(visibleCount).map((item: any) => (
                          <Badge
                            key={item.value}
                            className="relative flex items-center justify-center group !text-black px-3 py-1 rounded-full font-normal text-sm shadow-none"
                            style={
                              item.color
                                ? { backgroundColor: item.color }
                                : { backgroundColor: "#e5e7eb" }
                            }
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="truncate">{item.label}</span>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer">
                              <X
                                className="h-[1.1em] w-[1.1em] cursor-pointer
      text-muted-foreground opacity-0 group-hover:opacity-100
      hover:text-red-500 transition rounded-full bg-white/80 p-[2px] shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemove(item.value);
                                }}
                              />
                            </div>
                          </Badge>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 self-center" />
          </Button>
        </PopoverTrigger>

        {mounted && (
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
            <Command>
              <CommandInput
                value={searchValue}
                onValueChange={(val: string) => {
                  setSearchValue(val);
                }}
                placeholder={searchPlaceholder || "Search..."}
                className="h-9"
              />
              <CommandList
                className="max-h-60 overflow-y-auto"
                ref={listScrollRef}
                onScroll={() => {
                  if (!listScrollRef.current || !hasMore || isFetchingMore)
                    return;

                  const { scrollTop, scrollHeight, clientHeight } =
                    listScrollRef.current;

                  if (scrollTop + clientHeight >= scrollHeight - 20) {
                    setIsFetchingMore?.(true);
                    setPage?.((prev: number) => prev + 1);
                  }
                }}
              >
                {loading && filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredItems.length === 0 ? (
                  canCreate ? (
                    <CommandGroup>
                      <CommandItem
                        className="cursor-pointer"
                        value={createValue}
                        onSelect={handleCreate}
                      >
                        Create &quot;{createValue}&quot;
                      </CommandItem>
                    </CommandGroup>
                  ) : (
                    <CommandEmpty>No data found.</CommandEmpty>
                  )
                ) : (
                  <CommandGroup onWheel={(e) => e.stopPropagation()}>
                    {showClear && (
                      <CommandItem
                        onSelect={() => onChange([])}
                        className="text-red-600 font-medium w-full cursor-pointer"
                      >
                        Clear All
                      </CommandItem>
                    )}
                    {filteredItems.map((item) => {
                      const isSelected = value.includes(item.value);
                      return (
                        <CommandItem
                          className="cursor-pointer"
                          key={item.value}
                          value={item.label}
                          onSelect={() => handleSelect(item.value)}
                        >
                          <Badge
                            className="relative flex items-center justify-center text-black-600 px-3 py-1 rounded-full font-normal text-sm shadow-none"
                            style={
                              item.color
                                ? { backgroundColor: item.color }
                                : { backgroundColor: "#e5e7eb" }
                            }
                          >
                            {item.label}
                          </Badge>
                          <div className="ml-auto h-6 w-6 flex items-center justify-center">
                            <Check
                              className={cn(
                                "h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </div>
                        </CommandItem>
                      );
                    })}
                    {canCreate && (
                      <CommandItem
                        className="cursor-pointer"
                        value={createValue}
                        onSelect={handleCreate}
                      >
                        Create &quot;{createValue}&quot;
                      </CommandItem>
                    )}
                    {isFetchingMore && (
                      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                        Loading...
                      </div>
                    )}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </>
  );
};
