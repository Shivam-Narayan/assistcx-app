"use client";

import { EmptyState } from "@/components/empty-state/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Eye,
  EyeOff,
  GripVertical,
  Columns3,
  PanelLeft,
  Pin,
  PinOff,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { COLUMN_TYPE_OPTIONS, type TableColumnDef } from "../types/table-types";

interface ColumnsVisibilityDropdownProps {
  columns: TableColumnDef[];
  hiddenColumnIds: Set<string>;
  frozenColumnIds: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  onToggleFreeze: (columnId: string) => void;
  onReorderColumns: (columnIds: string[]) => void;
  canReorder?: boolean;
}

export function ColumnsVisibilityDropdown({
  columns,
  hiddenColumnIds,
  frozenColumnIds,
  onToggleColumn,
  onShowAll,
  onHideAll,
  onToggleFreeze,
  onReorderColumns,
  canReorder = true,
}: ColumnsVisibilityDropdownProps) {
  const [search, setSearch] = useState("");
  const visibleCount = columns.length - hiddenColumnIds.size;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const filteredColumns = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return columns;
    return columns.filter((column) =>
      column.name.toLowerCase().includes(query),
    );
  }, [columns, search]);

  const columnIds = useMemo(
    () => columns.map((column) => column.id),
    [columns],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const nextOrder = [...columnIds];
    const oldIndex = nextOrder.indexOf(String(active.id));
    const newIndex = nextOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    nextOrder.splice(oldIndex, 1);
    nextOrder.splice(newIndex, 0, String(active.id));
    onReorderColumns(nextOrder);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 cursor-pointer gap-2 px-3"
        >
          <PanelLeft className="h-4 w-4" />
          {visibleCount}/{columns.length} columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b p-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start gap-2 cursor-pointer"
              onClick={onShowAll}
            >
              <Eye className="h-4 w-4" />
              Show all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start gap-2 cursor-pointer"
              onClick={onHideAll}
            >
              <EyeOff className="h-4 w-4" />
              Hide all
            </Button>
          </div>
        </div>

        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search columns..."
              className="h-8 pl-8"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto px-1 pb-1">
          {columns.length === 0 ? (
            <div className="px-2 pb-2">
              <EmptyState
                variant="card"
                title="No columns yet"
                description="Add a column to start configuring visibility and order."
                icon={Columns3}
                className="rounded-xl px-4 py-6"
              />
            </div>
          ) : filteredColumns.length === 0 ? (
            <div className="px-2 pb-2">
              <EmptyState
                variant="card"
                title="No columns found"
                description="Try a different search term."
                icon={Search}
                className="rounded-xl px-4 py-6"
              />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columnIds}
                strategy={verticalListSortingStrategy}
              >
                {filteredColumns.map((column) => (
                  <ColumnVisibilityRow
                    key={column.id}
                    column={column}
                    isVisible={!hiddenColumnIds.has(column.id)}
                    isFrozen={frozenColumnIds.has(column.id)}
                    canReorder={canReorder}
                    onToggleColumn={() => onToggleColumn(column.id)}
                    onToggleFreeze={() => onToggleFreeze(column.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ColumnVisibilityRow({
  column,
  isVisible,
  isFrozen,
  canReorder,
  onToggleColumn,
  onToggleFreeze,
}: {
  column: TableColumnDef;
  isVisible: boolean;
  isFrozen: boolean;
  canReorder: boolean;
  onToggleColumn: () => void;
  onToggleFreeze: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, disabled: !canReorder });
  const columnType = COLUMN_TYPE_OPTIONS.find(
    (type) => type.value === column.type,
  );
  const Icon = columnType?.icon;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        isDragging && "opacity-60",
      )}
    >
      {canReorder && (
        <button
          type="button"
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="Reorder column"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <Checkbox
        checked={isVisible}
        onCheckedChange={onToggleColumn}
        className="cursor-pointer"
      />
      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          isFrozen && "font-medium text-primary",
        )}
      >
        {column.name}
      </span>
      <button
        type="button"
        onClick={onToggleFreeze}
        className={cn(
          "rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer",
          isFrozen && "text-primary hover:text-primary",
        )}
        aria-label={isFrozen ? "Unfreeze column" : "Freeze column"}
      >
        {isFrozen ? (
          <PinOff className="h-4 w-4" />
        ) : (
          <Pin className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
