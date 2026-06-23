import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import * as z from "zod";
import HeaderHoverCard from "@/components/header";
import { mailboxPollingSchema } from "@/lib/schemas/settings/mailbox-polling-schema";

type SwitchFieldProps = {
  name: keyof z.infer<typeof mailboxPollingSchema>;
  title: string;
  message: string;
  disabled?: boolean;
  form?: any;
};

export const SwitchField = ({
  form,
  name,
  title,
  message,
  disabled,
}: SwitchFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="rounded-lg border p-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <HeaderHoverCard
              title={title}
              message={message}
              type="field"
              isRequired={false}
            />
            <FormControl>
              <Switch
                className="cursor-pointer"
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
                disabled={disabled}
              />
            </FormControl>
          </div>
        </FormItem>
      )}
    />
  );
};
