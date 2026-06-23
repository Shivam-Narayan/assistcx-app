import { getFormattedValues } from "@/helper/helper-function";
import { AddNewToolFormSchemaType } from "@/lib/schemas/tools-schemas";
import { CustomFieldDef } from "./tool-interfaces";

export function shouldSkipToolFormValidation(
  userEvent: string,
  supportsCustomFields: boolean,
  isDefault?: boolean,
) {
  return (
    userEvent === "editTool" && (supportsCustomFields || Boolean(isDefault))
  );
}

export const convertObjectToArray = <T extends Record<string, any>>(
  obj: Record<string, string>,
) =>
  Object.entries(obj).map(([key, value]) => ({
    your_key: key,
    value,
  })) as unknown as T[];

export function generateRequestBody(
  values: AddNewToolFormSchemaType,
  {
    headersList,
    queryParametersList,
    endPointMethod,
    customFields,
  }: {
    headersList: any[];
    queryParametersList: any[];
    endPointMethod: string;
    customFields?: any[];
  },
) {
  // ---------- AUTH CONFIG ----------
  let auth_config: any = {};

  switch (values.auth_type) {
    case "Basic":
      auth_config = {
        username: values.username ?? "",
        password: values.password ?? "",
      };
      break;

    case "Bearer":
      auth_config = { token: values.token ?? "" };
      break;

    case "OAuth2":
      auth_config = {
        client_id: values.client_id ?? "",
        client_secret: values.client_secret ?? "",
        token_url: values.token_url ?? "",
        scope: values.scope ?? "",
      };
      break;

    case "APIKey":
      auth_config = {
        api_key_name: values.api_key_name ?? "",
        api_key: values.api_key ?? "",
        api_key_location: values.api_key_location ?? "",
      };
      break;
  }

  const isApi = ["REST", "ODATA", "SOAP"].includes(values.api_type ?? "");

  return {
    icon: values.icon,
    name: values.name,
    action: values.action,
    description: values.description,

    // ---------- API CONFIG ----------
    api_type: isApi ? values.protocol : null,
    method: isApi ? endPointMethod : null,
    endpoint: isApi ? values.endpoint : null,
    content_type: isApi ? values.content_type : null,

    headers: isApi
      ? headersList?.length
        ? getFormattedValues(headersList)
        : {}
      : null,

    query_params:
      values.api_type === "REST" || values.api_type === "ODATA"
        ? queryParametersList?.length
          ? getFormattedValues(queryParametersList)
          : {}
        : null,

    path_params: {},

    body_template:
      values.api_type === "SOAP" || values.api_type === "REST"
        ? values.body_template
        : "",

    // ---------- META ----------
    is_default: false,
    is_enabled: true,
    auth_type: values.auth_type === "No Auth" ? "" : values.auth_type,
    auth_config,
    additional_config: {},
    tool_config: { name: "API Tool" },
    ...(customFields ? { custom_fields: customFields } : {}),
  };
}

export function buildToolEditPayload(
  values: AddNewToolFormSchemaType,
  {
    skipMainForm,
    customFields,
    supportsCustomFields,
    headersList,
    queryParametersList,
    endPointMethod,
  }: {
    skipMainForm: boolean;
    customFields: CustomFieldDef[];
    supportsCustomFields: boolean;
    headersList: any[];
    queryParametersList: any[];
    endPointMethod: string;
  },
) {
  if (skipMainForm) {
    return { custom_fields: customFields };
  }
  return generateRequestBody(values, {
    headersList,
    queryParametersList,
    endPointMethod,
    customFields: supportsCustomFields ? customFields : undefined,
  });
}
