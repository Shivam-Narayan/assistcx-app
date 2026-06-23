import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import { validateImportedConfig } from "@/helper/import-config-validator";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  classGroupSchema,
  ClassGroupSchemaType,
  classLabelSchema,
  ClassLabelSchemaType,
} from "@/lib/schemas/settings/class-group-schemas";
import { displayNameToIdentifierKey } from "@/lib/utils";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleClassGroupData } from "@/redux/settings/class-group/classgroup-data-slice";
import { handleClassGroupEvents } from "@/redux/settings/class-group/classgroup-events-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

interface IDataRow {
  label?: string;
  value?: string;
}
interface IDataField {
  class_name: string;
  class_description: string;
}

interface FileUpload {
  File: File;
}

export const useClassGroupLogic = (
  loadTableData: (data: any, type: PostActionStateSyncAction) => void,
) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const userEvents = useAppSelector(
    (state) => state?.classGroupEventReducer?.value?.userEvent,
  );
  const classGroupData = useAppSelector(
    (state) => state?.classGroupSliceDataReducer?.value,
  );
  const sheetEvent = useAppSelector(
    (state) => state?.sheetTriggerReducer?.value?.sheetEvent,
  );
  const [isLoading, setLoading] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [openconfirmModel, setOpenconfirmModel] = useState(false);
  const [showClassLabelForm, setShowClassLabelForm] = useState(false);
  const [dataFields, setDataFields] = useState<IDataField[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [restoredData, setRestoredData] = useState<any | null>(null);

  // Import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Export
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);

  const mainForm = useForm<ClassGroupSchemaType>({
    resolver: zodResolver(classGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  const classLabelForm = useForm<ClassLabelSchemaType>({
    resolver: zodResolver(classLabelSchema),
    defaultValues: {
      class_name: "",
      class_description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setSheetOpen(sheetEvent);
  }, [sheetEvent]);

  useEffect(() => {
    if (
      (userEvents === "editClassGroup" || userEvents === "viewClassGroup") &&
      classGroupData
    ) {
      mainForm.setValue("name", classGroupData.name ?? "");
      mainForm.setValue("description", classGroupData.description ?? "");
      setDataFields(classGroupData.class_schema);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEvents, classGroupData]);

  const ClassGroupInfo: IDataRow[] = [
    { label: "Name", value: classGroupData?.name ?? "" },
    { label: "Description", value: classGroupData?.description ?? "" },
  ];

  const handleClassGroupField = (e: any) => {
    const value = e.target.value.trim();
  };
  //============[Function:: Add/Edit Class details]==========================//
  async function onSubmit(values: ClassGroupSchemaType) {
    if (showClassLabelForm) {
      errorMessageHandler("Please save the Class Label form first");
      return;
    }
    if (dataFields.length === 0) {
      errorMessageHandler("At least 1 Class Label required");
      return;
    }
    // Check if any class_name or class_description is empty
    const hasEmptyValues = dataFields.some(
      (item) =>
        !item.class_name ||
        item.class_name.trim() === "" ||
        !item.class_description ||
        item.class_description.trim() === "",
    );

    if (hasEmptyValues) {
      errorMessageHandler("Please fill all Class Label fields before saving");
      return;
    }

    if (!loading) {
      if (userEvents === "addClassGroup") {
        setLoading(true);
        let body = {
          name: values.name,
          description: values.description,
          key: displayNameToIdentifierKey(values.name.trim()),
          class_schema: dataFields,
        };
        try {
          const result = await axiosAuth.post(url.POST_CLASS_GROUP_LIST, body);
          if (result?.status === 200) {
            const newItem = result.data;
            setLoading(false);
            successMessageHandler("Class group added successfully");
            setSheetOpen(false);
            loadTableData(newItem, "add");
          }
        } catch (error: any) {
          const errorMessage =
            error.response.data.detail || "Something went wrong";
          errorMessageHandler(errorMessage);
          setLoading(false);
        }
      } else {
        setLoading(true);
        let body = {
          name: values.name,
          description: values.description,
          key: displayNameToIdentifierKey(values.name.trim()),
          class_schema: dataFields,
        };

        try {
          const result = await axiosAuth.patch(
            `${url.POST_CLASS_GROUP_LIST}/${classGroupData?.id}`,
            body,
          );
          if (result?.status === 200) {
            const updatedItem = result.data;
            setLoading(false);
            successMessageHandler(messages.class_group_updated_successfully);
            setSheetOpen(false);
            loadTableData(updatedItem, "update");
          }
        } catch (error: any) {
          const errorMessage =
            error.response.data.detail || "Something went wrong";
          errorMessageHandler(errorMessage);
          setLoading(false);
        }
      }
    }
  }

  //============[Function:: Add Class Label (Data Field)]==========================//
  const onSubmitClassLabel = (values: ClassLabelSchemaType) => {
    if (
      dataFields.some(
        (df, i) => i !== editingIndex && df.class_name === values.class_name,
      )
    ) {
      classLabelForm.setError("class_name", {
        type: "manual",
        message: "Class name already exists",
      });
      return;
    }
    if (editingIndex !== null) {
      setDataFields((prev) =>
        prev.map((item, i) => (i === editingIndex ? values : item)),
      );
      setEditingIndex(null);
    } else {
      setDataFields((prev) => [...prev, values]);
    }

    classLabelForm.reset();
    setShowClassLabelForm(false);
  };

  //============[Function:: Reset Add/Edit Form modal]==========================//
  function handleResetForm() {
    const resetIntentData = {
      id: "",
      name: "",
      intent_class: "",
      description: "",
      created_at: "",
      class_schema: [],
    };
    mainForm.reset();
    classLabelForm.reset();
    dispatch(handleSheetEvents(false));
    dispatch(handleClassGroupEvents(""));
    dispatch(handleClassGroupData(resetIntentData));
    setDataFields([]);
    setShowClassLabelForm(false);
  }

  //============[Function:: Handle Edit Intent Class details]==========================//
  const handleEditClassGroup = () => {
    dispatch(handleClassGroupEvents("editClassGroup"));
  };

  const getButtonProps = () => {
    switch (userEvents) {
      case "addClassGroup":
        return {
          label: "Add Class ",
          onClick: mainForm.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      case "editClassGroup":
        return {
          label: "Update Class",
          onClick: mainForm.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      default:
        return {};
    }
  };

  const { label, variant, onClick } = getButtonProps();

  //============[Function:: Handle Cancel Edit Intent Class details]==========================//
  const cancleEdit = () => {
    dispatch(handleClassGroupEvents("viewClassGroup"));
    setShowClassLabelForm(false);
    classLabelForm.reset();
  };

  //============[Function:: Remove Data Field]==========================//
  const removeDataField = (index: number) => {
    setDataFields((prev) => prev.filter((_, i) => i !== index));
  };

  //============[Function:: delete class groups func]==========================//
  const handleDeleteClick = () => {
    setOpenconfirmModel(true);
  };

  const handleConfirmDelete = async () => {
    if (loading || !classGroupData?.id) return;

    setIsDeleteLoading(true);
    try {
      const API_ENDPOINT_PATH = `${url.DELETE_CLASS_GROUP}/${classGroupData?.id}`;
      const result = await axiosAuth.delete(API_ENDPOINT_PATH);

      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setOpenconfirmModel(false);
        setSheetOpen(false);
        loadTableData(classGroupData, "delete");
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      const errorMessage = error.response.data.detail || "Something went wrong";
      errorMessageHandler(errorMessage);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const editDataField = (index: number) => {
    const field = dataFields[index];
    if (!field) return;

    classLabelForm.setValue("class_name", field.class_name);
    classLabelForm.setValue("class_description", field.class_description);

    setEditingIndex(index);
    setShowClassLabelForm(true);
  };

  const moveDataField = (oldIndex: number, newIndex: number) => {
    setDataFields((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, removed);
      return updated;
    });
  };

  // Import
  const handleImportClassGroup = (filesToUpload: FileUpload[]) => {
    filesToUpload.forEach((fileUploaded) => {
      setIsImportLoading(true);
      const file = fileUploaded.File;
      if (file.type.includes("application/json") && file.size > 0 && !loading) {
        const reader = new FileReader();

        reader.onload = async (event) => {
          const fileContent = event.target?.result as string;

          if (!fileContent.trim()) {
            errorMessageHandler(
              "The file is empty or contains only whitespace.",
            );
            setIsImportLoading(false);
            return;
          }
          try {
            const jsonContent = JSON.parse(fileContent);

            const validation = validateImportedConfig(
              jsonContent,
              {
                moduleName: "class_group",
                fields: ["name", "description", "key", "class_schema"],
              },
              true,
            );

            if (!validation.valid) {
              errorMessageHandler(validation.message);
              return;
            }
            autoFillForm(jsonContent);
          } catch (error: any) {
            const errorMessage =
              error.response.data.detail || "Something went wrong";
            errorMessageHandler(errorMessage);
          } finally {
            setIsImportLoading(false);
            setIsImportModalOpen(false);
          }
        };

        reader.readAsText(file);
      } else {
        errorMessageHandler("Please upload a valid JSON file.");
        setIsImportLoading(false);
      }
    });
  };

  const autoFillForm = (jsonData: any) => {
    if (!jsonData.class_schema || !jsonData.name) {
      errorMessageHandler("Invalid Json");
      return;
    }

    mainForm.setValue("name", jsonData.name ?? "");
    mainForm.setValue("description", jsonData.description ?? "");
    setDataFields(jsonData.class_schema);
    mainForm.clearErrors();
    mainForm.trigger();
  };

  // Export
  const handleExportClassGroup = async () => {
    if (!loading) {
      try {
        const result = await axiosAuth.get(
          `${url.POST_CLASS_GROUP_LIST}/${classGroupData.id}`,
        );
        if (result?.status === 200) {
          const jsonBlob = new Blob([JSON.stringify(result?.data, null, 2)], {
            type: "application/json",
          });
          const jsonURL = URL.createObjectURL(jsonBlob);
          const link = document.createElement("a");
          link.href = jsonURL;
          link.download = `${classGroupData.name}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setOpenConfirmation(false);
          successMessageHandler(messages.class_group_exported_successfully);
        }
      } catch (error) {
        errorMessageHandler(error);
        setOpenConfirmation(false);
      }
    }
  };

  const handleRestoreVersionData = (data: any) => {
    const config = data?.config_data;
    setRestoredData(config);
    dispatch(handleClassGroupEvents("editClassGroup"));
  };

  useEffect(() => {
    if (!restoredData) return;
    mainForm.setValue("name", restoredData.name ?? "");
    mainForm.setValue("description", restoredData.description ?? "");
    setDataFields(restoredData.class_schema);
  }, [restoredData, mainForm]);

  return {
    userEvents,
    classGroupData,
    sheetEvent,
    setSheetOpen,
    isLoading,
    isDeleteLoading,
    sheetOpen,
    openconfirmModel,
    showClassLabelForm,
    dataFields,
    mainForm,
    classLabelForm,
    handleClassGroupField,
    onSubmit,
    onSubmitClassLabel,
    ClassGroupInfo,
    handleResetForm,
    handleEditClassGroup,
    label,
    variant,
    onClick,
    cancleEdit,
    removeDataField,
    handleDeleteClick,
    handleConfirmDelete,
    setShowClassLabelForm,
    setOpenconfirmModel,
    editDataField,
    moveDataField,
    editingIndex,
    setEditingIndex,
    isAdding,
    setIsAdding,

    // Import
    isImportLoading,
    isImportModalOpen,
    setIsImportModalOpen,
    handleImportClassGroup,

    // Export
    openConfirmation,
    setOpenConfirmation,
    handleExportClassGroup,
    handleRestoreVersionData,
  };
};
