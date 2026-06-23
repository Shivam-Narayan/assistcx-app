import { IntegrationsItem } from "@/types/types";
import * as z from "zod";


export const activateIntegrationSchema = (
  integrationsDetails: IntegrationsItem | null
) => {
  if (!integrationsDetails) {
    return z.object({});
  }

  const userFields = integrationsDetails.auth_schema_fields.user ?? {};

  const shape = Object.keys(userFields).reduce(
    (acc, key) => {
      const field = userFields[key];

      if (!field) return acc;

      acc[field.name] = field.required
        ? z.string().nonempty(`${field.label} is required`)
        : z.string().optional();

      return acc;
    },
    {} as Record<string, z.ZodTypeAny>
  );

  return z.object(shape);
};

