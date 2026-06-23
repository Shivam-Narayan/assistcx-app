"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs } from "@/components/ui/tabs";
import {
  UTCToLocalTimezon,
  errorMessageHandler,
  formatFileSize,
  getFileType,
  getFileTypeIcon,
  sortedMetadataEntries,
  useCopyToClipboard,
} from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { CalendarDays, File, HardDrive, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FileViewerLoader } from "./components/file-viewer/file-viewer-loader";
import { TabsContentViewer } from "./components/file-viewer/tabs-content-viewer";
import { TabsHeaders } from "./components/file-viewer/tabs-headers";
import { transformFileData } from "./data-table";

// TypeScript interfaces
interface FileMetadata {
  [key: string]: any;
}

interface KnowledgeItem {
  id: string;
  document_id: string;
  record_type: string;
  knowledge_topic: string;
  content: string;
  created_at: number;
  metadata: {
    file_name: string;
    file_uuid: string;
    [key: string]: any;
  };
}

interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  metadata?: FileMetadata;
}

interface FileViewerProps {
  isOpen: boolean;
  onClose: (value: boolean) => void;
  fileId: string | null;
  setSelectedFileId: (id: string | null) => void;
  enableKnowledgeFetching?: boolean; // New prop to control knowledge fetching
}

