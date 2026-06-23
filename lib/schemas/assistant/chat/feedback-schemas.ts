import * as z from "zod";

export const formSchema = z.object({
  options: z.array(z.string()),
  feedbackText: z.string().optional(),
});
