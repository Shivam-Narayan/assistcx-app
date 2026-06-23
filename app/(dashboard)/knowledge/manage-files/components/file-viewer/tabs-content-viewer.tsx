"use client";

import {
  FileInfo,
  KnowledgeItem,
} from "@/app/(dashboard)/knowledge/manage-files/file-viewer";
import { ContentChunksTabs } from "./content-chunks-tabs";
import { KnowledgeTab } from "./knowledge-tab";
import { OverviewMetadataTabs } from "./overview-metadata-tabs";

interface BasicInfoItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface TabsContentViewerProps {
  basicInfo: BasicInfoItem[];
  metadataEntries: [string, any][];
  fileData: FileInfo | null;
  knowledgeData: KnowledgeItem[];
  fileChunks: any[];
  fileContent: string;
  knowledgeLoading: boolean;
  expandedKnowledgeId: string | null;
  toggleKnowledgeExpansion: (knowledgeId: string) => void;
  isCopied: boolean;
  handleCopyFileId: () => void;
  scrollRoot?: HTMLElement | null;
  fileChunksLoading: boolean;
  enableKnowledgeFetching?: boolean;
  stickyHeaderOffset?: number;
  activeTab?: string;
}

export const TabsContentViewer = ({
  basicInfo,
  metadataEntries,
  fileData,
  fileChunks,
  fileContent,
  knowledgeData,
  knowledgeLoading,
  expandedKnowledgeId,
  toggleKnowledgeExpansion,
  isCopied,
  handleCopyFileId,
  scrollRoot = null,
  fileChunksLoading,
  enableKnowledgeFetching,
  stickyHeaderOffset = 0,
  activeTab,
}: TabsContentViewerProps) => {
  return (
    <>
      <OverviewMetadataTabs
        basicInfo={basicInfo}
        metadataEntries={metadataEntries}
        isCopied={isCopied}
        handleCopyFileId={handleCopyFileId}
      />

      <ContentChunksTabs
        fileData={fileData}
        fileChunks={fileChunks}
        fileContent={fileContent}
        scrollRoot={scrollRoot}
        fileChunksLoading={fileChunksLoading}
        stickyHeaderOffset={stickyHeaderOffset}
        activeTab={activeTab}
      />

      <KnowledgeTab
        knowledgeData={knowledgeData}
        knowledgeLoading={knowledgeLoading}
        expandedKnowledgeId={expandedKnowledgeId}
        toggleKnowledgeExpansion={toggleKnowledgeExpansion}
        enableKnowledgeFetching={enableKnowledgeFetching}
      />
    </>
  );
};
