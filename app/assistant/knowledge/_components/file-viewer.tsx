"use client";

import { Tabs } from "@/components/ui/tabs";
import { CalendarDays, File, HardDrive } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";

import { TabsContentViewer } from "@/app/(dashboard)/knowledge/manage-files/components/file-viewer/tabs-content-viewer";
import { TabsHeaders } from "@/app/(dashboard)/knowledge/manage-files/components/file-viewer/tabs-headers";
import { transformFileData } from "@/app/(dashboard)/knowledge/manage-files/data-table";
import {
  FileInfo,
  KnowledgeItem,
} from "@/app/(dashboard)/knowledge/manage-files/file-viewer";
import { getFileExtension } from "@/helper/assistant-helper/helper";
import {
  errorMessageHandler,
  formatFileSize,
  getFileTypeIcon,
  sortedMetadataEntries,
  useCopyToClipboard,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { FileDataItem } from "@/types/types";
import { fileViewerProps } from "./types";

const FileViewer = ({
  fileData,
  enableKnowledgeFetching = true,
}: fileViewerProps) => {
  const { axiosAuth } = useAxiosAuth();
  const [isCopied, copyToClipboard] = useCopyToClipboard();
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeItem[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [fileChunksLoading, setFileChunksLoading] = useState(false);
  const [expandedKnowledgeId, setExpandedKnowledgeId] = useState<string | null>(
    null,
  );
  const [fileChunks, setFileChunks] = useState<any[]>([]);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileLoading, setFileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFileForViewer, setSelectedFileForViewer] =
    useState<FileInfo | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sheetHeaderRef = useRef<HTMLDivElement>(null);
  const [stickyHeaderOffset, setStickyHeaderOffset] = useState(0);
  const tabScrollPositionsRef = useRef<Record<string, number>>({});
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const resetScrollTabs = useRef(new Set(["content", "chunks"]));

  // Fetch knowledge data for the file viewer
  const fetchKnowledgeData = useCallback(async () => {
    if (!fileData) return;

    setKnowledgeLoading(true);
    try {
      const response = await axiosAuth.get(
        `/data-files/${fileData.id}/knowledge`,
      );
      if (response.status === 200) {
        const sortedKnowledge = (response.data.knowledge || []).sort(
          (a: KnowledgeItem, b: KnowledgeItem) =>
            a.knowledge_topic.localeCompare(b.knowledge_topic),
        );
        setKnowledgeData(sortedKnowledge);
      }
    } catch (error) {
      errorMessageHandler(error);
      setKnowledgeData([]);
    } finally {
      setKnowledgeLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosAuth]);

  // Fetch file details for the file viewer
  const fetchFileDetails = useCallback(
    async (id: string) => {
      if (!id) return;
      try {
        setFileLoading(true);
        const response = await axiosAuth.get(`/data-files/${id}`);
        if (response.status === 200) {
          const transformedData = transformFileData(
            response.data.data_files[0] as FileDataItem,
          );
          setSelectedFileForViewer(transformedData as FileInfo);
        }
      } catch (error) {
        errorMessageHandler(error);
      } finally {
        setFileLoading(false);
      }
    },
    [axiosAuth],
  );
  const fetchFileChunks = useCallback(async () => {
    if (!fileData?.id) return;
    try {
      setFileChunksLoading(true);
      const response = await axiosAuth.get(`/data-files/${fileData.id}/chunks`);
      if (response.status === 200) {
        setFileChunks(response?.data?.chunks);
        setFileContent(response?.data?.extracted_content);
      }
    } catch (error) {
      errorMessageHandler(error);
      setFileChunks([]);
      setFileContent("");
    } finally {
      setFileChunksLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosAuth, fileData?.id]);
  // Fetch knowledge data when file viewer opens
  useEffect(() => {
    if (fileData) {
      fetchFileDetails(fileData.id || "");
      if (enableKnowledgeFetching) {
        fetchKnowledgeData();
      }
      fetchFileChunks();
      setActiveTab("overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileData]);

  const handleCopyFileId = () => {
    copyToClipboard(selectedFileForViewer?.id || "");
  };

  // Toggle knowledge item expansion
  const toggleKnowledgeExpansion = (knowledgeId: string) => {
    setExpandedKnowledgeId(
      expandedKnowledgeId === knowledgeId ? null : knowledgeId,
    );
  };

  const basicInfo = [
    {
      label: "File Name",
      value: selectedFileForViewer?.name || "",
      icon: <File className="h-4 w-4" />,
    },
    {
      label: "File Type",
      value: getFileExtension(selectedFileForViewer?.type || "")?.toUpperCase(),
      icon: getFileTypeIcon(selectedFileForViewer?.type || ""),
    },
    {
      label: "File Size",
      value: formatFileSize(selectedFileForViewer?.size || 0),
      icon: <HardDrive className="h-4 w-4" />,
    },
    {
      label: "Created At",
      value: UTCToLocalTimezon(selectedFileForViewer?.createdAt || ""),
      icon: <CalendarDays className="h-4 w-4" />,
    },
    ...(selectedFileForViewer?.updatedAt
      ? [
          {
            label: "Updated At",
            value: UTCToLocalTimezon(selectedFileForViewer?.updatedAt || ""),
            icon: <CalendarDays className="h-4 w-4" />,
          },
        ]
      : []),
  ];

  const rawMetadataEntries = selectedFileForViewer?.metadata
    ? Object.entries(selectedFileForViewer.metadata).filter(
        ([, value]) => value !== null && value !== undefined && value !== "",
      )
    : [];

  const metadataEntries = sortedMetadataEntries(rawMetadataEntries);

  const handleTabChange = useCallback(
    (nextTab: string) => {
      const container = scrollContainerRef.current;
      if (container) {
        if (!resetScrollTabs.current.has(activeTab)) {
          tabScrollPositionsRef.current[activeTab] = container.scrollTop;
        }
      }
      setActiveTab(nextTab);
    },
    [activeTab],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const shouldReset = resetScrollTabs.current.has(activeTab);
    const savedScroll = shouldReset
      ? 0
      : (tabScrollPositionsRef.current[activeTab] ?? 0);
    requestAnimationFrame(() => {
      container.scrollTop = savedScroll;
    });
  }, [activeTab]);

  useEffect(() => {
    setScrollRoot(scrollContainerRef.current);
  }, []);
  useLayoutEffect(() => {
    const wrapper = sheetHeaderRef.current;
    if (!wrapper) return;
    const update = () => setStickyHeaderOffset(wrapper.offsetTop);
    const observer = new ResizeObserver(update);
    observer.observe(wrapper.parentElement ?? wrapper);
    update();
    return () => observer.disconnect();
  }, [fileData]);

  return (
    <div
      ref={scrollContainerRef}
      className="sm:flex sm:flex-col w-full h-full overflow-auto break-all relative"
    >
      <TabsHeaders
        activeTab={activeTab}
        onValueChange={handleTabChange}
        isAssistant={true}
        enableKnowledgeFetching={enableKnowledgeFetching}
      />
      <div ref={sheetHeaderRef} className="flex flex-col w-full flex-1 p-4">
        <Tabs value={activeTab} className="flex-1">
          <TabsContentViewer
            fileChunks={fileChunks}
            fileContent={fileContent}
            basicInfo={basicInfo}
            metadataEntries={metadataEntries}
            fileData={selectedFileForViewer}
            knowledgeData={knowledgeData}
            knowledgeLoading={knowledgeLoading}
            fileChunksLoading={fileChunksLoading}
            expandedKnowledgeId={expandedKnowledgeId}
            toggleKnowledgeExpansion={toggleKnowledgeExpansion}
            isCopied={isCopied}
            handleCopyFileId={handleCopyFileId}
            scrollRoot={scrollRoot}
            enableKnowledgeFetching={enableKnowledgeFetching}
            stickyHeaderOffset={stickyHeaderOffset}
            activeTab={activeTab}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default FileViewer;
