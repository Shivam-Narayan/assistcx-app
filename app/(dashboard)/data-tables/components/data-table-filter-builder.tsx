"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
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
import { Filter, GripVertical, Loader2, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import type {
  DataTableFilterCondition,
  DataTableFilterOperator,
  TableColumnDef,
} from "../types/table-types";
import {
  buildCondition,
  getColumnById,
  getDefaultOperator,
  getDefaultValue,
  getOperatorNote,
  getOperators,
  isValidCondition,
  OPERATOR_LABELS,
  requiresValue,
} from "../utils/filter-helpers";

interface DataTableFilterBuilderProps {
  columns: TableColumnDef[];
  filters: DataTableFilterCondition[];
  open: boolean;
  requestedColumnId?: string | null;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: DataTableFilterCondition[]) => void;
  isApplying?: boolean;
}

function FilterValueInput({
  condition,
  column,
  onChange,
}: {
  condition: DataTableFilterCondition;
  column: TableColumnDef;
  onChange: (value: DataTableFilterCondition["value"]) => void;
}) {
  if (!requiresValue(condition.op)) {
    return (
      <div className="flex h-9 items-center border bg-muted/40 px-3 text-sm text-muted-foreground">
        No value needed
      </div>
    );
  }

  if (
    (column.type === "select" || column.type === "multi_select") &&
    (condition.op === "eq" || condition.op === "neq")
  ) {
    const options = column.options?.filter((option) => option.value) ?? [];
    return (
      <Select value={String(condition.value ?? "")} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select a value" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (column.type === "checkbox") {
    return (
      <Select
        value={String(condition.value ?? "true")}
        onValueChange={(value) => onChange(value)}
      >
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Checked</SelectItem>
          <SelectItem value="false">Unchecked</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  const inputType =
    column.type === "number" || column.type === "currency"
      ? "number"
      : column.type === "date"
        ? "date"
        : column.type === "datetime"
          ? "datetime-local"
          : "text";

  return (
    <Input
      type={inputType}
      value={String(condition.value ?? "")}
      placeholder="Enter a value"
      onChange={(event) => onChange(event.target.value)}
      className="h-9"
    />
  );
}

function SortableFilterRow({
  condition,
  index,
  columns,
  onUpdate,
  onRemove,
}: {
  condition: DataTableFilterCondition;
  index: number;
  columns: TableColumnDef[];
  onUpdate: (id: string, patch: Partial<DataTableFilterCondition>) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: condition.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const column = getColumnById(columns, condition.column_key);
  if (!column) return null;
  const operators = getOperators(column.type);
  const operatorNote = getOperatorNote(condition.op);

  return (
    <div ref={setNodeRef} style={style} className="space-y-1">
      <div className="flex items-center">
        <div className="w-14 shrink-0">
          <span className="text-xs text-muted-foreground">
            {index === 0 ? "Where" : "and"}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center [&_button[role=combobox]]:rounded-none [&_input]:rounded-none">
          <Select
            value={condition.column_key}
            onValueChange={(columnId) =>
              onUpdate(condition.id, { column_key: columnId })
            }
          >
            <SelectTrigger className="h-9 rounded-l-md rounded-r-none border-r-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {columns.map((tableColumn) => (
                <SelectItem key={tableColumn.id} value={tableColumn.id}>
                  {tableColumn.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={condition.op}
            onValueChange={(op) =>
              onUpdate(condition.id, { op: op as DataTableFilterOperator })
            }
          >
            <SelectTrigger className="h-9 rounded-none border-r-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operators.map((operator) => (
                <SelectItem key={operator} value={operator}>
                  {OPERATOR_LABELS[operator]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="min-w-0 flex-1 [&>button]:rounded-l-none [&>button]:rounded-r-md [&>div]:rounded-none [&_input]:rounded-l-none [&_input]:rounded-r-md [&_button[role=combobox]]:rounded-l-none [&_button[role=combobox]]:rounded-r-md">
            <FilterValueInput
              condition={condition}
              column={column}
              onChange={(value) => onUpdate(condition.id, { value })}
            />
          </div>
        </div>

        <button
          type="button"
          className="ml-1 flex h-9 w-8 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(condition.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {operatorNote && (
        <p className="ml-14 text-xs text-muted-foreground">{operatorNote}</p>
      )}
    </div>
  );
}

function FilterConditionsList({
  conditions,
  columns,
  onUpdate,
  onRemove,
  onReorder,
}: {
  conditions: DataTableFilterCondition[];
  columns: TableColumnDef[];
  onUpdate: (id: string, patch: Partial<DataTableFilterCondition>) => void;
  onRemove: (id: string) => void;
  onReorder: (reordered: DataTableFilterCondition[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const conditionIds = useMemo(() => conditions.map((c) => c.id), [conditions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = conditions.findIndex((c) => c.id === active.id);
    const newIndex = conditions.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...conditions];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onReorder(next);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={conditionIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <SortableFilterRow
              key={condition.id}
              condition={condition}
              index={index}
              columns={columns}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export function DataTableFilterBuilder({
  columns,
  filters,
  open,
  requestedColumnId,
  onOpenChange,
  onApply,
  isApplying = false,
}: DataTableFilterBuilderProps) {
  const [draftFilters, setDraftFilters] =
    useState<DataTableFilterCondition[]>(filters);

  const requestedColumn = useMemo(() => {
    if (!requestedColumnId) return null;
    return columns.find((column) => column.id === requestedColumnId) ?? null;
  }, [columns, requestedColumnId]);

  useEffect(() => {
    if (!open) return;
    setDraftFilters(() => {
      const base = filters.map((filter) => ({ ...filter }));
      if (
        requestedColumn &&
        !base.some((filter) => filter.column_key === requestedColumn.id)
      ) {
        return [...base, buildCondition(requestedColumn)];
      }
      return base;
    });
  }, [open, filters, requestedColumn]);

  const addFilter = () => {
    const firstColumn = columns[0];
    if (!firstColumn) return;
    setDraftFilters((prev) => [...prev, buildCondition(firstColumn)]);
  };

  const updateFilter = (
    filterId: string,
    patch: Partial<DataTableFilterCondition>,
  ) => {
    setDraftFilters((prev) =>
      prev.map((filter) => {
        if (filter.id !== filterId) return filter;
        const next = { ...filter, ...patch };

        if (patch.column_key) {
          const column = getColumnById(columns, patch.column_key);
          if (column) {
            next.op = getDefaultOperator(column.type);
            next.value = getDefaultValue(column);
          }
        }

        if (patch.op && !requiresValue(patch.op)) {
          delete next.value;
        }

        if (patch.op && requiresValue(patch.op)) {
          const column = getColumnById(columns, next.column_key);
          if (column && next.value === undefined) {
            next.value = getDefaultValue(column, patch.op);
          } else if (patch.op === "in" && !Array.isArray(next.value)) {
            const currentValue = String(next.value ?? "").trim();
            next.value = currentValue ? [currentValue] : [];
          } else if (patch.op !== "in" && Array.isArray(next.value)) {
            next.value = next.value[0] ?? "";
          }
        }

        return next;
      }),
    );
  };

  const removeDraftFilter = (filterId: string) => {
    setDraftFilters((prev) => prev.filter((filter) => filter.id !== filterId));
  };

  const applyFilters = () => {
    const nextFilters = draftFilters.filter((condition) =>
      isValidCondition(condition, columns),
    );
    onApply(nextFilters);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 cursor-pointer gap-2 px-3"
        >
          <Filter className="h-4 w-4" />
          Filter
          {filters.length > 0 && (
            <Badge className="ml-0.5 h-5 min-w-5 rounded-full border border-primary/60 bg-primary px-1.5 text-center text-[10px] leading-5 text-primary-foreground ring-1 ring-primary/20">
              {filters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-screen max-w-2xl p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Filter records</p>
            <p className="text-xs text-muted-foreground">
              Records must match all filter conditions.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-96 space-y-3 overflow-y-auto p-4">
          {draftFilters.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center">
              <p className="text-sm font-medium">No filters yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add conditions to narrow the rows shown in this table.
              </p>
            </div>
          ) : (
            <FilterConditionsList
              conditions={draftFilters}
              columns={columns}
              onUpdate={updateFilter}
              onRemove={removeDraftFilter}
              onReorder={(reordered) => setDraftFilters(reordered)}
            />
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 cursor-pointer gap-1.5 px-2"
            onClick={addFilter}
            disabled={columns.length === 0}
          >
            <Plus className="h-4 w-4" />
            Add condition
          </Button>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-xs text-muted-foreground">
            {filters.length} active{" "}
            {filters.length === 1 ? "condition" : "conditions"}
          </div>
          <div className="flex items-center gap-2">
            {filters.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  setDraftFilters([]);
                  onApply([]);
                  onOpenChange(false);
                }}
              >
                Clear all
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="cursor-pointer"
              onClick={applyFilters}
              disabled={isApplying}
            >
              {isApplying && (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              )}
              Apply filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
