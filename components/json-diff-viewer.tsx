"use client";

import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

type DiffLineType = "same" | "remove" | "add";

interface DiffLine {
  type: DiffLineType;
  line: string;
  lineNumOld?: number;
  lineNumNew?: number;
}

function computeLineDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const m = oldLines.length;
  const n = newLines.length;

  const safeM = Math.min(m, 300);
  const safeN = Math.min(n, 300);
  const trimmedOld = oldLines.slice(0, safeM);
  const trimmedNew = newLines.slice(0, safeN);

  const dp: number[][] = Array.from({ length: safeM + 1 }, () =>
    new Array(safeN + 1).fill(0),
  );

  for (let i = 1; i <= safeM; i++) {
    for (let j = 1; j <= safeN; j++) {
      if (trimmedOld[i - 1] === trimmedNew[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  const result: DiffLine[] = [];
  let i = safeM;
  let j = safeN;

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      trimmedOld[i - 1] === trimmedNew[j - 1]
    ) {
      result.unshift({ type: "same", line: trimmedOld[i - 1] });
      i--;
      j--;
    } else if (
      j > 0 &&
      (i === 0 || dp[i][j - 1] >= dp[i - 1][j])
    ) {
      result.unshift({ type: "add", line: trimmedNew[j - 1] });
      j--;
    } else {
      result.unshift({ type: "remove", line: trimmedOld[i - 1] });
      i--;
    }
  }

  // Append truncated lines if capped
  if (m > safeM || n > safeN) {
    result.push({
      type: "same",
      line: `… (${Math.max(m, n) - 300} more lines truncated)`,
    });
  }

  // Attach line numbers
  let oldNum = 1;
  let newNum = 1;
  for (const line of result) {
    if (line.type === "same") {
      line.lineNumOld = oldNum++;
      line.lineNumNew = newNum++;
    } else if (line.type === "remove") {
      line.lineNumOld = oldNum++;
    } else {
      line.lineNumNew = newNum++;
    }
  }

  return result;
}

function normalizeJson(value: unknown): string {
  try {
    const parsed =
      typeof value === "string" ? JSON.parse(value) : value;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }
}

interface JsonDiffViewerProps {
  original: unknown;
  modified: unknown;
  className?: string;
  showSummary?: boolean;
  maxHeight?: string;
}

export const JsonDiffViewer: React.FC<JsonDiffViewerProps> = ({
  original,
  modified,
  className,
  showSummary = true,
  maxHeight = "400px",
}) => {
  const diffLines = useMemo(() => {
    const oldStr = normalizeJson(original);
    const newStr = normalizeJson(modified);
    if (oldStr === newStr) return null;
    return computeLineDiff(oldStr.split("\n"), newStr.split("\n"));
  }, [original, modified]);

  if (!diffLines) {
    return (
      <div className="rounded-md border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        No differences — the two values are identical.
      </div>
    );
  }

  const added = diffLines.filter((l) => l.type === "add").length;
  const removed = diffLines.filter((l) => l.type === "remove").length;

  return (
    <div className={cn("rounded-md border border-border overflow-hidden text-xs font-mono", className)}>
      {showSummary && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 border-b border-border text-[11px] font-sans">
          <span className="text-muted-foreground font-medium">Changes:</span>
          {added > 0 && (
            <span className="text-green-700 dark:text-green-400 font-semibold">
              +{added} added
            </span>
          )}
          {removed > 0 && (
            <span className="text-red-700 dark:text-red-400 font-semibold">
              -{removed} removed
            </span>
          )}
        </div>
      )}

      <div className="overflow-y-auto" style={{ maxHeight }}>
        <table className="w-full border-collapse">
          <tbody>
            {diffLines.map((diffLine, idx) => {
              const isAdd = diffLine.type === "add";
              const isRemove = diffLine.type === "remove";

              return (
                <tr
                  key={idx}
                  className={cn(
                    "group",
                    isAdd && "bg-green-50 dark:bg-green-950/30",
                    isRemove && "bg-red-50 dark:bg-red-950/30",
                  )}
                >
                  {/* Old line number */}
                  <td
                    className={cn(
                      "select-none w-10 text-right pr-2 pl-2 text-[10px] border-r border-border/60",
                      isAdd
                        ? "bg-green-100/60 dark:bg-green-900/20 text-green-700/50 dark:text-green-400/40 border-green-200 dark:border-green-900/40"
                        : isRemove
                          ? "bg-red-100/60 dark:bg-red-900/20 text-red-700/50 dark:text-red-400/40 border-red-200 dark:border-red-900/40"
                          : "bg-muted/30 text-muted-foreground/40",
                    )}
                  >
                    {diffLine.lineNumOld ?? ""}
                  </td>

                  {/* New line number */}
                  <td
                    className={cn(
                      "select-none w-10 text-right pr-2 pl-1 text-[10px] border-r border-border/60",
                      isAdd
                        ? "bg-green-100/60 dark:bg-green-900/20 text-green-700/50 dark:text-green-400/40 border-green-200 dark:border-green-900/40"
                        : isRemove
                          ? "bg-red-100/60 dark:bg-red-900/20 text-red-700/50 dark:text-red-400/40 border-red-200 dark:border-red-900/40"
                          : "bg-muted/30 text-muted-foreground/40",
                    )}
                  >
                    {diffLine.lineNumNew ?? ""}
                  </td>

                  {/* Gutter marker */}
                  <td
                    className={cn(
                      "select-none w-5 text-center text-[11px] font-bold border-r border-border/60",
                      isAdd
                        ? "text-green-600 dark:text-green-400 bg-green-100/80 dark:bg-green-900/30 border-green-200 dark:border-green-900/40"
                        : isRemove
                          ? "text-red-600 dark:text-red-400 bg-red-100/80 dark:bg-red-900/30 border-red-200 dark:border-red-900/40"
                          : "text-transparent bg-muted/30",
                    )}
                  >
                    {isAdd ? "+" : isRemove ? "-" : " "}
                  </td>

                  {/* Line content */}
                  <td
                    className={cn(
                      "px-3 py-0.5 whitespace-pre-wrap break-all",
                      isAdd
                        ? "text-green-900 dark:text-green-200"
                        : isRemove
                          ? "text-red-900 dark:text-red-200"
                          : "text-foreground",
                    )}
                  >
                    {diffLine.line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
