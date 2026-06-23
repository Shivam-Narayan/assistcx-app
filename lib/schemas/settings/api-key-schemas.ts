import { getValidationConstant } from "@/lib/validation-constants";
import * as z from "zod";

const minimumText = getValidationConstant("minimumText");

export const apiKeyFormSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .trim()
    .min(minimumText.min, `Name must be at least ${minimumText.min} characters`)
    .regex(/^[A-Za-z0-9 ]+$/, {
      message: "Name can only contain letters and numbers",
    }),
});

export type ApiKeyFormSchemaType = z.infer<typeof apiKeyFormSchema>;
