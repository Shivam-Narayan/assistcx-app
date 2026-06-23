"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TextEditor from "@/components/text-editor";
import { useFormContext } from "react-hook-form";
import { AgentFormValues } from "../schemas/agent-schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Props {
  isFormOpen: boolean;
  isNew: boolean;
  editingIndex: number | null;
  handleCancel: () => void;
  handleSave: () => void;
}

const GuidelinesDialog = ({
  isFormOpen,
  isNew,
  editingIndex,
  handleCancel,
  handleSave,
}: Props) => {
  const { control } = useFormContext<AgentFormValues>();

  return (
    <Dialog
      open={isFormOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <DialogContent className="p-0 overflow-hidden max-w-xl! w-full rounded-xl">
        <Card className="overflow-hidden shadow-none p-0 gap-0 border-none">
          <CardHeader className="border-b bg-muted px-4 py-4! flex flex-row items-center justify-between space-y-0">
            <DialogTitle asChild>
              <div>
                <h3 className="text-base font-semibold leading-none tracking-tight">
                  {isNew ? "Add New Guideline" : "Edit Guideline"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-normal">
                  Configure the agent&apos;s core skills and performance
                  expectations
                </p>
              </div>
            </DialogTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {editingIndex !== null && (
              <>
                <FormField
                  control={control}
                  name={`identity.guidelines.${editingIndex}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`identity.guidelines.${editingIndex}.instructions`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Instructions <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <TextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                className="cursor-pointer"
                type="button"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default GuidelinesDialog;
