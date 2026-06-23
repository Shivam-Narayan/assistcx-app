import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToolCall } from "@/types/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { JsonEditor } from "./json-editor";

interface EditActionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  call?: ToolCall;
  value: string;
  onChange: (val: string) => void;
  onUpdate: () => void;
  isValid: boolean;
  setJsonValidity: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  editingCallId: string | null;
  handleCancel: () => void;
  setEditingCallId: (id: string | null) => void;
}

export const EditAction = ({
  isOpen,
  onOpenChange,
  call,
  value,
  onChange,
  onUpdate,
  isValid,
  setJsonValidity,
  editingCallId,
  handleCancel,
}: EditActionProps) => {
  if (!call) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) handleCancel();
      }}
    >
      <DialogContent className="flex flex-col max-w-[50%] sm:max-w-sm md:max-w-4xl overflow-hidden p-0 gap-2">
        <DialogHeader className="sticky top-0 z-10 flex px-4 py-3 flex-row justify-between items-center bg-background border-b">
          <div className="w-full flex flex-col gap-2">
            <DialogTitle>{call.function.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Edit the JSON input for the tool call and click update to save
              changes.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <button className="p-1 rounded-md hover:bg-secondary transition cursor-pointer">
              <X />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="p-4">
          <JsonEditor
            value={value}
            onChange={onChange}
            wrapMode="wrap"
            onValidJson={() =>
              editingCallId &&
              setJsonValidity((prev) => ({ ...prev, [editingCallId]: true }))
            }
            onInvalidJson={() =>
              editingCallId &&
              setJsonValidity((prev) => ({ ...prev, [editingCallId]: false }))
            }
            minHeight={300}
          />
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              handleCancel();
            }}
          >
            Cancel
          </Button>
          <Button onClick={onUpdate} disabled={!isValid}>
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
