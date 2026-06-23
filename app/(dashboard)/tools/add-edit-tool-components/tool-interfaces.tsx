export interface addNewToolProps {
  addToolSheetOpenEvent: boolean;
  closeAddToolSheetEvent: () => void;
  toolEdit?: boolean;
  isCreatUpdateAgentTool?: boolean;
}

export const endPointMethods = [
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
] as const;

export interface IDataSchema {
  your_key?: string;
  value?: string;
}

export interface IDataSchemas {
  your_key: string;
  value: string;
}

export type IconsData = {
  agent_icons: Record<string, string>;
  tool_icons: Record<string, string>;
};

export interface InputSchemaData {
  [key: string]: {
    title: string;
    type?: string;
    default?: any;
    anyOf?: any[];
  };
}
export interface CustomFieldDef {
  name: string;
  key: string;
  type: "string" | "integer" | "number" | "boolean";
  description: string;
  required: boolean;
}

export const CUSTOM_FIELD_TYPES = [
  { label: "String", value: "string" },
  { label: "Integer", value: "integer" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
] as const;

export const apiType = ["REST", "ODATA", "SOAP"];

export interface ToolFormProps {
  userEvents: string;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getApiType: "REST" | "ODATA" | "SOAP" | null | undefined;
  endPointMethod: string;
  setMethodSelectionHandler: (value: string) => void;
  setOpenModalType: (type: "header" | "parameter") => void;
  setEditIndex: (index: number | null) => void;
  setEditDetails: (data: IDataSchemas | null) => void;
  setAddEditModalOpen: (isOpen: boolean) => void;
  headersList: IDataSchemas[];
  setHeadersList: (items: IDataSchemas[]) => void;
  queryParametersList: IDataSchemas[];
  setQueryParametersList: (items: IDataSchemas[]) => void;
  supportsCustomFields: boolean;
}
