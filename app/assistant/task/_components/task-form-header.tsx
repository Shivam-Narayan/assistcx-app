import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { TaskFormHeaderProps } from "./types";

export function TaskFormHeader({ form, onClose }: TaskFormHeaderProps) {
  return (
    <div className="flex items-start gap-3 w-full">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input
                placeholder="Enter task name"
                className="border-0 focus:ring-0 focus:border-0 shadow-none text-lg! p-0 focus-visible:ring-0 focus-visible:border-0 focus-visible:shadow-none font-semibold dark:bg-white dark:text-black"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <DialogClose asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 cursor-pointer shadow-none"
          type="button"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogClose>
    </div>
  );
}
