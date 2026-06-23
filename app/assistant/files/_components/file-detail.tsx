import FileViewer from "@/app/(dashboard)/knowledge/manage-files/file-viewer";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UTCToLocalTimezon } from "@/helper/helper-function";
import { cn } from "@/lib/utils";
import { Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { FileDetailProps, FileItem } from "./types";

export default function FileDetail({
  file,
  isSelected,
  confirmDeleteId,
  setConfirmDeleteId,
  handleDelete,
  isDeleting,
  IconComponent,
  iconData,
  isConfirming,
}: FileDetailProps) {
  const [fileViewerOpen, setFileViewerOpen] = useState<boolean>(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleFileViewerOpen = (fileData: FileItem) => {
    setFileViewerOpen(true);
    setSelectedFileId(fileData?.id);
  };
  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
  };

  return (
    <>
      <Card
        className={cn(
          "relative flex flex-row items-center justify-between shadow-xs p-3 cursor-pointer group transition-colors hover:bg-gray-100/70",
          isSelected && "border-blue-600 border-2",
        )}
        onMouseLeave={() => {
          if (confirmDeleteId === file.id) {
            setConfirmDeleteId(null);
          }
        }}
        onClick={() => handleFileViewerOpen(file)}
      >
        <div className="flex-1 max-w-[calc(100%-100px)]">
          <div className="flex items-start gap-2 max-w-full">
            {IconComponent && (
              <div className="text-gray-500 shrink-0 mt-1">
                <IconComponent
                  className={`${
                    iconData ? iconData.color : "text-gray-500"
                  } h-5 w-5`}
                />
              </div>
            )}
            <div className="flex flex-col max-w-full">
              <ConditionalTooltip
                content={file?.name ?? "NA"}
                alwaysShow={true}
                align="center"
                showArrow={true}
                className="break-all"
              >
                <h2 className="text-sm font-medium line-clamp-1 mb-1">
                  {file?.name ?? "NA"}
                </h2>
              </ConditionalTooltip>

              {file?.updated_at && (
                <p className="text-xs text-muted-foreground">
                  Last updated {UTCToLocalTimezon(file?.updated_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {isConfirming ? (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
                className="cursor-pointer h-6 w-6 md:h-8 md:w-8"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => handleDelete(file.id)}
                className="cursor-pointer h-6 w-6 md:h-8 md:w-8"
                disabled={isDeleting === file.id}
              >
                {isDeleting === file.id ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteId(file.id);
              }}
              className="cursor-pointer h-6 w-6 md:h-8 md:w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </Card>
      <FileViewer
        isOpen={fileViewerOpen}
        onClose={handleFileViewerClose}
        fileId={selectedFileId}
        setSelectedFileId={setSelectedFileId}
        enableKnowledgeFetching={false}
      />
    </>
  );
}
