"use client";

import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { Columns3, Rows3, Search, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getIconsData,
  getIconSvg,
  type IconCategory,
} from "@/components/icon-manager/icon-render-component";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state/empty-state";
import { Loader } from "lucide-react";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import {
  formatNumberUS,
  getStatusColor,
  getTimeAgo,
} from "@/helper/helper-function";
import { Badge } from "@/components/ui/badge";

interface ContextItemSelectModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any[];
  isLoading?: boolean;
  selectedItems: any[];
  onAdd: (items: any[]) => void;
  addButtonText?: string;
  dialogTitle?: string;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  iconSet?: IconCategory;
  defaultIconKey?: string;
  idKey?: string;
  context?: string;
}

export default function ContextItemSelectModal({
  open,
  setOpen,
  data,
  isLoading = false,
  selectedItems,
  onAdd,
  dialogTitle = "Select Items",
  addButtonText = "Apply",
  searchPlaceholder = "Search...",
  emptyTitle = "No items found",
  emptyDescription = "No items match your search.",
  iconSet,
  defaultIconKey,
  idKey = "id",
  context = "",
}: ContextItemSelectModalProps) {
  const [tempSelected, setTempSelected] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const iconsData = iconSet ? getIconsData(iconSet) : null;
  const defaultIcon =
    iconSet && defaultIconKey ? getIconSvg(defaultIconKey, iconSet) : null;

  const filteredData = searchText.trim()
    ? data.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchText.toLowerCase()),
      )
    : data;

  const handleSelect = (item: any) => {
    const itemId = item[idKey];
    const isAlreadySelected = tempSelected.some((i) => i[idKey] === itemId);

    if (isAlreadySelected) {
      setTempSelected(tempSelected.filter((i) => i[idKey] !== itemId));
    } else {
      setTempSelected([...tempSelected, item]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSearchText("");
  };

  const handleAdd = () => {
    onAdd(tempSelected);
    handleClose();
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempSelected([]);
  };

  useEffect(() => {
    if (open) {
      setTempSelected(selectedItems);
    }
  }, [open]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [searchText]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) handleClose();
        else setOpen(true);
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden [&_[data-dialog-close]]:rounded-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b bg-white z-10">
            <DialogTitle className="text-lg font-semibold">
              {dialogTitle}
            </DialogTitle>

            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10 pr-10 bg-white border border-input shadow-xs transition-colors ring-offset-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                />
                {searchText.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchText("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <Cross2Icon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div
                className="p-2 flex items-center justify-center rounded-md cursor-pointer hover:bg-secondary"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className="flex flex-col h-full overflow-y-auto min-h-[60vh] max-h-[60vh]"
            ref={scrollContainerRef}
          >
            <div className="px-4 pt-4">
              <AnimatePresence>
                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center py-10">
                    <Loader className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : filteredData.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {filteredData.map((item: any) => {
                      const itemId = item[idKey];
                      const isChecked = tempSelected.some(
                        (i) => i[idKey] === itemId,
                      );

                      return (
                        <motion.div
                          key={itemId}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card
                            onClick={() => handleSelect(item)}
                            className={cn(
                              "p-4 shadow-xs cursor-pointer transition-colors hover:bg-slate-100",
                              isChecked && "border-primary/30 bg-primary/10",
                            )}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <div className="flex items-start gap-3 w-full">
                                {iconsData && (
                                  <div className="p-2.5 bg-primary/10 text-primary rounded-full w-auto">
                                    <div
                                      className="h-full flex text-primary"
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          iconsData[item.icon] ||
                                          defaultIcon ||
                                          "",
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="w-full flex flex-col gap-1 min-w-0">
                                  <div className="flex flex-row justify-between items-start gap-2 min-w-0">
                                    <div className="flex flex-col min-w-0 flex-1 pr-8">
                                      <div className="flex flex-row w-full gap-x-2 items-center">
                                        <ConditionalTooltip
                                          content={item.name || item.label}
                                        >
                                          <p className="text-sm  font-medium text-foreground/90 line-clamp-1">
                                            {item.name || item.label}
                                          </p>
                                        </ConditionalTooltip>
                                        {item.availability ? (
                                          <span className="text-xs font-normal shrink-0">
                                            <Badge
                                              variant="outline"
                                              className={`shrink-0 ${getStatusColor(item?.availability)}`}
                                            >
                                              {item?.availability}
                                            </Badge>
                                          </span>
                                        ) : null}
                                      </div>
                                      {item?.updated_at ? (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Updated {getTimeAgo(item?.updated_at)}
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                  {item?.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 break-all">
                                      {item?.description || "No description"}
                                    </p>
                                  )}
                                  {context === "data_tables" && (
                                    <div className="flex items-center gap-6 text-sm mt-2">
                                      <div className="flex items-center gap-1">
                                        <Columns3 className="h-4 w-4 text-muted-foreground " />
                                        <span>
                                          {" "}
                                          {formatNumberUS(
                                            item?.columns?.length,
                                          )}{" "}
                                          {item?.columns?.length === 1
                                            ? "column"
                                            : "columns"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Rows3 className="h-4 w-4 text-muted-foreground " />
                                        <span>
                                          {" "}
                                          {formatNumberUS(item?.rowCount)}{" "}
                                          {item?.rowCount === 1
                                            ? "row"
                                            : "rows"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleSelect(item)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                              />
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    variant="card"
                    compact
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {filteredData.length !== 0 && (
          <DialogFooter className="px-4 py-3 border-t shrink-0 !flex !flex-row !items-center !justify-between">
            <div className="flex items-center gap-3">
              {tempSelected.length > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span
                        className="bg-slate-200 dark:bg-slate-600 px-2 py-2 rounded text-xs font-semibold cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tempSelected.length} Selected
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="p-2 flex flex-wrap gap-2 w-auto min-w-[100px] max-w-[300px] max-h-60 overflow-y-auto overflow-x-hidden"
                    >
                      {tempSelected.map((item: any) => (
                        <span
                          key={item[idKey]}
                          className="relative px-2 py-1 mr-1 rounded border bg-slate-200 text-xs font-medium"
                        >
                          <span className="truncate">
                            {item.name || item.label}
                          </span>
                        </span>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="cursor-pointer flex items-center text-sm text-destructive hover:text-destructive/80 font-medium transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                onClick={handleAdd}
                className="cursor-pointer"
              >
                {addButtonText}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
