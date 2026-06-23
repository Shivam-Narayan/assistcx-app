"use client";

import { useEffect, useMemo, useState } from "react";
import { ChunksScrollViewer } from "@/app/(dashboard)/knowledge/manage-files/components/file-viewer/chunks-scroll-viewer";
import { FileInfo } from "@/app/(dashboard)/knowledge/manage-files/file-viewer";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { EmptyState } from "@/components/empty-state/empty-state";
import { SmartContentViewer } from "@/components/smart-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { downloadMarkdownFile } from "@/helper/helper-function";
import { Download, FileText } from "lucide-react";
import { InlineSearchBar } from "./inline-searchbar";

interface ContentChunksTabsProps {
  fileData: FileInfo | null;
  fileChunks: any[];
  fileContent: string;
  scrollRoot?: HTMLElement | null;
  fileChunksLoading: boolean;
  stickyHeaderOffset?: number;
  activeTab?: string;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const ContentChunksTabs = ({
  fileData,
  fileChunks,
  fileContent,
  scrollRoot = null,
  fileChunksLoading,
  stickyHeaderOffset = 0,
  activeTab,
}: ContentChunksTabsProps) => {
  const [contentSearch, setContentSearch] = useState("");
  const [contentSearchIndex, setContentSearchIndex] = useState(0);
  const [chunksSearch, setChunksSearch] = useState("");
  const [chunksSearchIndex, setChunksSearchIndex] = useState(0);

  const contentMatchCount = useMemo(() => {
    if (!contentSearch || !fileContent) return 0;
    return (
      fileContent.match(new RegExp(escapeRegex(contentSearch), "gi"))?.length ??
      0
    );
  }, [fileContent, contentSearch]);

  const chunksMatchCount = useMemo(() => {
    if (!chunksSearch || !fileChunks?.length) return 0;
    const allText = fileChunks.map((c) => c.text || "").join(" ");
    return (
      allText.match(new RegExp(escapeRegex(chunksSearch), "gi"))?.length ?? 0
    );
  }, [fileChunks, chunksSearch]);

  const handleContentSearch = (value: string) => {
    setContentSearch(value);
    setContentSearchIndex(0);
  };

  const handleChunksSearch = (value: string) => {
    setChunksSearch(value);
    setChunksSearchIndex(0);
  };

  const navigateContent = (direction: "prev" | "next") => {
    if (contentMatchCount === 0) return;
    setContentSearchIndex((prev) =>
      direction === "next"
        ? (prev + 1) % contentMatchCount
        : (prev - 1 + contentMatchCount) % contentMatchCount,
    );
  };

  const navigateChunks = (direction: "prev" | "next") => {
    if (chunksMatchCount === 0) return;
    setChunksSearchIndex((prev) =>
      direction === "next"
        ? (prev + 1) % chunksMatchCount
        : (prev - 1 + chunksMatchCount) % chunksMatchCount,
    );
  };

  useEffect(() => {
    if (fileData?.id) {
      setContentSearch("");
      setContentSearchIndex(0);
      setChunksSearch("");
      setChunksSearchIndex(0);
    }
  }, [fileData?.id]);

  // Clear both searches whenever the active tab changes
  useEffect(() => {
    setContentSearch("");
    setContentSearchIndex(0);
    setChunksSearch("");
    setChunksSearchIndex(0);
  }, [activeTab]);

  return (
    <>
      <TabsContent
        value="content"
        forceMount
        className="data-[state=inactive]:hidden"
      >
        <Card className="shadow-none py-0 gap-0">
          <CardHeader
            className="border-b gap-0 !py-3 !px-4 sticky z-10 bg-background rounded-t-xl"
            style={{ top: stickyHeaderOffset }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex flex-col">
                <CardTitle className="text-lg font-medium">Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Extracted text from the document
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {fileContent && !fileChunksLoading && (
                  <InlineSearchBar
                    search={contentSearch}
                    onSearchChange={handleContentSearch}
                    matchCount={contentMatchCount}
                    currentIndex={contentSearchIndex}
                    onNavigate={navigateContent}
                    onClear={() => handleContentSearch("")}
                    placeholder="Search in content..."
                  />
                )}
                {fileContent && (
                  <ConditionalTooltip
                    content="Download"
                    alwaysShow={true}
                    align="center"
                    showArrow={true}
                  >
                    <Button
                      className="cursor-pointer"
                      onClick={() => {
                        if (fileData?.id && fileContent) {
                          downloadMarkdownFile(
                            fileContent,
                            fileData.id,
                            fileData.name,
                          );
                        }
                      }}
                      disabled={!fileContent}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </ConditionalTooltip>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {fileChunksLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground mt-2">
                  Loading content...
                </p>
              </div>
            ) : fileContent && fileContent.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-md border overflow-hidden dark:bg-slate-700/30 ">
                  <SmartContentViewer
                    content={fileContent}
                    className="bg-gray-50 dark:bg-slate-700/30 "
                    expandView={true}
                    search={contentSearch}
                    currentSearchIndex={contentSearchIndex}
                    scrollRoot={scrollRoot}
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                title=" No content available"
                icon={FileText}
                variant="card"
                compact
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent
        value="chunks"
        forceMount
        className="data-[state=inactive]:hidden"
      >
        <Card className="shadow-none py-0 gap-0">
          <CardHeader
            className="border-b gap-0 !py-3 !px-4 sticky z-10 bg-background rounded-t-xl"
            style={{ top: stickyHeaderOffset }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg font-medium flex  flex-col">
                <div className="flex items-center gap-2 ">
                  Chunks{" "}
                  <Badge
                    variant="outline"
                    className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 h-7 text-xs px-2 py-0.2 flex items-center gap-1.5 font-normal cursor-pointer transition-all"
                  >
                    TOTAL
                    <span className="bg-slate-200 dark:bg-slate-600 px-1 py-0.5 rounded text-xs font-semibold">
                      {fileChunks?.length}
                    </span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Individual text segments extracted from the document
                </p>
              </CardTitle>
              {fileChunks?.length > 0 && !fileChunksLoading && (
                <InlineSearchBar
                  search={chunksSearch}
                  onSearchChange={handleChunksSearch}
                  matchCount={chunksMatchCount}
                  currentIndex={chunksSearchIndex}
                  onNavigate={navigateChunks}
                  onClear={() => handleChunksSearch("")}
                  placeholder="Search in chunks..."
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 gap-4 flex flex-col">
            {fileChunksLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground mt-2">
                  Loading file chunks...
                </p>
              </div>
            ) : fileChunks && fileChunks.length > 0 ? (
              <ChunksScrollViewer
                chunks={fileChunks}
                scrollRoot={scrollRoot}
                search={chunksSearch}
                currentSearchIndex={chunksSearchIndex}
              />
            ) : (
              <EmptyState
                title=" No chunks available"
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
