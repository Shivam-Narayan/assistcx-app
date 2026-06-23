import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, PencilIcon, Move } from "lucide-react";
import { InfoIconWithMessage } from "@/components/InfoIconWithMessage";
import {
  displayNameToStrictSnakeName,
  handleSpaceValidation,
} from "@/lib/utils";
import { NestedDataTypeList } from "./add-edit-data-template";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { useEffect } from "react";

export const SortableNestedCard = ({
  id,
  row,
  index,
  handleEditNestedFieldClick,
  handleDeleteforsigleNestedField,
  handleSaveNestedField,
  handleCancelEditNested,
  isEditing,
}: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const form = useForm({
    defaultValues: row,
  });

  const onSubmit = (data: any) => {
    handleSaveNestedField(data, index);
  };

  useEffect(() => {
    form.reset(row);
  }, [row, form]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border p-3 rounded-md bg-white space-y-2 group/card transition-all ${
        isEditing ? "" : "hover:shadow-sm"
      }`}
    >
      {isEditing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-md bg-muted/50 space-y-4"
          >
            <FormField
              control={form.control}
              name="fieldName"
              render={({ field }) => (
                <FormItem className="flex flex-col">
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
                      onKeyDown={handleSpaceValidation}
                      onChange={(event) =>
                        form.setValue(
                          `fieldName`,
                          event.target.value != null &&
                            event.target.value != undefined
                            ? displayNameToStrictSnakeName(event.target.value)
                            : "",
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dataType"
              render={({ field }) => (
                <FormItem className="flex flex-col">
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
                          key={o.value}
                          value={o.value}
                          className="cursor-pointer"
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
              control={form.control}
              name="fieldDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-foreground required">
                    <div className="flex items-center gap-1">
                      <span>Field Description</span>

                      <InfoIconWithMessage
                        content={`This helps others understand the Field’s purpose and expected content.`}
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
                onClick={() => {
                  form.reset(row);
                  handleCancelEditNested(index);
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Save Nested Field
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <>
          <div className="flex gap-2 font-semibold items-center">
            <Badge variant="outline">{row.fieldName}</Badge>
            <Badge variant="secondary">{row.dataType}</Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            {row.fieldDescription}
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background border rounded-md px-1 py-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-destructive/10 cursor-pointer"
              onClick={() => handleDeleteforsigleNestedField(index)}
            >
              <Trash2 strokeWidth={1.5} size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted cursor-pointer"
              onClick={() => handleEditNestedFieldClick(index)}
            >
              <PencilIcon width={18} height={18} />
            </Button>

            <Button
              {...attributes}
              {...listeners}
              variant="ghost"
              size="icon"
              className="h-7 w-7 cursor-move hover:bg-muted"
            >
              <Move strokeWidth={1.5} size={18} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
