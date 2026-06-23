"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain01Icon, FlashIcon } from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { LLMToolSelectorProps } from "@/types/types";
import IconRenderComponent from "../icon-manager/icon-render-component";

// Radix Select requires non-empty string values for items.
const EMPTY_VALUE_SENTINEL = "__llm_default__";

// ─── Utilities ───────────────────────────────────────────────────────────────

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    const val = tokens / 1_000_000;
    return val % 1 === 0 ? `${val}M` : `${val.toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    const val = tokens / 1_000;
    return val % 1 === 0 ? `${val}K` : `${val.toFixed(0)}K`;
  }
  return `${tokens}`;
}

function formatLabel(str: string): string {
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type ItemMeta = {
  speed: number;
  intelligence: number;
  maxTokens: number;
  maxOutputTokens: number;
  capabilities: string[];
  provider: string;
};

export function extractMeta(item: Record<string, any>): ItemMeta {
  const meta = item.metadata;
  return {
    speed: meta?.speed ?? 0,
    intelligence: meta?.intelligence ?? 0,
    maxTokens:
      meta?.max_tokens ??
      (typeof item.max_tokens === "number" ? item.max_tokens : 0),
    maxOutputTokens: meta?.max_output_tokens ?? 0,
    capabilities: meta?.capabilities ?? [],
    provider: (
      meta?.provider_display_name ??
      item.provider ??
      item.integration_key ??
      ""
    ).trim(),
  };
}

// ─── Metric visuals ──────────────────────────────────────────────────────────

export function MetricCircle({
  type,
  value,
  max = 5,
}: {
  type: "speed" | "intelligence";
  value: number;
  max?: number;
}) {
  const clamped = Math.max(0, Math.min(max, Math.round(value)));
  const icon = type === "speed" ? FlashIcon : AiBrain01Icon;
  const activeClass = type === "speed" ? "bg-orange-500" : "bg-blue-500";
  const iconClass = type === "speed" ? "!text-orange-600" : "!text-blue-600";

  return (
    <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
      {Array.from({ length: max }).map((_, idx) => (
        <span
          key={idx}
          className={cn(
            "absolute h-[2px] w-[6px] rounded-full",
            idx < clamped ? activeClass : "bg-muted-foreground/25",
          )}
          style={{
            transform: `rotate(${idx * (360 / max)}deg) translateY(-8px)`,
          }}
          aria-hidden
        />
      ))}
      <HugeiconsIcon
        icon={icon}
        style={{ pointerEvents: "none", width: 10, height: 10 }}
        className={cn("relative z-10", iconClass)}
      />
    </div>
  );
}

export function ScoreBar({
  value,
  max = 5,
  activeClass,
}: {
  value: number;
  max?: number;
  activeClass: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-5 rounded-full",
            i < value ? activeClass : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

// ─── Info card (shown on hover) ──────────────────────────────────────────────

function LlmModelInfoCard({ item }: { item: Record<string, any> }) {
  const meta = extractMeta(item);
  const hasTokens = meta.maxTokens > 0 || meta.maxOutputTokens > 0;
  const hasScores = meta.intelligence > 0 || meta.speed > 0;
  const hasCaps = meta.capabilities.length > 0;
  const title = item.label ?? item.name ?? "-";

  return (
    <div className="w-72 space-y-3 p-4">
      <div className="flex items-start gap-2.5">
        <div className="bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <IconRenderComponent
            iconName={item.provider || item.integration_key}
            category="ai_icons"
            size={18}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm leading-snug font-semibold">
            {title}
          </p>
          {meta.provider && (
            <p className="text-muted-foreground text-[11px] font-medium">
              {formatLabel(meta.provider)}
            </p>
          )}
        </div>
      </div>

      {item.description ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {item.description}
        </p>
      ) : null}

      {hasTokens ? (
        <>
          <Separator />
          <div className="space-y-1.5">
            {meta.maxTokens > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-xs font-medium">
                  Context
                </p>
                <p className="text-foreground text-xs font-semibold tabular-nums">
                  {formatTokenCount(meta.maxTokens)}
                  <span className="text-muted-foreground ml-1 font-medium">
                    tokens
                  </span>
                </p>
              </div>
            ) : null}
            {meta.maxOutputTokens > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-muted-foreground text-xs font-medium">
                  Output
                </p>
                <p className="text-foreground text-xs font-semibold tabular-nums">
                  {formatTokenCount(meta.maxOutputTokens)}
                  <span className="text-muted-foreground ml-1 font-medium">
                    tokens
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {hasScores ? (
        <>
          <Separator />
          <div className="space-y-2">
            {meta.speed > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={FlashIcon}
                    className="text-muted-foreground h-3.5 w-3.5 shrink-0"
                  />
                  <span className="text-muted-foreground text-xs">Speed</span>
                </div>
                <ScoreBar value={meta.speed} activeClass="bg-orange-400" />
              </div>
            ) : null}
            {meta.intelligence > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={AiBrain01Icon}
                    className="text-muted-foreground h-3.5 w-3.5 shrink-0"
                  />
                  <span className="text-muted-foreground text-xs">
                    Intelligence
                  </span>
                </div>
                <ScoreBar value={meta.intelligence} activeClass="bg-blue-500" />
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {hasCaps ? (
        <>
          <Separator />
          <div className="flex flex-wrap gap-1.5">
            {meta.capabilities.map((cap) => (
              <span
                key={cap}
                className="border-border bg-muted/40 text-muted-foreground rounded-full border px-2 py-0.5 text-[10px] font-medium"
              >
                {formatLabel(cap)}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Select item with hover popover ──────────────────────────────────────────

const llmSelectItemClassName = cn(
  "w-full min-w-0 pr-2 [&>span:first-child]:hidden",
  "[&>span:last-child]:min-w-0 [&>span:last-child]:w-full",
  "data-[state=checked]:bg-muted data-[state=checked]:text-foreground",
  "data-[state=checked]:focus:bg-muted data-[state=checked]:focus:text-foreground",
  "data-[state=checked]:data-[highlighted]:bg-muted data-[state=checked]:data-[highlighted]:text-foreground",
);

function LlmModelSelectItem({
  item,
  selectValue,
  isSelectOpen,
  activeHoverValue,
  onHoverStart,
  onHoverEnd,
}: {
  item: Record<string, any>;
  selectValue: string;
  isSelectOpen: boolean;
  activeHoverValue: string | null;
  onHoverStart: (value: string) => void;
  onHoverEnd: (value: string, delayMs?: number) => void;
}) {
  const meta = extractMeta(item);
  const hasDetail = !!(item.provider || item.integration_key);

  const rowContent = (
    <div className="flex w-full min-w-0 items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {hasDetail && (
          <div className="shrink-0">
            <IconRenderComponent
              iconName={item.provider || item.integration_key}
              category="ai_icons"
              size={13}
            />
          </div>
        )}
        <span className="min-w-0 truncate">{item.label}</span>
      </div>
      {hasDetail && (
        <div className="mr-[-8px] ml-auto flex w-32 shrink-0 items-center justify-end gap-2">
          {meta.maxTokens > 0 && (
            <span className="text-muted-foreground w-12 text-right text-[10px] font-medium tabular-nums">
              {formatTokenCount(meta.maxTokens)}
            </span>
          )}
          {meta.speed > 0 && <MetricCircle type="speed" value={meta.speed} />}
          {meta.intelligence > 0 && (
            <MetricCircle type="intelligence" value={meta.intelligence} />
          )}
        </div>
      )}
    </div>
  );

  if (!hasDetail) {
    return (
      <SelectItem value={selectValue} className={llmSelectItemClassName}>
        {rowContent}
      </SelectItem>
    );
  }

  return (
    <div
      onMouseEnter={() => onHoverStart(selectValue)}
      onMouseLeave={() => onHoverEnd(selectValue)}
    >
      <Popover
        open={isSelectOpen && activeHoverValue === selectValue}
        onOpenChange={(next) => {
          if (next) onHoverStart(selectValue);
          else onHoverEnd(selectValue, 0);
        }}
      >
        <PopoverAnchor asChild>
          <SelectItem value={selectValue} className={llmSelectItemClassName}>
            {rowContent}
          </SelectItem>
        </PopoverAnchor>
        <PopoverContent
          side="right"
          sideOffset={4}
          className="w-auto max-w-none p-0"
          onMouseEnter={() => onHoverStart(selectValue)}
          onMouseLeave={() => onHoverEnd(selectValue)}
          onPointerDownOutside={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
        >
          <LlmModelInfoCard item={item} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export const LLMToolSelector = ({
  items,
  value,
  onChange,
  placeholder = "Select an option",
  buttonClassName,
  disabled = false,
  popoverContentClassName,
  align,
}: LLMToolSelectorProps) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [activeHoverValue, setActiveHoverValue] = useState<string | null>(null);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    };
  }, []);

  const handleHoverStart = (valueToOpen: string) => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    setActiveHoverValue(valueToOpen);
  };

  const handleHoverEnd = (valueToClose: string, delayMs = 120) => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = setTimeout(() => {
      setActiveHoverValue((current) =>
        current === valueToClose ? null : current,
      );
    }, delayMs);
  };

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        _selectValue: item.value === "" ? EMPTY_VALUE_SENTINEL : item.value,
      })),
    [items],
  );

  const selected = value?.toString().trim() ?? "";
  const selectValue = selected === "" ? EMPTY_VALUE_SENTINEL : selected;
  const selectedItem = normalizedItems.find(
    (item) => item._selectValue === selectValue,
  );
  const selectedProvider =
    selectedItem?.provider || selectedItem?.integration_key;

  const handleValueChange = (next: string) => {
    onChange(next === EMPTY_VALUE_SENTINEL ? "" : next);
  };

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "border-border bg-muted text-muted-foreground flex min-h-8 w-full items-center rounded-md border px-3 py-2 text-xs leading-snug",
          buttonClassName,
        )}
      >
        No models available
      </div>
    );
  }

  return (
    <Select
      value={selectedItem ? selectValue : undefined}
      onValueChange={handleValueChange}
      onOpenChange={(open) => {
        setIsSelectOpen(open);
        if (!open) {
          if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
          setActiveHoverValue(null);
        }
      }}
      disabled={disabled}
    >
      <FormControl>
        <SelectTrigger className={cn("w-full", buttonClassName)}>
          <SelectValue placeholder={placeholder}>
            {selectedItem ? (
              <div className="flex min-w-0 items-center gap-1.5">
                {selectedProvider && (
                  <div className="shrink-0">
                    <IconRenderComponent
                      iconName={selectedProvider}
                      category="ai_icons"
                      size={13}
                    />
                  </div>
                )}
                <span className="min-w-0 truncate">{selectedItem.label}</span>
              </div>
            ) : undefined}
          </SelectValue>
        </SelectTrigger>
      </FormControl>
      <SelectContent
        position="popper"
        align={align}
        className={cn("max-h-80 min-w-80", popoverContentClassName)}
      >
        {normalizedItems.map((item, index) => (
          <LlmModelSelectItem
            key={`${item._selectValue}-${index}`}
            item={item}
            selectValue={item._selectValue}
            isSelectOpen={isSelectOpen}
            activeHoverValue={activeHoverValue}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
          />
        ))}
      </SelectContent>
    </Select>
  );
};
