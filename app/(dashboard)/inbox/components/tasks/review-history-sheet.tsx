"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { DiffCheckerComponent } from "@/components/version-history/change-log-component";
import { compareJSONSummary } from "@/components/version-history/useDiffCheckedHook";
import type { ReviewHistoryItem } from "@/types/types";
import { Clock, MessageSquareText, ShieldCheck, X } from "lucide-react";
import React, { useMemo } from "react";
import { REVIEW_ACTION_CONFIG, type ReviewAction } from "./constants";

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return ts;
  }
}

function filterMetadataKeys(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const metadataKeys = new Set(["user_id", "timestamp"]);
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => !metadataKeys.has(key)),
  );
}

function ReviewItemCard({
  item,
  isLast,
}: {
  item: ReviewHistoryItem;
  isLast: boolean;
}) {
  const action = item.action_taken as ReviewAction;
  const config = REVIEW_ACTION_CONFIG[action];

  const diff = useMemo(() => {
    if (action !== "edit" || !item.original_params || !item.edited_params)
      return null;

    const cleanOriginal = filterMetadataKeys(item.original_params);
    const cleanEdited = filterMetadataKeys(item.edited_params);

    try {
      return compareJSONSummary(cleanOriginal, cleanEdited, "generic");
    } catch {
      return null;
    }
  }, [action, item]);

  return (
    <>
      <div className="px-4 py-4 space-y-4">
        {item.question ? (
          <div className="rounded-md border border-primary/15 bg-primary/[0.04] dark:bg-primary/[0.08] px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Question
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {item.question}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No question text
          </p>
        )}

        <div className="rounded-md border bg-muted/30 px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold ${config.textClassName}`}>
              {config.label}
            </span>
            {item.tool_name && (
              <span className="text-xs text-muted-foreground">
                {item.tool_name}
              </span>
            )}
          </div>
          {item.timestamp && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="h-3 w-3 shrink-0" />
              {formatTimestamp(item.timestamp)}
            </div>
          )}
        </div>

        {item.feedback?.trim() && (
          <div className="rounded-md border border-muted bg-muted/20 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <MessageSquareText className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Feedback
              </p>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {item.feedback}
            </p>
          </div>
        )}

        {action === "edit" && diff?.diff && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Parameter changes
            </p>
            <DiffCheckerComponent diff={diff.diff} />
          </div>
        )}
      </div>
      {!isLast && <Separator />}
    </>
  );
}

interface ReviewHistorySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reviews: ReviewHistoryItem[];
}

export const ReviewHistorySheet: React.FC<ReviewHistorySheetProps> = ({
  isOpen,
  onOpenChange,
  reviews,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 gap-0 overflow-auto bg-white dark:bg-black">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b border-gray-300 dark:border-gray-700 space-y-0 bg-white dark:bg-black">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <SheetTitle className="text-base font-semibold">
              Review History
            </SheetTitle>
          </div>
          <SheetClose asChild>
            <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">
              <X className="w-5 h-5" />
            </div>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {reviews.map((review, index) => (
            <ReviewItemCard
              key={`${review.tool_call_id}-${index}`}
              item={review}
              isLast={index === reviews.length - 1}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
