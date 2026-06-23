import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ToolsMultiSelectComboBoxProps } from "@/types/types";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Bolt, Loader2, Search, Trash2, X } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { EmptyState } from "../empty-state/empty-state";
import {
  getIconsData,
  getIconSvg,
} from "../icon-manager/icon-render-component";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { getToolIcon } from "@/helper/helper-function";

export const ToolSelectorModalStyle = ({
  setOpen,
  open,
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
  filterOptions,
  selectedFilter,
  setSelectedFilter,
  selectionMode,
  dialogHeaderText,
  icons,
  // defaultIcon,
  isLoading,
}: ToolsMultiSelectComboBoxProps) => {
  const isMulti = selectionMode === "multiple";

  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [categorySearch, setCategorySearch] = React.useState("");
  const [tempSelectedItems, setTempSelectedItems] = React.useState<any[]>([]);
  const toolIcons = getIconsData("tool_icons");
  const defaultIcon = getIconSvg("tool-case", "tool_icons");

  const selectedItems = useMemo(() => {
    if (isMulti) return Array.isArray(value) ? value : [];
    return value ? [value] : [];
  }, [value, isMulti]);

  const handleSelect = (selectedItem: any) => {
    const isAlreadySelected = tempSelectedItems.some(
      (v: any) => v.value === selectedItem.value,
    );

    if (isMulti) {
      const newSelected = isAlreadySelected
        ? tempSelectedItems.filter((v: any) => v.value !== selectedItem.value)
        : [...tempSelectedItems, selectedItem];

      setTempSelectedItems(newSelected);
    } else {
      setTempSelectedItems(isAlreadySelected ? [] : [selectedItem]);
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

  useEffect(() => {
    setSelectedCategory("all");
    setSelectedFilter?.("all");
    setCategorySearch("");
    setLocalSearch?.("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      setTempSelectedItems(selectedItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  const filteredCategories = categorySearch
    ? filterOptions.filter((category: any) =>
        category.label?.toLowerCase().includes(categorySearch.toLowerCase()),
      )
    : filterOptions;
  const showClearAll =
    showClearButton && isMulti && tempSelectedItems?.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 gap-0 overflow-hidden h-[520px] flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader className="px-4 py-4 border-b shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full shrink-0 border bg-primary/10 text-primary border-primary/20",
                )}
              >
                <Bolt className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <DialogTitle className="text-lg font-medium leading-none text-foreground/90">
                  <div className="flex items-center gap-2">
                    {dialogHeaderText || "Select Tools"}
                  </div>
                </DialogTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative h-9 w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={localSearch}
                  onChange={(e) => {
                    if (setLocalSearch) {
                      setLocalSearch(e.target.value);
                    }
                  }}
                  placeholder={searchPlaceholder || "Search tools..."}
                  className="h-full w-full pl-9 pr-10 rounded-md border bg-muted/40 focus:bg-background transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />

                {localSearch && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLocalSearch?.("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <Cross2Icon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div
                className="p-2 flex items-center justify-center rounded rounded-md cursor-pointer hover:bg-secondary"
                onClick={() => setOpen?.(false)}
              >
                <X className="h-5 w-5" />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-55 border-r bg-muted/20 flex flex-col overflow-hidden">
            {/* search categories is commented out for now */}
            {/* <div className="px-3 py-2 border-b shrink-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search Categories"
                  className="h-8 w-full pl-7 pr-2 rounded-md border bg-muted/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                {categorySearch && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCategorySearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <Cross2Icon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div> */}
            <ScrollArea className="flex-1 h-0">
              <div className="py-2">
                {(!categorySearch ||
                  "all".includes(categorySearch.toLowerCase())) && (
                  <button
                    className={cn(
                      "cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left",
                      selectedCategory === "all"
                        ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent",
                    )}
                    onClick={() => {
                      setSelectedFilter?.("all");
                      setSelectedCategory("all");
                    }}
                  >
                    <span>All</span>
                  </button>
                )}
                {filteredCategories.map((category: any) => {
                  const isActive = selectedCategory === category.value;
                  return (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedFilter?.(category.value);
                        setSelectedCategory(category.value);
                      }}
                      className={cn(
                        "cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left",
                        isActive
                          ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent",
                      )}
                    >
                      <span className="truncate">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Search and Tools */}
          <div className="flex-1 flex flex-col min-w-0">
            <Command shouldFilter={false} className="flex-1 flex flex-col">
              <CommandList
                className="flex-1 max-h-none overflow-y-auto px-4 py-3"
                onScroll={handleScroll}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm">Loading tools...</span>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      <EmptyState
                        variant="card"
                        compact
                        icon={<Bolt />}
                        title="No tools found"
                        description="We couldn't find any tools matching your search."
                      />
                    </CommandEmpty>
                    <CommandGroup className="p-0">
                      <div className="grid grid-cols-2 gap-3">
                        {filteredItems.map((item, index) => {
                          const isSelected = tempSelectedItems.some(
                            (v: any) => v.value === item.value,
                          );
                          return (
                            <CommandItem
                              key={item.value}
                              value={`${item.value} ${item.label}`}
                              onSelect={() => handleSelect(item)}
                              className={cn(
                                "rounded-lg p-3 cursor-pointer transition-all flex flex-col items-start h-auto bg-transparent aria-selected:bg-transparent hover:!bg-muted/50",
                                isSelected
                                  ? "bg-primary/5 border border-primary hover:!bg-primary/10"
                                  : "border border-muted-foreground/20",
                              )}
                            >
                              <div className="flex w-full gap-2">
                                <div className="p-1 border bg-primary/10 text-primary border-primary/20 rounded-full w-fit h-fit shrink-0">
                                  {getToolIcon(item, toolIcons, defaultIcon)}
                                </div>

                                <div className="flex flex-col">
                                  <span className="font-medium text-sm leading-tight">
                                    {item.label}
                                  </span>

                                  {item.description && (
                                    <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                      {item.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </div>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </div>
        </div>

        <DialogFooter className="px-4 py-3 border-t shrink-0 !flex !flex-row !items-center !justify-between">
          <div className="flex items-center gap-3">
            {tempSelectedItems.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span
                    className="bg-slate-200 dark:bg-slate-600 px-2 py-2 rounded text-xs font-semibold cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tempSelectedItems.length} Selected
                  </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="p-2 flex flex-wrap gap-2 w-auto min-w-[100px] max-w-[300px] max-h-60 overflow-y-auto overflow-x-hidden"
                >
                  {tempSelectedItems.map((item: any) => (
                    <span
                      key={item.value}
                      className="relative px-2 py-1 mr-1 rounded border bg-slate-200 text-xs font-medium"
                    >
                      <span className="truncate">
                        {item.label || item.name}
                      </span>
                    </span>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {showClearAll && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTempSelectedItems([])}
                className="cursor-pointer flex items-center text-sm text-destructive hover:text-destructive/80 font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (isMulti) {
                  onChange(tempSelectedItems);
                } else {
                  onChange(tempSelectedItems[0] || null);
                }

                setOpen?.(false);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
