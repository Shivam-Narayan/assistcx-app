"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import type { SyncStatus } from "../hook/useSyncQueue";

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  className?: string;
}

export function SyncStatusIndicator({
  status,
  className,
}: SyncStatusIndicatorProps) {
  if (status === "idle") return null;

  const isSynced = status === "saved";

  return (
    <div
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-opacity duration-300",
        isSynced
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-border bg-muted/60 text-muted-foreground",
        className,
      )}
    >
      {isSynced ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>Synced</span>
        </>
      ) : (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Syncing</span>
        </>
      )}
    </div>
  );
}
