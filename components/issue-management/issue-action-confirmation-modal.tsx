import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, RotateCcw, X } from "lucide-react";
import { useForm } from "react-hook-form";
import AutoGrowingTextarea from "../auto-grow-textarea";
import {
  IssueActionFormType,
  issueActionSchema,
} from "@/lib/schemas/issue-management-schema";

type ActionType = "resolved" | "ACTIVE";

interface IssueActionConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ActionType;
  issueTitle: string;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

export const IssueActionConfirmationModal = ({
  isOpen,
  onOpenChange,
  actionType,
  issueTitle,
  onConfirm,
  loading,
}: IssueActionConfirmationModalProps) => {
  const actionForm = useForm<IssueActionFormType>({
    resolver: zodResolver(issueActionSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleClose = () => {
    actionForm.reset();
    onOpenChange(false);
  };

  const handleSubmitForm = (data: IssueActionFormType) => {
    onConfirm(data.reason);
    handleClose();
  };

  const isResolve = actionType === "resolved";
  const actionContent = isResolve ? (
    <>
      <CheckCircle2 className="w-4 h-4" /> Resolve
    </>
  ) : (
    <>
      <RotateCcw className="w-4 h-4" /> Reopen
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col sm:max-w-xl p-0 overflow-auto gap-2"
        onCloseAutoFocus={handleClose}
      >
        <DialogHeader className="sticky top-0 z-10 flex px-4 py-3 flex-row justify-between items-center space-y-0 bg-background">
          <DialogTitle className="flex items-center gap-2">
            {isResolve ? "Resolve " : "Reopen "} Issue
          </DialogTitle>
          <DialogClose>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary"
              onClick={handleClose}
            >
              <X className="w-5 h-5" />
            </div>
          </DialogClose>
        </DialogHeader>

        <DialogDescription className="px-4 text-sm text-muted-foreground">
          {isResolve
            ? "Are you sure you want to mark this issue as resolved?"
            : "Are you sure you want to reopen this issue?"}
        </DialogDescription>
        <Form {...actionForm}>
          <form
            onSubmit={actionForm.handleSubmit(handleSubmitForm)}
            className="px-4 py-2 space-y-4"
          >
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {issueTitle}
              </p>
            </div>

            <FormField
              control={actionForm.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground required">
                    Note
                  </FormLabel>

                  <FormControl>
                    <AutoGrowingTextarea
                      placeholder={
                        isResolve
                          ? "Describe how the issue was resolved..."
                          : "Explain why this issue needs to be reopened..."
                      }
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="px-0 py-3 gap-2 bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className={
                  isResolve
                    ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                    : "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                }
              >
                {actionContent}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueActionConfirmationModal;
