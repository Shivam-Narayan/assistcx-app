import { JumpingLoadingAnimation } from "@/components/JumpingLoadingAnimation";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  getFileType,
  getStatusColor,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import { formatFileSize, getFileIcon } from "@/lib/utils";
import { FileDataItem } from "@/types/types";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Download, RefreshCw, Trash2 } from "lucide-react";
import React from "react";

interface FileRowProps {
  rowItem: FileDataItem;
  index: number;
  onRename: (id: string, newName: string) => void;
  isRenaming: boolean;
  onRenameStart: () => void;
  onRenameCancel: () => void;
  onDeleteConfirmPopup: () => void;
  onDownload: () => void;
  isDataFileAction: boolean;
  onSelectFile: (id: string, checked: boolean) => void;
  selectedFiles?: string[];
  onFileViewerOpen: () => void;
  onReIndexHandle: () => void;
}

export default function FileRow({
  rowItem,
  index,
  onRename,
  isRenaming,
  onRenameStart,
  onRenameCancel,
  onDeleteConfirmPopup,
  onDownload,
  isDataFileAction,
  onSelectFile,
  selectedFiles = [],
  onFileViewerOpen,
  onReIndexHandle,
}: FileRowProps) {
  const getLatestStatus = (file: any): string => {
    if (Array.isArray(file.status) && file.status.length > 0) {
      return file.status[file.status.length - 1]?.status || "";
    }
    return "";
  };

  const status = getLatestStatus(rowItem);
  const isLoadingStatus = ["INDEXING", "PARSING", "EXTRACTING"].includes(
    status,
  );

  const loadingColor =
    status === "INDEXING"
      ? "bg-violet-500"
      : status === "PARSING"
        ? "bg-blue-500"
        : status === "EXTRACTING"
          ? "bg-cyan-500"
          : "";
  return (
    <TableRow key={`file-${index}`}>
      <TableCell className="p-3">
        <Checkbox
          className="translate-y-[2px] cursor-pointer"
          checked={selectedFiles.includes(rowItem.id)}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => {
            onSelectFile(rowItem.id, checked === true);
          }}
        />
      </TableCell>

      <TableCell className="p-3 font-medium min-w-[180px] max-w-[260px]">
        <div
          className="flex items-center cursor-pointer hover:text-primary transition-colors"
          onClick={onFileViewerOpen}
        >
          <div>
            {React.createElement(getFileIcon(rowItem.mime_type), {
              className: "h-4 w-4 mr-2",
            })}
          </div>
          <ConditionalTooltip content={rowItem?.name}>
            <div className="max-w-[300px] truncate cursor-pointer">
              <span>{rowItem?.name}</span>
            </div>
          </ConditionalTooltip>
        </div>
      </TableCell>
      <TableCell className="p-3 w-fit max-w-[100px] min-w-[100px]">
        <Badge variant="outline" className="text-sm">
          {getFileType(rowItem?.name)}
        </Badge>
      </TableCell>

      <TableCell className="p-3 w-fit max-w-[100px] min-w-[100px]">
        {formatFileSize(rowItem?.size)}
      </TableCell>
      <TableCell className="p-3">
        <Badge
          variant="outline"
          className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap uppercase ${getStatusColor(
            status,
          )}`}
        >
          {isLoadingStatus && (
            <JumpingLoadingAnimation
              color={loadingColor}
              className="w-3 h-3 mr-1"
            />
          )}
          {status}
        </Badge>
      </TableCell>

      <TableCell className="p-3 w-fit max-w-fit min-w-[100px]">
        {UTCToLocalTimezon(rowItem?.updated_at)}
      </TableCell>
      <TableCell className="p-3 max-w-[50px] min-w-[50px] ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span
              className={`${!isDataFileAction ? "cursor-not-allowed" : ""}`}
            >
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
                aria-label="Open file actions menu"
                disabled={!isDataFileAction}
              >
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </span>
          </DropdownMenuTrigger>
          {isDataFileAction && (
            <DropdownMenuContent align="end" className="w-[160px]">
              {["FAILED", "SUCCESSFUL", "QUEUED"].includes(
                getLatestStatus(rowItem),
              ) && (
                <DropdownMenuItem
                  onSelect={onDeleteConfirmPopup}
                  className="cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onSelect={onDownload}
                className="cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              {["FAILED", "SUCCESSFUL"].includes(getLatestStatus(rowItem)) && (
                <DropdownMenuItem
                  onSelect={onReIndexHandle}
                  className="cursor-pointer"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-Index
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
