import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import AutoGrowingTextarea from "../auto-grow-textarea";
import { DynamicMultiSelectCombobox } from "../dynamic-multi-select-combobox";

interface IssueFormContentProps {
  issueForm: any;
  handleSubmitForm: (values: any) => void;
  tagItems: any[];
  loadingAddIssue: boolean;
  loadingTags: boolean;
  tagsSearch: string;
  setTagsSearch: (v: string) => void;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  hasMore: boolean;
  isFetchingMore: boolean;
  setIsFetchingMore: (v: boolean) => void;
  isEditMode: boolean;
}

export const IssueFormContent = ({
  issueForm,
  handleSubmitForm,
  tagItems,
  loadingAddIssue,
  loadingTags,
  tagsSearch,
  setTagsSearch,
  page,
  setPage,
  hasMore,
  isFetchingMore,
  setIsFetchingMore,
  isEditMode,
}: IssueFormContentProps) => {
  const addFilter = () => {};
  return (
    <>
      <DialogDescription className="mb-2 text-sm text-muted-foreground">
        Report an issue related to this email thread. Provide a clear title and
        description.
      </DialogDescription>

      <div className="space-y-4">
        <Form {...issueForm}>
          <form
            className="space-y-4"
            onSubmit={issueForm.handleSubmit(handleSubmitForm)}
          >
            <FormField
              control={issueForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground required">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Title"
                      {...issueForm.register("title")}
                      onChange={(e) => {
                        field.onChange(e);
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
              control={issueForm.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground required">
                    Tags
                  </FormLabel>

                  <FormControl>
                    <DynamicMultiSelectCombobox
                      maxRows={3}
                      items={tagItems}
                      value={(field.value ?? []).map((t: any) => t.value)}
                      onChange={(selectedValues: string[]) => {
                        const selectedObjects = selectedValues.map((val) => {
                          const matched = tagItems.find((i) => i.value === val);
                          return matched || { label: val, value: val };
                        });

                        field.onChange(selectedObjects);
                      }}
                      placeholder="Select tags..."
                      searchPlaceholder="Search tags..."
                      buttonClassName="w-full"
                      localSearch={tagsSearch}
                      setLocalSearch={setTagsSearch}
                      loading={loadingTags}
                      setPage={setPage}
                      hasMore={hasMore}
                      isFetchingMore={isFetchingMore}
                      setIsFetchingMore={setIsFetchingMore}
                      filterType="tags"
                      addFilter={addFilter}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={issueForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground required">
                    Description{" "}
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
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loadingAddIssue}
            >
              {loadingAddIssue && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? "Update" : "Save"} Issue
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};
