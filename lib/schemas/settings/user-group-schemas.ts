import * as z from "zod";
import { getValidationConstant } from "../../validation-constants";

const name = getValidationConstant("name");

export const userGroupformSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(name.min, `Name must be at least ${name.min} characters`)
    .max(name.max!, `Name must be at most ${name.max!} characters`)
    .regex(/^[A-Za-z0-9 _-]+$/, {
      message:
        "Name can only contain letters, numbers, spaces, hyphens and underscores",
    }),
  description: z.string().nonempty("Description is required"),
});
