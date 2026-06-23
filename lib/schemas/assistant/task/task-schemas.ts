import { getValidationConstant } from "@/lib/validation-constants";
import { parseISO } from "date-fns";
import * as z from "zod";

const title = getValidationConstant("title");

export const formSchema = z
  .object({
    name: z
      .string()
      .nonempty( "Task name is required")
      .min(title.min, `Task name must be at least ${title.min} characters`)
      .max(title.max!, `Task name must be less than ${title.max!} characters`),
    scheduleType: z.enum(["once", "daily", "weekly", "monthly", "yearly"]),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format",
    }),
    date: z.string().optional(),
    dayOfWeek: z.string().optional(),
    dayOfMonth: z.coerce.number().min(1).max(31).optional(),
    month: z.string().optional(),
    prompt: z.string().nonempty("Prompt is required"),
    collections: z.array(z.object({})).optional(),
    alertRecipientsemails: z.array(z.string()).optional(),
    webSearch: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.scheduleType === "once" || data.scheduleType === "yearly") &&
      !data.date
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Date is required for this schedule type",
      });
    }
    if (
      (data.scheduleType === "once" || data.scheduleType === "yearly") &&
      data.date
    ) {
      const today = new Date();
      const selectedDate = parseISO(data.date); // yyyy-MM-dd string → Date
      const [hours, minutes] = data.time.split(":").map(Number);

      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(hours, minutes, 0, 0);

      // normalize to start of day for date-only comparison
      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);

      const startOfSelected = new Date(selectedDate);
      startOfSelected.setHours(0, 0, 0, 0);

      if (startOfSelected < startOfToday) {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: "Please select today or a future date",
        });
      }

      const isSameDay = selectedDate.toDateString() === today.toDateString();
      if (isSameDay && selectedDateTime <= today) {
        ctx.addIssue({
          code: "custom",
          path: ["time"],
          message: "Please select a future time for today",
        });
      }
    }
    if (data.scheduleType === "weekly" && !data.dayOfWeek) {
      ctx.addIssue({
        code: "custom",
        path: ["dayOfWeek"],
        message: "Day of week is required",
      });
    }
    if (data.scheduleType === "monthly" && !data.dayOfMonth) {
      ctx.addIssue({
        code: "custom",
        path: ["dayOfMonth"],
        message: "Day of month is required",
      });
    }
    // Validate duplicate email addresses (case-insensitive)
    if (data.alertRecipientsemails && data.alertRecipientsemails.length > 0) {
      const emailMap = new Map<string, number>();
      data.alertRecipientsemails.forEach((email, index) => {
        const normalizedEmail = email.toLowerCase().trim();
        if (emailMap.has(normalizedEmail)) {
          ctx.addIssue({
            code: "custom",
            path: ["alertRecipientsemails", index],
            message: "Duplicate email address",
          });
        } else {
          emailMap.set(normalizedEmail, index);
        }
      });
    }
  });