"use client";

import { getProviderByKey, getToolIcon } from "@/helper/helper-function";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getIconsData, getIconSvg } from "./icon-manager/icon-render-component";
import ToolConnectionSelector from "./tool-connection-selector";
import ToolHumanReview, { HumanReviewCriteria } from "./tool-human-review";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

interface agentToolInterface {
  name: string;
  action: string;
  function: string;
  description: string;
  selection?: boolean;
  api_type: string;
  icon: string;
  integration_key?: string;
  is_default?: boolean;
  tool_config?: {
    name: string;
  };
  human_review?: boolean;
  review_rules?: string[];
  connection_id?: string;
}

export interface emptyDataInteface {
  isDisabled?: boolean;
  disabledProps?: (editable: boolean) => {
    disabled: boolean;
    className: string;
  };
  pageType: string;
  index: number;
  tool: agentToolInterface;
  className: string;
  removeRuleHandler?: (index: number) => void;
  onSelectionchangeHandler?: (selection: boolean, index: number) => void;
  editTool?: (toolE: any) => void;
  viewTool?: (toolE: any) => void;
  isCreatUpdateAgentTool?: boolean;
  isAccordionExpanded?: boolean;
  onAccordionExpandedChange?: (expanded: boolean) => void;
  onHumanReviewChange?: (index: number, enabled: boolean) => void;
  onReviewRulesChange?: (index: number, rules: string[]) => void;
  providerList?: any;
  onConnectionChange?: (index: number, connectionId: string) => void;
}

const CustomAgentToolCard = ({
  isDisabled,
  disabledProps,
  index,
  pageType,
  tool,
  className,
  isCreatUpdateAgentTool,
  removeRuleHandler,
  onSelectionchangeHandler,
  editTool,
  viewTool,
  isAccordionExpanded,
  onAccordionExpandedChange,
  onHumanReviewChange,
  onReviewRulesChange,
  providerList,
  onConnectionChange,
}: emptyDataInteface) => {
  const toolIcons = getIconsData("tool_icons");
  const defaultIcon = getIconSvg("tool-case", "tool_icons");
  const [humanReviewEnabled, setHumanReviewEnabled] = useState(
    () => tool.human_review ?? false,
  );
  const [humanReviewCriteria, setHumanReviewCriteria] = useState<
    HumanReviewCriteria[]
  >(() =>
    (tool.review_rules || []).map((rule, idx) => ({
      id: `criteria-init-${idx}-${tool.action}`,
      criteria: rule,
    })),
  );

  useEffect(() => {
    setHumanReviewEnabled(tool.human_review ?? false);
    setHumanReviewCriteria(
      (tool.review_rules || []).map((rule, idx) => ({
        id: `criteria-init-${idx}-${tool.action}`,
        criteria: rule,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.action]);

  //=================[Function: Remove Tool]==========================================================//
  const removeRuleOnClickHandler = (index: number) => {
    removeRuleHandler?.(index);
  };

  //=================[Function: Checkbox Selection Tool]==========================================================//
  const onSelectionchangeHandlerF = (selection: boolean, index: number) => {
    onSelectionchangeHandler?.(selection, index);
  };

  //=================[Function: Edit Tool]==========================================================//
  const onEditClickHandler = (toolE: any) => {
    editTool?.(toolE);
  };

  //=================[Function: View Tool]==========================================================//
  const onViewClickHandler = (toolE: any) => {
    viewTool?.(toolE);
  };

  const handleHumanReviewToggle = (checked: boolean) => {
    setHumanReviewEnabled(checked);
    onHumanReviewChange?.(index, checked);
  };

  const handleCriteriaChange = (newCriteria: HumanReviewCriteria[]) => {
    setHumanReviewCriteria(newCriteria);
    onReviewRulesChange?.(
      index,
      newCriteria.map((c) => c.criteria),
    );
  };

  const provider = getProviderByKey(providerList, tool.integration_key);

  const handleConnectionChange = (connectionId: string) => {
    onConnectionChange?.(index, connectionId);
  };

  return (
    <Card className={`p-0 gap-0 ${className} wrap-break-word overflow-hidden`}>
      <CardContent
        className="grid gap-4 xl:gap-6 px-3 xl:px-4 py-3 xl:py-4 relative cursor-pointer group hover:bg-primary/5 transition-colors"
        onClick={() => onViewClickHandler(tool)}
      >
        <div className="flex space-x-4 w-full min-w-0">
          <div className="p-1.5  rounded-full w-fit h-fit shrink-0 bg-primary/10 text-primary">
            {getToolIcon(tool, toolIcons, defaultIcon)}
          </div>

          <div className="w-full flex flex-col gap-2 min-w-0">
            <div className="flex flex-row justify-between items-center min-w-0">
              <div className="flex flex-row gap-2 items-center text-lg font-semibold leading-none min-w-0 flex-1">
                <p className="text-base xl:text-lg font-medium leading-none text-foreground/90 wrap-break-word hyphens-auto min-w-0">
                  {tool.name}
                </p>

                <span className="text-xs xl:text-sm font-normal leading-none shrink-0">
                  {tool?.tool_config?.name && (
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary max-w-full"
                    >
                      <span className="wrap-break-word min-w-0 overflow-hidden">
                        {tool?.tool_config?.name}
                      </span>
                    </Badge>
                  )}
                </span>
              </div>

              {/** Create/Edit Agent: Tool Selection */}
              {!isDisabled && pageType == "1" && (
                <Checkbox
                  className="justify-end ml-auto h-5 w-5 shrink-0 cursor-pointer"
                  checked={tool.selection}
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(checked) =>
                    onSelectionchangeHandlerF(Boolean(checked), index)
                  }
                  disabled={isDisabled}
                />
              )}

              {/** Create/Edit Agent: Remove Tool */}
              {!isDisabled && pageType == "2" && (
                <Button
                  type="button"
                  className="absolute top-3 right-3 p-1 h-8 w-8 bg-muted items-center rounded-md cursor-pointer ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRuleOnClickHandler(index);
                  }}
                  disabled={isDisabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="text-xs xl:text-sm text-muted-foreground line-clamp-2 wrap-break-word hyphens-auto">
              {tool.description}
            </p>

            <div className="flex flex-wrap flex-row items-center gap-4 px-0 lg:space-y-0">
              <Badge
                variant="outline"
                className="p-0 overflow-hidden max-w-full"
              >
                <span className="bg-foreground/10 text-foreground/70 px-2 py-0.5 text-xs font-medium shrink-0">
                  Action ID
                </span>
                <span className="px-2 py-0.5 text-foreground/90 text-xs font-mono wrap-break-word min-w-0 overflow-hidden">
                  {tool.action}
                </span>
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      {/** Showing connection  */}
      {provider && (
        <ToolConnectionSelector
          providerKey={provider.key}
          selectedConnection={tool.connection_id || "default"}
          onConnectionChange={handleConnectionChange}
          disabled={isDisabled}
        />
      )}

      {/** Human Review Footer */}
      {pageType == "2" && (
        <ToolHumanReview
          isDisabled={isDisabled}
          humanReviewEnabled={humanReviewEnabled}
          onToggleChange={handleHumanReviewToggle}
          criteria={humanReviewCriteria}
          onCriteriaChange={handleCriteriaChange}
          isExpanded={isAccordionExpanded}
          onExpandedChange={onAccordionExpandedChange}
        />
      )}
    </Card>
  );
};

export default CustomAgentToolCard;
