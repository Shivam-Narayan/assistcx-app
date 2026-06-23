import * as z from "zod";

export const DATA_TABLE_AVAILABILITY_VALUES = [
  "PUBLISHED",
  "UNLISTED",
] as const;

export const DATA_TABLE_NAME_PATTERN = /^[a-zA-Z0-9 _-]*$/;
export const DATA_TABLE_NAME_MAX_LENGTH = 60;

export const DATA_TABLE_NAME_INVALID_CHARS_MESSAGE =
  "Use only letters, numbers, spaces, hyphens, and underscores. No special characters.";

export const DATA_TABLE_NAME_LETTER_REQUIRED_MESSAGE =
  "Name must include at least one letter.";

export function canAcceptDataTableNameDraft(value: string): boolean {
  return (
    value.length <= DATA_TABLE_NAME_MAX_LENGTH &&
    DATA_TABLE_NAME_PATTERN.test(value)
  );
}

export const createTableSchema = z.object({
  icon: z.string().nonempty("Icon is required"),
  name: z
    .string()
    .nonempty("Data table name is required")
    .min(2, "Name must be at least 2 characters")
    .max(
      DATA_TABLE_NAME_MAX_LENGTH,
      `Name must be at most ${DATA_TABLE_NAME_MAX_LENGTH} characters`,
    )
    .regex(DATA_TABLE_NAME_PATTERN, DATA_TABLE_NAME_INVALID_CHARS_MESSAGE)
    .refine(
      (value) => /[a-zA-Z]/.test(value.trim()),
      DATA_TABLE_NAME_LETTER_REQUIRED_MESSAGE,
    ),
  description: z.string().optional(),
  availability: z.enum(DATA_TABLE_AVAILABILITY_VALUES),
});

export type CreateTableSchemaType = z.infer<typeof createTableSchema>;
