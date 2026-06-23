import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { InfoIconWithMessage } from "@/components/InfoIconWithMessage";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NestedFieldSchemaType } from "@/lib/schemas/settings/data-templates-schemas";
import {
  displayNameToStrictSnakeName,
  handleSpaceValidation,
} from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { NestedDataTypeList } from "../add-edit-data-template";

interface NestedFieldFormFieldsProps {
  nestedFieldForm: UseFormReturn<NestedFieldSchemaType>;
  onSubmit: (data: NestedFieldSchemaType) => void;
  onCancel: () => void;
}

export const NestedFieldFormFields = ({
  nestedFieldForm,
  onCancel,
}: NestedFieldFormFieldsProps) => {
  return (
    <>
      <FormField
        control={nestedFieldForm.control}
        name="fieldName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground required">
              <div className="flex items-center gap-1">
                <span>Field Name</span>

                <InfoIconWithMessage
                  content={`Field name must be unique and contain only lowercase letters, numbers and underscores. Spaces and hyphens are replaced with underscores; other special characters are removed.`}
                />
              </div>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Nested Field Name"
                {...field}
                maxLength={80}
                autoComplete="off"
                onChange={(e) => {
                  field.onChange(
                    displayNameToStrictSnakeName(e.target.value),
                  );
                }}
                onKeyDown={handleSpaceValidation}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={nestedFieldForm.control}
        name="dataType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground required">
              <div className="flex items-center gap-1">
                <span>Data Type</span>

                <InfoIconWithMessage
                  content={`Choose the data type from the dropdown.`}
                />
              </div>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {NestedDataTypeList.map((o) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={o.value}
                    value={o.value}
                  >
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={nestedFieldForm.control}
        name="fieldDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground required">
              <div className="flex items-center gap-1">
                <span>Field Description</span>

                <InfoIconWithMessage
                  content={`This helps others understand the Field's purpose and expected content.`}
                />
              </div>
            </FormLabel>
            <FormControl>
              <AutoGrowingTextarea
                placeholder="Enter field description"
                {...field}
                maxLength={1800}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button type="submit" className="cursor-pointer">
          Save Nested Field
        </Button>
      </div>
    </>
  );
};
