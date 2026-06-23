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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  errorMessageHandler,
  getRandomTagColor,
} from "@/helper/helper-function";
import { CREATE_TAG, DELETE_TAG, UPDATE_TAG } from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import CustomDeleteDialog from "./custom-delete-dialog";
const ColorPicker = lazy(() => import("./ui/color-picker-component"));

interface ComboBoxProps {
  dataList: any[];
  selectedIds: string[];
  setDataList: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder?: string;
  popoverContentClassName?: any;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  autoOpen?: boolean;
  localSearch?: any;
  setLocalSearch?: any;
  setSelectedTags?: any;
  setPage?: any;
  page?: any;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  setIsFetchingMore?: any;
}

export default function TagSelectorComponent({
  dataList,
  selectedIds,
  setDataList,
  setSelectedIds,
  placeholder = "Select tags",
  searchPlaceholder = "Search...",
  isLoading,
  autoOpen = false,
  localSearch,
  setLocalSearch,
  setSelectedTags,
  setPage,
  page,
  hasMore,
  isFetchingMore,
  setIsFetchingMore,
}: ComboBoxProps) {
  const { axiosAuth } = useAxiosAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const hideButton = true;

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<any>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isTagActionLoading, setIsTagActionLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tagError, setTagError] = useState("");

  // Auto-open effect
  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);

  useEffect(() => {
    if (open) {
      setPage?.(1);
    }
  }, [open, setPage]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleClear = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const handleCreate = async (label: string) => {
    if (isTagActionLoading) return;
    const trimmedLabel = label.trim();

    // min 1 & max 60 characters
    if (trimmedLabel.length < 1 || trimmedLabel.length > 60) {
      console.error("Tag name must be between 1 and 60 characters");
      return;
    }

    const payload = {
      name: trimmedLabel,
      color: getRandomTagColor(),
      description: "",
      tag_metadata: {},
    };

    setIsTagActionLoading(true);
    try {
      const response = await axiosAuth.post(CREATE_TAG, payload);
      if (response.status === 200 || response.status === 201) {
        const createdItem = response.data;
        onTagUpdate("create", createdItem);

        // Add to selected items
        setSelectedIds((prev) => [...prev, createdItem.id]);

        if (typeof setSelectedTags === "function") {
          setSelectedTags((prev: any[]) => [...prev, createdItem]);
        }
      }
    } catch (err: any) {
      let errorData = err?.response?.data?.detail;
      let message =
        (Array.isArray(errorData?.detail) && errorData.detail[0]?.msg) ||
        errorData?.detail ||
        "Something went wrong";

      if (typeof errorData === "string") {
        const match = errorData.match(/'msg':\s*["']([^"']+)["']/);
        if (match && match[1]) {
          message = match[1];
        }
      }

      errorMessageHandler(message);
    } finally {
      setIsTagActionLoading(false);
      setOpen(false);
      setLocalSearch("");
    }
  };

  const handleDeleteClick = (e: any, item: any) => {
    e.stopPropagation();
    e.preventDefault();
    setTagToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;

    setIsDeleteLoading(true);
    try {
      const response = await axiosAuth.delete(
        `${DELETE_TAG}/${tagToDelete.id}`,
      );
      if (response.status === 200 || response.status === 204) {
        onTagUpdate("delete", tagToDelete);

        // Remove from selected items
        setSelectedIds((prev) => prev.filter((x) => x !== tagToDelete.id));

        // Close dialog and reset state
        setDeleteDialogOpen(false);
        setTagToDelete(null);
      }
    } catch (err: any) {
      console.error("Failed to delete tag:", err);
      errorMessageHandler(err.response.data.detail || "Failed to delete tag");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleSaveRename = async (item: any) => {
    if (isTagActionLoading) return;
    const trimmedName = editingName.trim();

    // min 1 & max 60 characters
    if (trimmedName.length < 1 || trimmedName.length > 60) {
      console.error("Tag name must be between 1 and 60 characters");
      return;
    }

    if (trimmedName === item.name) {
      setEditingId(null);
      setEditingName("");
      return;
    }

    setIsTagActionLoading(true);
    try {
      const payload = {
        ...item,
        name: trimmedName,
      };

      const response = await axiosAuth.patch(
        `${UPDATE_TAG}/${item.id}`,
        payload,
      );
      if (response.status === 200) {
        const updatedItem = { ...item, name: trimmedName };
        onTagUpdate("update", updatedItem);
      }
    } catch (err: any) {
      console.error("Failed to rename tag:", err);
      errorMessageHandler(err.response.data.detail || "Failed to rename tag");
    } finally {
      setIsTagActionLoading(false);
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleRenameKeyDown =
    (item: any) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === " ") {
        e.stopPropagation();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleSaveRename(item);
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleCancelRename();
      }
    };

  const handleMenuOpenChange = (item: any) => (open: boolean) => {
    if (open) {
      setEditingId(item.id);
      setEditingName(item.name);
    } else {
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleColorChange = async (itemId: string, newColor: string) => {
    if (isTagActionLoading) return;
    const item = dataList.find((i) => i.id === itemId);
    if (!item) return;

    setIsTagActionLoading(true);
    try {
      const payload = {
        ...item,
        color: newColor,
      };

      const response = await axiosAuth.patch(
        `${UPDATE_TAG}/${itemId}`,
        payload,
      );
      if (response.status === 200) {
        const updatedItem = { ...item, color: newColor };
        onTagUpdate("update", updatedItem);
      }
    } catch (err) {
      console.error("Failed to update tag color:", err);
    } finally {
      setIsTagActionLoading(false);
    }
  };

  const onTagUpdate = (action: "create" | "update" | "delete", tag: any) => {
    switch (action) {
      case "create":
        setDataList((prev) => [...prev, tag]);
        break;
      case "update":
        setDataList((prev) =>
          prev.map((item: any) => (item.id === tag.id ? tag : item)),
        );
        break;
      case "delete":
        setDataList((prev) => prev.filter((item: any) => item.id !== tag.id));
        break;
    }
  };

  const handleInputChange = (value: string) => {
    setLocalSearch(value);

    if (!value) {
      setTagError("");
      return;
    }

    const pattern = /^[a-zA-Z0-9 ]+$/;
    if (!pattern.test(value)) {
      setTagError("Tag can only contain letters, numbers, and spaces.");
    } else if (value.length > 60) {
      setTagError("Tag name must be 60 characters or less.");
    } else {
      setTagError("");
    }
  };

  const filtered = localSearch
    ? dataList.filter((item) =>
        item.name.toLowerCase().includes(localSearch.toLowerCase()),
      )
    : dataList;

  const exactMatch = dataList.some(
    (item) => item.name.toLowerCase() === localSearch.toLowerCase(),
  );
  const shouldShowCreate = localSearch.trim() && !exactMatch;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            {!hideButton && (
              <Button
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between min-h-[42px] h-auto py-2 px-3 flex-wrap gap-2
          bg-white border border-input shadow-sm
          text-black hover:bg-white hover:text-black"
              >
                {selectedIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2 flex-1">
                    {selectedIds.map((id) => {
                      const elem = dataList.find((i) => i.id === id);
                      if (!elem) return null;
                      return (
                        <Badge
                          key={id}
                          className="relative flex items-center justify-center group 
             !text-black hover:!bg-[inherit] hover:!text-[inherit]"
                          style={{ backgroundColor: elem.color }}
                        >
                          {elem.name}
                          <X
                            className="absolute right-0.5 top-0.5 h-[1.1em] w-[1.1em] cursor-pointer 
               text-muted-foreground opacity-0 group-hover:opacity-100 
               hover:text-red-500 transition rounded-full bg-white/80 p-[1px] shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClear(id);
                            }}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          className="min-w-[var(--radix-popover-trigger-width)] w-full p-0"
        >
          <Command filter={() => 1}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={localSearch}
              onValueChange={handleInputChange}
              maxLength={60}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (
                    localSearch.trim() &&
                    !exactMatch &&
                    localSearch.trim().length <= 60
                  ) {
                    handleCreate(localSearch.trim());
                  }
                }
              }}
            />
            {/* {tagError && <p className="text-red-600 text-xs p-4">{tagError}</p>} */}
            <CommandList
              className="max-h-60 overflow-y-auto"
              ref={listRef}
              onScroll={() => {
                if (!listRef.current || !hasMore || isFetchingMore) return;

                const { scrollTop, scrollHeight, clientHeight } =
                  listRef.current;

                if (scrollTop + clientHeight >= scrollHeight - 20) {
                  setIsFetchingMore(true);
                  setPage((prev: number) => prev + 1);
                }
              }}
            >
              {isLoading && filtered.length === 0 ? (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <>
                  <CommandGroup>
                    {filtered.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.name}
                        onSelect={() => {
                          if (!editingId) toggle(item.id);
                        }}
                        className="flex items-center justify-between group cursor-pointer relative"
                      >
                        <Badge
                          key={item.id}
                          className="relative flex items-center justify-center text-black-600 group px-3 py-1 rounded-full font-normal text-sm shadow-none"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.name || "N/A"}
                        </Badge>
                        <div className="ml-auto relative h-6 w-6 flex items-center justify-center">
                          <Check
                            className={cn(
                              "h-4 w-4 absolute transition-opacity",
                              selectedIds.includes(item.id) &&
                                editingId !== item.id
                                ? "opacity-100 group-hover:opacity-0"
                                : "opacity-0",
                            )}
                          />

                          <DropdownMenu
                            open={editingId === item.id}
                            onOpenChange={handleMenuOpenChange(item)}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-6 w-6 p-0 absolute transition-opacity",
                                  editingId === item.id
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100",
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent side="right" align="start">
                              <div className="p-2">
                                <Input
                                  ref={editingId === item.id ? inputRef : null}
                                  value={editingName}
                                  autoFocus
                                  onChange={(e) =>
                                    setEditingName(e.target.value)
                                  }
                                  onKeyDown={handleRenameKeyDown(item)}
                                  maxLength={60}
                                  className="h-6 text-xs px-2 bg-transparent hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent"
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                />
                              </div>

                              <div>
                                <Suspense fallback="loading...">
                                  <ColorPicker
                                    selectedColor={item.color}
                                    onColorSelect={(color) =>
                                      handleColorChange(item.id, color)
                                    }
                                  />
                                </Suspense>
                              </div>

                              <DropdownMenuSeparator />

                              <div
                                className="flex items-center gap-2 px-2 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50"
                                onClick={(e) => handleDeleteClick(e, item)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {filtered.length === 0 && !shouldShowCreate && (
                    <CommandEmpty>No results found.</CommandEmpty>
                  )}
                </>
              )}
            </CommandList>
            {shouldShowCreate && !tagError && (
              <CommandGroup>
                <CommandItem
                  value={`create-${localSearch}`}
                  onSelect={() => handleCreate(localSearch)}
                  className="w-full cursor-pointer text-blue-600 flex justify-center items-center gap-2 font-medium py-2 hover:bg-blue-50 hover:text-blue-700 border border-gray-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create {localSearch}</span>
                </CommandItem>
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      <CustomDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title="Are you sure you want to delete this tag?"
        description={`This action cannot be undone and will permanently delete the tag "${tagToDelete?.name}".`}
      />
    </>
  );
}
