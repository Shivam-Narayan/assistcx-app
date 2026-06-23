"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { JsonDiffViewer } from "@/components/json-diff-viewer";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/user-avatar";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import type { ReviewHistoryItem } from "@/types/types";
import {
  Bolt,
  Calendar,
  MessageSquareText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import React, { useEffect } from "react";
import { REVIEW_ACTION_CONFIG, type ReviewAction } from "./constants";

interface UserInfo {
  first_name: string;
  last_name: string;
}

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
  isOpen,
}: {
  item: ReviewHistoryItem;
  isLast: boolean;
  isOpen: boolean;
}) {
  const { axiosAuth } = useAxiosAuth();
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);
  const action = item.action_taken as ReviewAction;
  const config = REVIEW_ACTION_CONFIG[action];
  const fetchedRef = React.useRef(false);

  const borderColorMap: Record<ReviewAction, string> = {
    approve:
      "border-green-200 dark:border-green-800 bg-green-50/60 dark:bg-green-900/10",
    edit: "border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/10",
    reject:
      "border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-900/10",
  };

  const cleanOriginal = item.original_params
    ? filterMetadataKeys(item.original_params)
    : null;
  const cleanEdited = item.edited_params
    ? filterMetadataKeys(item.edited_params)
    : null;

  const getUserInfo = async (userId: string) => {
    try {
      const baseUrl = url.LIST_TEAM_MEMBERS;

      const result = await axiosAuth.get(`${baseUrl}/${userId}`);

      if (result?.status === 200) {
        setUserInfo(result.data.users[0]);
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  useEffect(() => {
    if (isOpen && item.user_id && !fetchedRef.current) {
      fetchedRef.current = true;
      getUserInfo(item.user_id);
    }

    if (!isOpen) {
      fetchedRef.current = false;
    }
  }, [isOpen, item.user_id]);

  const name =
    `${userInfo?.first_name ?? ""} ${userInfo?.last_name ?? ""}`.trim();
  const Icon = config.icon;

  return (
    <>
      <div className="px-5 py-4 space-y-3.5">
        {/* Question block */}
        {item.question && (
          <div className="rounded-md border border-primary/15 bg-primary/[0.04] dark:bg-primary/[0.08] px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
              Question
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {item.question}
            </p>
          </div>
        )}

        {/* Action Taken block */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Action Taken
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium pointer-events-none ${config.badgeClassName}`}
            >
              <Icon className={config.iconClassName} />
              {config.label}
            </span>
          </div>
          {item.timestamp && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              {formatTimestamp(item.timestamp)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
              <UserRound className="h-3 w-3" />
              Reviewer
            </p>
            {name ? (
              <ConditionalTooltip content={name}>
                <div className="flex items-center gap-2.5 cursor-pointer max-w-[300px]">
                  <UserAvatar name={name} size="sm" />
                  <span className="text-sm font-medium text-foreground truncate whitespace-nowrap overflow-hidden">
                    {name}
                  </span>
                </div>
              </ConditionalTooltip>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>

          <div className="rounded-lg bg-muted/50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2.5">
              <Bolt className="h-3 w-3" />
              Tool used
            </p>

            {item.tool_name ? (
              <ConditionalTooltip content={item.tool_name}>
                <Badge
                  variant="outline"
                  className="max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis bg-muted/50 text-foreground border-border text-xs font-mono px-2 py-0.5 leading-5 inline-flex"
                >
                  <span className="truncate block max-w-[260px]">
                    {item.tool_name}
                  </span>
                </Badge>
              </ConditionalTooltip>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>
        {config.label !== "Approved" && <Separator />}

        {/* Feedback block — Reject only */}
        {action === "reject" && item.feedback?.trim() && (
          <div className="rounded-md border border-primary/15 bg-primary/[0.04] dark:bg-primary/[0.08] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
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

        {/* JSON diff — Edit only */}
        {action === "edit" && cleanOriginal && cleanEdited && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Parameter Changes
            </p>
            <JsonDiffViewer
              original={cleanOriginal}
              modified={cleanEdited}
              maxHeight="360px"
            />
          </div>
        )}
      </div>
      {!isLast && <Separator />}
    </>
  );
}

interface ReviewHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reviews: ReviewHistoryItem[];
}

export const ReviewHistoryDialog: React.FC<ReviewHistoryDialogProps> = ({
  isOpen,
  onOpenChange,
  reviews,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 gap-0 max-h-[85vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-row justify-between items-center px-5 py-3.5 border-b space-y-0 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            <DialogTitle className="text-base font-semibold">
              Review History
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">
              No review history available.
            </p>
          ) : (
            reviews.map((review, index) => (
              <ReviewItemCard
                key={`${review.tool_call_id}-${index}`}
                item={review}
                isLast={index === reviews.length - 1}
                isOpen={isOpen}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
