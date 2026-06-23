import { z } from "zod";
import { getValidationConstant } from "../validation-constants";

const short_text = getValidationConstant("short_text");

export const issueActionSchema = z.object({
  reason: z
    .string()
    .trim()
    .nonempty("Note is required")
    .min(
      short_text.min,
      `Note must be at least ${short_text.min} characters`
    ).max(short_text.max!, `Note must be at most ${short_text.max!} characters` ),
});

export type IssueActionFormType = z.infer<typeof issueActionSchema>;
