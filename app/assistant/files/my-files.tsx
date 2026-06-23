"use client";

import { BoxLayout } from "@/components/assistant/box-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useMyFiles } from "@/app/assistant/files/hooks/useMyFiles";
import { getIconForFileType } from "@/helper/assistant-helper/helper";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as Icons from "lucide-react";
import { FilesIcon, Plus, Search } from "lucide-react";
import { useState } from "react";
import { MyFileLoader } from "./_components/my-file-loader";
import UploadFilePopup from "./_components/upload-file-popup";

import { EmptyState } from "@/components/empty-state/empty-state";
import FileDetail from "./_components/file-detail";

export default function MyFiles() {
  const {
    files,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    selectedFiles,
    confirmDeleteId,
    page,
    hasMore,
    loaderRef,
    setConfirmDeleteId,
    setSearchQuery,
    handleDelete,
    handleSearchChange,
    refetchFiles,
    isDeleting,
  } = useMyFiles();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className="flex flex-col items-center w-full z-0">
      <BoxLayout className="w-full h-full flex flex-col min-w-full md:max-w-full">
        <div className="sticky top-0  backdrop-blur-md z-10 ">
          <div className="md:max-w-screen-md md:mx-auto pt-20 md:pt-12 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl md:text-3xl font-semibold">My Files</h1>
              <Button
                className="cursor-pointer !h-8 !px-3 !py-2"
                onClick={() => setIsPopupOpen(true)}
                aria-label="Upload Files"
              >
                <Plus className="h-4 w-4" /> Upload Files
              </Button>
            </div>
            <div className="relative w-full mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search your files..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 bg-white border border-input shadow-xs transition-colors ring-offset-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full  overflow-auto md:max-w-screen-md md:mx-auto">
          <div className="space-y-3 w-full pb-6">
            {isLoading && page === 1 ? (
              Array.from({ length: 5 }).map((_, index) => (
                <MyFileLoader key={`loader-${index}`} />
              ))
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : files.length === 0 ? (
              <EmptyState
                variant="fullpage"
                title="No files found!"
                icon={FilesIcon}
                action={
                  <Button
                    variant="outline"
                    className="cursor-pointer !h-8 !px-3 !py-2"
                    onClick={() => setIsPopupOpen(true)}
                    aria-label="Upload Files"
                  >
                    <Plus className="h-4 w-4" /> Upload Files
                  </Button>
                }
              />
            ) : (
              <>
                {files.map((file) => {
                  const isSelected = selectedFiles.includes(file.id);
                  const isConfirming = confirmDeleteId === file.id;
                  const iconData = getIconForFileType({
                    name: file?.name,
                    mime: file?.mime_type,
                  });
                  const IconComponent = (
                    iconData && Icons[iconData?.icon as keyof typeof Icons]
                      ? Icons[iconData?.icon as keyof typeof Icons]
                      : Icons.File
                  ) as React.ElementType;
                  return (
                    <FileDetail
                      key={`${file.id}-${file.updated_at}`}
                      file={file}
                      isSelected={isSelected}
                      confirmDeleteId={confirmDeleteId}
                      isConfirming={isConfirming}
                      setConfirmDeleteId={setConfirmDeleteId}
                      handleDelete={handleDelete}
                      isDeleting={isDeleting}
                      IconComponent={IconComponent}
                      iconData={iconData}
                    />
                  );
                })}

                {hasMore && (
                  <div
                    ref={loaderRef}
                    className="w-full h-10 flex items-center justify-center"
                  >
                    {isFetchingMore && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span>Loading more files...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </BoxLayout>
      <UploadFilePopup
        isPopupOpen={isPopupOpen}
        setIsPopupOpen={setIsPopupOpen}
        onUploadSuccess={() => {
          refetchFiles();
        }}
      />
    </div>
  );
}
