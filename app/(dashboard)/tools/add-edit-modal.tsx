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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formSchema, formSchemaType } from "@/lib/schemas/tools-schemas";
import { handleSpaceValidation } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export interface IDataSchema {
  your_key: string;
  value: string;
}

interface AddEditModalProps {
  open: boolean;
  title: string;
  editDetails: IDataSchema | null;
  index: number | null;
  onClode: () => void;
  onSubmitValues: (saveValue: IDataSchema, index: number | null) => boolean;
}

export function AddEditModal({
  open,
  title,
  editDetails,
  index,
  onClode,
  onSubmitValues,
}: AddEditModalProps) {
  const [showRequiredValueMsg, setShowRequiredValueMsg] =
    useState<boolean>(false);

  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      your_key: "",
      value: "",
      checked: false,
    },
    mode: "onChange",
  });

  function onSubmit(values: formSchemaType) {
    if (!form.getValues("checked") && !form.getValues("value")) {
      setShowRequiredValueMsg(true);
      return;
    }
    if (values["checked"]) {
      values["value"] = "{" + values["your_key"] + "}";
    }
    const isSuccess = onSubmitValues(
      { value: values["value"], your_key: values["your_key"] },
      index,
    );
    if (isSuccess) {
      form.reset();
    }
  }

  const handleResetForm = () => {
    form.reset();
    onClode();
  };
  const handleClose = () => {
    form.reset();
    onClode();
  };

  useEffect(() => {
    if (form.getValues("checked")) {
      form.setValue("value", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("checked")]);

  useEffect(() => {
    if (form.getValues("value")) {
      setShowRequiredValueMsg(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("value")]);

  // Watch for changes in your_key to update the dynamic preview
  const watchedKey = form.watch("your_key");
  const watchedChecked = form.watch("checked");

  useEffect(() => {
    if (editDetails) {
      const isCheckedvalue = editDetails["your_key"]
        ? "{" + editDetails["your_key"] + "}"
        : "";
      form.resetField("your_key");
      form.setValue("your_key", editDetails["your_key"]);
      form.resetField("value");
      form.setValue(
        "value",
        isCheckedvalue === editDetails["value"]
          ? editDetails["your_key"]
          : editDetails["value"],
      );
      form.resetField("checked");
      form.setValue(
        "checked",
        isCheckedvalue === editDetails["value"] ? true : false,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDetails]);

  return (
    <Dialog open={open}>
      <DialogContent
        className="flex flex-col sm:max-w-[425px] p-0 overflow-auto gap-2"
        onCloseAutoFocus={handleResetForm}
      >
        <DialogHeader className="sticky top-0 z-10 flex px-4 py-3 flex-row justify-between items-center space-y-0 bg-background">
          <div className="w-full">
            <DialogTitle>{title}</DialogTitle>
          </div>

          <DialogClose>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </div>
          </DialogClose>
        </DialogHeader>
        <div className="grow">
          <div className="px-4 space-y-4">
            <Form {...form}>
              <FormField
                control={form.control}
                name="checked"
                render={({ field }) => (
                  <FormItem className="flex flex-row gap-4 items-center justify-between rounded-lg border p-4 space-y-0">
                    <FormLabel className="text-foreground flex flex-col gap-1 items-start">
                      <span className="text-sm font-semibold">
                        Dynamic Field
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        Let AI determine the value at runtime
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Switch
                        className="cursor-pointer"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="your_key"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-foreground required">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={"text"}
                        placeholder="Enter name"
                        maxLength={80}
                        {...field}
                        autoFocus={false}
                        onKeyDown={handleSpaceValidation}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-foreground required">
                      {watchedChecked ? "Variable" : "Value"}
                    </FormLabel>
                    {watchedChecked ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/30">
                        <div className="text-sm flex-1">
                          {watchedKey ? (
                            `{${watchedKey}}`
                          ) : (
                            <span className="text-muted-foreground/50">
                              {"{variable_name}"}
                            </span>
                          )}
                        </div>
                        <div className="bg-primary rounded-md p-1 shrink-0">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <FormControl>
                        <Input
                          type={"text"}
                          placeholder="Enter value"
                          maxLength={80}
                          {...field}
                          autoFocus={false}
                          autoComplete="off"
                          onKeyDown={handleSpaceValidation}
                        />
                      </FormControl>
                    )}
                    <FormMessage />
                    {showRequiredValueMsg && (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        Value is required
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </Form>
          </div>
        </div>

        <DialogFooter className="px-4 py-3 pb-6 bg-background">
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            className="w-full cursor-pointer"
          >
            {editDetails ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
