"use client";

import { AddEditToolsSheet } from "@/app/(dashboard)/tools/add-edit-tool-sheet";
import CustomAgentToolCard from "@/components/agent-tools";
import { ConfirmationDialog } from "@/components/confirmation-modal";
import { EmptyState } from "@/components/empty-state/empty-state";
import useToolList from "@/components/tool-selectors/Hook/useToolList";
import { ToolSelectorModalStyle } from "@/components/tool-selectors/modal-tool-selector";
import { Button } from "@/components/ui/button";
import { handleToolsEvents } from "@/redux/agents/create-agents-data-slice";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { handleToolsData } from "@/redux/tools/tools-data-slice";
import { Bolt, ListChecksIcon, Loader } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AgentFormValues } from "../schemas/agent-schema";
import { useAgentConfigData } from "../hook/useAgentConfigData";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";

const ToolsSection = ({ isEditing }: { isEditing: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useAxiosAuth();
  const [isToolSelectorOpen, setIsToolSelectorOpen] = useState(false);
  const [showConfrimation, setShowConfrimation] = useState(false);
  const [toolIndexToDelete, setToolIndexToDelete] = useState<number | null>(
    null,
  );
  const { getProviderList, providerList } = useAgentConfigData();
  const { control, watch, trigger, getValues, setValue } =
    useFormContext<AgentFormValues>();
  const sheetEvent = useAppSelector(
    (state) => state.sheetTriggerReducer.value.sheetEvent,
  );
  const tools = useWatch({
    control,
    name: "tools",
    defaultValue: [],
  });

  const {
    toolsItems,
    toolsSearch,
    setToolsSearch,
    hasMore,
    isFetchingMore,
    isLoading: isToolListLoading,
    loadMoreTools,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    isFilterListLoading,
    toolIcons,
    defaultIcon,
  } = useToolList();

  const removeRuleHandler = (indexToRemove: number) => {
    setToolIndexToDelete(indexToRemove);
    setShowConfrimation(true);
  };

  const handleConfirmDelete = () => {
    if (toolIndexToDelete === null) return;

    const currentTools = getValues("tools") || [];

    const updatedTools = currentTools.filter(
      (_: any, index: number) => index !== toolIndexToDelete,
    );

    setValue("tools", updatedTools, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    trigger("tools");

    setShowConfrimation(false);
    setToolIndexToDelete(null);
  };

  const handleViewTool = (ele: any) => {
    dispatch(handleSheetEvents(true));
    dispatch(handleToolsEvents("viewTool"));
    dispatch(handleToolsData(ele));
  };

  const handleToolHumanReviewChange = (idx: number, enabled: boolean) => {
    const currentTools = getValues("tools") || [];
    const updated = [...currentTools];
    updated[idx] = { ...updated[idx], human_review: enabled };
    setValue("tools", updated, { shouldDirty: true });
  };

  const handleToolReviewRulesChange = (idx: number, rules: string[]) => {
    const currentTools = getValues("tools") || [];
    const updated = [...currentTools];
    updated[idx] = { ...updated[idx], review_rules: rules };
    setValue("tools", updated, { shouldDirty: true });
  };
  const closeAddToolSheetEventHandler = () => {
    dispatch(handleSheetEvents(false));
  };

  const handleToolConnectionChange = (idx: number, connectionId: string) => {
    const currentTools = getValues("tools") || [];

    const updated = [...currentTools];

    updated[idx] = {
      ...updated[idx],
      connection_id: connectionId || "default",
    };

    setValue("tools", updated, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    getProviderList();
  }, [loading]);

  const shouldStickButton = tools.length > 2;

  return (
    <div className="relative">
      <div className="w-full px-4 py-4 overflow-x-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-2 gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Agent Tools
            </h1>
            <p className="text-sm text-muted-foreground">
              AI agents can perform actions and interact with external systems
              using tools. Common interactions include sending emails, fetching
              or posting data, and file-based operations.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="pt-3">
          <Suspense
            fallback={
              <main className="flex flex-1 items-center justify-center">
                <Loader className="h-10 w-10 animate-spin text-primary" />
              </main>
            }
          >
            {!tools?.length ? (
              <EmptyState
                variant="card"
                compact
                icon={<Bolt />}
                title="No tools added"
                description="Add or select your tools"
                className="bg-primary/10"
                action={
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-[6px] w-full sm:w-auto whitespace-nowrap cursor-pointer"
                    onClick={() => setIsToolSelectorOpen(true)}
                    disabled={!isEditing}
                  >
                    <ListChecksIcon className="h-4 w-4" /> Select Tools
                  </Button>
                }
              />
            ) : (
              <div className={`pt-2 ${tools.length > 2 ? "pb-10" : ""}`}>
                {tools.map((tool: any, index) => (
                  <CustomAgentToolCard
                    isDisabled={!isEditing}
                    key={tool.action ?? index}
                    className="shadow-none mb-4 overflow-x-hidden"
                    index={index}
                    tool={tool}
                    pageType="2"
                    removeRuleHandler={removeRuleHandler}
                    // disabledProps={disabledProps}
                    viewTool={handleViewTool}
                    onHumanReviewChange={handleToolHumanReviewChange}
                    onReviewRulesChange={handleToolReviewRulesChange}
                    providerList={providerList}
                    onConnectionChange={handleToolConnectionChange}
                  />
                ))}

                {isEditing && (
                  <div
                    className={`${
                      shouldStickButton
                        ? "sticky bottom-0  left-35 w-full py-3 z-50"
                        : "mt-4"
                    }`}
                  >
                    <div className="flex justify-center">
                      <div className="flex flex-row gap-2 backdrop-blur-sm rounded-lg p-2 shadow-lg border bg-primary/20">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-[6px] whitespace-nowrap cursor-pointer"
                          onClick={() => setIsToolSelectorOpen(true)}
                        >
                          <ListChecksIcon className="h-4 w-4" /> Select Tools
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Suspense>
        </div>
      </div>
      <ToolSelectorModalStyle
        items={toolsItems}
        selectionMode="multiple"
        value={tools.map((tool: any) => ({
          id: tool.id,
          label: tool.name,
          value: tool.action,
          description: tool.description,
          icon: tool.icon,
          integration_key: tool.integration_key,
          is_default: tool.is_default,
          tool_config: { name: tool.tool_config?.name ?? "" },
        }))}
        onChange={(value) => {
          const existingTools = getValues("tools") || [];
          const transformedTools = (value || []).map((item: any) => {
            const action =
              typeof item === "string"
                ? item
                : (item.action ?? item.value ?? "");
            const existing = existingTools.find(
              (t: any) => t.action === action,
            );
            if (typeof item === "string") {
              return {
                icon: "",
                name: item,
                description: "",
                action: item,
                integration_key: existing?.integration_key ?? "",
                is_default: existing?.is_default ?? false,
                human_review: existing?.human_review ?? false,
                review_rules: existing?.review_rules ?? [],
                connection_id: existing?.connection_id ?? "default",
              };
            }
            return {
              id: item.id,
              icon: item.icon ?? "",
              name: item.name ?? item.label ?? "",
              description: item.description ?? "",
              action,
              tool_config: { name: item.tool_config?.name ?? "" },
              integration_key: item.integration_key ?? "",
              is_default: item.is_default ?? false,
              human_review: existing?.human_review ?? false,
              review_rules: existing?.review_rules ?? [],
              connection_id: existing?.connection_id ?? "default",
            };
          });
          setValue("tools", transformedTools, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          trigger("tools");
        }}
        placeholder="Select Tools"
        searchPlaceholder="Search Tools"
        dialogHeaderText="Select Tools"
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
        open={isToolSelectorOpen}
        setOpen={setIsToolSelectorOpen}
        icons={toolIcons}
        defaultIcon={defaultIcon}
        isLoading={isToolListLoading}
      />

      <AddEditToolsSheet
        closeAddToolSheetEvent={closeAddToolSheetEventHandler}
        addToolSheetOpenEvent={sheetEvent}
      />

      <ConfirmationDialog
        open={showConfrimation}
        confirm={handleConfirmDelete}
        cancel={() => {
          setShowConfrimation(false);
          setToolIndexToDelete(null);
        }}
        title={"Are you sure you want to remove this tool?"}
        description={"This tool will be removed from the agent."}
      />
    </div>
  );
};

export default ToolsSection;
