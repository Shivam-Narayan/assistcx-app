"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { feedbackOptions } from "@/lib/data/chat-data";
import { formSchema } from "@/lib/schemas/assistant/chat/feedback-schemas";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Icon from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FeedbackDialogProps } from "./types";

export function FeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  feedback,
}: FeedbackDialogProps) {
  const alwaysIncluded =
    feedback?.category?.filter((c) => ["helpful", "not-helpful"].includes(c)) ||
    [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      options:
        feedback?.category?.filter(
          (c) => !["helpful", "not-helpful"].includes(c),
        ) || [],
      feedbackText: feedback?.comment,
    },
  });

  useEffect(() => {
    form.reset({
      options:
        feedback?.category?.filter(
          (c) => !["helpful", "not-helpful"].includes(c),
        ) || [],
      feedbackText: feedback?.comment,
    });
  }, [feedback, form]); // Dependency array ensures this runs when feedback changes

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const finalCategories = [
      ...alwaysIncluded, // helpful or not-helpful (from props)
      ...values.options, // user-selected categories from form
    ];
    onSubmit({
      category: finalCategories,
      comment: values.feedbackText || "",
      sentiment: feedback.sentiment,
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w")}>
        <DialogHeader className={cn("space-y-2")}>
          <DialogTitle className={cn("text-2xl")}>Help us improve</DialogTitle>
          <DialogDescription className={cn("text-base")}>
            Provide additional feedback on this answer. Select all that apply.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="options"
              render={({ field }) => (
                <FormItem>
                  <div className={cn("grid grid-cols-2 gap-2 py-2")}>
                    {feedbackOptions.map((option) => {
                      const SelectedIcon = Icon[
                        option.icon as keyof typeof Icon
                      ] as React.ElementType;
                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "flex items-center gap-1 p-2 rounded-lg border transition-all duration-200",
                            field.value?.includes(option.id)
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-input hover:border-primary/50 hover:bg-accent/50",
                          )}
                        >
                          <div className={cn("flex items-center gap-3 flex-1")}>
                            {option.icon && (
                              <SelectedIcon className={cn("w-4 h-4")} />
                            )}
                            <label
                              htmlFor={option.id}
                              className={cn(
                                "text-sm font-medium leading-none cursor-pointer flex-1",
                              )}
                            >
                              {option.label}
                            </label>
                          </div>
                          <FormControl>
                            <Checkbox
                              id={option.id}
                              className={cn(
                                "h-5 w-5 border-0 rounded-full focus-visible:ring-[0px]",
                                "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                              )}
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value ?? []),
                                      option.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== option.id,
                                      ),
                                    );
                              }}
                            />
                          </FormControl>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedbackText"
              render={({ field }) => (
                <FormItem className={cn("space-y-3")}>
                  <FormLabel
                    className={cn("text-sm text-muted-foreground font-medium")}
                  >
                    How can the response be improved? (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your feedback..."
                      {...field}
                      className={cn("py-2 px-3")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className={cn("flex justify-end gap-2 mt-4")}>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="cancel"
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                aria-label="submit"
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
