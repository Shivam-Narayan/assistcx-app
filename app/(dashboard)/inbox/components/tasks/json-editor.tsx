"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const LINE_PX = 24;
const EDITOR_PAD_PX = 16;
const FONT_SIZE = 13;
const FONT_FAMILY =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const GUTTER_WIDTH = 44;

const LINE_CLASS =
  "shrink-0 text-right font-mono text-xs tabular-nums leading-6 text-muted-foreground select-none flex items-start justify-end pr-1";

let _canvas: HTMLCanvasElement | null = null;
function getCanvas(): CanvasRenderingContext2D {
  if (!_canvas) _canvas = document.createElement("canvas");
  const ctx = _canvas.getContext("2d")!;
  ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  return ctx;
}

function visualRowsForLine(line: string, availableWidth: number): number {
  if (availableWidth <= 0) return 1;
  if (line.length === 0) return 1;
  const ctx = getCanvas();
  const textWidth = ctx.measureText(line).width;
  return Math.max(1, Math.ceil(textWidth / availableWidth));
}

function trimJsonBounds(s: string): { start: number; end: number } {
  let a = 0;
  let b = s.length;
  while (a < b && /\s/.test(s[a])) a++;
  while (b > a && /\s/.test(s[b - 1])) b--;
  return { start: a, end: b };
}

function getJsonParseError(str: string): string | null {
  const { start, end } = trimJsonBounds(str);
  const trimmed = str.slice(start, end);
  if (!trimmed) return null;

  try {
    JSON.parse(trimmed);
    return null;
  } catch (e) {
    const msg = (e as Error).message ?? "Invalid JSON syntax.";
    const posMatch = msg.match(/position (\d+)/i);
    const posInTrimmed = posMatch ? parseInt(posMatch[1], 10) : -1;

    if (posInTrimmed >= 0 && posInTrimmed <= trimmed.length) {
      const absPos = start + Math.min(posInTrimmed, trimmed.length);
      const before = str.slice(0, absPos);
      const line = before.split("\n").length;

      let friendlyMsg = "Invalid JSON format";
      if (msg.includes("Expected ':'") || msg.includes("after property name"))
        friendlyMsg = "Missing colon (:) after key or bracket";
      else if (
        msg.includes("Expected ',' or '}'") ||
        msg.includes("Expected ',' or ']'")
      )
        friendlyMsg = "Missing comma or bracket";
      else if (msg.includes("Unexpected token"))
        friendlyMsg = "Unexpected character found";
      else if (msg.includes("Unexpected end"))
        friendlyMsg = "Incomplete JSON structure";

      return `Line ${line}: ${friendlyMsg}`;
    }
    return "Invalid JSON format";
  }
}

function getSyntaxErrorLine(value: string): number | null {
  const { start, end } = trimJsonBounds(value);
  const trimmed = value.slice(start, end);
  if (!trimmed) return null;
  try {
    JSON.parse(trimmed);
    return null;
  } catch (e) {
    const posMatch = (e as Error).message.match(/position (\d+)/i);
    const posInTrimmed = posMatch ? parseInt(posMatch[1], 10) : 0;
    const clamped = Math.min(Math.max(0, posInTrimmed), trimmed.length);
    const absPos = start + clamped;
    const before = value.slice(0, absPos);
    return before.split("\n").length;
  }
}

export interface JsonEditorError {
  index: number;
  message: string;
}

export interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  externalErrors?: JsonEditorError[];
  minHeight?: number;
  maxHeight?: number;
  placeholder?: string;
  className?: string;
  wrapMode?: "nowrap" | "wrap";
  onValidJson?: (parsed: unknown) => void;
  onInvalidJson?: () => void;
}

