import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { TaskFormRecipientsProps } from "./types";

export function TaskFormRecipients({
  form,
  input,
  inputRef,
  onKeyDown,
  onInputChange,
  onRemoveEmail,
}: TaskFormRecipientsProps) {
  return (
    <FormField
      control={form.control}
      name="alertRecipientsemails"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Recipients</FormLabel>
          <FormControl>
            <div
              className={cn(
                "flex flex-wrap items-center gap-2 dark:bg-input/30 border-input w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-within:ring-ring focus-within:ring-1 min-h-9",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                {(field.value ?? []).map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="flex items-center gap-1 break-all whitespace-normal!"
                  >
                    {email}
                    <X
                      className="h-3 w-3 cursor-pointer pointer-events-auto!"
                      onClick={() => onRemoveEmail(email)}
                    />
                  </Badge>
                ))}
              </div>
              {(field.value?.length ?? 0) < 3 && (
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={onInputChange}
                  onKeyDown={onKeyDown}
                  placeholder="Enter email addresses"
                  className="w-auto flex-1 placeholder:text-sm outline-none placeholder:font-normal placeholder:text-muted-foreground"
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
