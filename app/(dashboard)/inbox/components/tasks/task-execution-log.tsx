"use client";

import { CollapsibleContent as ExpandableContent } from "@/components/collapsible-content";
import { SmartContentViewer } from "@/components/smart-content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutionMessage, ToolCall } from "@/types/types";
import { Cpu, MessageSquare, UserCircle, Wrench } from "lucide-react";
import React from "react";

import CopyToClipboard from "@/components/copy-to-clipboard";

// Helper functions for message icons and labels
const getMessageIcon = (role: ExecutionMessage["role"]): React.ReactElement => {
  switch (role) {
    case "user":
      return React.createElement(UserCircle, {
        className: "h-6 w-6 text-blue-500",
      });
    case "assistant":
      return React.createElement(Cpu, { className: "h-6 w-6 text-green-500" });
    case "tool":
      return React.createElement(Wrench, {
        className: "h-6 w-6 text-purple-500",
      });
    default:
      const exhaustiveCheck: never = role;
      return React.createElement(MessageSquare, {
        className: "h-6 w-6 text-gray-500",
      });
  }
};

const getMessageRoleLabel = (role: ExecutionMessage["role"]) => {
  switch (role) {
    case "user":
      return "User";
    case "assistant":
      return "Assistant";
    case "tool":
      return "Tool Output";
    default:
      const exhaustiveCheck: never = role;
      return "Message";
  }
};

interface TaskExecutionLogProps {
  messages: ExecutionMessage[];
}

export const TaskExecutionLog: React.FC<TaskExecutionLogProps> = ({
  messages,
}) => {
  return (
    <div>
      <div className="space-y-4 mr-4 md:mr-6">
        {messages.map((msg, index) => (
          <Card
            key={index}
            className="p-0 gap-0 border shadow-xs rounded-md bg-white dark:bg-slate-800 overflow-hidden"
          >
            <CardHeader
              className={`px-4! py-3! flex flex-row items-center gap-3 border-b ${
                msg.role === "user"
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-900/20"
                  : msg.role === "assistant"
                  ? "bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-900/20"
                  : "bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-900/20"
              }`}
            >
              {getMessageIcon(msg.role)}
              <CardTitle className="text-base font-medium">
                {getMessageRoleLabel(msg.role)}
                {msg.role === "tool" && msg.name && (
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    ({msg.name})
                  </span>
                )}
              </CardTitle>
              {msg.role === "tool" && msg.credits !== undefined && (
                <Badge
                  variant="outline"
                  className="ml-auto text-sm text-primary/80"
                >
                  Credits: {msg.credits}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 md:p-5 text-gray-700 dark:text-slate-300">
              {msg.content && (
                <div className="reset-prose max-w-none">
                  <ExpandableContent
                    gradientStart="from-background"
                    className="prose prose-sm dark:prose-invert max-w-none reset-prose"
                  >
                    <SmartContentViewer content={msg.content} />
                  </ExpandableContent>
                </div>
              )}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">
                    Tool Calls
                  </h5>
                  {msg.tool_calls.map((call: ToolCall) => (
                    <div
                      key={call.id}
                      className="p-3 border rounded-md bg-slate-50 dark:bg-slate-700/40"
                    >
                      <p className="font-medium text-base mb-1">
                        Tool:{" "}
                        <code className="text-pink-600 font-semibold dark:text-pink-400">
                          {call.function.name}
                        </code>
                      </p>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                        <span>ID: {call.id}</span>
                        <CopyToClipboard
                          text={call?.id || ""}
                          tooltipLabel="Copy ID"
                        />
                      </p>
                      <details className="text-sm border rounded-md p-2">
                        <summary className="cursor-pointer font-medium text-base text-foreground/70 hover:text-foreground/80 mb-1">
                          Tool Input
                        </summary>
                        <div className="mt-2 bg-transparent dark:bg-slate-800/60 rounded-md">
                          <ExpandableContent
                            className="prose prose-sm dark:prose-invert max-w-none reset-prose"
                            gradientStart="from-slate-50"
                          >
                            <SmartContentViewer
                              content={call.function.arguments}
                              className="bg-background!"
                            />
                          </ExpandableContent>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}
              {msg.role === "tool" && msg.tool_call_id && (
                <p className="text-xs text-muted-foreground mt-3">
                  Tool Call ID: {msg.tool_call_id}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
