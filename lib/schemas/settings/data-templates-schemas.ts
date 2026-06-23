import { getValidationConstant } from "@/lib/validation-constants";
import * as z from "zod";

const required = getValidationConstant("required");
const minimumText = getValidationConstant("minimumText");
const description = getValidationConstant("description");

export const formSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(minimumText.min, `Name must be at least ${minimumText.min} characters`)
    .regex(/^[-A-Za-z0-9 ]+$/, {
      message: "Name can only contain letters, numbers, spaces, and hyphens",
    }),
  templateClass: z
    .string()
    .min(
      minimumText.min,
      `Template class must be at least ${minimumText.min} characters`
    )
    .nonempty("Template class is required")
    .regex(/^[-A-Za-z0-9_ ]+$/, {
      message:
        "Template class can only contain letters, numbers, underscores, spaces, and hyphens",
    }),
  description: z
    .string()
    .nonempty("Description is required")
    .min(
      description.min,
      `Description must be at least ${description.min} characters`
    )
    .max(
      description.max!,
      `Description must be at most ${description.max!} characters`
    ),
  document_instructions: z.array(
    z.object({
      value: z.string().optional(),
    })
  ),
});

export type FormSchemaType = z.infer<typeof formSchema>;

export const dataSchemaModal = z
  .object({
    fieldName: z
      .string()
      .nonempty("Name is required.")
      .refine((val) => !val.startsWith("_") && !val.endsWith("_"), {
        message: "Name cannot start or end with an underscore.",
      }),
    fieldDescription: z.string().nonempty("Description is required."),
    dataType: z.string().min(required.min, "Date Type is required."),
    keywords: z
      .array(z.string())
      .optional()
      .refine(
        (keywords) => !keywords || keywords.every((kw) => kw.length <= 25),
        {
          message: "Only 25 characters allowed per keyword.",
        }
      ),
    nestedFields: z
      .array(
        z.object({
          fieldName: z
            .string()
            .min(required.min, "Nested field name is required."),
          fieldDescription: z
            .string()
            .min(required.min, "Nested description is required."),
          dataType: z
            .string()
            .min(required.min, "Nested data type is required."),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.dataType === "object" || data.dataType === "list[object]") &&
      (!data.nestedFields || data.nestedFields.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one nested field is required.",
        path: ["nestedFields"],
      });
    }
  });

export type DataSchemaModalType = z.infer<typeof dataSchemaModal>;

export const nestedFieldSchema = z.object({
  fieldName: z
    .string()
    .min(required.min, "Name is required.")
    .refine((val) => !val.startsWith("_") && !val.endsWith("_"), {
      message: "Name cannot start or end with an underscore.",
    }),
  fieldDescription: z.string().min(required.min, "Description is required."),
  dataType: z.string().min(required.min, "Data Type is required."),
});

export type NestedFieldSchemaType = z.infer<typeof nestedFieldSchema>;
