import * as z from "zod";
import { getValidationConstant } from "../validation-constants";

const password = getValidationConstant("password");

export const profileformSchema = z.object({
  first_name: z.string().nonempty("First name is required"),
  last_name: z.string().nonempty("Last name is required"),
});

export type ProfileFormSchemaType = z.infer<typeof profileformSchema>;

export const passwordUpdateSchema = z
  .object({
    current_password: z
      .string()
      .nonempty("Current password is required")
      .min(
        password.min,
        `Current password must be at least ${password.min} characters`
      ),

    password: z
      .string()
      .nonempty("New password is required")
      .min(password.min, `New password must be at least ${password.min} characters`)
      .regex(/[A-Z]/, {
        message: "Must include at least one uppercase letter",
      })
      .regex(/[0-9]/, { message: "Must include at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Must include at least one special character",
      }),

    confirm_password: z
      .string()
      .nonempty("Confirm password is required")
      .min(
        password.min,
        `Confirm password must be at least ${password.min} characters`
      ),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type passwordUpdateSchemaType = z.infer<typeof passwordUpdateSchema>;
