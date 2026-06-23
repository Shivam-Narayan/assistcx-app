import * as z from "zod";
import { getValidationConstant } from "../../validation-constants";

const minimumText = getValidationConstant("minimumText");

export const formSchema = z.object({
  role_name: z
    .string()
    .nonempty("Role name is required")
    .min(
      minimumText.min,
      `Role name must be at least ${minimumText.min} characters`
    ),
  description: z.string().nonempty("Description is required"),
});

export type FormSchemaType = z.infer<typeof formSchema>;
