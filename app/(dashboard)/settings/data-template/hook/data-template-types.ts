"use client";

import type { UseFormReturn } from "react-hook-form";
import type {
  DataSchemaModalType,
  FormSchemaType,
  NestedFieldSchemaType,
} from "@/lib/schemas/settings/data-templates-schemas";

export interface NestedFieldData {
  fieldName: string;
  fieldDescription: string;
  dataType: string;
}

export interface DataSchemaData {
  id: number;
  fieldName: string;
  fieldDescription: string;
  dataType: string;
  keywords?: any;
  nestedFields?: NestedFieldData[];
}

export interface IDataRow {
  label?: string;
  value?: string;
}

export interface IViewDataSchema {
  label?: string;
  value?: string;
  dataType: string;
  keywords: any;
  nestedFields?: NestedFieldData[];
  field_schema?: {
    fieldName: string;
    dataType: string;
    fieldDescription: string;
  }[];
}

export interface DataItem {
  name: string;
  description: string;
  data_type: string;
  keywords?: any;
  field_schema?: Omit<DataItem, "field_schema">[];
}

export interface FileUploadType {
  File: File;
}

export interface IDataTemplateState {
  userEvents: string;
  dataTemplate: any;
  sheetEvent: boolean;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  dataSchemasList: any[];
  setDataSchemasList: React.Dispatch<React.SetStateAction<any[]>>;
  openAddDataSchemaModal: boolean;
  setOpenAddDataSchemaModal: (open: boolean) => void;
  editIndex: number | null;
  setEditIndex: (index: number | null) => void;
  openconfirmModel: boolean;
  setOpenconfirmModel: (open: boolean) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  isImportLoading: boolean;
  setImportLoading: (loading: boolean) => void;
  isDeleteLoading: boolean;
  setIsDeleteLoading: (loading: boolean) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  openConfirmation: boolean;
  setOpenConfirmation: (open: boolean) => void;
  restoredData: any | null;
  setRestoredData: (data: any | null) => void;
  editNestedIndex: number | null;
  setEditNestedIndex: (index: number | null) => void;
  isCollapsed: boolean;
  openPrompt: boolean;
  setOpenPrompt: (open: boolean) => void;
  dataSchemaLoader: boolean;
  setDataSchemaLoader: (loading: boolean) => void;
  listNestedFields: NestedFieldData[];
  setListNestedFields: React.Dispatch<React.SetStateAction<NestedFieldData[]>>;
  showAddNestedFieldForm: boolean;
  setShowAddNestedFieldForm: (show: boolean) => void;
  ViewDataSchemaJSON: boolean;
  setViewDataSchemaJSON: (view: boolean) => void;
  localError: string;
  setLocalError: (error: string) => void;
  form: UseFormReturn<FormSchemaType>;
  dataSchemaForm: UseFormReturn<DataSchemaModalType>;
  nestedFieldForm: UseFormReturn<NestedFieldSchemaType>;
  DataTemplateInfo: IDataRow[];
  DataSchemaInfo: IViewDataSchema[];
  handleResetForm: () => void;
  handleEditDataTemplate: () => void;
  viewDataSchemaJeson: (isView: boolean) => void;
  axiosAuth: any;
  loading: boolean;
}
