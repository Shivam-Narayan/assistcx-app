"use client";

import CopyToClipboard from "@/components/copy-to-clipboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UTCToLocalTimezon } from "@/helper/helper-function";
import { DialogClose } from "@radix-ui/react-dialog";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  Cpu,
  X,
  Zap,
} from "lucide-react";
import React from "react";

export interface TokenUsageDetail {
  node: string;
  tool_call: string | null;
  tool_call_id: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  timestamp: string;
}

export interface TokenUsagePayload {
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  llm_calls_count: number;
  token_details: TokenUsageDetail[];
}

interface TaskTokenUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string | undefined;
  creditsUsed?: number | null;
  tokenUsage?: TokenUsagePayload | null;
}

function formatTokenCount(count: number) {
  return count.toLocaleString();
}

function calculatePercentage(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function TaskTokenUsageDialog({
  open,
  onOpenChange,
  creditsUsed,
  tokenUsage,
}: TaskTokenUsageDialogProps) {
  const data: TokenUsagePayload | null = tokenUsage ? tokenUsage : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="sticky top-0 z-10 flex flex-row justify-between items-center px-4 py-3 border-b space-y-0 bg-background">
          <DialogTitle className="text-lg font-medium">Token Usage</DialogTitle>
          <div className="flex items-center gap-2">
            {creditsUsed !== undefined && creditsUsed !== null && (
              <div className="flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs text-muted-foreground">
                <Coins className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                Credits Used : {creditsUsed}
              </div>
            )}
            <DialogClose>
              <div className="p-1 rounded-md cursor-pointer hover:bg-secondary">
                <X className="h-5 w-5" />
              </div>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-5 pt-4 pb-4 border-b">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={
                <ArrowDownToLine className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              }
              label="Input"
              value={formatTokenCount(data?.total_input_tokens || 0)}
            />
            <StatCard
              icon={
                <ArrowUpFromLine className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              }
              label="Output"
              value={formatTokenCount(data?.total_output_tokens || 0)}
            />
            <StatCard
              icon={
                <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              }
              label="Total"
              value={formatTokenCount(data?.total_tokens || 0)}
            />
            <StatCard
              icon={
                <Cpu className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              }
              label="LLM Calls"
              value={String(data?.llm_calls_count || 0)}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <h3 className="text-sm font-medium">Breakdown</h3>
            <span className="text-xs text-muted-foreground">
              {data?.token_details?.length} step
              {data?.token_details?.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {data?.token_details && data.token_details.length > 0 && (
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-5">
            <div className="space-y-3">
              {data?.token_details.map((row, idx) => {
                const stepPercentage = calculatePercentage(
                  row.total_tokens,
                  data?.total_tokens,
                );
                const inputPercentage = calculatePercentage(
                  row.input_tokens,
                  row.total_tokens,
                );
                const outputPercentage = calculatePercentage(
                  row.output_tokens,
                  row.total_tokens,
                );

                return (
                  <div
                    key={`${row.tool_call_id}-${idx}`}
                    className="rounded-lg border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {row.tool_call ?? row.node}
                        </p>
                        {row.tool_call_id && (
                          <div className="mt-0.5">
                            <ToolCallIdRow id={row.tool_call_id} />
                          </div>
                        )}
                      </div>
                      {row.timestamp && (
                        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                          {UTCToLocalTimezon(row.timestamp)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 px-3 py-2">
                        <span className="text-[10px] uppercase tracking-wider text-blue-500 dark:text-blue-400">
                          Input
                        </span>
                        <p className="text-base font-semibold tabular-nums tracking-tight mt-0.5">
                          {formatTokenCount(row.input_tokens)}
                          <span className="text-[11px] font-normal ml-1">
                            ({inputPercentage}%)
                          </span>
                        </p>
                      </div>
                      <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                          Output
                        </span>
                        <p className="text-base font-semibold tabular-nums tracking-tight mt-0.5">
                          {formatTokenCount(row.output_tokens)}
                          <span className="text-[11px] font-normal ml-1">
                            ({outputPercentage}%)
                          </span>
                        </p>
                      </div>
                      <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                        <span className="text-[10px] uppercase tracking-wider text-amber-500 dark:text-amber-400">
                          Total
                        </span>
                        <p className="text-base font-bold tabular-nums tracking-tight mt-0.5">
                          {formatTokenCount(row.total_tokens)}
                        </p>
                      </div>
                      <div className="rounded-md bg-muted dark:bg-muted/900 px-3 py-2">
                        <span className="text-[10px] uppercase tracking-wider">
                          Step Usage %
                        </span>
                        <p className="text-base font-bold tabular-nums tracking-tight mt-0.5">
                          {stepPercentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ToolCallIdRow({ id }: { id: string | null }) {
  if (!id) return null;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
        {id}
      </span>
      <div tabIndex={-1}>
        <CopyToClipboard text={id} tooltipLabel="Copy tool call ID" size="sm" />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5 rounded-lg border bg-card p-3">
      <div className="shrink-0 pt-px">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-muted-foreground leading-none block">
          {label}
        </span>
        <p className="text-lg font-semibold tabular-nums tracking-tight leading-tight mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}
