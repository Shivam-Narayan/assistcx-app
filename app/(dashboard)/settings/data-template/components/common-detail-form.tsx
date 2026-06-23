import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSchemaType } from "@/lib/schemas/settings/data-templates-schemas";
import { getValidationConstant } from "@/lib/validation-constants";
import { displayNameToIdentifierKey, handleSpaceValidation } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";

interface CommonDetailFormProps {
  form: UseFormReturn<FormSchemaType>;
  userEvents: string;
}

const nameMinLen = getValidationConstant("minimumText").min;

export const CommonDetailForm = ({
  form,
  userEvents,
}: CommonDetailFormProps) => {
  return (
    <Card className="shadow-none p-0 gap-0">
      <CardHeader className="border-b px-4 py-4! flex flex-row items-center justify-between space-y-0">
        <CardTitle
          className="flex gap-3 items-center text-lg font-medium 
               leading-none tracking-tight"
        >
          <span>Common Details</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 pb-2 flex flex-col ">
        <div className="p-4 pt-2">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter name"
                        {...form.register("name")}
                        onChange={(e) => {
                          field.onChange(e);
                          const value = e.target.value;
                          if (userEvents == "addDataTemplate") {
                            const templateClass = displayNameToIdentifierKey(
                              value.trim(),
                            );
                            form.setValue("templateClass", templateClass, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }
                        }}
                        maxLength={80}
                        minLength={nameMinLen}
                        autoFocus={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Template Class{" "}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter template class"
                        {...field}
                        onKeyDown={handleSpaceValidation}
                        maxLength={80}
                        minLength={nameMinLen}
                        autoFocus={false}
                        autoComplete="off"
                        disabled={userEvents == "editDataTemplate"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Description
                    </FormLabel>
                    <FormControl>
                      <AutoGrowingTextarea
                        placeholder="Enter description"
                        maxLength={280}
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
      </CardContent>
    </Card>
  );
};
