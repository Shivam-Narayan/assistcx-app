import { STORAGE_TYPES } from "@/lib/constants";
import { successCriteriaToStringArray } from "@/helper/helper-function";
import { z } from "zod";

export const planningStepSchema = z.object({
  step_name: z
    .string()
    .trim()
    .nonempty("Step name is required")
    .min(4, "Step name must be at least 4 characters"),
  condition: z.string().optional(),
  tool: z
    .array(
      z.object({
        action: z.string(),
        name: z.string().optional(),
      }),
    )
    .optional(),
  instructions: z.array(z.string()).min(1, "At least one instruction required"),
});

export const agentSchema = z.object({
  identity: z.object({
    icon: z.string().min(1, "Icon is required"),
    name: z
      .string()
      .trim()
      .min(6, "Name must be at least 6 characters")
      .regex(/^[A-Za-z0-9 ]+$/, {
        message: "Name can only contain letters and numbers",
      }),

    goal: z.string().trim().min(10, "Goal must be at least 10 characters"),
    style: z.string().min(1, "Style is required"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters"),
    instructions: z
      .string()
      .trim()
      .min(10, "Instructions must be at least 10 characters"),
    rules: z
      .array(
        z.object({
          rule: z.string().min(1, "Rule is required"),
        }),
      )
      .optional(),
    success_criteria: z
      .unknown()
      .optional()
      .transform((val) =>
        val === undefined
          ? undefined
          : successCriteriaToStringArray(val).map((criterion) => ({
              criterion,
            })),
      ),

    guidelines: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Name is required"),

          instructions: z
            .string()
            .trim()
            .min(5, "Instructions must be at least 5 characters"),
        }),
      )
      .optional(),
  }),

  tools: z
    .array(
      z.object({
        icon: z.string().default(""),
        name: z.string().min(1, "Tool name is required"),
        description: z.string().default(""),
        action: z.string().min(1, "Tool action is required"),
        tool_config: z
          .object({
            name: z.string().optional(),
          })
          .optional(),
        integration_key: z.string().nullable().optional(),
        is_default: z.boolean().optional(),
        human_review: z.boolean().default(false),
        review_rules: z.array(z.string()).default([]),
        connection_id: z.string().nullable().optional(),
      }),
    )
    .default([]),

  knowledge: z
    .array(
      z.object({
        id: z.string().default(""),
        icon: z.string().default(""),
        name: z.string().min(1, "name is required"),
        description: z.string().default(""),
        availability: z.string().default(""),
        index_name: z.string().default(""),
      }),
    )
    .default([]),

  data_tables: z
    .array(
      z.object({
        id: z.string().default(""),
        icon: z.string().default(""),
        name: z.string().min(1, "name is required"),
        description: z.string().default(""),
        availability: z.string().default(""),
      }),
    )
    .default([]),

  planning: z.array(planningStepSchema).default([]),

  response_schema: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Field name is required"),
        data_type: z.string().min(1, "Data Type is required."),
        description: z
          .string()
          .trim()
          .min(5, "Description must be at least 5 characters"),
      }),
    )
    .default([]),
  settings: z
    .object({
      data_template: z.array(z.any()).default([]),
      class_groups: z.array(z.any()).default([]),
      assignment_type: z
        .enum(["ai", "mailbox", "task_api", "schedule", "assistant"])
        .nullable()
        .optional(),
      storage_type: z.string().default(""),
      mount_path: z.string().optional(),
      bucket_name: z.string().optional(),
      folder_name: z.string().optional(),
      mailbox_name: z.string().nullable().optional(),
      agent_llm: z.string().default(""),
      create_task_by_attachments: z.boolean().default(false),
      vision_data_extraction: z.boolean().default(false),
      retry_incomplete_tasks: z.boolean().default(false),
      allow_task_followup: z.boolean().default(false),
      enable_human_review: z.boolean().default(false).optional(),
      human_review_users: z
        .array(
          z.object({
            id: z.string().optional(),
            email: z.string().email(),
            name: z.string().optional(),
          }),
        )
        .default([])
        .optional(),

      schedule_config: z
        .object({
          type: z.enum(["daily", "weekly", "monthly", "yearly"]),
          time: z.string().optional(),
          dayOfWeek: z.string().optional(),
          dayOfMonth: z.number().optional(),
          date: z.string().optional(),
        })
        .optional(),
    })

    .refine(
      (data) => {
        if (data.assignment_type === "mailbox") {
          return !!data.mailbox_name?.trim();
        }
        return true;
      },
      {
        path: ["mailbox_name"],
        message: "Mailbox is required",
      },
    )
    .refine(
      (data) =>
        data.storage_type !== "remote" ||
        (data.bucket_name && data.bucket_name.trim() !== ""),
      {
        path: ["bucket_name"],
        message: "Bucket name is required when storage type is 'remote'",
      },
    )
    .refine(
      (data) =>
        data.storage_type !== "local" ||
        (data.mount_path && data.mount_path.trim() !== ""),
      {
        path: ["mount_path"],
        message: "Mount path is required when storage type is 'local'",
      },
    )
    .refine(
      (data) => {
        if (
          data.storage_type === STORAGE_TYPES.REMOTE ||
          data.storage_type === STORAGE_TYPES.LOCAL
        ) {
          return data.folder_name && data.folder_name.trim() !== "";
        }
        return true;
      },
      {
        path: ["folder_name"],
        message: "Data folder is required",
      },
    )
    .superRefine((data, ctx) => {
      if (data.assignment_type === "schedule") {
        const schedule = data.schedule_config;

        if (!schedule?.time) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["schedule_config", "time"],
            message: "Time is required",
          });
        }

        if (schedule?.type === "weekly" && !schedule.dayOfWeek) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["schedule_config", "dayOfWeek"],
            message: "Day of week is required",
          });
        }

        if (schedule?.type === "monthly" && !schedule.dayOfMonth) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["schedule_config", "dayOfMonth"],
            message: "Day of month is required",
          });
        }

        if (schedule?.type === "yearly" && !schedule.date) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["schedule_config", "date"],
            message: "Date is required",
          });
        }
      }
    }),
  status: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
});

export type AgentFormValues = z.infer<typeof agentSchema>;
