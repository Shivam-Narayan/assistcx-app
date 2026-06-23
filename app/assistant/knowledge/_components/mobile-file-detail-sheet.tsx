"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/assistant-sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import FileViewer from "./file-viewer";
import { MobileFileDetailSheetProps } from "./types";

export function MobileFileDetailSheet({
  open,
  onOpenChange,
  selectedFile,
}: MobileFileDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[90%] p-0 gap-0 z-50 overflow-auto break-all">
        <SheetHeader className="!gap-0 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white sticky top-0 z-10">
          <div className="w-full sm:w-auto md:flex gap-6">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <SheetTitle className="text-lg font-medium">
                {selectedFile?.name || "File Details"}
              </SheetTitle>
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer h-8 w-8 sm:hidden"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer h-9 w-9 hidden sm:flex"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        {open && <FileViewer fileData={selectedFile} />}
      </SheetContent>
    </Sheet>
  );
}
