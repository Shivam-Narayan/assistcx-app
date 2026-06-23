"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { Paperclip, X } from "lucide-react";
import { SelectedAttachmentDialogProps } from "./types";

export function SelectedAttachmentDialog({
  open,
  onOpenChange,
  selectedAttachment,
  onRemove,
}: SelectedAttachmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl p-0 overflow-hidden [&_[data-dialog-close]]:hidden min-h-[]">
        <div className="flex items-center justify-between p-4 border-b bg-white z-10">
          <div className="sm:text-lg font-semibold flex items-center gap-3">
            <DialogTitle className="text-lg font-semibold">
              Selected Attachment Collection
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4 pb-4 min-h-40 max-h-60vh  overflow-y-auto">
          {selectedAttachment.length > 0 ? (
            <div className="flex flex-wrap gap-2 pb-2 ">
              {selectedAttachment.map((file, index) => (
                <div
                  key={index}
                  className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                >
                  <Paperclip className="size-4" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <div
                    onClick={() => onRemove(file)}
                    className="hover:bg-secondary/50 rounded-full p-1 cursor-pointer"
                  >
                    <X className="size-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full bg-secondary flex justify-center items-center gap-2 rounded-lg px-5 py-5 text-sm max-w-full min-h-full">
              <p className="text-lg">No Attchment selected</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
