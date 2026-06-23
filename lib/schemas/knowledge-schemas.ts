import * as z from "zod";
import { displayNameToStrictSnakeName } from "../utils";
import { getValidationConstant } from "../validation-constants";

const required = getValidationConstant("required");
const title = getValidationConstant("title");
const minimumText = getValidationConstant("minimumText");
const keywordsLimit = getValidationConstant("keywords");

export const collectionSchema = z.object({
  icon: z.string().min(required.min, "Icon is required"),
  collection_name: z
    .string()
    .nonempty("Name is required")
    .min(title.min, `Name must be at least ${title.min} characters`)
    .max(title.max!, `Name must be at most ${title.max} characters`)
    .regex(/^[A-Za-z0-9_ ]+$/, {
      message:
        "Name can only contain letters, numbers, underscores, and spaces",
    }),
  description: z.string().min(required.min, "Description is required"),
  availability: z.string().min(required.min, "Please select availability"),
  embedding_model: z.string().optional(),
});
export type CollectionSchemaType = z.infer<typeof collectionSchema>;

/** Normalize smart-field / topic technical names to a-z, 0-9, underscore */
export const normalizeFieldName = (name: string): string =>
  displayNameToStrictSnakeName(String(name ?? "").trim());

// Schema for Smart Fields (single item - used for form and import validation)
export const smartFieldSchemaDefinition = z.object({
  name: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "Field name is required",
    })
    .refine((val) => val.trim().length >= minimumText.min, {
      message: `Field name must be at least ${minimumText.min} characters`,
    })
    .refine((val) => !val.startsWith("_") && !val.endsWith("_"), {
      message: "Field name cannot start or end with an underscore.",
    }),
  description: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "Description is required",
    })
    .refine((val) => val.trim().length >= minimumText.min, {
      message: `Description must be at least ${minimumText.min} characters`,
    }),
  data_type: z.string().min(required.min, "Data type is required"),
  keywords: z
    .array(z.string())
    .optional()
    .refine(
      (keywords) =>
        !keywords || keywords.every((kw) => kw.length <= keywordsLimit.min),
      {
        message: `Only ${keywordsLimit.min} characters allowed per keyword.`,
      },
    ),
});

// Schema for the Smart Fields form
export const smartFormSchema = z.object({
  fields: z
    .array(smartFieldSchemaDefinition)
    .min(required.min, "At least one field is required"),
});

// Schema for Knowledge Topics (single item)
export const knowledgeTopicSchemaDefinition = z.object({
  name: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "Topic name is required",
    })
    .refine((val) => val.trim().length >= minimumText.min, {
      message: `Topic name must be at least ${minimumText.min} characters`,
    })
    .refine((val) => !val.startsWith("_") && !val.endsWith("_"), {
      message: "Topic name cannot start or end with an underscore.",
    }),
  description: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "Description is required",
    })
    .refine((val) => val.trim().length >= minimumText.min, {
      message: `Description must be at least ${minimumText.min} characters`,
    }),
  keywords: z
    .array(z.string())
    .optional()
    .refine(
      (keywords) =>
        !keywords || keywords.every((kw) => kw.length <= keywordsLimit.min),
      {
        message: `Only ${keywordsLimit.min} characters allowed per keyword.`,
      },
    ),
});

// Schema for the Knowledge Topics form
export const knowledgeFormSchema = z.object({
  fields: z
    .array(knowledgeTopicSchemaDefinition)
    .min(required.min, "At least one topic is required"),
});

export type SmartFormSchemaType = z.infer<typeof smartFormSchema>;
export type KnowledgeFormSchemaType = z.infer<typeof knowledgeFormSchema>;

export type SmartFieldItem = z.infer<typeof smartFieldSchemaDefinition>;
export type KnowledgeTopicItem = z.infer<typeof knowledgeTopicSchemaDefinition>;

export const DATA_TYPE_VALUES = [
  "text",
  "number",
  "boolean",
  "date",
  "list",
] as const;

function prepareSmartFieldForValidation(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const name = typeof raw.name === "string" ? normalizeFieldName(raw.name) : "";
  return {
    ...raw,
    name,
    data_type: raw.data_type ?? "",
    description: raw.description ?? "",
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
  };
}

function prepareKnowledgeTopicForValidation(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const name = typeof raw.name === "string" ? normalizeFieldName(raw.name) : "";
  return {
    ...raw,
    name,
    description: raw.description ?? "",
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
  };
}

export interface ImportValidationError {
  index: number;
  message: string;
}

