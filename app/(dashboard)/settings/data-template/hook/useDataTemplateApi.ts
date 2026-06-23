"use client";

import * as helperFun from "@/helper/helper-function";
import { validateImportedConfig } from "@/helper/import-config-validator";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import { FormSchemaType } from "@/lib/schemas/settings/data-templates-schemas";
import {
  formatAndCombineValue,
  formatStringArrayToObjectArray,
} from "@/lib/utils";
import { handleDataTemplateEvents } from "@/redux/settings/data-template/data-template-events-slice";
import type { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import type {
  DataItem,
  FileUploadType,
  IDataTemplateState,
} from "./data-template-types";

/** Submit, delete, import/export, restore, generate schema. */
export function useDataTemplateApi(
  state: IDataTemplateState,
  loadTableData: (data: any, type: PostActionStateSyncAction) => void,
) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    form,
    dataSchemasList,
    userEvents,
    dataTemplate,
    setSheetOpen,
    setLoading,
    setDataSchemasList,
    axiosAuth,
    loading,
    setImportLoading,
    setIsImportModalOpen,
    setOpenConfirmation,
    setOpenconfirmModel,
    setIsDeleteLoading,
    setRestoredData,
    setDataSchemaLoader,
    setOpenPrompt,
  } = state;

  const mapDataSchemasToApi = (): DataItem[] => {
    if (dataSchemasList.length === 0) return [];
    return dataSchemasList.map((item) => {
      const { fieldName, fieldDescription, dataType, keywords, nestedFields } =
        item;
      return {
        name: fieldName,
        description: fieldDescription,
        data_type: dataType,
        keywords: keywords,
        field_schema:
          (dataType === "object" || dataType === "list[object]") &&
          Array.isArray(nestedFields)
            ? nestedFields.map((nf) => ({
                name: nf.fieldName,
                description: nf.fieldDescription,
                data_type: nf.dataType,
              }))
            : undefined,
      };
    });
  };

  async function onSubmit(values: FormSchemaType) {
    if (!loading) {
      if (userEvents === "addDataTemplate") {
        setLoading(true);
        const newData = mapDataSchemasToApi();
        const hasEmptyField = newData.some(
          (item) =>
            !item.name?.trim() ||
            !item.description?.trim() ||
            !item.data_type?.trim(),
        );
        if (hasEmptyField) {
          helperFun.errorMessageHandler("Missing data inside data_schema");
          setLoading(false);
          return;
        }
        try {
          const result = await axiosAuth.post(url.ADD_DATA_TEMPLATE, {
            name: values.name,
            template_class: values.templateClass,
            description: values.description,
            document_instructions: formatAndCombineValue(
              values.document_instructions,
            ),
            data_schema: newData,
          });
          if (result?.status === 200) {
            const newItem = result.data;
            helperFun.successMessageHandler(
              messages.data_template_added_successfully,
            );
            setSheetOpen(false);
            loadTableData(newItem, "add");
          } else helperFun.errorMessageHandler(result);
        } catch (error: any) {
          helperFun.errorMessageHandler(
            error.response?.data?.detail || "Something went wrong",
          );
        }
        setLoading(false);
      } else {
        setLoading(true);
        const newData = mapDataSchemasToApi();
        const hasEmptyField = newData.some(
          (item) =>
            !item.name?.trim() ||
            !item.description?.trim() ||
            !item.data_type?.trim(),
        );
        if (hasEmptyField) {
          helperFun.errorMessageHandler("Missing data inside data_schema");
          setLoading(false);
          return;
        }
        try {
          const result = await axiosAuth.patch(
            `${url.UPDATE_DATA_TEMPLATE}/${dataTemplate?.id}`,
            {
              name: values.name,
              template_class: values.templateClass,
              description: values.description,
              document_instructions: formatAndCombineValue(
                values.document_instructions,
              ),
              data_schema: newData,
            },
          );
          if (result?.status === 200) {
            const updatedItem = result.data;
            helperFun.successMessageHandler(
              messages.data_template_updated_successfully,
            );
            setSheetOpen(false);

            loadTableData(updatedItem, "update");
          } else helperFun.errorMessageHandler(result);
        } catch (error: any) {
          helperFun.errorMessageHandler(
            error.response?.data?.detail || "Something went wrong",
          );
        } finally {
          setLoading(false);
        }
      }
    }
  }

  const getButtonProps = () => {
    switch (userEvents) {
      case "addDataTemplate":
        return {
          label: "Add Template",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      case "editDataTemplate":
        return {
          label: "Update Template",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      default:
        return {};
    }
  };
  const { label, variant, onClick } = getButtonProps();

  const handleDeleteClick = () => setOpenconfirmModel(true);

  const handleConfirmDelete = async () => {
    if (loading || !dataTemplate?.id) return;
    setIsDeleteLoading(true);
    try {
      const result = await axiosAuth.delete(
        `${url.DELETE_DATA_TEMPLATE}/${dataTemplate.id}`,
      );
      if (result?.status === 200) {
        helperFun.successMessageHandler(result.data.message);
        setOpenconfirmModel(false);
        setSheetOpen(false);
        loadTableData(dataTemplate, "delete");
      } else helperFun.errorMessageHandler(result);
    } catch (error: any) {
      helperFun.errorMessageHandler(
        error.response?.data?.detail || "Something went wrong",
      );
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const fillDataTemplateForm = (template: any) => {
    if (!template) return;
    if (userEvents !== "editDataTemplate") {
      form.setValue("name", template.name ?? "");
      form.setValue("description", template.description ?? "");
      form.setValue("templateClass", template.template_class ?? "");
    }
    const newData: any[] = (template.data_schema || []).map(
      (item: any, i: number) => {
        const { name, description, data_type, field_schema, keywords } = item;
        const newItem: any = {
          fieldName: name,
          fieldDescription: description,
          id: i,
          dataType: data_type?.toLowerCase(),
          keywords: keywords,
        };
        if (field_schema?.length) {
          newItem.nestedFields = field_schema.map((nested: any) => ({
            fieldName: nested.name,
            fieldDescription: nested.description,
            dataType: nested.data_type,
          }));
        }
        return newItem;
      },
    );
    setDataSchemasList(newData.length > 0 ? newData : []);
    const docInstrValue = formatStringArrayToObjectArray(
      template?.document_instructions,
    );
    form.setValue("document_instructions", docInstrValue as any);
  };

  const handleImportDataTemplate = (filesToUpload: FileUploadType[]) => {
    filesToUpload.forEach((fileUploaded) => {
      setImportLoading(true);
      const file = fileUploaded.File;
      if (file.type.includes("application/json") && file.size > 0 && !loading) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileContent = event.target?.result as string;
          if (!fileContent.trim()) {
            helperFun.errorMessageHandler(
              "The file is empty or contains only whitespace.",
            );
            setImportLoading(false);
            return;
          }
          try {
            const jsonContent = JSON.parse(fileContent);
            const importedTemplate = jsonContent.data_templates?.[0];
            const validation = validateImportedConfig(
              importedTemplate,
              {
                moduleName: "data_template",
                fields: [
                  "name",
                  "description",
                  "template_class",
                  "data_schema",
                ],
              },
              true,
            );
            if (!validation.valid) {
              helperFun.errorMessageHandler(validation.message);
              return;
            }
            fillDataTemplateForm(importedTemplate);
          } catch (error: any) {
            const errorMessage =
              error instanceof SyntaxError
                ? "Invalid JSON format"
                : error.response?.data?.detail ||
                  "Please upload a valid JSON file";
            helperFun.errorMessageHandler(errorMessage);
          } finally {
            setImportLoading(false);
            setIsImportModalOpen(false);
          }
        };
        reader.readAsText(file);
      } else {
        helperFun.errorMessageHandler("Please upload a valid JSON file.");
        setImportLoading(false);
      }
    });
  };

  const handleExportDataTemplate = async () => {
    if (!loading) {
      try {
        const result = await axiosAuth.get(
          `${url.LIST_DATA_TEMPLATE}/${dataTemplate.id}`,
        );
        if (result?.status === 200) {
          const jsonBlob = new Blob([JSON.stringify(result?.data, null, 2)], {
            type: "application/json",
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(jsonBlob);
          link.download = `${dataTemplate.name}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setOpenConfirmation(false);
          helperFun.successMessageHandler(
            messages.data_template_exported_successfully,
          );
        }
      } catch (error) {
        helperFun.errorMessageHandler(error);
        setOpenConfirmation(false);
      }
    }
  };

  const handleRestoreVersionData = (data: any) => {
    setRestoredData(data?.config_data);
    dispatch(handleDataTemplateEvents("editDataTemplate"));
  };

  const watchedName = form.watch("name");
  const watchedTemplateClass = form.watch("templateClass");
  const watchedDescription = form.watch("description");
  const showGenerateButton =
    !!watchedName?.trim() &&
    !!watchedTemplateClass?.trim() &&
    !!watchedDescription?.trim();

  const handleGenerateDataSchema = async (promptValue: string) => {
    if (!loading) {
      setDataSchemaLoader(true);
      try {
        const requestBody =
          dataSchemasList.length > 0
            ? {
                name: form.getValues("name"),
                description: form.getValues("description"),
                user_instructions: promptValue,
                data_schema: dataSchemasList.map((item) => ({
                  name: item.fieldName,
                  description: item.fieldDescription,
                  data_type: item.dataType,
                  keywords: item.keywords,
                  field_schema:
                    item.dataType === "object" ||
                    item.dataType === "list[object]"
                      ? item.nestedFields?.map((nested: any) => ({
                          name: nested.fieldName,
                          description: nested.fieldDescription,
                          data_type: nested.dataType,
                        }))
                      : [],
                })),
              }
            : {
                name: form.getValues("name"),
                description: form.getValues("description"),
              };
        const result = await axiosAuth.post(
          url.DATA_TEMPLATES_BUILDER,
          requestBody,
        );
        if (result?.status === 200) {
          const generatedSchema = result.data.data_schema || [];
          const formatDataSchema = generatedSchema.map(
            (item: any, id: number) => ({
              id,
              fieldName: item.name,
              fieldDescription: item.description,
              dataType: item.data_type?.toLowerCase(),
              keywords: item.keywords,
              nestedFields: item.field_schema?.map((nested: any) => ({
                fieldName: nested.name,
                fieldDescription: nested.description,
                dataType: nested.data_type?.toLowerCase(),
              })),
            }),
          );
          setDataSchemasList(formatDataSchema);
          helperFun.successMessageHandler(
            messages.data_template_schema_generated_successfully,
          );
        } else helperFun.errorMessageHandler(result);
      } catch (error: any) {
        helperFun.errorMessageHandler(error);
      }
      setLoading(false);
      setDataSchemaLoader(false);
      setOpenPrompt(false);
    }
  };

  return {
    onSubmit,
    label,
    variant,
    onClick,
    handleDeleteClick,
    handleConfirmDelete,
    fillDataTemplateForm,
    handleImportDataTemplate,
    handleExportDataTemplate,
    handleRestoreVersionData,
    showGenerateButton,
    handleGenerateDataSchema,
  };
}
