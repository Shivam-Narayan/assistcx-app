"use client";

import { EmptyState } from "@/components/empty-state/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader, PlusCircle, Trash2 } from "lucide-react";

interface ContextSectionCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  selectLabel: string;
  onSelect: () => void;
  isEditing: boolean;
  isEmpty: boolean;
  isLoading?: boolean;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
}

const ContextSectionCard = ({
  icon,
  title,
  count,
  selectLabel,
  onSelect,
  isEditing,
  isEmpty,
  isLoading,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  children,
}: ContextSectionCardProps) => {
  return (
    <Card className="overflow-hidden shadow-none p-0 gap-0">
      <CardHeader className=" bg-muted px-4 !pt-4 !pb-4 items-center gap-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              {icon}
            </div>
            <h3 className="text-base font-semibold leading-none tracking-tight">
              {title}
            </h3>
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </div>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-[6px] cursor-pointer gap-1.5 shrink-0"
              onClick={onSelect}
            >
              <PlusCircle className="h-4 w-4" />
              {selectLabel}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isEmpty ? (
          <EmptyState
            variant="card"
            compact
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export function ContextRemoveItemButton({
  onRemove,
}: {
  onRemove: (e: React.MouseEvent) => void;
}) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onRemove}
      type="button"
      aria-label="Delete"
      className=" p-1 h-8 w-8 items-center rounded-md cursor-pointer cursor-pointer h-6 w-6 md:h-8 md:w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
    >
      <Trash2 className="h-4 w-4 text-primary" />
    </Button>
  );
}

export default ContextSectionCard;
