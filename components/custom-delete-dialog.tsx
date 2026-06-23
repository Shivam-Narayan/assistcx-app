import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface CustomAlertDialogProps {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  handleAlert: (data: string) => void;
  isLoading?: boolean | undefined;
  deleteButtonText?: string;
}

const CustomDeleteDialog = ({
  open,
  title,
  description,
  onOpenChange,
  handleAlert,
  isLoading,
  deleteButtonText,
}: CustomAlertDialogProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset confirmation when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsConfirmed(false);
    }
  }, [open]);

  const handleDeleteClick = () => {
    handleAlert("Continue");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        onPointerDown={(e: any) => e.preventDefault()}
        onClick={(e: any) => e.preventDefault()}
      >
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertDialogTitle className="text-lg font-semibold">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Confirmation Checkbox */}
        <div
          className="flex items-start gap-3 py-4"
          onClick={() => setIsConfirmed((prev) => !prev)}
        >
          <Checkbox
            id="delete-confirm"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked === true)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 cursor-pointer"
          />
          <label
            htmlFor="delete-confirm"
            className="text-sm leading-5 cursor-pointer"
          >
            I understand this action cannot be undone
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            disabled={!isConfirmed || isLoading}
            className="cursor-pointer"
          >
            {isLoading != undefined && isLoading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {deleteButtonText || "Delete Permanently"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomDeleteDialog;
