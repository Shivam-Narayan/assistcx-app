import AutoGrowingTextarea from "@/components/auto-grow-textarea";
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
import { Loader2, Sparkles, X } from "lucide-react";
import { useForm } from "react-hook-form";

interface DataSchemaDialogInterface {
  openPrompt: boolean;
  setOpenPrompt: (open: boolean) => void;
  handleGenerate: (promptValue: string) => void;
  isLoading: boolean;
}

export const DataSchemaDialog = ({
  openPrompt,
  setOpenPrompt,
  handleGenerate,
  isLoading,
}: DataSchemaDialogInterface) => {
  const form = useForm({
    defaultValues: {
      instructions: "",
    },
  });

  const handleClose = () => {
    setOpenPrompt(false);
    form.reset();
  };

  return (
    <Dialog open={openPrompt} onOpenChange={setOpenPrompt}>
      <DialogContent className="flex flex-col max-w-[95vw] sm:max-w-2xl p-0 overflow-auto gap-2">
        <DialogHeader className="sticky top-0 z-10 flex px-4 py-3 flex-row justify-between items-center bg-background border-b">
          <DialogTitle className="text-lg font-semibold">
            Edit Data Schema
          </DialogTitle>

          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              handleGenerate(data?.instructions),
            )}
            className="px-4 py-4 flex flex-col gap-6"
          >
            <div className="px-5 py-5 bg-primary/5 rounded-lg flex gap-4 border-l-4 border-primary">
              <div className="flex p-1 min-w-8 h-8 rounded-md bg-primary/10 items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground">
                  Let AI design a structured data schema tailored to your
                  template context. Provide clear instructions to generate
                  meaningful and relevant data fields.
                </p>
              </div>
            </div>

            <FormItem>
              <FormField
                control={form.control}
                name="instructions"
                rules={{ required: "Instructions are required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Instructions
                      <span className="text-destructive text-lg">*</span>
                    </FormLabel>
                    <FormControl>
                      <AutoGrowingTextarea
                        placeholder="Enter instructions here..."
                        {...field}
                        className="min-h-[100px]"
                        maxHeight={200}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormItem>

            <DialogFooter className="bg-background border-t pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!form.watch("instructions")?.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 " />
                )}
                Generate
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
