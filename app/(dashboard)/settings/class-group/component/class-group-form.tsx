import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleSpaceValidation } from "@/lib/utils";

interface ClassGroupFormProps {
  mainForm: any;
  handleClassGroupField: (e: any) => void;
}

interface ClassLabelProps {
  classLabelForm: any;
  onSubmitClassLabel: (data: any) => void;
  setShowClassLabelForm: (value: boolean) => void;
  setEditingIndex: (index: number | null) => void;
  setIsAdding: (val: boolean) => void;
}
export const ClassGroupForm = ({
  mainForm,
  handleClassGroupField,
}: ClassGroupFormProps) => {
  return (
    <Form {...mainForm}>
      <form className="space-y-4">
        <FormField
          control={mainForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground required">Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter name"
                  {...mainForm.register("name")}
                  onChange={(e) => {
                    field.onChange(e);
                    handleClassGroupField(e);
                  }}
                  onKeyDown={handleSpaceValidation}
                  autoFocus={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={mainForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground required">
                Description
              </FormLabel>
              <FormControl>
                <AutoGrowingTextarea
                  placeholder="Enter description"
                  maxHeight={100}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export const ClassLabelForm = ({
  classLabelForm,
  onSubmitClassLabel,
  setShowClassLabelForm,
  setEditingIndex,
  setIsAdding,
}: ClassLabelProps) => {
  return (
    <div className="p-4 border rounded-lg bg-background">
      <Form {...classLabelForm}>
        <form
          className="space-y-4"
          onSubmit={classLabelForm.handleSubmit(onSubmitClassLabel)}
        >
          <FormField
            control={classLabelForm.control}
            name="class_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground required">
                  Class Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter class name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={classLabelForm.control}
            name="class_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground required">
                  Class Description
                </FormLabel>
                <FormControl>
                  <AutoGrowingTextarea
                    placeholder="Enter class description"
                    {...field}
                    maxHeight={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowClassLabelForm(false);
                setEditingIndex(null);
                setIsAdding(false);
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" className="cursor-pointer">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
