"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import FileUpload from "./file-upload";

interface UploadFilePopupProps {
  isPopupOpen: boolean;
  setIsPopupOpen: (isOpen: boolean) => void;
  onUploadSuccess?: () => void;
}
export default function UploadFilePopup({
  isPopupOpen,
  setIsPopupOpen,
  onUploadSuccess,
}: UploadFilePopupProps) {
  return (
    <div className="space-y-4 w-full relative">
      <Dialog open={isPopupOpen} onOpenChange={() => setIsPopupOpen(false)}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl p-0 overflow-hidden [&_[data-dialog-close]]:hidden">
          <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="flex items-center justify-between p-4 border-b bg-white z-10">
              <DialogTitle className="text-lg font-semibold">
                Upload Files
              </DialogTitle>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPopupOpen(false)}
                  className="h-8 w-8 p-0 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col h-full overflow-y-auto max-h-[60vh]">
              <FileUpload
                setIsPopupOpen={setIsPopupOpen}
                onUploadSuccess={onUploadSuccess}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
