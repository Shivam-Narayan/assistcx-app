import { STORAGE_TYPES } from "@/lib/constants";
import { getValidationConstant } from "@/lib/validation-constants";
import * as z from "zod";

const required = getValidationConstant("required");

export const mailboxPollingSchema = z
  .object({
    emailId: z
      .string()
      .nonempty("Email is required")
      .email("Enter a valid email")
      .regex(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, {
        message: "Enter a valid email",
      }),
    mailbox_folder: z.string().nonempty("Mailbox folder name is required"),
    data_folder: z.string().optional(),
    pollingFrequency: z
      .string()
      .min(required.min, "Polling frequency is required"),
    description: z.string().optional(),
    storage_type: z
      .string()
      .nullable()
      .refine((val) => val !== null && val.trim() !== "", {
        message: "Storage type is required",
      }),

    bucket_name: z.string().optional(),
    mount_path: z.string().optional(),
    pdf_parsing: z.string().optional(),
    copy_email_data: z.boolean().default(false).optional(),
    mailbox_priority: z.string().optional(),
    split_pdf_pages: z.boolean().default(false).optional(),
    storage_folder: z.string().optional(),
    folder_name: z.string().optional(),
    send_notifications: z.boolean().default(false).optional(),
    fix_page_rotation: z.boolean().default(false).optional(),
    ocr_parser: z.boolean().optional(),
    data_parsing: z.boolean().optional(),
    alert_recipients: z
      .array(
        z.object({
          id: z.string().optional(),
          email: z.string().email(),
          name: z.string().optional(),
        }),
      )
      .max(10, "You can add up to 10 alert recipients only")
      .default([])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.storage_type === STORAGE_TYPES.REMOTE) {
        return data.bucket_name && data.bucket_name.trim() !== "";
      }
      return true;
    },
    {
      message: "Bucket name is required",
      path: ["bucket_name"],
    },
  )
  .refine(
    (data) => {
      if (data.storage_type === STORAGE_TYPES.LOCAL) {
        return data.mount_path && data.mount_path.trim() !== "";
      }
      return true;
    },
    {
      message: "Mount Path is required",
      path: ["mount_path"],
    },
  )
  .refine(
    (data) => {
      if (
        (data.storage_type === STORAGE_TYPES.REMOTE ||
          data.storage_type === STORAGE_TYPES.LOCAL) &&
        (!data.folder_name || data.folder_name.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Data folder is required",
      path: ["folder_name"],
    },
  );

export type MailboxPollingType = z.infer<typeof mailboxPollingSchema>;
