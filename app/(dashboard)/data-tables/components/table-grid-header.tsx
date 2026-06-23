import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import React from "react";

export function SortableHeader({
  id,
  width,
  isFrozen,
  frozenLeft,
  resizingCol,
  onResizeStart,
  sortIndicator,
  canReorder = true,
  children,
}: {
  id: string;
  width: number;
  isFrozen: boolean;
  frozenLeft?: number;
  resizingCol: string | null;
  onResizeStart: (e: React.MouseEvent) => void;
  sortIndicator: string | null;
  canReorder?: boolean;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: resizingCol === id || !canReorder });

  const style: React.CSSProperties = {
    width,
    minWidth: width,
    maxWidth: width,
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    left: frozenLeft,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative z-40 overflow-hidden border-b border-r bg-muted px-3 py-2 text-left align-middle font-medium whitespace-nowrap",
        "select-none hover:bg-muted",
        isFrozen &&
          "sticky z-50 text-primary after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border after:content-['']",
      )}
    >
      <div className="flex h-5 w-full min-w-0 flex-nowrap items-center justify-between gap-1.5">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden text-left">
          {children}
        </div>
        {sortIndicator && (
          <span className="shrink-0 text-xs leading-none text-muted-foreground">
            {sortIndicator}
          </span>
        )}
        {canReorder && (
          <button
            type="button"
            className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground opacity-0 transition-opacity hover:bg-muted-foreground/10 hover:text-foreground group-hover:opacity-100 active:cursor-grabbing"
            aria-label="Drag column"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart(e);
        }}
        className={cn(
          "absolute -right-1 top-0 h-full w-2 cursor-col-resize transition-colors hover:bg-primary/40",
          resizingCol === id && "bg-primary/60",
        )}
      />
    </th>
  );
}
