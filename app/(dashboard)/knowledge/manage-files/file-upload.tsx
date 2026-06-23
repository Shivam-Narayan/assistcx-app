"use client";

import CustomProgressBar from "@/components/custom-progress-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import {
  truncateFileName,
  validateFile,
} from "@/helper/assistant-helper/helper";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { formSchema, FormSchemaType } from "@/lib/schemas/knowledge-schemas";
import { formatFileSize, getFileIcon } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Loader2,
  LucideProps,
  UploadIcon,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 10;

const allowedMimeTypes = {
  "application/pdf": [".pdf"],
  "text/markdown": [".md"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
};

interface UploadFile {
  name: string;
  error?: string;
}

interface FileUploadProps {
  collection_id: string;
  collection_name: string;
  open: boolean;
  onClose: () => void;
  refresh?: () => void;
}

export default function FileUpload({
  collection_id,
  open,
  onClose,
  refresh,
}: FileUploadProps) {
  const { axiosAuth, loading } = useAxiosAuth();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [isLoading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [successful_uploads, setSuccessfulUploads] = useState<any>(null);
  const [unsuccessful_uploads, setUnsuccessfulUploads] = useState<UploadFile[]>(
    []
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
    },
    mode: "onChange",
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles: File[] = [];

      for (const file of acceptedFiles) {
        const result = await validateFile(
          file,
          uploadedFiles,
          allowedMimeTypes,
          MAX_FILES
        );

        if (!result.isValid) {
          toast.error(result.errorMessage!);
          continue;
        }

        validFiles.push(file);
      }

      const newFiles = [...uploadedFiles, ...validFiles].slice(0, MAX_FILES);

      setUploadedFiles(newFiles);
      form.setValue("files", newFiles, { shouldValidate: true });

      if (validFiles.length > 0) {
        toast.success(`Added ${validFiles.length} file(s)`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, uploadedFiles, allowedMimeTypes]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    accept: {
      "application/pdf": [".pdf"],
      "text/markdown": [".md"],
      "application/vnd.openxmlformats-officedocument.*": [".docx", ".pptx"],
    },
    onDropRejected: (fileRejections: FileRejection[]) => {
      if (fileRejections.length > MAX_FILES) {
        toast.error(`You can only upload up to ${MAX_FILES} files`);
        return;
      }
      fileRejections.forEach(({ file, errors }, index) => {
        const file_name = truncateFileName(file.name, 25);
        errors.forEach((error) => {
          setTimeout(() => {
            if (error.code === "file-too-large") {
              toast.error(
                `File size exceeds the 50MB limit ${file_name} is ${(
                  file.size /
                  (1024 * 1024)
                ).toFixed(2)} MB.`
              );
            } else if (error.code === "file-invalid-type") {
              toast.error(
                `Invalid file type Allowed types: PDF, Markdown (.md), DOCX, PPTX.`
              );
            } else {
              toast.error(`Upload Error: ${file_name}: ${error.message}`);
            }
          }, index * 1000);
        });
      });
    },
  });

  const onSubmit = async (values: FormSchemaType) => {
    if (!loading) {
      setUploadProgress(0);
      setLoading(true);
      const formData = new FormData();
      values.files.forEach((file) => {
        const mimeType =
          file.type || (file.name.endsWith(".md") ? "text/markdown" : "");
        formData.append(
          "data_files",
          new File([file], file.name, { type: mimeType })
        );
      });
      formData.append("collection_id", collection_id || "");

      try {
        const result = await axiosAuth.post(url.UPLOAD_DATA_FILE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || 1;
            const percentage = Math.round((progressEvent.loaded / total) * 100);
            setUploadProgress(percentage);
          },
        });
        if (result.status === 200) {
          const { unsuccessful_uploads = [], successful_uploads = [] } =
            result.data;
          setUnsuccessfulUploads(unsuccessful_uploads);
          setSuccessfulUploads(successful_uploads);

          unsuccessful_uploads.forEach((file: UploadFile) => {
            const file_name = truncateFileName(file.name, 25);
            toast.error(`Upload failed: ${file_name} (${file.error})`);
          });

          if (unsuccessful_uploads?.length === 0) {
            successMessageHandler(messages.files_upload_successfully);
            resetAll();
            onClose?.();
            refresh?.();
          }

          setLoading(false);
          setUploadProgress(0);
        }
      } catch (error) {
        console.error("Error during import:", error);
        errorMessageHandler(error);
        setLoading(false);
        setUploadProgress(0);
      }
    }
  };

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = uploadedFiles.filter((file) => file !== fileToRemove);
    setUploadedFiles(updatedFiles);
    form.setValue("files", updatedFiles);
  };

  const resetAll = () => {
    setUploadedFiles([]);
    setSuccessfulUploads(null);
    setUnsuccessfulUploads([]);
    setUploadProgress(0);
    form.reset();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            resetAll();
            onClose();
          }
        }}
      >
        <DialogContent className="flex flex-col p-0 overflow-auto gap-2 sm:max-w-xl">
          <DialogHeader className="sticky top-0 z-10 flex px-4 pt-3 flex-row justify-between items-center space-y-0 bg-background">
            <div className="w-full">
              <DialogTitle>Upload Files</DialogTitle>
            </div>

            <DialogClose>
              <div
                className="p-1 rounded-md cursor-pointer hover:bg-secondary"
                onClick={onClose}
              >
                <X />
              </div>
            </DialogClose>
          </DialogHeader>

          <DialogDescription className="px-4 pb-2">
            Upload up to 10 files (.pdf, .md, .docx, .pptx, max 50MB each)
          </DialogDescription>
          <div className="px-5 pb-5">
            <Toaster />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div
                          {...getRootProps()}
                          className="relative flex flex-col items-center justify-center w-full py-6 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted"
                        >
                          <input {...getInputProps()} />
                          <div className="rounded-full border border-dashed p-3 max-w-min mx-auto">
                            <UploadIcon
                              className="size-7 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="mt-4 text-sm text-secondary-foreground">
                            <span className="font-semibold">
                              Drag and drop your file here or click to browse.
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground ml-3">
                            Only PDF, Markdown, DOCX, and PPTX files (max 50MB
                            each, up to 10 files)
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {uploadedFiles.length > 0 && (
                  <div>
                    <ScrollArea
                      className={`${
                        uploadedFiles.length > 3
                          ? "h-[200px] rounded-md border p-3"
                          : ""
                      }`}
                    >
                      {uploadedFiles.map((file) => {
                        const Icon: React.ComponentType<LucideProps> =
                          getFileIcon(file.type); // Get the icon based on MIME type
                        const isUnsuccessful = unsuccessful_uploads?.some(
                          (failedFile: UploadFile) =>
                            failedFile.name === file.name
                        );
                        const isSuccessful: boolean =
                          successful_uploads?.data_files?.some(
                            (successFile: { name: string }) =>
                              successFile.name === file.name
                          );
                        return (
                          <div
                            key={file.name}
                            className="flex items-center justify-between bg-muted p-2 rounded-md mb-2 w-auto"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="max-w-xs">
                                  <p className="text-sm font-medium truncate">
                                    {file.name}
                                  </p>{" "}
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSuccessful && (
                                <CheckCircle2 className="h-5 w-5 text-info-foreground" />
                              )}
                              {isUnsuccessful && (
                                <XCircle className="h-5 w-5 text-error-foreground" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(file)}
                                className="cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </ScrollArea>
                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        uploadedFiles.some(
                          (file) =>
                            successful_uploads?.data_files?.some(
                              (successFile: { name: string }) =>
                                successFile.name === file.name
                            ) ||
                            unsuccessful_uploads?.some(
                              (failedFile) => failedFile.name === file.name
                            )
                        )
                      }
                      className="w-full mt-4 cursor-pointer"
                    >
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Upload
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* uploading file progress bar */}
      {uploadProgress > 0 && (
        <CustomProgressBar
          downloadProgress={uploadProgress}
          status={"Uploading"}
        />
      )}
    </>
  );
}
