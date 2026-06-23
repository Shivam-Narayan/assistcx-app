import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { InfoIconWithMessage } from "@/components/InfoIconWithMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { errorMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  reprocessformSchema,
  reprocessSchemaType,
} from "@/lib/schemas/inbox-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface RetryTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachmentId: string;
  setIsReprocessing: (isReprocessing: boolean) => void;
}

export function ReprocessAttachmentModal({
  open,
  onOpenChange,
  attachmentId,
  setIsReprocessing,
}: RetryTaskProps) {
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoading, setLoading] = useState(false);

  const form = useForm<reprocessSchemaType>({
    resolver: zodResolver(reprocessformSchema),
    defaultValues: {
      instructions: "",
    },
    mode: "onChange",
  });

  // //===================[Function: Reset Form Details] ==========================//
  const handleResetForm = () => {
    form.reset();
  };

  async function onSubmit(values: reprocessSchemaType) {
    const payload = {
      instructions: values.instructions?.trim() || "",
    };

    setIsReprocessing(true);
    onOpenChange(false);
    handleResetForm();

    (async () => {
      if (!loading) {
        try {
          setLoading(true);
          toast.success("Attachment reprocessing initiated...");
          const result = await axiosAuth.post(
            `${url.REPROCESS_ATTACHMENT}/${attachmentId}/reprocess`,
            payload
          );
        } catch (error: any) {
          errorMessageHandler(error.message);
        } finally {
          setIsReprocessing(false);
          setLoading(false);
        }
      }
    })();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col sm:max-w-[425px] p-0 overflow-auto gap-2"
        onCloseAutoFocus={handleResetForm}
      >
        <DialogHeader className="sticky top-0 z-10 flex px-4 py-3 flex-row justify-between items-center space-y-0 bg-background">
          <div className="w-full">
            <DialogTitle>Reprocess Attachment</DialogTitle>
          </div>
          <DialogClose>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary"
              onClick={(e) => onOpenChange(false)}
            >
              <X />
            </div>
          </DialogClose>
        </DialogHeader>

        <div className="grow">
          <div className="px-4">
            <p>
              Are you sure you want to reprocess this attachment? You can also
              provide additional instructions for the agent to ensure better
              handling.
            </p>
          </div>
        </div>

        <div className="grow">
          <div className="px-4 py-2 items-center">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground gap-1">
                        Instructions
                        <InfoIconWithMessage content="These instructions will be provided to the agent to improve task execution during reprocessing attempts" />
                      </FormLabel>
                      <FormControl>
                        <AutoGrowingTextarea
                          placeholder="Enter instructions"
                          maxLength={800}
                          rows={3}
                          {...field}
                          maxHeight={100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
        <DialogFooter className="px-4 py-3 pb-6 bg-background">
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
            className="cursor-pointer"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
