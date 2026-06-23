"use client";

import * as React from "react";
import { FileQuestion, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/*
fullpage: Whole main area of a screen when there's nothing to show
card:     A self-contained styled block (dashed border + muted bg) within a page or panel
inline:   Inside something else — table body, sheet, sidebar panel, etc.
*/
export type AppEmptyStateVariant = "fullpage" | "card" | "inline";

/**
 * AppEmptyStateProps
 *
 * @param variant - Visual context: "fullpage" | "card" | "inline"
 * @param title - Main heading text
 * @param description - Supporting description beneath the title
 * @param icon - Lucide icon component or React node (defaults to Inbox)
 * @param action - Footer area (buttons, links)
 * @param className - Optional extra class names for the outer wrapper
 * @param compact - Tighter layout for tables and dense panels (inline only)
 * @param removeOuterPadding - Skip outer vertical padding on the wrapper (inline only)
 */
export interface AppEmptyStateProps {
  variant?: AppEmptyStateVariant;
  title: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
  removeOuterPadding?: boolean;
}

/** Shown when `icon` prop is not provided */
const DEFAULT_EMPTY_ICON = FileQuestion;

function IconDisplay({
  icon,
  className,
}: {
  icon: LucideIcon | React.ReactNode;
  className: string;
}) {
  if (React.isValidElement(icon)) {
    return React.cloneElement(
      icon as React.ReactElement<{ className?: string }>,
      {
        className: cn(
          className,
          (icon as React.ReactElement<{ className?: string }>).props.className,
        ),
      },
    );
  }
  const I = icon as LucideIcon;
  return <I className={className} />;
}

export function EmptyState({
  variant = "inline",
  title,
  description,
  icon,
  action,
  className,
  compact = false,
  removeOuterPadding = false,
}: AppEmptyStateProps) {
  const resolvedIcon = icon ?? DEFAULT_EMPTY_ICON;

  if (variant === "fullpage") {
    return (
      <div
        className={cn(
          "flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4",
          className,
        )}
      >
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center">
            <IconDisplay
              icon={resolvedIcon}
              className="h-20 w-20 text-primary/80"
            />
          </div>
          <p className="text-xl text-foreground/80 font-medium">{title}</p>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-primary/30 bg-muted/30 px-6 py-10 text-center",
          className,
        )}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <IconDisplay icon={resolvedIcon} className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {action ? (
          <div className="mt-4 flex justify-center">{action}</div>
        ) : null}
      </div>
    );
  }

  /* inline */
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        removeOuterPadding ? "" : compact ? "p-4" : "py-10",
        className,
      )}
    >
      <Empty
        className={cn(
          "w-full rounded-2xl flex items-center justify-center",
          compact
            ? "gap-4 md:p-4 bg-muted/80 text-muted-foreground"
            : "py-12 max-w-lg",
        )}
      >
        <EmptyHeader
          className={cn("text-center space-y-0", compact ? "" : "gap-2")}
        >
          <EmptyMedia
            variant="icon"
            className={cn(
              "flex items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto",
              compact ? "h-10 w-10" : "h-16 w-16 mb-2",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-2xl",
                compact ? "h-12 w-12 p-2" : "h-20 w-20 p-4",
              )}
              style={{ fontSize: 0 }}
            >
              {React.isValidElement(resolvedIcon) ? (
                React.cloneElement(
                  resolvedIcon as React.ReactElement<Record<string, unknown>>,
                  {
                    className: compact ? "h-7 w-7" : "h-10 w-10",
                    size: undefined,
                    style: { width: "100%", height: "100%" },
                  },
                )
              ) : (
                <IconDisplay
                  icon={resolvedIcon}
                  className={compact ? "h-7 w-7" : "h-10 w-10"}
                />
              )}
            </div>
          </EmptyMedia>

          <EmptyTitle className="text-lg font-semibold text-foreground">
            {title}
          </EmptyTitle>

          {description ? (
            <EmptyDescription className="text-sm text-muted-foreground max-w-md mx-auto">
              {description}
            </EmptyDescription>
          ) : null}
        </EmptyHeader>

        {action ? (
          <EmptyContent
            className={cn("flex justify-center", compact ? "" : "mt-6")}
          >
            {action}
          </EmptyContent>
        ) : null}
      </Empty>
    </div>
  );
}
