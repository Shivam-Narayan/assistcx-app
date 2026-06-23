"use client";

import {
  truncateFileName,
  validateFile,
} from "@/helper/assistant-helper/helper";
import { UPLOAD_FILES } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  formSchema,
  MAX_FILE_SIZE,
  MAX_FILES,
} from "@/lib/schemas/assistant/my-files/my-files-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
import {
  SuccessfulUpload,
  UploadFile,
  UseFileUploadOptions,
} from "../_components/types";

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

export function useFileUpload({
  setIsPopupOpen,
  onUploadSuccess,
}: UseFileUploadOptions) {
  const { axiosAuth } = useAxiosAuth();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [successfulUploads, setSuccessfulUploads] =
    useState<SuccessfulUpload | null>(null);
  const [unsuccessfulUploads, setUnsuccessfulUploads] = useState<UploadFile[]>(
    [],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { files: [] },
    mode: "onChange",
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[], _fileRejections: FileRejection[]) => {
      const validFiles: File[] = [];

      for (const file of acceptedFiles) {
        const result = await validateFile(
          file,
          uploadedFiles,
          allowedMimeTypes,
          MAX_FILES,
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
    [form, uploadedFiles],
  );

  const dropzone = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    accept: allowedMimeTypes,
    multiple: true,
    onDropRejected: (fileRejections: FileRejection[]) => {
      if (fileRejections.length > MAX_FILES) {
        toast.error(`You can only upload up to ${MAX_FILES} files`);
        return;
      }

      fileRejections.forEach(({ file, errors }, index) => {
        const fileName = truncateFileName(file.name, 25);

        errors.forEach((error) => {
          setTimeout(() => {
            if (error.code === "file-too-large") {
              toast.error(
                `File size exceeds the 50MB limit — ${fileName} is ${(
                  file.size /
                  (1024 * 1024)
                ).toFixed(2)} MB.`,
              );
            } else if (error.code === "file-invalid-type") {
              toast.error(
                "Invalid file type. Allowed types: PDF, Markdown (.md), DOCX, PPTX.",
              );
            } else {
              toast.error(`Upload error for ${fileName}: ${error.message}`);
            }
          }, index * 1000);
        });
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const uploadToast = toast.loading("Starting upload...");

    try {
      setUploadProgress(0);
      setLoading(true);
      setSuccessfulUploads(null);
      setUnsuccessfulUploads([]);

      const formData = new FormData();
      values.files.forEach((file) => {
        const mimeType =
          file.type || (file.name.endsWith(".md") ? "text/markdown" : "");
        formData.append(
          "data_files",
          new File([file], file.name, { type: mimeType }),
        );
      });

      const result = await axiosAuth.post(UPLOAD_FILES, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          const percentage = Math.round((progressEvent.loaded / total) * 100);
          setUploadProgress(percentage);
          toast.loading(`Uploading... ${percentage}%`, { id: uploadToast });
        },
      });

      if (result.status === 200) {
        const { unsuccessful_uploads = [], successful_uploads = null } =
          result.data;

        setUnsuccessfulUploads(unsuccessful_uploads);
        setSuccessfulUploads(successful_uploads);

        unsuccessful_uploads.forEach((file: UploadFile) => {
          const fileName = truncateFileName(file.name, 25);
          toast.error(`Upload failed: ${fileName} (${file.error})`);
        });

        if (
          unsuccessful_uploads.length === 0 &&
          successful_uploads?.data_files?.length > 0
        ) {
          toast.success("All files uploaded successfully!", {
            id: uploadToast,
          });
          form.reset();
          setUploadedFiles([]);
          onUploadSuccess?.();
        } else if (successful_uploads?.data_files?.length > 0) {
          toast.success(
            `Uploaded ${successful_uploads.data_files.length} file(s) successfully!`,
            { id: uploadToast },
          );
          onUploadSuccess?.();
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload files";
      toast.dismiss(uploadToast);
      toast.error(errorMessage, { id: uploadToast });
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setIsPopupOpen(false);
      setTimeout(() => toast.dismiss(uploadToast), 1000);
    }
  };

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = uploadedFiles.filter((file) => file !== fileToRemove);
    setUploadedFiles(updatedFiles);
    form.setValue("files", updatedFiles, { shouldValidate: true });

    setSuccessfulUploads((prev) =>
      prev
        ? {
            ...prev,
            data_files: prev.data_files.filter(
              (f) => f.name !== fileToRemove.name,
            ),
          }
        : null,
    );

    setUnsuccessfulUploads((prev) =>
      prev.filter((f) => f.name !== fileToRemove.name),
    );

    toast.success(`Removed ${fileToRemove.name}`);
  };

  const isSubmitDisabled =
    isLoading ||
    uploadedFiles.length === 0 ||
    uploadedFiles.some(
      (file) =>
        successfulUploads?.data_files?.some((f) => f.name === file.name) ||
        unsuccessfulUploads.some((f) => f.name === file.name),
    );

  const isUploadInProgress = uploadProgress > 0 && uploadProgress < 100;

  const isFileSuccessful = (file: File) =>
    successfulUploads?.data_files?.some((f) => f.name === file.name) ?? false;

  const isFileUnsuccessful = (file: File) =>
    unsuccessfulUploads.some((f) => f.name === file.name);

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    dropzone,
    allowedMimeTypes,
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
  };
}
