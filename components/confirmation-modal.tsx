import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";

interface ConfrimationProps {
  open: boolean;
  title: string;
  description?: string;
  cancel: () => void;
  confirm: () => void;
  customContent?: ReactNode;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  title,
  description,
  cancel,
  confirm,
  customContent,
  isLoading: externalLoading,
}: ConfrimationProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isLoading) cancel();
  };

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await confirm();
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {customContent && (
          <AlertDialogDescription asChild>
            <div>{customContent}</div>
          </AlertDialogDescription>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            type="button"
            onClick={cancel}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {customContent ? "Discard" : "Continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