const FileViewer = ({
  isOpen,
  onClose,
  fileId,
  setSelectedFileId,
  enableKnowledgeFetching = true,
}: FileViewerProps) => {
  const [isCopied, copyToClipboard] = useCopyToClipboard();
  const [fileData, setFileData] = useState<FileInfo | null>(null);
  const [fileChunks, setFileChunks] = useState<any[]>([]);
  const [fileChunksLoading, setFileChunksLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");
  const [knowledgeData, setKnowledgeData] = useState<KnowledgeItem[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [expandedKnowledgeId, setExpandedKnowledgeId] = useState<string | null>(
    null,
  );
  const { axiosAuth } = useAxiosAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const sheetContentRef = useRef<HTMLDivElement>(null);
  const sheetHeaderRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
  const [stickyHeaderOffset, setStickyHeaderOffset] = useState(0);
  const resetScrollTabs = useRef(new Set(["content", "chunks"]));

  // Fetch knowledge data
  const fetchKnowledgeData = useCallback(async () => {
    if (!fileId) return;

    setKnowledgeLoading(true);
    try {
      const response = await axiosAuth.get(`/data-files/${fileId}/knowledge`);
      if (response.status === 200) {
        const sortedKnowledge = (response.data.knowledge || []).sort(
          (a: KnowledgeItem, b: KnowledgeItem) =>
            a.knowledge_topic.localeCompare(b.knowledge_topic),
        );
        setKnowledgeData(sortedKnowledge);
      }
    } catch (error) {
      console.error("Error fetching knowledge data:", error);
      setKnowledgeData([]);
    } finally {
      setKnowledgeLoading(false);
    }
  }, [axiosAuth, fileId]);

  const fetchFileDetails = useCallback(
    async (id: string) => {
      if (!id) return;
      try {
        const response = await axiosAuth.get(`/data-files/${id}`);
        if (response.status === 200) {
          const transformedData = transformFileData(
            response.data.data_files[0],
          );
          setFileData(transformedData);
        }
      } catch (error) {
        errorMessageHandler(error);
      }
    },
    [axiosAuth],
  );

  const fetchFileChunks = useCallback(
    async (id: string) => {
      if (!id) return;
      try {
        setFileChunksLoading(true);
        const response = await axiosAuth.get(`/data-files/${id}/chunks`);
        if (response.status === 200) {
          setFileChunks(response?.data?.chunks);
          setFileContent(response?.data?.extracted_content);
        }
      } catch (error) {
        errorMessageHandler(error);
      } finally {
        setFileChunksLoading(false);
      }
    },
    [axiosAuth],
  );
  // Fetch knowledge data when file viewer opens
  useEffect(() => {
    if (isOpen && fileId) {
      setFileData(null);
      fetchFileDetails(fileId);
      fetchFileChunks(fileId);
      if (enableKnowledgeFetching) {
        fetchKnowledgeData();
      }
      setActiveTab("overview");
    }

    return () => {
      setActiveTab("overview");
    };
  }, [isOpen, fileId, fetchKnowledgeData, fetchFileDetails]);

  // Scroll restore/reset when active tab changes
  useEffect(() => {
    const container = sheetContentRef.current;
    if (!container) return;
    const shouldReset = resetScrollTabs.current.has(activeTab);
    if (shouldReset) {
      container.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    setScrollRoot(sheetContentRef.current);
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
  if (!fileId) return null;

  const handleCopyFileId = () => {
    copyToClipboard(fileData?.id || "");
  };

  const toggleKnowledgeExpansion = (knowledgeId: string) => {
    setExpandedKnowledgeId(
      expandedKnowledgeId === knowledgeId ? null : knowledgeId,
    );
  };

  const showLoading = !fileData;

  const basicInfo = showLoading
    ? []
    : [
        {
          label: "File Name",
          value: fileData.name,
          icon: <File className="h-4 w-4" />,
        },
        {
          label: "File Type",
          value: getFileType(fileData?.name),
          icon: getFileTypeIcon(fileData.type),
        },
        {
          label: "File Size",
          value: formatFileSize(fileData.size),
          icon: <HardDrive className="h-4 w-4" />,
        },
        {
          label: "Created At",
          value: UTCToLocalTimezon(fileData.createdAt),
          icon: <CalendarDays className="h-4 w-4" />,
        },
        ...(fileData.updatedAt
          ? [
              {
                label: "Updated At",
                value: UTCToLocalTimezon(fileData.updatedAt),
                icon: <CalendarDays className="h-4 w-4" />,
              },
            ]
          : []),
      ];

  const rawMetadataEntries = showLoading
    ? []
    : fileData.metadata
      ? Object.entries(fileData.metadata).filter(
          ([, value]) => value !== null && value !== undefined && value !== "",
        )
      : [];

  // Sort metadata entries with custom ordering
  const metadataEntries = showLoading
    ? []
    : sortedMetadataEntries(rawMetadataEntries);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={() => {
        onClose(false);
      }}
    >
      <SheetContent
        ref={sheetContentRef}
        className="flex flex-col w-full max-w-xl sm:max-w-3xl p-0 gap-0 overflow-auto"
        onCloseAutoFocus={() => {
          onClose(false);
          setSelectedFileId(null);
        }}
      >
        {showLoading ? (
          <>
            <SheetHeader className="sr-only">
              <SheetTitle>File Viewer</SheetTitle>
            </SheetHeader>
            <FileViewerLoader
              enableKnowledgeFetching={enableKnowledgeFetching}
            />
          </>
        ) : (
          <>
            <SheetHeader className="sticky top-0 z-10 flex p-4  border-b space-y-0 bg-background">
              <div className="flex-row justify-between items-center flex ">
                <div className="flex items-center gap-2 flex-1 truncate max-w-[80%]">
                  {getFileTypeIcon(fileData.type)}
                  <SheetTitle className="flex-1 truncate max-w-[80%] text-lg font-medium">
                    {fileData.name}
                  </SheetTitle>
                </div>
                <SheetClose asChild>
                  <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
                    <X className="h-5 w-5" />
                  </div>
                </SheetClose>
              </div>

              <TabsHeaders
                activeTab={activeTab}
                onValueChange={setActiveTab}
                enableKnowledgeFetching={enableKnowledgeFetching}
              />
            </SheetHeader>

            <div ref={sheetHeaderRef} className="flex-1 p-4 space-y-4">
              <Tabs value={activeTab} className="flex-1">
                <TabsContentViewer
                  basicInfo={basicInfo}
                  metadataEntries={metadataEntries}
                  fileData={fileData}
                  fileChunks={fileChunks}
                  fileContent={fileContent}
                  knowledgeData={knowledgeData}
                  knowledgeLoading={knowledgeLoading}
                  expandedKnowledgeId={expandedKnowledgeId}
                  toggleKnowledgeExpansion={toggleKnowledgeExpansion}
                  isCopied={isCopied}
                  handleCopyFileId={handleCopyFileId}
                  scrollRoot={scrollRoot}
                  fileChunksLoading={fileChunksLoading}
                  enableKnowledgeFetching={enableKnowledgeFetching}
                  stickyHeaderOffset={stickyHeaderOffset}
                  activeTab={activeTab}
                />
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FileViewer;
export type { FileInfo, FileMetadata, KnowledgeItem };