export function JsonEditor({
  value,
  onChange,
  externalErrors = [],
  minHeight = 280,
  maxHeight = 440,
  placeholder = '[\n  { "key": "value" }\n]',
  className,
  wrapMode = "wrap",
  onValidJson,
  onInvalidJson,
}: JsonEditorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);

  const onValidJsonRef = useRef(onValidJson);
  const onInvalidJsonRef = useRef(onInvalidJson);
  onValidJsonRef.current = onValidJson;
  onInvalidJsonRef.current = onInvalidJson;

  const measureWidth = useCallback(() => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.clientWidth - GUTTER_WIDTH - 24;
    setAvailableWidth(Math.max(0, w));
  }, []);

  useEffect(() => {
    measureWidth();
    const ro = new ResizeObserver(measureWidth);
    if (scrollRef.current) ro.observe(scrollRef.current);
    return () => ro.disconnect();
  }, [measureWidth]);

  const syntaxError = useMemo(
    () => (value.trim() ? getJsonParseError(value) : null),
    [value],
  );

  const errorLine = useMemo(
    () => (value.trim() ? getSyntaxErrorLine(value) : null),
    [value],
  );

  useEffect(() => {
    if (!syntaxError && value.trim()) {
      try {
        onValidJsonRef.current?.(JSON.parse(value.trim()));
      } catch {}
    } else if (syntaxError) {
      onInvalidJsonRef.current?.();
    }
  }, [value, syntaxError]);

  const lines = useMemo(
    () => (value.length === 0 ? [""] : value.split("\n")),
    [value],
  );

  const visualRows = useMemo<number[]>(() => {
    if (wrapMode === "nowrap" || availableWidth === 0) {
      return lines.map(() => 1);
    }
    return lines.map((line) => visualRowsForLine(line, availableWidth));
  }, [lines, wrapMode, availableWidth]);

  const totalVisualRows = useMemo(
    () => visualRows.reduce((s, r) => s + r, 0),
    [visualRows],
  );

  const innerHeightPx = useMemo(() => {
    const contentH = EDITOR_PAD_PX + totalVisualRows * LINE_PX;
    return Math.max(minHeight, contentH);
  }, [totalVisualRows, minHeight]);

  const taWidthCh = useMemo(() => {
    if (wrapMode === "wrap") return undefined;
    const maxLen = lines.reduce((m, l) => Math.max(m, l.length), 0);
    return Math.max(maxLen + 6, 52);
  }, [lines, wrapMode]);

  const errorMessage: string | null = useMemo(() => {
    if (syntaxError) return syntaxError;
    const topLevel = externalErrors.find((e) => e.index === -1);
    if (topLevel) return topLevel.message;
    const first = externalErrors.find((e) => e.index >= 0);
    if (first) return `Item ${first.index + 1}: ${first.message}`;
    return null;
  }, [syntaxError, externalErrors]);

  const hasError = !!errorMessage;
  const lineCount = lines.length;

  return (
    <Card
      className={cn(
        "overflow-hidden py-0 shadow-sm",
        hasError && "ring-1 ring-destructive/50",
        className,
      )}
    >
      <CardContent className="flex flex-col gap-0 p-0">
        <div
          ref={scrollRef}
          className={cn(
            "rounded-t-xl border-b border-border/60 bg-muted/20",
            wrapMode === "wrap"
              ? "overflow-x-hidden overflow-y-auto"
              : "overflow-auto",
          )}
          style={{ maxHeight, minHeight }}
        >
          <div
            className={cn("flex", wrapMode === "nowrap" && "w-max min-w-full")}
            style={{ minHeight: innerHeightPx }}
          >
            <div
              className="shrink-0 border-r border-border/60 bg-muted/40 py-2 pl-2 pr-1"
              style={{ width: GUTTER_WIDTH, minHeight: innerHeightPx }}
              aria-hidden
            >
              {lines.map((_, i) => {
                const lineNum = i + 1;
                const isErrorLine = !!syntaxError && errorLine === lineNum;
                const rowH = (visualRows[i] ?? 1) * LINE_PX;

                return (
                  <div
                    key={i}
                    className={LINE_CLASS}
                    style={{ height: rowH, minHeight: LINE_PX }}
                  >
                    <span
                      className={cn(
                        "mt-0", // align to top of the block
                        isErrorLine &&
                          "rounded-sm bg-red-100 px-0.5 font-semibold text-red-600",
                      )}
                      title={
                        isErrorLine ? (syntaxError ?? undefined) : undefined
                      }
                    >
                      {lineNum}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className="relative box-border min-h-0 min-w-0 flex-1"
              style={{
                minHeight: innerHeightPx,
                ...(taWidthCh ? { minWidth: `${taWidthCh}ch` } : {}),
              }}
            >
              <Textarea
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                style={{ height: innerHeightPx, width: "100%" }}
                className={cn(
                  "box-border min-h-0 w-full resize-none overflow-hidden rounded-none border-0 bg-transparent py-2 pl-3 pr-3 font-mono text-sm leading-6 text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  wrapMode === "wrap"
                    ? "whitespace-pre-wrap break-all"
                    : "whitespace-pre",
                )}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-border/60 px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">
              {lineCount} line{lineCount !== 1 ? "s" : ""}
            </span>
            {syntaxError && errorLine && (
              <span className="text-muted-foreground">
                · error at{" "}
                <span className="font-mono text-foreground">L{errorLine}</span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 text-xs leading-snug sm:text-right">
            {errorMessage && (
              <p className="text-destructive" title={errorMessage}>
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
