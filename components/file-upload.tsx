"use client";

import { Loader2, UploadIcon, X, LucideProps } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { getFileIcon } from "@/lib/utils";

interface FileUpload {
  File: File;
}

interface fileUploadProps {
  text: string;
  subText: string;
  multiple?: boolean;
  accept?: Accept;
  handleImportAgent?: (files: FileUpload[]) => void;
  isLoading?: boolean;
  buttonText?: string;
}

export default function FileUpload({
  text,
  subText,
  multiple = true,
  accept,
  handleImportAgent,
  isLoading,
  buttonText,
}: fileUploadProps) {
  const [filesToUpload, setFilesToUpload] = useState<FileUpload[]>([]);

  const removeFile = (file: File) => {
    setFilesToUpload((prevUploadProgress) => {
      return prevUploadProgress.filter((item) => item.File !== file);
    });
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length !== 0) {
        if (!multiple && acceptedFiles.length > 1) {
          // If `multiple` is false, accept only one file at a time
          acceptedFiles = acceptedFiles.slice(0, 1);
        }

        setFilesToUpload((prevUploadProgress) => {
          // If `multiple` is false, only keep the latest file
          return multiple
            ? [...prevUploadProgress, ...acceptedFiles.map(fileMapper)]
            : [fileMapper(acceptedFiles[0])];
        });
      }
    },
    [multiple],
  );

  const fileMapper = (file: File) => ({
    File: file,
    source: null,
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple,
    accept,
  });

  // Helper function to reset the input after selecting files
  // const clearInputValue = () => {
  //   const input = document.getElementById("dropzone-file") as HTMLInputElement;
  //   if (input) input.value = ""; // Reset the input field value
  // };

  const acceptToString = (accept: Accept | undefined): string | undefined => {
    if (!accept) return undefined;
    return Object.keys(accept).join(",");
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files); // Convert FileList to Array
      onDrop(fileArray); // Use the same onDrop handler
    }
  };

  return (
    <div>
      <div>
        <label
          {...getRootProps()}
          className="relative flex flex-col items-center justify-center w-full py-6 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted"
        >
          <div className=" text-center">
            <div className="rounded-full border border-dashed p-3 max-w-min mx-auto">
              <UploadIcon
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            <p className="mt-4 text-sm text-secondary-foreground">
              <span className="font-semibold">{text}</span>
            </p>
            <p className="text-xs text-muted-foreground">{subText}</p>
          </div>
        </label>

        <Input
          {...getInputProps()}
          id="dropzone-file"
          accept={acceptToString(accept)}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {filesToUpload.length > 0 && (
        <div>
          <ScrollArea className="h-30">
            <div>
              <p className="font-medium my-2 mt-6 text-muted-foreground text-sm">
                File to upload
              </p>
              <div className="space-y-2">
                {filesToUpload.map((fileUploadProgress) => {
                  const Icon: React.ComponentType<LucideProps> = getFileIcon(
                    fileUploadProgress.File.type,
                  );
                  return (
                    <div
                      key={fileUploadProgress.File.lastModified}
                      className="flex justify-between gap-2 rounded-lg overflow-hidden border group pr-2"
                    >
                      <div className="flex items-center flex-1 p-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="w-full ml-2 space-y-1">
                          <div className="text-sm flex justify-between max-w-xs">
                            <p className="text-muted-foreground truncate">
                              {fileUploadProgress.File.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            removeFile(fileUploadProgress.File);
                          }}
                          className="size-2 border-none h-6 w-6 cursor-pointer"
                        >
                          <X className="size-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end mt-5">
            <Button
              className="cursor-pointer"
              onClick={() => {
                if (handleImportAgent) {
                  handleImportAgent(filesToUpload);
                }
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {buttonText || "Upload Files"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
