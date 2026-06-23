import { Card } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import {
  getFileExtension,
  getIconForFileType,
} from "@/helper/assistant-helper/helper";
import { getTimeAgo } from "@/helper/helper-function";
import { formatFileSize } from "@/lib/utils";
import * as Icons from "lucide-react";
import FileViewer from "./file-viewer";
import { FileCardResponsiveProps } from "./types";
import { DataFile } from "../../chat/_components/types";

export const FileCardResponsive = ({
  filteredData,
  onSelectFile,
  selectedFile,
  isMobile,
  setIsFileDetailOpen,
}: FileCardResponsiveProps) => {
  return (
    <div className="p-4 space-y-4">
      {filteredData.map((file) => {
        const iconData = getIconForFileType({
          name: file?.name,
          mime: file?.mime_type || "",
        });
        const IconComponent = (
          iconData && Icons[iconData?.icon as keyof typeof Icons]
            ? Icons[iconData?.icon as keyof typeof Icons]
            : Icons.File
        ) as React.ElementType;
        const isSelected = selectedFile?.id === file.id;

        return (
          <div key={`${file.id}-${file.updated_at}`}>
            <Card
              onClick={() => {
                onSelectFile(file);
                if (isMobile) {
                  setIsFileDetailOpen(true);
                }
              }}
              className={`cursor-pointer relative p-3 group transition-colors shadow-xs ${
                isSelected
                  ? "bg-primary/10 border-primary/30"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <IconComponent
                  className={`${
                    iconData ? iconData.color : "text-muted-foreground"
                  } h-5 w-5 shrink-0 mt-0.5`}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {file?.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 mt-2 text-xs text-muted-foreground">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {getFileExtension(file?.mime_type || "")?.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Icons.HardDrive className="h-3.5 w-3.5" />
                        <span>{formatFileSize(file?.size)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icons.Clock className="h-3.5 w-3.5" />
                        <span>{getTimeAgo(file?.updated_at || "")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {selectedFile &&
              isSelected &&
              (() => {
                const file = selectedFile; // Type narrowing helper
                return (
                  <Sheet>
                    <SheetContent>
                      <FileViewer fileData={selectedFile as DataFile} />
                    </SheetContent>
                  </Sheet>
                );
              })()}
          </div>
        );
      })}
    </div>
  );
};
