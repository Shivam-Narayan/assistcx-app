"use client";

import { KnowledgeItem } from "@/app/(dashboard)/knowledge/manage-files/file-viewer";
import { EmptyState } from "@/components/empty-state/empty-state";
import { SmartContentViewer } from "@/components/smart-content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { getPreviewContent } from "@/helper/helper-function";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";

interface KnowledgeTabProps {
  knowledgeData: KnowledgeItem[];
  knowledgeLoading: boolean;
  expandedKnowledgeId: string | null;
  toggleKnowledgeExpansion: (knowledgeId: string) => void;
  enableKnowledgeFetching?: boolean;
}

export const KnowledgeTab = ({
  knowledgeData,
  knowledgeLoading,
  expandedKnowledgeId,
  toggleKnowledgeExpansion,
  enableKnowledgeFetching,
}: KnowledgeTabProps) => {
  if (!enableKnowledgeFetching) return null;

  return (
    <TabsContent value="knowledge">
      <Card className="shadow-none py-0 gap-0">
        <CardHeader className="border-b gap-0 !py-3 !px-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">
              Extracted Knowledge
            </CardTitle>
            {knowledgeData.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {knowledgeData.length} topics
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Extracted content on the knowledge topics
          </p>
        </CardHeader>
        <CardContent className="p-4">
          {knowledgeLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground mt-2">
                Loading knowledge...
              </p>
            </div>
          ) : knowledgeData.length > 0 ? (
            <div className="space-y-3">
              {knowledgeData.map((knowledge) => (
                <Card
                  key={knowledge.id}
                  className="shadow-none border py-0 gap-0 overflow-hidden"
                >
                  <CardHeader
                    className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleKnowledgeExpansion(knowledge.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            className="text-base font-medium"
                          >
                            {knowledge.knowledge_topic
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {getPreviewContent(knowledge.content)}
                        </p>
                      </div>
                      <div className="shrink-0 ml-4">
                        {expandedKnowledgeId === knowledge.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {expandedKnowledgeId === knowledge.id && (
                    <CardContent className="px-4 pb-4 pt-0 border-t">
                      <div className="pt-4">
                        <SmartContentViewer
                          content={knowledge.content}
                          className="prose prose-sm max-w-none"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No knowledge extracted"
              icon={Brain}
              variant="card"
              compact
              description="This document does not have any extracted knowledge topics"
            />
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};
