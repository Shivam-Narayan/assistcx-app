import { Card } from "@/components/ui/card";
import { getNextRunText } from "@/helper/assistant-helper/helper";
import { cn } from "@/lib/utils";
import { Clock4, Pause } from "lucide-react";
import { forwardRef } from "react";
import { TaskCardProps } from "./types";

export const TaskCard = forwardRef<HTMLButtonElement, TaskCardProps>(
  ({ task, cron, className, ...props }, ref) => {
    const isPaused = task?.status === "paused";

    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={cn("w-full text-left", className)}
      >
        <Card
          className={cn(
            "relative shadow-xs px-4 py-3 cursor-pointer group transition-colors hover:bg-muted/50",
          )}
        >
          <div className="flex flex-col">
            <div>
              <h2 className="text-base font-semibold line-clamp-1">
                {task?.title}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                {task?.task_prompt}
              </p>
            </div>
            <div className="my-2.5 w-full border-t border-dashed border-border" />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {isPaused ? (
                  <Pause className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <Clock4 className="h-3.5 w-3.5 text-primary" />
                )}
                <p className="text-xs text-muted-foreground">
                  {isPaused
                    ? "Paused"
                    : getNextRunText({
                        type: cron.type as
                          | "daily"
                          | "weekly"
                          | "monthly"
                          | "yearly"
                          | "once",
                        time: cron.time,
                        dayOfWeek: cron.dayOfWeek,
                        dayOfMonth: cron.dayOfMonth
                          ? parseInt(cron.dayOfMonth)
                          : undefined,
                        date: cron?.date ?? undefined,
                      })}
                </p>
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full border capitalize",
                  isPaused
                    ? "text-amber-600 bg-amber-50 border-amber-200"
                    : "text-emerald-600 bg-emerald-50 border-emerald-200",
                )}
              >
                {task?.status}
              </span>
            </div>
          </div>
        </Card>
      </button>
    );
  },
);

TaskCard.displayName = "TaskCard";
