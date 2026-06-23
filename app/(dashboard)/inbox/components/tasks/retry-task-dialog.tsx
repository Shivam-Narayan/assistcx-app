import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { InfoIconWithMessage } from "@/components/InfoIconWithMessage";
import TextareaWithActions from "@/components/textarea-with-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { errorMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  retryTaskformSchema,
  RetryTaskFormSchemaType,
} from "@/lib/schemas/inbox-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface RetryTaskProps {
  open: boolean;
  retryTaskDetails: any;
  onOpenChange: (open: boolean) => void;
  onRetrySuccess?: () => void;
}

export function RetryTaskDialog({
  open,
  onOpenChange,
  retryTaskDetails,
  onRetrySuccess,
}: RetryTaskProps) {
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoading, setLoading] = useState(false);

  const form = useForm<RetryTaskFormSchemaType>({
    resolver: zodResolver(retryTaskformSchema),
    defaultValues: {
      note: "",
    },
    mode: "onChange",
  });

  // //===================[Function: Reset Form Details] ==========================//
  const handleResetForm = () => {
    form.reset();
  };

  //===================[Function: Submit Retry Task Details] ==========================//
  async function onSubmit(values: RetryTaskFormSchemaType) {
    if (!loading) {
      const requestBody = {
        note: values?.note?.trim(),
      };

      try {
        setLoading(true);
        const result = await axiosAuth.post(
          `${url.RETRY_TASK}/${retryTaskDetails.agent_task_id}/retry/${retryTaskDetails.agent_id}`,
          requestBody,
        );
        if (result?.status === 200) {
          const message = result?.data?.message;
          toast.success(message, {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
          onOpenChange(false);
          setLoading(false);
          onRetrySuccess?.();
        } else {
          setLoading(false);
        }
      } catch (error: any) {
        errorMessageHandler(error.message);
        setLoading(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col sm:max-w-lg p-0 overflow-auto gap-2"
        onCloseAutoFocus={handleResetForm}
      >
        <DialogHeader className="sticky top-0 z-10 flex flex-row justify-between items-start space-y-0 bg-background px-4 pt-4">
          <div className="w-full flex flex-col gap-2">
            <DialogTitle>Retry Task</DialogTitle>
            <DialogDescription>
              Add instructions to guide the retry process and generate improved
              results.
            </DialogDescription>
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
          <div className="px-4 py-2 items-center">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <AutoGrowingTextarea
                          placeholder="Enter agent instructions"
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
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
            className="w-full cursor-pointer"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Retry Task Execution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
