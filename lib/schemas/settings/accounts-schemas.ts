import * as z from "zod";
import { getValidationConstant } from "../../validation-constants";

const required = getValidationConstant("required");
const alertRecipients = getValidationConstant("alert_recipients");

export const switchOrgFormSchema = z.object({
  organization_name: z.string().min(required.min, "Organization is required"),
  password: z.string().min(required.min, "Password is required"),
});

export type SwitchOrgFormType = z.infer<typeof switchOrgFormSchema>;

export const preferanceInfoSchema = z.object({
  agentllm: z.string().min(required.min, "Agent LLM is required"),
  fastllm: z.string().min(required.min, "Fast LLM is required"),
  default_email: z
    .string()
    .trim()
    .min(required.min, "Please enter Default Email")
    .regex(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})$/, "Enter a valid email"),
  platform_alert_recipients: z
    .array(
      z.object({
        id: z.string().optional(),
        email: z.string().email(),
        name: z.string().optional(),
      }),
    )
    .max(10, "You can add up to 10 platform alert recipients only")
    .default([])
    .optional(),
});

export type PreferanceInfoType = z.infer<typeof preferanceInfoSchema>;

export const companyInfoSchema = z.object({
  companyName: z.string().min(required.min, "Company name is required"),
  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (value: any) =>
        !value || /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value),
      { message: "Enter a valid email" },
    ),
  city: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (value: any) =>
        !value ||
        /\b(?:https?|ftp):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|]$/.test(
          value,
        ),
      { message: "Enter a valid url" },
    ),
});

export type CompanyInfoType = z.infer<typeof companyInfoSchema>;
