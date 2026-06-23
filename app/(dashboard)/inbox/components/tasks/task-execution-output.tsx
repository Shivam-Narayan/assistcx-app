"use client";

import { CollapsibleContent as ExpandableContent } from "@/components/collapsible-content";
import { SmartContentViewer } from "@/components/smart-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, FileOutput } from "lucide-react";
import React, { useMemo, useState } from "react";

interface TaskExecutionOutputProps {
  agentOutputData: string;
}

interface ParsedData {
  [key: string]: any;
}

const formatKey = (key: string): string => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const parseOutputData = (
  data: string,
): { isJson: boolean; parsedData: ParsedData } => {
  try {
    const parsed = JSON.parse(data);
    return {
      isJson: typeof parsed === "object",
      parsedData: typeof parsed === "object" ? parsed : { Output: data },
    };
  } catch {
    return {
      isJson: false,
      parsedData: { Output: data },
    };
  }
};

const renderValue = (value: any): React.ReactNode => {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue.split(/\s+/).length === 1 ? (
      trimmedValue.toUpperCase()
    ) : (
      <SmartContentViewer content={value} />
    );
  }
  return <SmartContentViewer content={value} />;
};

export const TaskExecutionOutput: React.FC<TaskExecutionOutputProps> = ({
  agentOutputData,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { parsedData } = useMemo(
    () => parseOutputData(agentOutputData),
    [agentOutputData],
  );
  const [isJson, setIsJson] = useState(false);

  return (
    <Card
      className={`p-0 gap-0 shadow-xs overflow-hidden divide-y transition-colors border bg-white dark:bg-slate-800`}
    >
      <CardHeader
        className={`
        px-4 py-3 gap-0 cursor-pointer transition-colors duration-300 hover:bg-slate-100 dark:hover:bg-slate-500
        
      `}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <FileOutput className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            <CardTitle className="text-base xl:text-lg text-gray-800 dark:text-slate-200">
              Final Output
            </CardTitle>
          </div>
          <div className="flex items-center space-x-4 ">
            <div
              className="flex items-center bg-white space-x-2 cursor-pointer border rounded-lg px-3 py-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Label htmlFor="isJson">JSON</Label>
              <Switch
                checked={isJson}
                onCheckedChange={(checked) => setIsJson(checked)}
                id="isJson"
              />
            </div>
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            )}
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="p-3 xl:p-5 text-gray-700 dark:text-slate-300 flex flex-col gap-4">
          {isJson ? (
            <SmartContentViewer content={parsedData} expandView={true} />
          ) : (
            Object.entries(parsedData).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">
                  {formatKey(key)}
                </p>
                <div className="bg-muted/50 wrap-break-word p-3 rounded-md border text-sm">
                  <ExpandableContent
                    className="prose prose-sm dark:prose-invert max-w-none reset-prose"
                    maxHeight={150}
                    gradientStart="from-slate-50"
                  >
                    {value ? renderValue(value) : "N/A"}
                  </ExpandableContent>
                </div>
              </div>
            ))
          )}
        </CardContent>
      )}
    </Card>
  );
};
