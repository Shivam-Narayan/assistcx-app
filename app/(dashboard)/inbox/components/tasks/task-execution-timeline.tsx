"use client";

import { CollapsibleContent as ExpandableContent } from "@/components/collapsible-content";
import { SmartContentViewer } from "@/components/smart-content";
import type {
  ExecutionMessage,
  ReviewHistoryItem,
  ToolCall,
} from "@/types/types";
import {
  ArrowRight,
  Bolt,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  MessageSquare,
  MessageSquareReply,
  SquareActivity,
  SquareChevronRight,
  UserCircle,
  ZapIcon,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import CopyToClipboard from "@/components/copy-to-clipboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { REVIEW_ACTION_CONFIG, type ReviewAction } from "./constants";
import { ReviewHistoryDialog } from "./review-history-dialog";

const getMessageIcon = (
  role: ExecutionMessage["role"],
  message?: ExecutionMessage,
  index?: number,
): React.ReactElement => {
  switch (role) {
    case "user":
      if (index === 0) {
        return React.createElement(ClipboardList, {
          className: "h-5 w-5 text-blue-500",
        });
      }
      return React.createElement(UserCircle, {
        className: "h-5 w-5 text-blue-500",
      });
    case "assistant":
      if (message?.tool_calls && message.tool_calls.length > 0) {
        return React.createElement(Bolt, {
          className: "h-5 w-5 text-green-500",
        });
      } else {
        return React.createElement(MessageSquareReply, {
          className: "h-5 w-5 text-purple-500",
        });
      }
    case "tool":
      return React.createElement(SquareChevronRight, {
        className: "h-5 w-5 text-purple-500",
      });
    default:
      const exhaustiveCheck: never = role;
      return React.createElement(MessageSquare, {
        className: "h-5 w-5 text-gray-500",
      });
  }
};

const getMessageRoleLabel = (
  role: ExecutionMessage["role"],
  message?: ExecutionMessage,
) => {
  switch (role) {
    case "user":
      return "Task Input";
    case "assistant":
      if (message?.tool_calls && message.tool_calls.length > 0) {
        return "Agent Action";
      } else {
        return "Agent Response";
      }
    case "tool":
      return "Action Output";
    default:
      const exhaustiveCheck: never = role;
      return "Message";
  }
};

const getMessagePreview = (message: ExecutionMessage): string => {
  if (
    message.role === "assistant" &&
    (!message.content || message.content === "") &&
    message.tool_calls &&
    message.tool_calls.length > 0
  ) {
    const toolCount = message.tool_calls.length;
    return `Used ${toolCount} ${toolCount > 1 ? "tools" : "tool"}`;
  }

  if (message.role === "tool" && !message.content) {
    return "Tool response";
  }

  if (typeof message.content === "string") {
    const content = message.content.trim();
    return content.length > 75
      ? `${content.substring(0, 75)}...`
      : content || "Empty message";
  }

  return "Complex content";
};

const ToolBadge = ({
  name,
  isOutput = false,
}: {
  name: string;
  isOutput?: boolean;
}) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 rounded-full text-sm px-2.5 py-0.5 border",
      isOutput
        ? "border-purple-200 dark:border-purple-900/40 bg-purple-50/60 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
        : "border-green-200 dark:border-green-900/40 bg-green-50/60 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    )}
  >
    {isOutput ? (
      <ArrowRight className="h-3 w-3 stroke-[2.5]" />
    ) : (
      <ZapIcon className="h-3 w-3 stroke-[2.5]" />
    )}
    <span className="font-medium">{name}</span>
  </div>
);

const ReviewBadge = ({
  reviews,
  onClick,
}: {
  reviews: ReviewHistoryItem[];
  onClick: (e: React.MouseEvent) => void;
}) => {
  if (reviews.length === 0) return null;

  const dominantAction: ReviewAction = (() => {
    for (const r of reviews) {
      if (r.action_taken === "reject") return "reject";
    }
    for (const r of reviews) {
      if (r.action_taken === "edit") return "edit";
    }
    return "approve";
  })();

  const config = REVIEW_ACTION_CONFIG[dominantAction];
  const Icon = config.icon;
  const label =
    reviews.length === 1 ? config.label : `${reviews.length} reviews`;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 cursor-pointer rounded-full font-medium shrink-0",
        config.badgeClassName,
      )}
      onClick={onClick}
    >
      <Icon className={config.iconClassName} />
      {label}
    </Badge>
  );
};

interface TaskExecutionTimelineProps {
  executionLog: ExecutionMessage[];
  isScrolled?: boolean;
  isCustomTaskLoading: boolean;
  isTaskInExecutionPhase: boolean;
  reviewHistory?: ReviewHistoryItem[];
}

