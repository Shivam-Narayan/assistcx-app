import * as z from "zod";
import { getValidationConstant } from "../../validation-constants";

const required = getValidationConstant("required");
const password = getValidationConstant("password");

export const teamMemberFormSchema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  role: z.string().min(required.min, "Role is required"),
  user_group: z.array(z.string()).optional(),
  emailId: z
    .string()
    .nonempty("Email is required")
    .email("Enter a valid email")
    .regex(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, {
      message: "Enter a valid email",
    }),
  password: z
    .string()
    .nonempty("Password is required")
    .min(password.min, {
      message: `Password must be at least ${password.min} characters`,
    })
    .regex(/[A-Z]/, {
      message: "Must include at least one uppercase letter",
    })
    .regex(/[0-9]/, { message: "Must include at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Must include at least one special character",
    }),
});

export type TeamMemberformSchemaType = z.infer<typeof teamMemberFormSchema>;

export const passwordformSchema = z.object({
  password: z
    .string()
    .nonempty({ message: "Password is required" })
    .min(password.min, {
      message: `Password must be at least ${password.min} characters`,
    })
    .regex(/[A-Z]/, {
      message: "Must include at least one uppercase letter",
    })
    .regex(/[0-9]/, { message: "Must include at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Must include at least one special character",
    }),
});

export type PasswordformSchemaType = z.infer<typeof passwordformSchema>;
