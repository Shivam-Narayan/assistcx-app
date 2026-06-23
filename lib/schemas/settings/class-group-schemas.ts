import * as z from "zod";
import { getValidationConstant } from "../../validation-constants";

const description = getValidationConstant("description");
const name = getValidationConstant("name");

export const classGroupSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(name.min, `Name must be at least ${name.min} characters`)
    .max(name.max!, `Name must be at most ${name.max!} characters`),
  description: z
    .string()
    .nonempty("Description is required")
    .min(description.min, `Description must be at least ${description.min} characters`)
    .max(description.max!, `Description must be at most ${description.max!} characters`),
});

export type ClassGroupSchemaType = z.infer<typeof classGroupSchema>;

export const classLabelSchema = z.object({
  class_name: z
    .string()
    .nonempty("Class Name is required")
    .min(name.min, `Class Name must be at least ${name.min} characters`)
    .max(name.max!, `Class Name must not exceed ${name.max!} characters`)
    .trim(),
  class_description: z
    .string()
    .nonempty("Class Description is required")
    .min(description.min, `Class Description must be at least ${description.min} characters`)
    .max(description.max!, `Class Description must not exceed ${description.max!} characters`)
    .trim(),
});

export type ClassLabelSchemaType = z.infer<typeof classLabelSchema>;

