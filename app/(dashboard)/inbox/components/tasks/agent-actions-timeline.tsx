"use client";

import { CollapsibleContent as ExpandableContent } from "@/components/collapsible-content";
import { SmartContentViewer } from "@/components/smart-content";
import { Button } from "@/components/ui/button";
import * as helperFun from "@/helper/helper-function";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Terminal,
  Workflow,
  ZapIcon,
} from "lucide-react";
import React, { useState } from "react";

interface AgentAction {
  name: string;
  icon: string;
  action: string;
  input: any;
  output: any;
  thought: string;
}

interface AgentActionsTimelineProps {
  agentActions: AgentAction[];
}

const capitalizeTitle = (title: string) => {
  let sentenceCaseStr = title.replace(/_/g, " ").toLowerCase();
  sentenceCaseStr =
    sentenceCaseStr.charAt(0).toUpperCase() + sentenceCaseStr.slice(1);
  if (sentenceCaseStr.endsWith(";")) {
    return sentenceCaseStr.slice(0, -1);
  }
  return sentenceCaseStr;
};

// Helper component for displaying tool badges with better visuals
const ToolBadge = ({
  name,
  isOutput = false,
}: {
  name: string;
  isOutput?: boolean;
}) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 rounded-full text-xs px-2 py-0.5 border",
      isOutput
        ? "border-purple-200 dark:border-purple-900/40 bg-purple-50/60 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
        : "border-green-200 dark:border-green-900/40 bg-green-50/60 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    )}
  >
    {isOutput ? (
      <ArrowRight className="h-3 w-3 stroke-[2.5]" />
    ) : (
      <ZapIcon className="h-3 w-3 stroke-[2.5]" />
    )}
    <span className="">{name}</span>
  </div>
);

export const AgentActionsTimeline: React.FC<AgentActionsTimelineProps> = ({
  agentActions,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [allExpanded, setAllExpanded] = useState(false);

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => {
      const newExpandedSteps = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index];

      setAllExpanded(newExpandedSteps.length === agentActions?.length);
      return newExpandedSteps;
    });
  };

  const toggleAllSteps = () => {
    if (allExpanded) {
      setExpandedSteps([]);
      setAllExpanded(false);
    } else {
      setExpandedSteps(agentActions?.map((_, index) => index));
      setAllExpanded(true);
    }
  };

  const renderAction = (log: string) => {
    const segments = log.split(/(```(?:json)?\n[\s\S]*?\n```)/);
    return segments.map((segment, index) => {
      if (segment.startsWith("```")) {
        const codeString = segment.replace(/```(?:json)?\n|```/g, "");
        return (
          <pre
            key={index}
            className="whitespace-pre-wrap break-all text-sm p-4 mt-3 rounded-md bg-white"
          >
            {helperFun.renderSyntaxHighlight(codeString)}
          </pre>
        );
      }
      return (
        <span key={index} className="text-base">
          {segment}
        </span>
      );
    });
  };

  if (!agentActions || agentActions.length === 0) {
    return null;
  }

  return (
    <div className="mr-4 xl:mr-6">
      {/* Header with expand/collapse all */}
      <div className="flex items-center justify-between sticky top-0 bg-background py-2 z-5 mb-4">
        <div className="flex items-center">
          <Terminal className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-lg xl:text-xl font-semibold">Execution Log</h2>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllSteps}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          {allExpanded ? (
            <>
              <span className="text-sm">Collapse All</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="text-sm">Expand All</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Card wrapper for timeline */}
      <div className="border rounded-md bg-white dark:bg-slate-800 shadow-xs overflow-hidden">
        {agentActions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No agent actions recorded
          </div>
        ) : (
          <ul className="relative">
            {agentActions.map((action, index) => {
              const isExpanded = expandedSteps.includes(index);
              const isLast = index === agentActions.length - 1;

              return (
                <li
                  key={index}
                  className={cn(
                    "relative",
                    !isLast && "border-b border-gray-200 dark:border-gray-700",
                  )}
                >
                  {/* Vertical Timeline Line for previous segments */}
                  {index > 0 && (
                    <div className="absolute left-8 top-0 w-0.5 h-4 -ml-px bg-purple-200 dark:bg-purple-900/30" />
                  )}

                  {/* Vertical Timeline Line for current segment */}
                  {!isLast && (
                    <div className="absolute left-8 top-8 w-0.5 bottom-0 -ml-px bg-purple-200 dark:bg-purple-900/30" />
                  )}

                  {/* Step header - always visible */}
                  <div
                    onClick={() => toggleStep(index)}
                    className={cn(
                      "flex items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors relative",
                      isExpanded && "bg-gray-50 dark:bg-slate-700/20",
                    )}
                  >
                    <div className="shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center relative bg-purple-100 dark:bg-purple-900/30">
                        <Workflow className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <p className="text-sm xl:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                          {action.name
                            ? action.name
                            : capitalizeTitle(action.action)}
                        </p>
                        <ToolBadge name={action.action} />
                      </div>
                      <p className="text-xs text-muted-foreground/90 truncate mt-1.5">
                        {action.thought?.split("\n")[0] ||
                          "No description available"}
                      </p>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div
                      className={cn(
                        "pl-14 pr-4 py-5 relative flex flex-col gap-4",
                        isLast ? "" : "pb-4",
                      )}
                    >
                      {/* Thoughts & Input */}
                      <div className="bg-gray-50 dark:bg-slate-700/30 rounded-md border p-3 overflow-x-auto">
                        <h3 className="text-xs xl:text-sm font-medium text-muted-foreground mb-2">
                          Thoughts & Input
                        </h3>
                        <ExpandableContent
                          className="prose prose-sm dark:prose-invert max-w-none reset-prose"
                          gradientStart="from-slate-50"
                        >
                          <SmartContentViewer
                            content={action.thought}
                            expandView={true}
                          />
                          {/* {renderAction(action.thought)} */}
                        </ExpandableContent>
                      </div>

                      {/* Tool Output */}
                      <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-md border text-sm">
                        <h3 className="text-xs xl:text-sm font-medium text-muted-foreground mb-2">
                          Tool Output
                        </h3>
                        <ExpandableContent
                          className="prose prose-sm dark:prose-invert max-w-none reset-prose"
                          gradientStart="from-slate-50"
                        >
                          <SmartContentViewer
                            content={action.output}
                            expandView={true}
                          />
                          {/* {helperFun.renderSyntaxHighlight(action.output)} */}
                        </ExpandableContent>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
