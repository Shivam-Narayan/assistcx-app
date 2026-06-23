"use client";

import JsonViewer from "@/components/assistant/json-viewer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCopyToClipboard } from "@/helper/helper-function";
import { Check, Copy, X } from "lucide-react";
import toast from "react-hot-toast";
import { JsonViewDialogProps } from "./types";

export function JsonViewDialog({
  open,
  onOpenChange,
  data,
}: JsonViewDialogProps) {
  const [copied, copyToClipboard] = useCopyToClipboard(2000);

  // Helper function to get clean formatted JSON
  const getFormattedJson = (rawData: string): string => {
    try {
      // Keep parsing until we get an object/array, not a string
      let parsed = JSON.parse(rawData);
      while (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          break; // Stop if we can't parse further
        }
      }
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      console.error("Error formatting JSON:", error);
      return rawData;
    }
  };

  const handleCopy = async () => {
    if (!data) return;
    const formattedJson = getFormattedJson(data);
    try {
      await copyToClipboard(formattedJson);
      toast.success("Copied to clipboard", {
        duration: 1500,
        position: "top-center",
      });
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80%] sm:max-w-[80%] p-0 gap-0 overflow-hidden [&_[data-dialog-close]]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between p-4 border-b bg-white z-10">
            <DialogTitle className="text-lg font-semibold">
              Full State View
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 cursor-pointer ${
                  copied ? "text-green-600 bg-green-50 hover:bg-green-100" : ""
                }`}
                aria-label="copy"
                onClick={handleCopy}
                disabled={!data}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer"
                aria-label="close"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col h-full overflow-y-auto max-h-[60vh]">
          {data ? (
            <div className="overflow-y-auto p-4">
              <JsonViewer jsonString={getFormattedJson(data)} />
            </div>
          ) : (
            <div className="h-[40vh] flex items-center justify-center">
              No data available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
