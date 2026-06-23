import * as z from "zod";
import { getValidationConstant } from "../validation-constants";

const validation = getValidationConstant("required");
const name = getValidationConstant("name");
const short_text = getValidationConstant("short_text");

// Retry Task Schema
export const retryTaskformSchema = z.object({
  note: z.string().min(validation.min, "Instructions is required"),
});

export type RetryTaskFormSchemaType = z.infer<typeof retryTaskformSchema>;

// Change Status Schema
export const changeStatusSchema = z.object({
  status: z.string().min(validation.min, "Status is required"),
  comment: z.string().min(validation.min, "Comment is required"),
});

export type ChangeStatusSchemaType = z.infer<typeof changeStatusSchema>;

// Reprocess Attachment formSchema
export const reprocessformSchema = z.object({
  instructions: z.string().optional(),
});

export type reprocessSchemaType = z.infer<typeof reprocessformSchema>;

//add issue schema
export const addIssueFormSchema = z.object({
  title: z
    .string()
    .nonempty("Title is required")
    .min(name.min, `Title must be at least ${name.min} characters`)
    .max(name.max!, `Title must be at most ${name.max!} characters`),

  tags: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        color: z.string().optional(),
      })
    )
    .min(validation.min, "At least one tag is required"),

  description: z
    .string()
    .nonempty("Description is required")
    .min(
      short_text.min,
      `Description must be at least ${short_text.min} characters`
    )
    .max(
      short_text.max!,
      `Description must be at most ${short_text.max!} characters`
    ),
});

export type AddIssueFormType = z.infer<typeof addIssueFormSchema>;
