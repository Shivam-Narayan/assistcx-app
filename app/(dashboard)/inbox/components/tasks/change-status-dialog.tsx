"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { successMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  changeStatusSchema,
  ChangeStatusSchemaType,
} from "@/lib/schemas/inbox-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const statusOptions = [
  { label: "Incomplete", value: "INCOMPLETE" },
  { label: "Successful", value: "SUCCESSFUL" },
  { label: "Resolved", value: "RESOLVED" },
  // { label: "Archived", value: "ARCHIVED" },
];

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChangeSuccess?: () => void;
  taskDetails: any;
}

export function ChangeStatusDialog({
  open,
  onOpenChange,
  onStatusChangeSuccess,
  taskDetails,
}: ChangeStatusDialogProps) {
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangeStatusSchemaType>({
    resolver: zodResolver(changeStatusSchema),
    defaultValues: {
      status: "",
      comment: "",
    },
    mode: "onChange",
  });

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: ChangeStatusSchemaType) {
    if (!loading && taskDetails?.id) {
      setIsLoading(true);
      try {
        const requestBody = {
          agent_task_ids: [taskDetails.id],
          status: values.status,
          note: values.comment,
        };

        const result = await axiosAuth.post(
          `${url.CHANGE_TASK_STATUS}`,
          requestBody,
        );
        if (result?.status === 200) {
          onOpenChange(false);
          successMessageHandler(result?.data?.message);
          onStatusChangeSuccess?.();
        }
      } catch (error: any) {
        const errorMess =
          error?.response?.data?.detail || "Something went wrong";
        toast.error(errorMess, {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col sm:max-w-lg p-0 overflow-auto gap-2">
        <DialogHeader className="sticky top-0 z-10 flex flex-row justify-between items-start space-y-0 bg-background px-4 pt-4">
          <div className="w-full flex flex-col gap-2">
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              {" "}
              Select the final outcome to help us close this task appropriately.
            </DialogDescription>
          </div>
          <DialogClose>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary"
              onClick={() => onOpenChange(false)}
            >
              <X />
            </div>
          </DialogClose>
        </DialogHeader>

        <div className="px-4 py-2">
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      New Task Status{" "}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="cursor-pointer"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Comment{" "}
                    </FormLabel>
                    <FormControl>
                      <AutoGrowingTextarea
                        placeholder="Enter comment..."
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

              <DialogFooter className="py-3 bg-background">
                <Button
                  type="submit"
                  disabled={isLoading}
                  onClick={form.handleSubmit(onSubmit)}
                  className="w-full cursor-pointer"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Task
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
