"use client";

import { EmptyState } from "@/components/empty-state/empty-state";
import { Sheet, SheetContent } from "@/components/ui/assistant-sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/lib/hook/useMobile";
import { File, Search } from "lucide-react";
import { useKnowledgeDetailList } from "../hooks/useKnowledgeDetailList";
import { FileCardResponsive } from "./file-card-responsive";
import FileViewer from "./file-viewer";
import { KnowledgeDetailHeader } from "./knowledge-detail-header";
import { KnowledgeDetailListLoader } from "./knowledge-detail-list-loader";
import { MobileFileDetailSheet } from "./mobile-file-detail-sheet";
import { JsonViewSheetProps } from "./types";
import { DataFile } from "../../chat/_components/types";

export const getLatestStatus = (file: DataFile): string => {
  if (Array.isArray(file.status) && file.status.length > 0) {
    return file.status[file.status.length - 1]?.status || "";
  }
  return "";
};

export function KnowledgeDetailList({
  open,
  onOpenChange,
  name,
  id,
}: JsonViewSheetProps) {
  const isMobile = useIsMobile();
  const {
    dataFile,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    page,
    hasMore,
    loaderRef,
    setSearchQuery,
    handleSearchChange,
    selectedFile,
    setSelectedFile,
    isFileDetailOpen,
    setIsFileDetailOpen,
    fileViewerRef,
    scrollContainerRef,
  } = useKnowledgeDetailList({ open, collectionId: id });

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(isOpen) => {
          onOpenChange(isOpen);
          if (!isOpen) {
            setSearchQuery("");
          }
        }}
      >
        <SheetContent
          side="right"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-full sm:max-w-[90%] p-0 gap-0"
        >
          <KnowledgeDetailHeader
            name={name}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={() => setSearchQuery("")}
            onClose={() => {
              setSearchQuery("");
              onOpenChange(false);
            }}
          />
          <div className="flex h-full">
            <div
              className="h-full overflow-y-auto max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-68px)] w-full md:w-[45%] lg:w-[40%] "
              ref={scrollContainerRef}
            >
              <div className={`block ${dataFile?.length === 0 && "h-full"}`}>
                {isLoading && page === 1 ? (
                  <KnowledgeDetailListLoader />
                ) : error ? (
                  <div className="text-center py-4 text-red-500">{error}</div>
                ) : dataFile.length === 0 ? (
                  <EmptyState
                    variant="inline"
                    title={"No files found"}
                    icon={Search}
                    action={
                      searchQuery && (
                        <Button
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => setSearchQuery("")}
                        >
                          Clear search
                        </Button>
                      )
                    }
                    className="h-full"
                  />
                ) : (
                  <>
                    <FileCardResponsive
                      filteredData={dataFile}
                      onSelectFile={(file) => setSelectedFile(file)} // Added for manual selection
                      selectedFile={selectedFile} // To highlight active file
                      isMobile={isMobile}
                      setIsFileDetailOpen={setIsFileDetailOpen}
                    />
                    {hasMore && (
                      <div
                        ref={loaderRef}
                        className="w-full h-5 flex items-center justify-center"
                      >
                        {isFetchingMore && (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span>Loading more...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div
              ref={fileViewerRef}
              className="h-full overflow-y-auto max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-68px)] flex-1 border-l border-gray-200
            md:block hidden "
            >
              {selectedFile ? (
                <FileViewer fileData={selectedFile} />
              ) : (
                <EmptyState
                  variant="inline"
                  title="Select a file to view details."
                  icon={File}
                  className="h-full"
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <MobileFileDetailSheet
        open={isFileDetailOpen}
        onOpenChange={setIsFileDetailOpen}
        selectedFile={selectedFile}
      />
    </>
  );
}
