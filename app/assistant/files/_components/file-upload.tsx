"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatFileSize, getFileIcon } from "@/lib/utils";
import { CheckCircle2, Loader2, UploadIcon, X, XCircle } from "lucide-react";
import { useFileUpload } from "../hooks/useFileUpload";
import { FileUploadProps } from "./types";
import CustomProgressBar from "@/components/custom-progress-bar";

export default function FileUpload({
  setIsPopupOpen,
  onUploadSuccess,
}: FileUploadProps) {
  const {
    form,
    onSubmit,
    dropzone,
    uploadedFiles,
    removeFile,
    isFileSuccessful,
    isFileUnsuccessful,
    isLoading,
    uploadProgress,
    isSubmitDisabled,
    isUploadInProgress,
    MAX_FILES,
    MAX_FILE_SIZE,
  } = useFileUpload({ setIsPopupOpen, onUploadSuccess });

  const { getRootProps, getInputProps, isDragActive } = dropzone;

  return (
    <>
      <Card className="w-full max-w-xl mx-auto border-0">
        <CardHeader>
          <CardDescription>
            File uploaded will be securely stored to your private collection and
            will only be accessible to you. Upload up to {MAX_FILES} files at a
            time having maximum file size of {MAX_FILE_SIZE / (1024 * 1024)}MB.
            Supported file types: PDF, DOCX, PPTX, Markdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="files"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <div
                        {...getRootProps()}
                        className={`relative flex flex-col items-center justify-center w-full py-6 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted ${
                          isDragActive ? "border-primary" : ""
                        }`}
                      >
                        <input {...getInputProps()} />
                        <div className="rounded-full border border-dashed p-3 max-w-min mx-auto">
                          <UploadIcon
                            className="size-7 text-primary"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="mt-4 text-sm text-secondary-foreground">
                          <span className="font-semibold">
                            {isDragActive
                              ? "Drop files here"
                              : "Drag and drop files or click to browse"}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supported formats: PDF, Markdown, DOCX, PPTX
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {uploadedFiles.length > 0 && (
                <ScrollArea
                  className={
                    uploadedFiles.length > 3
                      ? "h-[200px] rounded-md border p-3"
                      : ""
                  }
                >
                  {uploadedFiles.map((file) => {
                    const Icon = getFileIcon(file.type);

                    return (
                      <div
                        key={file.name}
                        className="flex items-center justify-between bg-muted p-2 rounded-md mb-2 w-auto"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="max-w-xs">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isFileSuccessful(file) && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {isFileUnsuccessful(file) && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file);
                            }}
                            disabled={isLoading}
                            aria-label="Remove file"
                            className="cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              )}

              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full cursor-pointer"
                aria-label="Upload files"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isUploadInProgress && (
        <CustomProgressBar
          downloadProgress={uploadProgress}
          status="Uploading"
        />
      )}
    </>
  );
}
