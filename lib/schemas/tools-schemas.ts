import * as z from "zod";
import { getValidationConstant } from "../validation-constants";
import {
  getFieldType,
  isFieldRequiredFromAnyOf,
} from "@/helper/helper-function";

const required = getValidationConstant("required");
const toolName = getValidationConstant("tool_name");
const description = getValidationConstant("description");

//tools form
const apiType = ["REST", "ODATA", "SOAP"];

export const addNewToolFormSchema = z
  .object({
    icon: z.string().min(required.min, "Icon is required"),
    name: z
      .string()
      .nonempty("Name is required")
      .min(toolName.min, `Name must be at least ${toolName.min} characters`)
      .regex(/^[A-Za-z0-9 ]+$/, {
        message: "Name can only contain letters and numbers",
      }),
    protocol: z.string(),
    action: z
      .string()
      .min(required.min, "Action is required")
      .regex(/^[A-Za-z0-9_ ]+$/, {
        message:
          "Action can only contain letters, numbers, underscores and spaces",
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
    api_type: z
      .enum(["REST", "ODATA", "SOAP"], {
        required_error: "You need to select an API type.",
      })
      .nullable()
      .optional(),
    body_template: z.string().optional(),
    endpoint: z.string().optional(),
    content_type: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    token: z.string().optional(),
    client_id: z.string().optional(),
    client_secret: z.string().optional(),
    token_url: z.string().optional(),
    scope: z.string().optional(),
    api_key_name: z.string().optional(),
    api_key: z.string().optional(),
    api_key_location: z.string().optional(),
    auth_type: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.api_type && apiType.includes(data.api_type)) {
      if (!data.api_type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "API Type is required for API tools.",
          path: ["api_type"],
        });
      }

      if (!data.endpoint || data.endpoint.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End Point is required for API tools.",
          path: ["endpoint"],
        });
      }
      if (!data.content_type || data.content_type.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Content Type is required for API tools.",
          path: ["content_type"],
        });
      }
    }
  })
  .refine(
    (data) => {
      if (data.api_type === "SOAP") {
        return data.body_template && data.body_template.trim() !== "";
      }
      return true;
    },
    {
      message: "Body Template is required",
      path: ["body_template"],
    }
  )
  .refine(
    (data) => {
      if (data.auth_type === "Basic") {
        return data.username && data.username.trim() !== "";
      }
      return true;
    },
    {
      message: "Username is required",
      path: ["username"],
    }
  )
  .refine(
    (data) => {
      if (data.auth_type === "Basic") {
        return data.password && data.password.trim() !== "";
      }
      return true;
    },
    {
      message: "Password is required",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (data.auth_type === "Bearer") {
        return data.token && data.token.trim() !== "";
      }
      return true;
    },
    {
      message: "Token is required",
      path: ["token"],
    }
  )
  .refine(
    (data) => {
      if (data.auth_type === "OAuth2") {
        return data.client_id && data.client_id.trim() !== "";
      }
      return true;
    },
    {
      message: "Client ID is required",
      path: ["client_id"],
    }
  )
  .refine(
    (data) => {
      if (data.auth_type === "OAuth2") {
        return data.client_secret && data.client_secret.trim() !== "";
      }
      return true;
    },
    {
      message: "Client Secret is required",
      path: ["client_secret"],
    }
  )
  .refine(
    (data) => {
      if (data.auth_type === "OAuth2") {
        return data.token_url && data.token_url.trim() !== "";
      }
      return true;
    },
    {
      message: "Token URL is required",
      path: ["token_url"],
    }
  )
  .refine(
    (data) => {
      if (data.auth_type === "APIKey") {
        return data.api_key_name && data.api_key_name.trim() !== "";
      }
      return true;
    },
    {
      message: "API Key Name is required",
      path: ["api_key_name"],
    }
  )
  .refine(
    (data) => {
      if (data.auth_type === "APIKey") {
        return data.api_key && data.api_key.trim() !== "";
      }
      return true;
    },
    {
      message: "API Key is required",
      path: ["api_key"],
    }
  )
  .refine(
    (data) => {
      if (data.auth_type === "APIKey") {
        return data.api_key_location && data.api_key_location.trim() !== "";
      }
      return true;
    },
    {
      message: "API Key Location is required",
      path: ["api_key_location"],
    }
  );

