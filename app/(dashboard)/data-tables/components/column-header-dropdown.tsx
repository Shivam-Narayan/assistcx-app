"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  RotateCcw,
  Pencil,
  Filter,
  Pin,
  PinOff,
  MoveLeft,
  MoveRight,
  EyeOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  COLUMN_TYPE_OPTIONS,
  type ColumnType,
  type TableColumnDef,
} from "../types/table-types";
import { EditColumnForm } from "./column-config-form";

interface ColumnHeaderDropdownProps {
  column: TableColumnDef;
  onUpdate: (
    columnId: string,
    name: string,
    type: ColumnType,
    colData: Pick<TableColumnDef, "required" | "defaultValue" | "options" | "allowCustomValues" | "precision" | "currencyCode" | "description">,
  ) => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  onClearSort: () => void;
  onInsertLeft: () => void;
  onInsertRight: () => void;
  onDuplicate: () => void;
  onHide: () => void;
  onFilter: () => void;
  isFrozen: boolean;
  onToggleFreeze: () => void;
  onDelete: () => void;
  canEdit?: boolean;
}

export function ColumnHeaderDropdown({
  column,
  onUpdate,
  onSortAsc,
  onSortDesc,
  onClearSort,
  onInsertLeft,
  onInsertRight,
  onDuplicate,
  onHide,
  onFilter,
  isFrozen,
  onToggleFreeze,
  onDelete,
  canEdit = true,
}: ColumnHeaderDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const columnType = COLUMN_TYPE_OPTIONS.find(
    (type) => type.value === column.type,
  );
  const Icon = columnType?.icon;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setIsEditing(false);
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full min-w-0 items-center justify-start gap-1.5 overflow-hidden text-left text-xs font-semibold uppercase tracking-wide cursor-pointer transition-colors",
            isFrozen
              ? "text-primary hover:text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
          <div className="min-w-0 flex-1">
            <ConditionalTooltip content={column.name} fullWidth>
              <span className="block w-full min-w-0 truncate text-left">
                {column.name}
              </span>
            </ConditionalTooltip>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn("overflow-hidden p-0", isEditing ? "w-80" : "w-56 p-1")}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {isEditing ? (
          <EditColumnForm
            column={column}
            onUpdate={(columnId, name, type, config) => {
              onUpdate(columnId, name, type, config);
              setOpen(false);
              setIsEditing(false);
            }}
            onBack={() => setIsEditing(false)}
          />
        ) : (
          <>
            {canEdit && (
              <>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setIsEditing(true);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit column
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              onClick={() => {
                onSortAsc();
                setOpen(false);
              }}
              className="cursor-pointer gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              Sort ascending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onSortDesc();
                setOpen(false);
              }}
              className="cursor-pointer gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              Sort descending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onClearSort();
                setOpen(false);
              }}
              className="cursor-pointer gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear sorting
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                onFilter();
                setOpen(false);
              }}
              className="cursor-pointer gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter on this column
            </DropdownMenuItem>

            {canEdit && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    onInsertLeft();
                    setOpen(false);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <MoveLeft className="h-4 w-4" />
                  Insert left
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onInsertRight();
                    setOpen(false);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <MoveRight className="h-4 w-4" />
                  Insert right
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                onToggleFreeze();
                setOpen(false);
              }}
              className="cursor-pointer gap-2"
            >
              {isFrozen ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
              {isFrozen ? "Unfreeze column" : "Freeze column"}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                onHide();
                setOpen(false);
              }}
              className="cursor-pointer gap-2"
            >
              <EyeOff className="h-4 w-4" />
              Hide column
            </DropdownMenuItem>

            {canEdit && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    onDuplicate();
                    setOpen(false);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate column
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onDelete();
                    setOpen(false);
                  }}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete column
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
