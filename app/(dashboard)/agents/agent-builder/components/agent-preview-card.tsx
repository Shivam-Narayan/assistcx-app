"use client";

import {
  getIconsData,
  getIconSvg,
} from "@/components/icon-manager/icon-render-component";
import { Card } from "@/components/ui/card";
import {
  Bolt,
  Bot,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  Eye,
  FileOutput,
  List,
} from "lucide-react";
import { getToolIcon, useCopyToClipboard } from "@/helper/helper-function";
import { useState } from "react";
import toast from "react-hot-toast";

interface AgentPreviewCardProps {
  agentConfig: {
    name: string;
    businessUsecase: string;
    description?: string;
    instructions?: string;
    agentRules?: string[];
    successCriteria?: string[];
    planningSteps?: Array<{
      id: number;
      step_name: string;
      tool: { label: string; value: string }[];
      condition: string;
      action: string[];
      rules: string[];
    }>;
    outputFields?: Array<{
      id: number;
      name: string;
      type: string;
      description: string;
    }>;
    tools: any[];
  };
}

export const AgentPreviewCard = ({ agentConfig }: AgentPreviewCardProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "json">("preview");
  const [jsonCopied, copyJson] = useCopyToClipboard(2000);
  const [isToolsCollapsed, setIsToolsCollapsed] = useState(false);
  const [isPlanningCollapsed, setIsPlanningCollapsed] = useState(false);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  const toolIcons = getIconsData("tool_icons");
  const defaultIcon = getIconSvg("tool-case", "tool_icons");

  const copyJsonToClipboard = async () => {
    const jsonString = JSON.stringify(agentConfig, null, 2);
    try {
      await copyJson(jsonString);
      toast.success("Copied to clipboard", {
        duration: 1500,
        position: "top-center",
      });
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  };

  return (
    <Card className="bg-white rounded-xl py-0 gap-0 shadow-xs border border-slate-200 ">
      {/* Header with Tabs */}

      <div className="bg-primary/80 rounded-t-xl">
        <div className="px-4 xl:px-6 py-4 xl:py-4 flex items-center justify-between">
          <h2 className="text-base xl:text-lg font-semibold text-white flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agent Preview
          </h2>

          {/* Icon Tabs */}
          <div className="flex items-center gap-1 bg-primary/80 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("preview")}
              className={`p-2 rounded-md transition-all group relative cursor-pointer ${
                activeTab === "preview"
                  ? "bg-primary/80 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-primary/10"
              }`}
              title="Preview"
            >
              <Eye className="w-5 h-5" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Preview
              </span>
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`p-2 rounded-md transition-all group relative cursor-pointer ${
                activeTab === "json"
                  ? "bg-primary/80 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-primary/10"
              }`}
              title="JSON"
            >
              <Code className="w-5 h-5" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                JSON
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Tab Content */}
      {activeTab === "preview" && (
        <div className="divide-y divide-slate-200">
          {/* Basic Info Section */}
          <div className="p-4 xl:p-6 xl:space-y-6 space-y-4 ">
            {agentConfig.description && (
              <div>
                <h4 className="text-xs xl:text-sm font-semibold text-slate-900 mb-2">
                  Description
                </h4>
                <p className="text-xs xl:text-sm  text-slate-700 leading-relaxed">
                  {agentConfig.description}
                </p>
              </div>
            )}

            {agentConfig.instructions && (
              <div>
                <h4 className="text-xs xl:text-sm font-semibold text-slate-900 mb-3">
                  Instructions
                </h4>
                <div className="bg-slate-50 rounded-lg p-4 text-xs xl:text-sm text-slate-700 leading-relaxed">
                  {agentConfig.instructions}
                </div>
              </div>
            )}

            {agentConfig.agentRules && agentConfig.agentRules.length > 0 && (
              <div>
                <h4 className="text-xs xl:text-sm font-semibold text-slate-900 mb-3">
                  Agent Rules
                </h4>
                <div className="space-y-2">
                  {agentConfig.agentRules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0 mt-2"></div>
                      <p className="text-xs xl:text-sm text-slate-700">
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {agentConfig.successCriteria &&
              agentConfig.successCriteria.length > 0 && (
                <div>
                  <h4 className="text-xs xl:text-sm font-semibold text-slate-900 mb-3">
                    Success Criteria
                  </h4>
                  <div className="space-y-2">
                    {agentConfig.successCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <p className="text-xs xl:text-sm text-slate-700">
                          {criteria}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Tools Section (Collapsible) */}
          {agentConfig.tools && agentConfig.tools.length > 0 && (
            <div className="flex flex-col gap-6">
              <button
                onClick={() => setIsToolsCollapsed(!isToolsCollapsed)}
                className="w-full cursor-pointer px-6 py-4 flex items-center justify-between bg-muted hover:bg-primary/10 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Bolt className="w-5 h-5 text-slate-700" />
                  <h3 className=" text-base font-semibold text-slate-900">
                    Tools
                  </h3>
                  <span className="text-sm text-slate-600">
                    ({agentConfig.tools.length})
                  </span>
                </div>
                {isToolsCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {!isToolsCollapsed && (
                <div className="px-4 xl:px-6 pb-4 xl:pb-6">
                  <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
                    {agentConfig.tools.map((tool, index) => (
                      <div
                        key={`${tool.action}-${index}`}
                        className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="text-base xl:text-xl bg-primary/80 text-white rounded-xl p-2.5">
                          {getToolIcon(tool, toolIcons, defaultIcon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 text-xs xl:text-sm mb-1 xl:mb-0">
                            {tool.name}
                          </div>
                          <div className="text-xs xl:text-sm text-slate-600">
                            {tool.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Planning Steps Section (Collapsible) */}
          {agentConfig.planningSteps &&
            agentConfig.planningSteps.length > 0 && (
              <div>
                <button
                  onClick={() => setIsPlanningCollapsed(!isPlanningCollapsed)}
                  className="w-full px-4 xl:px-6 py-4 xl:py-4  flex items-center justify-between bg-muted hover:bg-primary/10 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <List className="w-5 h-5 text-slate-700" />
                    <h3 className="text-sm xl:text-base font-semibold text-slate-900">
                      Planning Steps
                    </h3>
                    <span className="text-xs xl:text-sm text-slate-600">
                      ({agentConfig.planningSteps.length})
                    </span>
                  </div>
                  {isPlanningCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {!isPlanningCollapsed && (
                  <div className="px-4 xl:px-6 pb-4 xl:pb-6 space-y-4 xl:mt-4 mt-2">
                    {agentConfig.planningSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-all"
                      >
                        {/* Step Header */}
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                          <div className="w-7 h-7 bg-primary/80 text-white rounded-lg flex items-center justify-center font-semibold text-sm shrink-0">
                            {index + 1}
                          </div>
                          <div className="font-semibold text-slate-900">
                            {step.step_name}
                          </div>
                        </div>

                        {/* Step Content */}
                        <div className="p-4 space-y-4">
                          {/* Tools */}
                          {step.tool && step.tool.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                                Tools
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {step.tool.map((tool, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-300"
                                  >
                                    {typeof tool === "string"
                                      ? tool
                                      : tool?.label || tool?.value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {step.condition !== "" && (
                            <div>
                              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                                Condition
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                                <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                                  {step.condition}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          {step.action && step.action.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                                Actions
                              </div>
                              <div className="space-y-2">
                                {step.action.map((action, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 bg-blue-50 rounded-md border border-blue-100"
                                  >
                                    <span className="text-sm text-slate-700 leading-relaxed">
                                      {action}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Rules */}
                          {step.rules && step.rules.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                                Rules
                              </div>
                              <div className="space-y-1.5">
                                {step.rules.map((rule, idx) => (
                                  <div
                                    key={idx}
                                    className="px-3 py-2 bg-slate-50 rounded-md font-mono text-xs text-slate-700 border border-slate-200"
                                  >
                                    {rule}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* Output Configuration Section (Collapsible) */}
          {agentConfig.outputFields && agentConfig.outputFields.length > 0 && (
            <div>
              <button
                onClick={() => setIsOutputCollapsed(!isOutputCollapsed)}
                className="w-full px-6 py-4 flex items-center justify-between bg-muted hover:bg-primary/10 transition-all"
              >
                <div className="flex items-center gap-2">
                  <FileOutput className="w-5 h-5 text-slate-700" />
                  <h3 className=" text-base font-semibold text-slate-900">
                    Structured Output
                  </h3>
                  <span className="text-sm text-slate-600">
                    ({agentConfig.outputFields.length})
                  </span>
                </div>
                {isOutputCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {!isOutputCollapsed && (
                <div className="px-6 pb-6 space-y-2.5 mt-2.5">
                  {agentConfig.outputFields.map((field) => (
                    <div
                      key={field.id}
                      className="border border-slate-200 rounded-lg p-3.5 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="font-mono text-sm font-semibold text-slate-900">
                          {field.name}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-300 shrink-0">
                          {field.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {field.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* JSON Tab Content */}
      {activeTab === "json" && (
        <div className="relative">
          {/* Copy Button */}
          <button
            onClick={copyJsonToClipboard}
            className="absolute top-4 right-4 z-10 p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all shadow-sm group"
            // title="Copy JSON"
          >
            {jsonCopied ? (
              <CheckCheck className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="absolute -bottom-8 right-0 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {jsonCopied ? "Copied!" : "Copy JSON"}
            </span>
          </button>

          {/* JSON Content */}
          <div className="p-6">
            <pre className="bg-slate-50 text-slate-800 p-4 rounded-lg text-xs font-mono leading-relaxed border border-slate-200 whitespace-pre-wrap">
              {JSON.stringify(agentConfig, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
};
