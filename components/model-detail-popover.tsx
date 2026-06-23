"use client";

import type { ReactNode } from "react";
import IconRenderComponent from "@/components/icon-manager/icon-render-component";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export interface ModelDetailMetadata {
  speed?: number | null;
  intelligence?: number | null;
  max_tokens?: number | null;
  max_output_tokens?: number | null;
  capabilities?: string[] | null;
  provider_display_name?: string | null;
  recommended_badge?: string | null;
  [key: string]: unknown;
}

export interface ModelDetailPopoverData {
  label?: string;
  name?: string;
  value?: string;
  description?: string;
  provider?: string;
  integration_key?: string;
  model_name?: string;
  max_tokens?: string | number;
  metadata?: ModelDetailMetadata | null;
  [key: string]: unknown;
}

export interface ModelDetailPopoverProps {
  item: ModelDetailPopoverData;
  children: ReactNode;
  contentClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

/** "400K" / "1.2M" for the context line */
function compact(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function RatingSegments({ value, segments = 5 }: { value: number; segments?: number }) {
  const filled = Math.min(segments, Math.max(0, Math.round(value)));
  return (
    <div className="flex gap-0.5 shrink-0" role="img" aria-label={`${filled} of ${segments}`}>
      {Array.from({ length: segments }, (_, i) => (
        <div key={i} className={cn("h-1.5 w-4 rounded-sm", i < filled ? "bg-primary" : "bg-muted")} />
      ))}
    </div>
  );
}

export function ModelDetailPopover({
  item,
  children,
  contentClassName = "w-80 p-4",
  side = "right",
  align = "start",
}: ModelDetailPopoverProps) {
  const meta = item.metadata ?? undefined;

  const title = item.label ?? item.name ?? "-";
  const normalized = String(title).trim().toLowerCase();
  const skipPopover =
    item.value === "" || normalized === "default" || normalized === "default agent llm";

  if (skipPopover) {
    return <>{children}</>;
  }

  const provider = (meta?.provider_display_name ?? item.provider ?? item.integration_key ?? "").trim();
  const maxTokens = meta?.max_tokens ?? (typeof item.max_tokens === "number" ? item.max_tokens : null);
  const contextText =
    maxTokens != null ? `${compact(maxTokens)} tokens | ${compact(Math.round(maxTokens * 0.75))} words` : null;

  const speed = meta?.speed;
  const intelligence = meta?.intelligence;
  const caps = meta?.capabilities ?? [];

  const showMetrics =
    (typeof speed === "number" && Number.isFinite(speed)) ||
    (typeof intelligence === "number" && Number.isFinite(intelligence)) ||
    provider.length > 0 ||
    contextText != null;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className={contentClassName} side={side} align={align}>
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                <IconRenderComponent
                  iconName={item.provider ?? item.integration_key ?? "local"}
                  category="ai_icons"
                  size={16}
                />
              </div>
              <h4 className="text-sm font-semibold">{title}</h4>
              {meta?.recommended_badge && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {String(meta.recommended_badge)}
                </Badge>
              )}
            </div>
            {item.description ? (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
            ) : null}
          </div>

          {showMetrics ? (
            <div className="space-y-2 text-xs">
              {typeof speed === "number" && Number.isFinite(speed) ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground">Speed</span>
                  <RatingSegments value={speed} />
                </div>
              ) : null}
              {typeof intelligence === "number" && Number.isFinite(intelligence) ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground">Intelligence</span>
                  <RatingSegments value={intelligence} />
                </div>
              ) : null}
              {provider ? (
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-foreground shrink-0">Provider</span>
                  <span className="font-medium text-right text-foreground">{provider}</span>
                </div>
              ) : null}
              {contextText ? (
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-foreground shrink-0">Context</span>
                  <span className="font-medium text-right text-foreground">{contextText}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {caps.length > 0 ? (
            <div className="space-y-1.5 border-t pt-1">
              <span className="text-xs font-semibold text-foreground">Capabilities</span>
              <div className="flex flex-wrap gap-1 pt-1">
                {caps.map((raw, i) => (
                  <Badge key={`${raw}-${i}`} variant="outline" className="text-[10px] font-normal">
                    {raw
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                      .join(" ")}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
