"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TableLockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLocked: boolean;
  onConfirm: (locked: boolean) => Promise<boolean>;
}

export function TableLockDialog({
  open,
  onOpenChange,
  isLocked,
  onConfirm,
}: TableLockDialogProps) {
  const [pendingLocked, setPendingLocked] = useState(isLocked);
  const [isApplying, setIsApplying] = useState(false);
  const hasChanged = pendingLocked !== isLocked;

  useEffect(() => {
    if (open) setPendingLocked(isLocked);
  }, [open, isLocked]);

  const handleClose = () => {
    if (isApplying) return;
    setPendingLocked(isLocked);
    onOpenChange(false);
  };

  const handleApply = async () => {
    if (!hasChanged || isApplying) return;
    setIsApplying(true);
    try {
      const success = await onConfirm(pendingLocked);
      if (success) onOpenChange(false);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <DialogHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold leading-none">
            Table protection
          </DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={handleClose}
              disabled={isApplying}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>
              When this table is <strong>locked</strong>, it becomes read-only:
              no cell edits, row or column changes, or imports. Viewing, search,
              filters, and export still work. Unlock when you need to edit
              again.
            </p>
          </div>

          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors",
              pendingLocked
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-muted/30",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  pendingLocked
                    ? "bg-destructive/10 text-destructive"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                )}
              >
                {pendingLocked ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {pendingLocked ? "Locked" : "Unlocked"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {pendingLocked
                    ? "Editing is disabled for everyone"
                    : "Authorized users can edit this table"}
                </span>
              </div>
            </div>

            <Switch
              checked={pendingLocked}
              onCheckedChange={setPendingLocked}
              disabled={isApplying}
              className="cursor-pointer data-[state=checked]:bg-destructive"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 border-t px-4 py-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isApplying}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!hasChanged || isApplying}
            className="cursor-pointer"
          >
            {isApplying && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