export interface SmartFieldsImportResult {
  valid: SmartFieldItem[];
  errors: ImportValidationError[];
}

export interface KnowledgeTopicsImportResult {
  valid: KnowledgeTopicItem[];
  errors: ImportValidationError[];
}

const SMART_FIELD_REQUIRED_KEYS = ["name", "description", "data_type"] as const;
const KNOWLEDGE_TOPIC_REQUIRED_KEYS = ["name", "description"] as const;

function missingKeys(
  obj: Record<string, unknown>,
  keys: readonly string[],
): string[] {
  return keys.filter((k) => {
    const v = obj[k];
    return (
      v === undefined ||
      v === null ||
      (typeof v === "string" && v.trim() === "")
    );
  });
}

/** Parse and validate pasted JSON for smart fields. Returns valid items and per-item errors. */
export function validateSmartFieldsJson(
  jsonString: string,
): SmartFieldsImportResult {
  const valid: SmartFieldItem[] = [];
  const errors: ImportValidationError[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return {
      valid: [],
      errors: [
        { index: -1, message: "Invalid JSON. Paste a valid JSON array." },
      ],
    };
  }
  if (!Array.isArray(parsed)) {
    return {
      valid: [],
      errors: [
        { index: -1, message: "JSON must be an array of field objects." },
      ],
    };
  }
  parsed.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push({ index, message: "Not an object." });
      return;
    }
    const raw = item as Record<string, unknown>;
    const missing = missingKeys(raw, SMART_FIELD_REQUIRED_KEYS);
    if (missing.length > 0) {
      errors.push({
        index,
        message: `Missing required field(s): ${missing.join(", ")}.`,
      });
      return;
    }
    const prepared = prepareSmartFieldForValidation(raw);
    const result = smartFieldSchemaDefinition.safeParse(prepared);
    if (result.success) {
      const ALLOWED_DATA_TYPES = ["text", "number", "boolean", "date", "list"];

      const dataType = String(result.data.data_type || "").toLowerCase();

      if (!ALLOWED_DATA_TYPES.includes(dataType)) {
        errors.push({
          index,
          message:
            "Invalid data_type. Allowed values: text, number, boolean, date, list.",
        });
        return;
      }

      result.data.data_type = dataType as typeof result.data.data_type;
      valid.push(result.data);
    } else {
      const first = result.error.flatten().fieldErrors;
      const msg =
        Object.entries(first)
          .map(([k, v]) => (Array.isArray(v) ? v.join(", ") : v))
          .filter(Boolean)[0] ?? "Invalid field.";
      errors.push({ index, message: msg });
    }
  });
  return { valid, errors };
}

/** Parse and validate pasted JSON for knowledge topics. Returns valid items and per-item errors. */
export function validateKnowledgeTopicsJson(
  jsonString: string,
): KnowledgeTopicsImportResult {
  const valid: KnowledgeTopicItem[] = [];
  const errors: ImportValidationError[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return {
      valid: [],
      errors: [
        { index: -1, message: "Invalid JSON. Paste a valid JSON array." },
      ],
    };
  }
  if (!Array.isArray(parsed)) {
    return {
      valid: [],
      errors: [
        { index: -1, message: "JSON must be an array of topic objects." },
      ],
    };
  }
  parsed.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push({ index, message: "Not an object." });
      return;
    }
    const raw = item as Record<string, unknown>;
    const missing = missingKeys(raw, KNOWLEDGE_TOPIC_REQUIRED_KEYS);
    if (missing.length > 0) {
      errors.push({
        index,
        message: `Missing required field(s): ${missing.join(", ")}.`,
      });
      return;
    }
    const prepared = prepareKnowledgeTopicForValidation(raw);
    const result = knowledgeTopicSchemaDefinition.safeParse(prepared);
    if (result.success) {
      valid.push(result.data);
    } else {
      const first = result.error.flatten().fieldErrors;
      const msg =
        Object.entries(first)
          .map(([k, v]) => (Array.isArray(v) ? v.join(", ") : v))
          .filter(Boolean)[0] ?? "Invalid topic.";
      errors.push({ index, message: msg });
    }
  });
  return { valid, errors };
}

// schema for file upload
export const formSchema = z.object({
  files: z.array(z.custom<File>()).min(required.min, "File is Required"),
});

export type FormSchemaType = z.infer<typeof formSchema>;

// schema for sharepoints
export const sharepointSchema = z.object({
  site: z
    .string()
    .min(required.min, "Site is required")
    .url("Please enter a valid URL"),
});

export type sharepointSchemaType = z.infer<typeof sharepointSchema>;