export type AddNewToolFormSchemaType = z.infer<typeof addNewToolFormSchema>;

// common form for Add New Header,Add New Query Parameter,
export const formSchema = z.object({
  your_key: z.string().min(required.min, "Your key is required"),
  value: z.string(),
  checked: z.boolean(),
});

export type formSchemaType = z.infer<typeof formSchema>;

type BuildSchemaArgs = {
  fields: Record<string, any>;
};

//Build dynamic Test Tool schema
export const buildDynamicZodSchema = ({ fields }: BuildSchemaArgs) => {
  return z.object(
    Object.fromEntries(
      Object.entries(fields).map(([key, field]) => {
        let base: any;
        const fieldType = getFieldType(field);
        const isRequired = isFieldRequiredFromAnyOf(field);

        switch (fieldType) {
          case "object-or-array":
            // Accepts both single object and array of objects
            base = z.union([z.string(), z.any()]).transform((val, ctx) => {
              if (typeof val === "string") {
                const trimmed = val.trim();

                // Allow empty for optional fields
                if (trimmed === "") {
                  if (isRequired) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `${field.title || key} is required`,
                    });
                    return z.NEVER;
                  }
                  return null;
                }

                try {
                  const parsed = JSON.parse(trimmed);

                  // Accept either object or array of objects
                  if (Array.isArray(parsed)) {
                    return parsed;
                  } else if (typeof parsed === "object" && parsed !== null) {
                    return parsed;
                  } else {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: "Expected a JSON object or array of objects",
                    });
                    return z.NEVER;
                  }
                } catch (error) {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Invalid JSON format";
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Invalid JSON format. ${errorMessage}`,
                  });
                  return z.NEVER;
                }
              }
              return val;
            });
            break;

          case "array-of-objects":
          case "object":
            // Accept string during typing, validate JSON on submit
            base = z.union([z.string(), z.any()]).transform((val, ctx) => {
              if (typeof val === "string") {
                const trimmed = val.trim();

                // Allow empty for optional fields
                if (trimmed === "") {
                  if (isRequired) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `${field.title || key} is required`,
                    });
                    return z.NEVER;
                  }
                  return fieldType === "array-of-objects" ? [] : {};
                }

                try {
                  const parsed = JSON.parse(trimmed);

                  if (fieldType === "array-of-objects") {
                    if (!Array.isArray(parsed)) {
                      ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Expected an array of objects",
                      });
                      return z.NEVER;
                    }
                  } else {
                    if (
                      Array.isArray(parsed) ||
                      typeof parsed !== "object" ||
                      parsed === null
                    ) {
                      ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Expected a JSON object",
                      });
                      return z.NEVER;
                    }
                  }

                  return parsed;
                } catch (error) {
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Invalid JSON format";
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Invalid JSON format. ${errorMessage}`,
                  });
                  return z.NEVER;
                }
              }
              return val;
            });
            break;

          case "simple-array":
            base = z.array(z.string());
            break;

          case "number":
            base = z.preprocess((val) => Number(val), z.number());
            break;

          default:
            base = z
              .string()
              .transform((val) => val.trim()) // Always trim input
              .refine(
                (val) => val.length > 0,
                `${field.title || key} cannot be empty`
              );
        }

        if (isRequired) {
          if (
            fieldType !== "array-of-objects" &&
            fieldType !== "object" &&
            fieldType !== "object-or-array"
          ) {
            base = base.refine((val: any) => {
              if (Array.isArray(val)) return val.length > 0;
              if (typeof val === "object" && val !== null)
                return Object.keys(val).length > 0;
              return val !== "" && val !== null && val !== undefined;
            }, `${field.title || key} is required`);
          }
        } else {
          base = base.optional();
        }

        return [key, base];
      })
    )
  );
};
