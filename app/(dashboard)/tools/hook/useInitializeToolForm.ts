import { AddNewToolFormSchemaType } from "@/lib/schemas/tools-schemas";
import { useAppSelector } from "@/redux/store";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { convertObjectToArray } from "../add-edit-tool-components/tool-helper-function";
import { DEFAULT_FORM_VALUES } from "../add-edit-tool-components/initial-form-state";
import { IDataSchemas } from "../add-edit-tool-components/tool-interfaces";
type FormType = UseFormReturn<AddNewToolFormSchemaType>;
interface UseInitializeToolFormProps {
  form: FormType;
  setHeadersList: (headers: IDataSchemas[]) => void;
  setQueryParametersList: (params: IDataSchemas[]) => void;
  setEndPointMethod: (method: string) => void;
  setApiType: (type: "REST" | "ODATA" | "SOAP") => void;
  endPointMethod: string;
}
export function useInitializeToolForm({
  form,
  setHeadersList,
  setQueryParametersList,
  setEndPointMethod,
  setApiType,
  endPointMethod,
}: UseInitializeToolFormProps) {
  const userEvents = useAppSelector(
    (state) => state?.toolsEventReducer?.toolsEventReducer?.value?.userEvent,
  );
  const toolsData = useAppSelector(
    (state) => state?.toolsDataReducer?.toolsDataReducer?.value,
  );

  useEffect(() => {
    if (!toolsData || (userEvents !== "editTool" && userEvents !== "viewTool"))
      return;

    // data store inside form
    const resolvedApiType =
      toolsData.api_type === "REST"
        ? "REST"
        : toolsData.api_type === "ODATA"
          ? "ODATA"
          : toolsData.api_type === "SOAP"
            ? "SOAP"
            : undefined;

    form.reset({
      ...DEFAULT_FORM_VALUES,
      ...toolsData,
      api_type: resolvedApiType,
      icon: toolsData.icon || DEFAULT_FORM_VALUES.icon,
    } as AddNewToolFormSchemaType);

    // --- HEADERS ---
    if (toolsData.headers && Object.keys(toolsData.headers).length > 0) {
      setHeadersList(convertObjectToArray(toolsData.headers));
    }

    // --- QUERY PARAMS ---
    if (
      toolsData.query_params &&
      Object.keys(toolsData.query_params).length > 0
    ) {
      setQueryParametersList(convertObjectToArray(toolsData.query_params));
    }

    // --- API TYPE ---
    const apiType = resolvedApiType;

    form.setValue("api_type", apiType);
    form.setValue("protocol", toolsData.api_type || "REST");

    // --- BASIC FIELDS ---
    setEndPointMethod(toolsData.method);
    form.setValue("endpoint", toolsData.endpoint ?? "");
    form.setValue("content_type", toolsData.content_type ?? "");
    form.setValue("body_template", toolsData.body_template ?? "");

    // Ensure the value passed matches the expected literal union type
    setApiType(apiType ?? "REST");

    // --- AUTH CONFIG ---
    const auth = toolsData?.auth_config ?? {};

    form.setValue("username", auth.username ?? "");
    form.setValue("password", auth.password ?? "");
    form.setValue("token", auth.token ?? "");
    form.setValue("client_id", auth.client_id ?? "");
    form.setValue("client_secret", auth.client_secret ?? "");
    form.setValue("token_url", auth.token_url ?? "");
    form.setValue("scope", auth.scope ?? "");
    form.setValue("api_key_name", auth.api_key_name ?? "");
    form.setValue("api_key", auth.api_key ?? "");
    form.setValue("api_key_location", auth.api_key_location ?? "header");

    form.setValue("auth_type", toolsData.auth_type ?? "");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolsData, userEvents]);

  useEffect(() => {
    if (userEvents == "addTool") {
      setApiType("REST");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEvents]);
  let getApiType = form.getValues("api_type");

  useEffect(() => {
    if (userEvents !== "viewTool" && getApiType) {
      if (getApiType === "ODATA") {
        setEndPointMethod("GET");
        form.setValue("content_type", "");
      } else if (getApiType === "SOAP") {
        setEndPointMethod("POST");
        form.setValue("content_type", "text/xml");
      }
      if (getApiType === "REST") {
        setEndPointMethod("GET");
        form.setValue("content_type", "");
        form.setValue("protocol", "REST");
        form.setValue("body_template", "");
      } else if (getApiType === "ODATA") {
        form.setValue("protocol", "ODATA");
        form.setValue("body_template", "");
      } else if (getApiType === "SOAP") {
        form.setValue("protocol", "SOAP");
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getApiType]); // Refactored dependencies
  useEffect(() => {
    if (endPointMethod === "POST") {
      setQueryParametersList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endPointMethod]);
  return { getApiType };
}
