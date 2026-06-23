import { getValidationConstant } from "@/lib/validation-constants";
import * as z from "zod";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES = 10;

const required = getValidationConstant("required");

export const formSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(required.min, "At least one file is required")
    .max(MAX_FILES, `Maximum ${MAX_FILES} files allowed`)
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      `Each file must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    ),
});
