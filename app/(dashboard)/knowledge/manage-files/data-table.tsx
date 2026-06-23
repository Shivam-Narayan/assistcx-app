import { ConfirmationDialog } from "@/components/confirmation-modal";
import CustomProgressBar from "@/components/custom-progress-bar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
  downloadBase64File,
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { setSelectedFiles } from "@/redux/knowledge/collections-slice";
import { useAppSelector } from "@/redux/store";
import { FileDataItem } from "@/types/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { columns } from "./columns";
import FileRow from "./file-row";
import FileViewer, { FileInfo } from "./file-viewer";
import FloatingActionBar from "./floating-action-bar";
import { RenderDataTableSkeleton } from "./loading";

interface DataTableProps {
  filesData: FileDataItem[];
  isListLoading: boolean;
  getManageFileData: (value: number) => void;
  isDataFileAction: boolean;
}

export const transformFileData = (fileData: FileDataItem): FileInfo => {
  // Use only file_metadata from the API response (AI-extracted document metadata)
  const finalMetadata = fileData.file_metadata || {};

  return {
    id: fileData.id,
    name: fileData.name,
    type: fileData.mime_type,
    size: fileData.size,
    createdAt:
      fileData.created_at || fileData.updated_at || new Date().toISOString(),
    updatedAt: fileData.updated_at,
    createdBy: fileData.source_type
      ? `Source: ${fileData.source_type}`
      : undefined,
    metadata: finalMetadata,
  };
};
export default function DataTable({
  filesData,
  isListLoading,
  getManageFileData,
  isDataFileAction,
}: DataTableProps) {
  const { axiosAuth, loading } = useAxiosAuth();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const [openBulkDeleteConfirm, setOpenBulkDeleteConfirm] =
    useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const selectedFiles = useAppSelector(
    (state) => state.collectionsReducer.selectedFiles,
  );
  const [isBackgroundLoading, setIsBackgroundLoading] =
    useState<boolean>(false);
  const [fileViewerOpen, setFileViewerOpen] = useState<boolean>(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  const dispatch = useDispatch();

  const handleRenameStart = (id: string) => {
    setRenamingId(id);
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
  };

  // Rename Data File Name
  const handleRenameFileName = async (id: string, newName: string) => {
    if (newName.length < 4) {
      errorMessageHandler(messages.file_name_validation);
      return;
    }

    if (!loading) {
      const requestBody = { name: newName };
      const API_ENDPOINT = `${url.RENAME_DATA_FILE_NAME}/${id}/rename`;
      try {
        const result = await axiosAuth.post(API_ENDPOINT, requestBody);

        if (result.status === 200) {
          setRenamingId(null);
          getManageFileData(1);
          successMessageHandler(messages.file_rename_successfully);
        }
      } catch (error: any) {
        let errorMessage = error?.response?.data?.detail;
        if (typeof errorMessage === "string") {
          errorMessageHandler(errorMessage);
        }
      } finally {
        setTimeout(() => {
          setRenamingId(null);
        }, 1000);
      }
    }
  };

  // Delete File
  const handleDeleteFile = async () => {
    if (!loading) {
      let requestBody = {
        data_file_ids: [deleteFileId],
      };
      try {
        const result = await axiosAuth.delete(`${url.DELETE_DATA_FILE}`, {
          data: requestBody,
        });
        if (result.status === 200) {
          successMessageHandler(result?.data?.message);
          setOpenDeleteConfirm(false);
          getManageFileData(1);
        }
      } catch (error: any) {
        let errorMessage = error?.response?.data?.detail;
        if (typeof errorMessage === "string") {
          errorMessageHandler(errorMessage);
        }
      }
    }
  };

  const onDeleteConfirmPopup = (id: string) => {
    setOpenDeleteConfirm(true);
    setDeleteFileId(id);
  };

  // Download Data File with Progress
  const handleDownloadDataFile = async (id: string) => {
    if (!loading) {
      setDownloadProgress(0);
      try {
        const response = await axiosAuth.get(
          `${url.DOWNLOAD_DATA_FILE}/${id}/download`,
          {
            responseType: "json", // Use "json" if expecting JSON response
            onDownloadProgress: (progressEvent) => {
              const percentComplete = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1),
              );
              setDownloadProgress(percentComplete);
            },
          },
        );
        const { content, file_name, mime_type } = response.data;
        if (content && file_name && mime_type) {
          downloadBase64File(content, file_name, mime_type);
          successMessageHandler(messages.download_completed_successfully);
        }
      } catch (error) {
        errorMessageHandler(error);
      } finally {
        setDownloadProgress(0);
      }
    }
  };

  const currentPageIds = useMemo(() => filesData.map((f) => f.id), [filesData]);

  const allPageRowsSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedFiles.includes(id));

  const handleSelectAllOnPage = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      dispatch(setSelectedFiles([...currentPageIds]));
    } else {
      dispatch(setSelectedFiles([]));
    }
  };

  const handleSelectcheckkFile = (id: string, checked: boolean) => {
    const updated = checked
      ? [...selectedFiles, id]
      : selectedFiles.filter((fileId) => fileId !== id);
    dispatch(setSelectedFiles(updated));
  };

  // Transform FileDataItem to FileInfo for the viewer

  // Handle file viewer open
  const handleFileViewerOpen = (fileData: FileDataItem) => {
    setFileViewerOpen(true);
    setSelectedFileId(fileData?.id);
  };

  // Handle file viewer close
  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
  };
  const callCountRef = useRef(0);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const getLatestStatus = (file: any): string => {
      if (Array.isArray(file.status) && file.status.length > 0) {
        return file.status[file.status.length - 1]?.status || "";
      }
      return "";
    };

    // 2. Check if polling is needed
    const hasPendingFiles = filesData.some((file) => {
      const latestStatus = getLatestStatus(file);
      return latestStatus !== "SUCCESSFUL" && latestStatus !== "FAILED";
    });

    if (!hasPendingFiles) {
      setIsBackgroundLoading(false);
      if (intervalIdRef.current) {
        clearTimeout(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      callCountRef.current = 0;
      return;
    }

    setIsBackgroundLoading(true);

    // Clear any existing timer before setting a new one
    if (intervalIdRef.current) {
      clearTimeout(intervalIdRef.current);
    }

    const delay =
      callCountRef.current < 15
        ? 10000
        : 10000 + (callCountRef.current - 14) * 2000;

    intervalIdRef.current = setTimeout(() => {
      getManageFileData(1);
      callCountRef.current += 1;
    }, delay);

    return () => {
      if (intervalIdRef.current) {
        clearTimeout(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [filesData, dispatch, getManageFileData]);

  const handleReindex = async (id: string) => {
    if (!loading && !isReindexing) {
      setIsReindexing(true);
      try {
        const result = await axiosAuth.post(`${url.RE_INDEX}/reindex`, {
          data_file_ids: id,
        });
        if (result.status === 200) {
          successMessageHandler(result?.data?.message);
          getManageFileData(1);
        }
      } catch (error: any) {
        let errorMessage = error?.response?.data?.detail;
        if (typeof errorMessage === "string") {
          errorMessageHandler(errorMessage);
        }
      } finally {
        setIsReindexing(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!loading && selectedFiles.length > 0 && !isBulkActionLoading) {
      setIsBulkActionLoading(true);
      try {
        const result = await axiosAuth.delete(`${url.DELETE_DATA_FILE}`, {
          data: { data_file_ids: selectedFiles },
        });
        if (result.status === 200) {
          successMessageHandler(result?.data?.message);
          setOpenBulkDeleteConfirm(false);
          dispatch(setSelectedFiles([]));
          getManageFileData(1);
        }
      } catch (error: any) {
        let errorMessage = error?.response?.data?.detail;
        if (typeof errorMessage === "string") {
          errorMessageHandler(errorMessage);
        }
      } finally {
        setIsBulkActionLoading(false);
      }
    }
  };

  const handleBulkReindex = async () => {
    if (!loading && selectedFiles.length > 0 && !isBulkActionLoading) {
      setIsBulkActionLoading(true);
      try {
        const result = await axiosAuth.post(`${url.RE_INDEX}/reindex`, {
          data_file_ids: selectedFiles,
        });
        if (result.status === 200) {
          successMessageHandler(result?.data?.message);
          dispatch(setSelectedFiles([]));
          getManageFileData(1);
        }
      } catch (error: any) {
        let errorMessage = error?.response?.data?.detail;
        if (typeof errorMessage === "string") {
          errorMessageHandler(errorMessage);
        }
      } finally {
        setIsBulkActionLoading(false);
      }
    }
  };

  // Skeleton Loading
  if ((!isBackgroundLoading && isListLoading) || loading) {
    return <RenderDataTableSkeleton />;
  }

  return (
    <>
      <Sheet>
        <div className="space-y-4">
          <Card className="p-0 gap-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-3 w-12">
                    <Checkbox
                      aria-label="Select all files on this page"
                      className="translate-y-[2px] cursor-pointer"
                      checked={allPageRowsSelected}
                      onCheckedChange={handleSelectAllOnPage}
                      disabled={!filesData.length}
                    />
                  </TableHead>
                  {columns.map((header, index) => (
                    <TableHead className="p-3" key={index}>
                      {header.header_name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filesData?.length ? (
                  filesData?.map((rowItem, index) => (
                    <FileRow
                      key={rowItem.id}
                      rowItem={rowItem}
                      index={index}
                      onRename={handleRenameFileName}
                      isRenaming={renamingId === rowItem.id}
                      onRenameStart={() => handleRenameStart(rowItem.id)}
                      onRenameCancel={handleRenameCancel}
                      onDeleteConfirmPopup={() => {
                        onDeleteConfirmPopup(rowItem.id);
                      }}
                      onDownload={() => handleDownloadDataFile(rowItem.id)}
                      isDataFileAction={isDataFileAction}
                      onSelectFile={handleSelectcheckkFile}
                      selectedFiles={selectedFiles}
                      onFileViewerOpen={() => handleFileViewerOpen(rowItem)}
                      onReIndexHandle={() => handleReindex(rowItem.id)}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center"
                    >
                      No Result
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </Sheet>
      {/* Download Progress Bar */}
      {downloadProgress > 0 && (
        <CustomProgressBar
          downloadProgress={downloadProgress}
          status={"Downloading"}
        />
      )}

      <ConfirmationDialog
        open={openDeleteConfirm}
        confirm={handleDeleteFile}
        cancel={() => setOpenDeleteConfirm(false)}
        title="Are you sure you want to delete file?"
        description="Deleting the file will permanently remove it from your system."
      />

      <ConfirmationDialog
        open={openBulkDeleteConfirm}
        confirm={handleBulkDelete}
        cancel={() => setOpenBulkDeleteConfirm(false)}
        title={`Delete ${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}?`}
        description="This will permanently remove the selected files from your system. This action cannot be undone."
      />

      {isDataFileAction && (
        <FloatingActionBar
          selectedCount={selectedFiles.length}
          onDeleteAll={() => setOpenBulkDeleteConfirm(true)}
          onReindexAll={handleBulkReindex}
          onClearSelection={() => dispatch(setSelectedFiles([]))}
          isLoading={isBulkActionLoading}
        />
      )}

      {/* File Viewer */}
      <FileViewer
        isOpen={fileViewerOpen}
        onClose={handleFileViewerClose}
        fileId={selectedFileId}
        setSelectedFileId={setSelectedFileId}
      />
    </>
  );
}
