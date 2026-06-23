"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { EmptyState } from "@/components/empty-state/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { MetadataValue } from "@/helper/helper-function";
import { Check, Copy, FileText } from "lucide-react";

interface BasicInfoItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface OverviewMetadataTabsProps {
  basicInfo: BasicInfoItem[];
  metadataEntries: [string, any][];
  isCopied: boolean;
  handleCopyFileId: () => void;
}

export const OverviewMetadataTabs = ({
  basicInfo,
  metadataEntries,
  isCopied,
  handleCopyFileId,
}: OverviewMetadataTabsProps) => {
  return (
    <>
      <TabsContent value="overview">
        <Card className="shadow-none py-0 gap-0">
          <CardHeader className="border-b gap-0 !py-3 !px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium gap-0">
                File Information
              </CardTitle>

              <ConditionalTooltip
                content={isCopied ? "Copied!" : "Copy File ID"}
                alwaysShow={true}
                align="center"
                showArrow={true}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0.5 rounded-full hover:bg-muted"
                  onClick={handleCopyFileId}
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </ConditionalTooltip>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {basicInfo.map((info, index) => (
              <div
                key={info.label}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 ${
                  index !== basicInfo.length - 1 ? "border-b border-dashed" : ""
                }`}
              >
                <div className="flex items-center gap-2 shrink-0">
                  {info.icon}
                  <span className="font-medium text-sm">{info.label}</span>
                </div>
                <div className="text-sm text-muted-foreground sm:max-w-[60%] w-full sm:text-right break-words">
                  {info.value}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="metadata">
        <Card className="shadow-none py-0 gap-0">
          <CardHeader className="border-b gap-0 !py-3 !px-4">
            <CardTitle className="text-lg font-medium">File Metadata</CardTitle>
            <p className="text-sm text-muted-foreground">
              Extracted fields and their values
            </p>
          </CardHeader>
          <CardContent
            className={`p-0 ${metadataEntries.length === 0 ? "p-4" : "p-0"}`}
          >
            {metadataEntries.length > 0 ? (
              <div className="divide-y divide-dashed">
                {metadataEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-2 flex items-start">
                      <span className="text-sm font-medium text-muted-foreground">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="col-span-3 flex break-all items-start min-w-0">
                      <MetadataValue value={value} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No metadata available"
                description="This file does not have any extracted metadata fields"
                icon={FileText}
                variant="card"
                compact
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};
