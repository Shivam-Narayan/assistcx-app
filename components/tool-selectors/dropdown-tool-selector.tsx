// ShadCN UI Components
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { PopoverContentTool } from "@/components/ui/popover-content-tool";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ToolsMultiSelectComboBoxProps } from "@/types/types";
import {
  Check,
  ChevronsUpDown,
  ListFilter,
  Loader2,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getIconsData,
  getIconSvg,
} from "../icon-manager/icon-render-component";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getToolIcon } from "@/helper/helper-function";

type TypeItem = {
  label: string;
  value: string;
  description?: string;
};

export const ToolSelectorDropdownStyle = ({
  maxRows = 3,
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
  disabled,
  hasMore,
  isFetchingMore,
  loadMoreTools,
  selectedFilter,
  setSelectedFilter,
  filterOptions,
  selectionMode,
  icons,
  // defaultIcon,
  isLoading,
}: ToolsMultiSelectComboBoxProps) => {
  const [open, setOpen] = React.useState(false);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const toolIcons = getIconsData("tool_icons");
  const defaultIcon = getIconSvg("tool-case", "tool_icons");

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(1);

  const isMulti = selectionMode === "multiple";

  const selectedItems = useMemo(() => {
    if (isMulti) return Array.isArray(value) ? value : [];
    return value ? [value] : [];
  }, [value, isMulti]);

  const handleSelect = (selectedItem: any) => {
    const isAlreadySelected = selectedItems.some(
      (v: any) => v.value === selectedItem.value,
    );

    if (isMulti) {
      const newSelected = isAlreadySelected
        ? selectedItems.filter((v: any) => v.value !== selectedItem.value)
        : [...selectedItems, selectedItem];

      onChange(newSelected);
    } else {
      if (isAlreadySelected) {
        onChange([]);
      } else {
        onChange(selectedItem);
      }
      setOpen(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!localSearch) return items;

    const search = localSearch.toLowerCase();

    return items.filter((item) => {
      return (
        item.label?.toLowerCase().includes(search) ||
        item.value?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    });
  }, [items, localSearch]);

  const formateFilterOptions = filterOptions.find(
    (option: any) => option.value === selectedFilter,
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const threshold = 40;

    if (
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - threshold
    ) {
      if (hasMore && !isFetchingMore) {
        loadMoreTools?.();
      }
    }
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

  const visibleItems = selectedItems.slice(0, visibleCount);
  const hiddenCount = selectedItems.length - visibleCount;

  const showClear = showClearButton && selectedItems?.length > 0;

  return (
    <>
      {/* this is hidden div for measurement container don’t removed this div */}
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

      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (isOpen) {
            setSelectedFilter?.("all");
          } else {
            setLocalSearch?.("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
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
                  {visibleItems.map((val: any, i: any) => (
                    <Badge
                      key={typeof val === "object" ? val.value : `${val}-${i}`}
                      className="relative flex items-center min-w-0 max-w-full p-0  group !text-black  rounded-full font-normal text-sm shadow-none cursor-pointer"
                      style={{
                        backgroundColor: "#e5e7eb",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="block min-w-0 max-w-[200px] truncate  group !text-black px-2 py-1 mr-1 rounded-xl border bg-slate-200 text-xs font-medium">
                        {typeof val === "object" &&
                        val !== null &&
                        "label" in val
                          ? val.label
                          : val}
                      </span>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(val);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
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
                          className="shrink-0 relative flex items-center justify-center !text-black hover:!bg-[inherit] hover:!text-[inherit] px-2 py-1 rounded-full font-normal text-xs shadow-none cursor-pointer"
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
                        {selectedItems
                          .slice(visibleCount)
                          .map((item: TypeItem, i) => (
                            <Badge
                              key={`${item.value}-${i}`}
                              className="relative p-0 flex items-center justify-center group !text-black  rounded-full font-normal text-sm shadow-none"
                              style={{
                                backgroundColor: "#e5e7eb",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className=" flex items-center justify-center group !text-black px-2 py-1 mr-1 rounded-xl border bg-slate-200 text-xs font-medium">
                                {item.label}
                              </span>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                                <X
                                  className="h-[1.1em] w-[1.1em] cursor-pointer
                                 text-muted-foreground opacity-0 group-hover:opacity-100
                                 hover:text-red-500 transition rounded-full bg-white/80 p-[2px] shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(item);
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
        <PopoverContentTool className="w-(--radix-popover-trigger-width) bg-popover p-0 max-h-80 overflow-hidden">
          <Command shouldFilter={false}>
            <div className="flex items-center gap-2 p-2">
              <Select
                value={selectedFilter}
                onValueChange={(value) => {
                  setSelectedFilter?.(value);
                }}
              >
                <SelectTrigger className="cursor-pointer h-9 w-[140px] rounded-lg border border bg-background shadow-xs hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground w-full overflow-hidden">
                    <ListFilter className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      <SelectValue />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                  <SelectItem value="all" className="cursor-pointer">
                    All Items
                  </SelectItem>
                  {filterOptions.map((item: TypeItem) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      className="cursor-pointer"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={localSearch}
                  onChange={(e) => setLocalSearch?.(e.target.value)}
                  placeholder={searchPlaceholder || "Search..."}
                  className="h-9 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm shadow-xs shadow-black/5 placeholder:text-muted-foreground hover:shadow-lg hover:border-border/90 transition-all focus:outline-none focus:ring-1 focus:ring-primaryfocus:ring-offset-1"
                />
              </div>
            </div>
            <CommandList
              className="max-h-64 overflow-y-auto"
              onScroll={handleScroll}
              ref={listScrollRef}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading tools...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>No item found.</CommandEmpty>
                  <CommandGroup>
                    {showClear && (
                      <CommandItem
                        onSelect={() => onChange([])}
                        className="text-red-600 font-medium w-full cursor-pointer"
                      >
                        {isMulti ? "Clear All" : "Clear"}
                      </CommandItem>
                    )}
                    {filteredItems.map((item, index) => {
                      const isSelected = selectedItems.some(
                        (v: any) => v.value === item.value,
                      );
                      return (
                        <CommandItem
                          key={`${item.value}-${index}`}
                          value={`${item.value} ${item.label}`}
                          onSelect={() => handleSelect(item)}
                          className="cursor-pointer"
                        >
                          <div className="flex w-full gap-2">
                            <div className="p-1 border bg-primary/10 text-primary border-primary/20 rounded-full w-fit h-fit [&_svg]:h-5 [&_svg]:w-5">
                              {getToolIcon(item, toolIcons, defaultIcon)}
                            </div>

                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium text-sm truncate">
                                {item.label}
                              </span>
                              {item.description && (
                                <span className="text-xs text-muted-foreground whitespace-normal break-words line-clamp-2">
                                  {item.description}
                                </span>
                              )}
                            </div>
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0 self-center",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContentTool>
      </Popover>
    </>
  );
};
