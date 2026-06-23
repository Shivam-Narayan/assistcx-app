"use client";

import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  dataSchemaModal,
  DataSchemaModalType,
  formSchema,
  FormSchemaType,
  nestedFieldSchema,
  NestedFieldSchemaType,
} from "@/lib/schemas/settings/data-templates-schemas";
import {
  formatStringArrayToObjectArray
} from "@/lib/utils";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleDataTemplateEvents } from "@/redux/settings/data-template/data-template-events-slice";
import { handleDataTemplate } from "@/redux/settings/data-template/data-template-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import type {
  IDataRow,
  IDataTemplateState,
  IViewDataSchema,
  NestedFieldData,
} from "./data-template-types";

export function useDataTemplateState(): IDataTemplateState {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const userEvents = useAppSelector(
    (state) => state?.dataTemplateEventReducer?.value.userEvent,
  );
  const dataTemplate = useAppSelector(
    (state) => state?.DataTemplateSliceReducer?.value,
  );
  const sheetEvent = useAppSelector(
    (state) => state?.sheetTriggerReducer?.value?.sheetEvent,
  );

  const [dataSchemasList, setDataSchemasList] = useState<any[]>([]);
  const [openAddDataSchemaModal, setOpenAddDataSchemaModal] =
    useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [openconfirmModel, setOpenconfirmModel] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isImportLoading, setImportLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [ViewDataSchemaJSON, setViewDataSchemaJSON] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [restoredData, setRestoredData] = useState<any | null>(null);
  const [editNestedIndex, setEditNestedIndex] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openPrompt, setOpenPrompt] = useState(false);
  const [dataSchemaLoader, setDataSchemaLoader] = useState(false);
  const [listNestedFields, setListNestedFields] = useState<NestedFieldData[]>(
    [],
  );
  const [showAddNestedFieldForm, setShowAddNestedFieldForm] =
    useState<boolean>(false);

  const nestedFieldForm = useForm<NestedFieldSchemaType>({
    resolver: zodResolver(nestedFieldSchema),
    defaultValues: { fieldName: "", fieldDescription: "", dataType: "" },
    mode: "onChange",
  });

  const dataSchemaForm = useForm<DataSchemaModalType>({
    resolver: zodResolver(dataSchemaModal),
    defaultValues: {
      fieldName: "",
      fieldDescription: "",
      dataType: "",
      keywords: [],
    },
    mode: "onChange",
  });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      templateClass: "",
      document_instructions: [],
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    setSheetOpen(sheetEvent);
  }, [sheetEvent]);

  useEffect(() => {
    setDataSchemasList([]);
    if (
      userEvents === "editDataTemplate" ||
      userEvents === "viewDataTemplate"
    ) {
      form.setValue("name", dataTemplate?.name ?? "");
      form.setValue("description", dataTemplate?.description ?? "");
      form.setValue("templateClass", dataTemplate?.template_class ?? "");

      const newData: any = (dataTemplate.data_schema || []).map(
        (item: any, i: number) => {
          const { name, description, data_type, field_schema, keywords } = item;
          const newItem: any = {
            fieldName: name,
            fieldDescription: description,
            id: i,
            dataType: data_type?.toLowerCase(),
            keywords: keywords,
          };
          if (field_schema && Array.isArray(field_schema)) {
            newItem.nestedFields = field_schema.map((nested: any) => ({
              fieldName: nested.name,
              fieldDescription: nested.description,
              dataType: nested.data_type,
            }));
          }
          return newItem;
        },
      );
      if (newData && newData.length != 0) {
        setDataSchemasList([]);
        setDataSchemasList([...newData]);
      }

      const docInstrValue = formatStringArrayToObjectArray(
        dataTemplate?.document_instructions,
      );
      form.setValue("document_instructions", docInstrValue as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEvents]);

  const DataTemplateInfo: IDataRow[] = [
    { label: "Name", value: dataTemplate?.name ?? "" },
    { label: "Template Class", value: dataTemplate?.template_class ?? "" },
    { label: "Description", value: dataTemplate?.description ?? "" },
  ];

  const DataSchemaInfo: IViewDataSchema[] = [];
  if (
    dataTemplate?.data_schema &&
    Array.isArray(dataTemplate.data_schema) &&
    dataTemplate.data_schema.length > 0
  ) {
    DataSchemaInfo.push(
      ...(dataTemplate.data_schema
        .map(
          (field: {
            name: any;
            description: any;
            data_type: any;
            keywords: any;
            field_schema: any;
          }) => [
            {
              label: field?.name,
              value: field?.description,
              dataType: field?.data_type,
              keywords: field?.keywords,
              field_schema: field?.field_schema?.map(
                (nestedField: {
                  name: any;
                  description: any;
                  data_type: any;
                }) => ({
                  fieldName: nestedField.name,
                  dataType: nestedField.data_type,
                  fieldDescription: nestedField.description,
                }),
              ),
            },
          ],
        )
        .flat()
        .filter(Boolean) as IViewDataSchema[]),
    );
  }

  const dataType = dataSchemaForm.watch("dataType");
  useEffect(() => {
    if (dataType !== "object" && dataType !== "list[object]") {
      dataSchemaForm.clearErrors("nestedFields");
      dataSchemaForm.setValue("nestedFields", [], { shouldDirty: true });
    }
  }, [dataType, dataSchemaForm]);

  useEffect(() => {
    if (!restoredData) return;

    form.setValue("name", restoredData?.name ?? "");
    form.setValue("description", restoredData?.description ?? "");
    form.setValue("templateClass", restoredData?.template_class ?? "");

    const docInstrValue = formatStringArrayToObjectArray(
      restoredData?.document_instructions,
    );
    form.setValue("document_instructions", docInstrValue as any);

    const newData: any[] = (restoredData?.data_schema || []).map(
      (item: any, i: number) => {
        const { name, description, data_type, field_schema, keywords } = item;
        const newItem: any = {
          id: i,
          fieldName: name,
          fieldDescription: description,
          dataType: data_type?.toLowerCase(),
          keywords: keywords ?? [],
        };

        if (Array.isArray(field_schema) && field_schema.length > 0) {
          newItem.nestedFields = field_schema.map((nested: any) => ({
            fieldName: nested.name,
            fieldDescription: nested.description,
            dataType: nested.data_type,
          }));
        }

        return newItem;
      },
    );

    setDataSchemasList(newData);
    setEditIndex(null);
    setOpenAddDataSchemaModal(false);
    setLocalError("");
  }, [restoredData, form]);

  function handleResetForm() {
    const resetDataTemplate: any = {
      id: "",
      name: "",
      template_class: "",
      description: "",
    };
    form.reset();
    dispatch(handleSheetEvents(false));
    dispatch(handleDataTemplateEvents(""));
    dispatch(handleDataTemplate(resetDataTemplate));
    setViewDataSchemaJSON(false);
    setIsCollapsed(false);
    setEditIndex(null);
    dataSchemaForm.reset();
    setOpenAddDataSchemaModal(false);
    setLocalError("");
  }

  const handleEditDataTemplate = () => {
    dispatch(handleDataTemplateEvents("editDataTemplate"));
  };

  const viewDataSchemaJeson = (isView: boolean) => {
    setViewDataSchemaJSON(isView);
  };

  return {
    userEvents,
    dataTemplate,
    sheetEvent,
    sheetOpen,
    setSheetOpen,
    dataSchemasList,
    setDataSchemasList,
    openAddDataSchemaModal,
    setOpenAddDataSchemaModal,
    editIndex,
    setEditIndex,
    openconfirmModel,
    setOpenconfirmModel,
    isLoading,
    setLoading,
    isImportLoading,
    setImportLoading,
    isDeleteLoading,
    setIsDeleteLoading,
    isImportModalOpen,
    setIsImportModalOpen,
    openConfirmation,
    setOpenConfirmation,
    restoredData,
    setRestoredData,
    editNestedIndex,
    setEditNestedIndex,
    isCollapsed,
    openPrompt,
    setOpenPrompt,
    dataSchemaLoader,
    setDataSchemaLoader,
    listNestedFields,
    setListNestedFields,
    showAddNestedFieldForm,
    setShowAddNestedFieldForm,
    ViewDataSchemaJSON,
    setViewDataSchemaJSON,
    localError,
    setLocalError,
    form,
    dataSchemaForm,
    nestedFieldForm,
    DataTemplateInfo,
    DataSchemaInfo,
    handleResetForm,
    handleEditDataTemplate,
    viewDataSchemaJeson,
    axiosAuth,
    loading,
  };
}
