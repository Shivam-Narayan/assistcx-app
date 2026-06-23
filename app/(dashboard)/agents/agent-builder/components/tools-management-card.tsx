"use client";

import { EmptyState } from "@/components/empty-state/empty-state";
import useToolList from "@/components/tool-selectors/Hook/useToolList";
import { ToolSelectorModalStyle } from "@/components/tool-selectors/modal-tool-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getToolIcon } from "@/helper/helper-function";
import { Bolt, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

interface ToolsManagementCardProps {
  selectedTools: any[];
  setSelectedTools: (tools: any[] | ((prev: any[]) => any[])) => void;
  isLoading: boolean;
  allToolsList?: any;
}

export const ToolsManagementCard = ({
  selectedTools,
  setSelectedTools,
  isLoading,
  allToolsList,
}: ToolsManagementCardProps) => {
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
  const [isToolSelectorOpen, setIsToolSelectorOpen] = useState(false);

  // Enrich selectedTools
  const enrichedSelectedTools = useMemo(() => {
    return selectedTools
      .map((selectedTool) => {
        // Find tool from allToolsList
        const fullToolData = allToolsList?.find(
          (item: any) => item.action === selectedTool.action,
        );

        return {
          name: selectedTool.name || fullToolData?.name || "",
          action: selectedTool.action,
          description:
            selectedTool.description || fullToolData?.description || "",
          selection: false,
          api_type: selectedTool.api_type || fullToolData?.api_type || "REST",
          icon: selectedTool.icon || fullToolData?.icon,
          integration_key:
            selectedTool.integration_key || fullToolData?.integration_key || "",
          is_default:
            selectedTool.is_default ?? fullToolData?.is_default ?? false,
        };
      })
      .filter(Boolean);
  }, [selectedTools, allToolsList]);

  const toggleTool = (toolAction: string) => {
    const newTools = selectedTools.filter((t) => t.action !== toolAction);
    setSelectedTools(newTools);
  };

  const normalizeTool = (tool: any) => ({
    label: tool.name ?? tool.label,
    value: tool.action ?? tool.value,
    description: tool.description,
    icon: tool.icon,
    integration_key: tool.integration_key,
    is_default: tool.is_default,
  });
  const normalizedSelectedTools = useMemo(() => {
    return (selectedTools || []).map(normalizeTool);
  }, [selectedTools]);

  return (
    <>
      <Card className="bg-white rounded-xl shadow-xs py-0 gap-0 border border-slate-200 overflow-hidden">
        <div className="bg-slate-100 px-4 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <h2 className="text-base xl:text-lg font-semibold text-slate-900 flex items-center gap-2">
                Tools
              </h2>
              <p className="text-xs xl:text-sm text-slate-600 bg-primary/10 rounded-full px-2 py-0.5 font-medium">
                {enrichedSelectedTools.length}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsToolSelectorOpen(true)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Tools
            </Button>
          </div>
        </div>

        <div>
          {enrichedSelectedTools.length === 0 ? (
            <CardContent className="p-4">
              <EmptyState
                variant="card"
                compact
                icon={<Bolt />}
                title="No Tools Selected"
                description="Add tools to extend this agent’s capabilities and enable external actions."
              />
            </CardContent>
          ) : (
            <div className="p-4 space-y-4">
              {enrichedSelectedTools.map((tool) => (
                <div
                  key={tool.action}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:shadow-xs transition-all"
                >
                  <div className="text-base xl:text-xl bg-primary/80 text-white rounded-xl p-2.5">
                    {getToolIcon(tool, toolIcons, defaultIcon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900">
                      {tool.name}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2">
                      {tool.description}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTool(tool.action)}
                    className="cursor-pointer opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <ToolSelectorModalStyle
        open={isToolSelectorOpen}
        setOpen={setIsToolSelectorOpen}
        items={toolsItems}
        selectionMode="multiple"
        value={normalizedSelectedTools}
        onChange={(tools: any[]) => {
          const normalized = tools.map((tool) => ({
            name: tool.label,
            action: tool.value,
            description: tool.description,
            icon: tool.icon,
            integration_key: tool.integration_key,
            is_default: tool.is_default,
          }));

          setSelectedTools(normalized);
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
        icons={toolIcons}
        defaultIcon={defaultIcon}
        isLoading={isToolsLoading}
      />

      {/* <AgentToolsListSheets
        sheetOpenEvent={isToolSelectorOpen}
        closeSheetEvent={() => setIsToolSelectorOpen(false)}
        userSelectionTools={selectedTools || []}
        setUserSelectionTools={(val: any) => setSelectedTools(val)}
      /> */}
    </>
  );
};