export const TaskExecutionTimeline: React.FC<TaskExecutionTimelineProps> = ({
  executionLog,
  isScrolled,
  isCustomTaskLoading,
  isTaskInExecutionPhase,
  reviewHistory = [],
}) => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const showOutputsInline = true;
  const [allExpanded, setAllExpanded] = useState(false);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState<ReviewHistoryItem[]>(
    [],
  );

  const isExecuting = isTaskInExecutionPhase || isCustomTaskLoading;

  const editedToolCallIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of reviewHistory) {
      if (item.action_taken === "edit" && item.tool_call_id) {
        ids.add(item.tool_call_id);
      }
    }
    return ids;
  }, [reviewHistory]);

  const deduplicatedLog = useMemo(() => {
    const lastIdxForCallId = new Map<string, number>();
    executionLog.forEach((msg, idx) => {
      if (msg.role === "assistant" && msg.tool_calls) {
        for (const call of msg.tool_calls) {
          lastIdxForCallId.set(call.id, idx);
        }
      }
    });

    const seen = new Set<string>();
    return executionLog.filter((msg, idx) => {
      if (msg.role === "assistant" && msg.tool_calls?.length) {
        const superseded = msg.tool_calls.some(
          (call) =>
            lastIdxForCallId.get(call.id) !== idx &&
            editedToolCallIds.has(call.id),
        );
        if (superseded) return false;
      }

      const key = JSON.stringify({
        role: msg.role,
        content: msg.content,
        name: msg.name,
        tool_call_id: msg.tool_call_id,
        tool_calls: msg.tool_calls,
      });
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [executionLog, editedToolCallIds]);

  const reviewsByToolCallId = useMemo(() => {
    const map = new Map<string, ReviewHistoryItem[]>();
    for (const item of reviewHistory) {
      if (!item.tool_call_id) continue;
      const existing = map.get(item.tool_call_id) || [];
      existing.push(item);
      map.set(item.tool_call_id, existing);
    }
    return map;
  }, [reviewHistory]);

  const getReviewsForMessage = (msg: ExecutionMessage): ReviewHistoryItem[] => {
    if (msg.role !== "assistant" || !msg.tool_calls) return [];
    const reviews: ReviewHistoryItem[] = [];
    for (const call of msg.tool_calls) {
      const callReviews = reviewsByToolCallId.get(call.id);
      if (callReviews) reviews.push(...callReviews);
    }
    return reviews;
  };

  const getToolOutputsForMessage = (msgIndex: number) => {
    if (!showOutputsInline) return [];

    const message = deduplicatedLog[msgIndex];
    if (message.role !== "assistant" || !message.tool_calls) return [];

    const toolCallIds = message.tool_calls.map((call) => call.id);
    const outputs = [];

    for (let i = msgIndex + 1; i < deduplicatedLog.length; i++) {
      const nextMsg = deduplicatedLog[i];
      if (
        nextMsg.role === "tool" &&
        toolCallIds.includes(nextMsg.tool_call_id || "")
      ) {
        outputs.push(nextMsg);
      } else if (nextMsg.role === "assistant") {
        break;
      }
    }

    return outputs;
  };

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => {
      const newExpandedSteps = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index];
      setAllExpanded(newExpandedSteps.length === deduplicatedLog.length);
      return newExpandedSteps;
    });
  };

  const toggleAllSteps = () => {
    if (allExpanded) {
      setExpandedSteps([]);
      setAllExpanded(false);
    } else {
      setExpandedSteps(deduplicatedLog.map((_, index) => index));
      setAllExpanded(true);
    }
  };

  const openReviewSheet = (
    reviews: ReviewHistoryItem[],
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setSelectedReviews(reviews);
    setReviewSheetOpen(true);
  };

  return (
    <>
      {executionLog && (
        <div className="relative space-y-3">
          <Card className="border py-0 gap-0 shadow-xs">
            <div
              className={cn(
                "flex items-center justify-between text-foreground/80 sticky top-0 rounded-t-xl bg-white dark:bg-slate-800 px-4 py-3 z-20 transition-shadow border-b border-border",
                isScrolled && "shadow-xs",
              )}
            >
              <div className="flex items-center gap-2">
                <SquareActivity className="h-6 w-6" />
                <h2 className="text-lg font-semibold">Execution Log</h2>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllSteps}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {allExpanded ? (
                  <>
                    <span className="text-sm">Collapse All</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span className="text-sm">Expand All</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            {deduplicatedLog.length === 0 && !isExecuting ? (
              <div className="p-4 text-center text-muted-foreground">
                No execution steps recorded
              </div>
            ) : (
              <>
                {deduplicatedLog.length > 0 && (
                  <ul className="relative">
                    {(() => {
                      const visibleMessages = deduplicatedLog
                        .map((msg, index) => ({ msg, index }))
                        .filter(
                          ({ msg }) =>
                            !(showOutputsInline && msg.role === "tool"),
                        );

                      return visibleMessages.map(
                        ({ msg, index }, visibleIndex) => {
                          const isExpanded = expandedSteps.includes(index);
                          const isLast = index === deduplicatedLog.length - 1;
                          const isLastVisible =
                            visibleIndex === visibleMessages.length - 1;
                          const msgReviews = getReviewsForMessage(msg);

                          return (
                            <li
                              key={index}
                              className={cn(
                                "relative",
                                !isLast &&
                                  "border-b border-gray-200 dark:border-gray-700",
                                "last:border-b-0",
                              )}
                            >
                              {index > 0 && (
                                <div className="absolute left-8 top-0 w-0.5 h-4 -ml-px bg-slate-300 dark:bg-slate-600 z-5" />
                              )}

                              {!isLast && (
                                <div className="absolute left-8 top-8 w-0.5 -bottom-px -ml-px bg-slate-300 dark:bg-slate-600 z-5" />
                              )}

                              <div
                                onClick={() => toggleStep(index)}
                                className={cn(
                                  "flex items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors relative",
                                  isExpanded &&
                                    "bg-gray-50 dark:bg-slate-700/20 sticky top-13 z-6 shadow-xs border-b border-gray-200 dark:border-gray-700",
                                  isLastVisible &&
                                    !isExpanded &&
                                    "rounded-b-lg",
                                )}
                              >
                                <div className="shrink-0 mr-3 relative z-6">
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center relative",
                                      msg.role === "user"
                                        ? "bg-blue-100 dark:bg-blue-900/30"
                                        : msg.role === "assistant"
                                          ? msg.tool_calls &&
                                            msg.tool_calls.length > 0
                                            ? "bg-green-100 dark:bg-green-900/30"
                                            : "bg-purple-100 dark:bg-purple-900/30"
                                          : "bg-purple-100 dark:bg-purple-900/30",
                                    )}
                                  >
                                    {getMessageIcon(msg.role, msg, index)}
                                  </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <p className="text-sm xl:text-base font-medium text-gray-900 dark:text-gray-100">
                                      {getMessageRoleLabel(msg.role, msg)}
                                    </p>

                                    {msg.role === "tool" && msg.name && (
                                      <ToolBadge
                                        name={msg.name}
                                        isOutput={true}
                                      />
                                    )}

                                    {msg.role === "assistant" &&
                                      msg.tool_calls &&
                                      msg.tool_calls.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {Array.from(
                                            new Set(
                                              msg.tool_calls.map(
                                                (call) => call.function.name,
                                              ),
                                            ),
                                          ).map((toolName, idx) => (
                                            <ToolBadge
                                              key={idx}
                                              name={toolName}
                                            />
                                          ))}
                                        </div>
                                      )}

                                    {msgReviews.length > 0 && (
                                      <ReviewBadge
                                        reviews={msgReviews}
                                        onClick={(e) =>
                                          openReviewSheet(msgReviews, e)
                                        }
                                      />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground/90 truncate mt-1.5">
                                    {getMessagePreview(msg)}
                                  </p>
                                </div>

                                <div className="shrink-0 ml-3">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </div>

                              {isExpanded && (
                                <div
                                  className={cn(
                                    "pl-14 pr-4 py-5 relative flex flex-col gap-4 break-all",
                                    isLast ? "" : "pb-4",
                                  )}
                                >
                                  {msg.content && (
                                    <div className="space-y-3">
                                      {msg.role === "assistant" && (
                                        <h5 className="text-xs xl:text-sm font-medium text-muted-foreground">
                                          Thoughts
                                        </h5>
                                      )}
                                      <div
                                        className={cn(
                                          "rounded-md border p-3 bg-muted/50",
                                        )}
                                      >
                                        <ExpandableContent
                                          gradientStart="from-gray-50 dark:from-slate-700/30"
                                          maxHeight={256}
                                          className="prose prose-sm dark:prose-invert max-w-none reset-prose"
                                        >
                                          <SmartContentViewer
                                            content={msg.content}
                                            expandView={true}
                                          />
                                        </ExpandableContent>
                                      </div>
                                    </div>
                                  )}

                                  {msg.tool_calls &&
                                    msg.tool_calls.length > 0 && (
                                      <div className="space-y-3">
                                        <h5 className="text-xs xl:text-sm font-medium text-muted-foreground">
                                          {msg.tool_calls.length > 1
                                            ? "Actions"
                                            : "Action"}
                                        </h5>
                                        {msg.tool_calls.map(
                                          (call: ToolCall) => {
                                            const callReviews =
                                              reviewsByToolCallId.get(
                                                call.id,
                                              ) || [];

                                            return (
                                              <div
                                                key={call.id}
                                                className={cn(
                                                  "p-3 border rounded-md bg-muted/50",
                                                )}
                                              >
                                                <div className="flex items-center justify-between mb-1">
                                                  <p className="font-medium flex items-center gap-2 text-primary/90">
                                                    <ZapIcon
                                                      className="h-4 w-4"
                                                      strokeWidth={2}
                                                    />
                                                    <code className="font-semibold">
                                                      {call.function.name}
                                                    </code>
                                                  </p>
                                                  {callReviews.length > 0 && (
                                                    <ReviewBadge
                                                      reviews={callReviews}
                                                      onClick={(e) =>
                                                        openReviewSheet(
                                                          callReviews,
                                                          e,
                                                        )
                                                      }
                                                    />
                                                  )}
                                                </div>
                                                <div className="mt-2 bg-transparent dark:bg-slate-800/60 rounded-md">
                                                  <div className="prose prose-sm dark:prose-invert max-w-none reset-prose">
                                                    <SmartContentViewer
                                                      content={
                                                        call.function.arguments
                                                      }
                                                      className="bg-background!"
                                                      expandView={true}
                                                    />
                                                  </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                  <span>
                                                    Tool call ID: {call.id}
                                                  </span>
                                                  <CopyToClipboard
                                                    text={call.id}
                                                    tooltipLabel="Copy ID"
                                                  />
                                                </p>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    )}

                                  {showOutputsInline &&
                                    msg.role === "assistant" &&
                                    msg.tool_calls &&
                                    msg.tool_calls.length > 0 &&
                                    (() => {
                                      const toolOutputs =
                                        getToolOutputsForMessage(index);
                                      return toolOutputs.length > 0 ? (
                                        <div className="space-y-3">
                                          <h5 className="text-xs xl:text-sm font-medium text-muted-foreground">
                                            Output
                                          </h5>
                                          <div className="rounded-md border p-3 bg-muted/50">
                                            <ExpandableContent
                                              gradientStart="from-gray-50 dark:from-slate-700/30"
                                              maxHeight={256}
                                              className="prose prose-sm dark:prose-invert max-w-none reset-prose"
                                            >
                                              <SmartContentViewer
                                                content={toolOutputs[0].content}
                                                expandView={true}
                                              />
                                            </ExpandableContent>
                                          </div>
                                        </div>
                                      ) : null;
                                    })()}

                                  {msg.role === "tool" && msg.tool_call_id && (
                                    <p className="text-xs text-muted-foreground">
                                      Tool Call ID: {msg.tool_call_id}
                                    </p>
                                  )}
                                </div>
                              )}
                            </li>
                          );
                        },
                      );
                    })()}
                  </ul>
                )}
              </>
            )}
          </Card>

          {isExecuting && (
            <div className="relative rounded-xl p-[1.5px] overflow-hidden">
              <div className="absolute inset-0 rounded-xl bg-border" />

              <div
                className="absolute inset-0 animate-border-spin"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 70%, hsl(var(--primary)) 85%, hsl(var(--primary) / 0.7) 93%, transparent 100%)",
                }}
              />
              <Card className="relative rounded-[10px] border-0 bg-card shadow-none">
                <div className="flex items-center justify-center gap-3.5 px-5 py-2">
                  <SquareActivity className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-base font-medium text-foreground">
                    Executing task&hellip;
                  </p>
                  {/* Equalizer bars */}
                  <div className="flex items-center gap-[3px]">
                    <span
                      className="block w-[3px] h-[10px] bg-primary rounded-full animate-[pulse-dot_1.2s_ease-in-out_infinite]"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="block w-[3px] h-[10px] bg-primary rounded-full animate-[pulse-dot_1.2s_ease-in-out_infinite]"
                      style={{ animationDelay: "200ms" }}
                    />
                    <span
                      className="block w-[3px] h-[10px] bg-primary rounded-full animate-[pulse-dot_1.2s_ease-in-out_infinite]"
                      style={{ animationDelay: "400ms" }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          <ReviewHistoryDialog
            isOpen={reviewSheetOpen}
            onOpenChange={setReviewSheetOpen}
            reviews={selectedReviews}
          />
        </div>
      )}
    </>
  );
};
