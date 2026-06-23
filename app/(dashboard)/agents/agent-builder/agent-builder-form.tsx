"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { InfoIconWithMessage } from "@/components/InfoIconWithMessage";
import useToolList from "@/components/tool-selectors/Hook/useToolList";
import { ToolSelectorDropdownStyle } from "@/components/tool-selectors/dropdown-tool-selector";
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
import useAgentBuilder from "../Hook/useAgentBuilder";

const AgentBuilderForm = () => {
  const { form, isLoadingAgent, handleSubmit, isPending } = useAgentBuilder();

  const {
    toolsItems,
    toolsSearch,
    setToolsSearch,
    hasMore,
    isFetchingMore,
    isLoading: isToolsLoading,
    loadMoreTools,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    isFilterListLoading,
    toolIcons,
    defaultIcon,
  } = useToolList();
  return (
    <>
      <DialogDescription className="px-4 pb-2">
        Define your agent by outlining its business use case and selecting tools
        it will use. Once set up, the agent can perform tasks based on your
        instructions.
      </DialogDescription>
      <div className="px-5 pb-5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="agentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Agent Name{" "}
                    <span className="text-destructive text-lg">*</span>
                    <InfoIconWithMessage content="Name the agent with a unique, recognizable identifier." />
                  </FormLabel>

                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="Enter agent name..."
                      {...field}
                      autoFocus={false}
                      className="disabled:opacity-50"
                      onKeyDown={handleSpaceValidation}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_usecase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Business Usecase{" "}
                    <span className="text-destructive text-lg">*</span>
                    <InfoIconWithMessage content="Define the purpose and the business problem or workflow the agent will handle." />
                  </FormLabel>
                  <FormControl>
                    <AutoGrowingTextarea
                      placeholder="Describe the business usecase and context for this agent..."
                      {...field}
                      maxLength={2000}
                      autoFocus={false}
                      maxHeight={280}
                      className="disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Tool <span className="text-destructive text-lg">*</span>
                    <InfoIconWithMessage content="Select the tools the agent will use to perform its tasks." />
                  </FormLabel>

                  <FormControl>
                    <ToolSelectorDropdownStyle
                      maxRows={3}
                      items={toolsItems}
                      selectionMode="multiple"
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={(val) => field.onChange(val)}
                      placeholder="Select Tools"
                      searchPlaceholder="Search tools"
                      buttonClassName="w-full"
                      showClearButton
                      displayMode="pills"
                      localSearch={toolsSearch}
                      setLocalSearch={setToolsSearch}
                      hasMore={hasMore}
                      isFetchingMore={isFetchingMore}
                      loadMoreTools={loadMoreTools}
                      filterOptions={filterOptions}
                      selectedFilter={selectedFilter}
                      setSelectedFilter={setSelectedFilter}
                      icons={toolIcons}
                      defaultIcon={defaultIcon}
                      isLoading={isToolsLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-10 text-base font-medium cursor-pointer"
                disabled={isLoadingAgent || isPending}
              >
                {(isLoadingAgent || isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isLoadingAgent || isPending
                  ? "Building Agent..."
                  : "Build Agent"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};
export default AgentBuilderForm;
