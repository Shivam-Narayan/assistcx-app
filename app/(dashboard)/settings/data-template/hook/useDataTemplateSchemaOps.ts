"use client";

import * as helperFun from "@/helper/helper-function";
import {
  dataSchemaModal,
  DataSchemaModalType,
  NestedFieldSchemaType,
} from "@/lib/schemas/settings/data-templates-schemas";
import { arrayMove } from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import { handleDataTemplateEvents } from "@/redux/settings/data-template/data-template-events-slice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import type {
  IDataTemplateState,
  DataSchemaData,
  NestedFieldData,
} from "./data-template-types";

/** Schema list + nested fields operations (add/edit/delete/reorder). */
export function useDataTemplateSchemaOps(state: IDataTemplateState) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    dataSchemasList,
    setDataSchemasList,
    dataSchemaForm,
    listNestedFields,
    setListNestedFields,
    setEditIndex,
    setOpenAddDataSchemaModal,
    setLocalError,
    setShowAddNestedFieldForm,
    setEditNestedIndex,
    nestedFieldForm,
    editNestedIndex,
  } = state;

  // —— Data schema list ——
  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id === over.id) return;
    setDataSchemasList((list) => {
      const oldIndex = list.findIndex((listI) => listI.id === active.id);
      const newIndex = list.findIndex((listI) => listI.id === over.id);
      return arrayMove(list, oldIndex, newIndex);
    });
  };

  const removeDataSchemaHandler = (indexI: any) => {
    setDataSchemasList((prev) => prev.filter((_, index) => index != indexI));
  };

  const setEditDataSchemaHandler = (index: number) => {
    setOpenAddDataSchemaModal(false);
    setEditIndex(index);
    setLocalError("");
  };

  const cancelUpdate = (index: number | null) => {
    if (index != null && index != undefined) {
      setEditIndex(null);
      setLocalError("");
    }
  };

  const saveEditDataSchemaHandler = (
    index: number | null,
    editedDataSchema: DataSchemaData,
  ) => {
    if (index == null || index === undefined) return;
    setDataSchemasList((prev) => {
      const isDuplicateName = prev.some(
        (item: any, id: number) =>
          id !== index && item.fieldName === editedDataSchema.fieldName,
      );
      if (isDuplicateName) {
        toast.error("Duplicate data schema not allowed", {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        });
        return prev;
      }
      return prev.map((item: any, id: number) =>
        id === index
          ? {
              ...editedDataSchema,
              id: item.id ?? editedDataSchema.id ?? index,
            }
          : item,
      );
    });
    setEditIndex(null);
    setOpenAddDataSchemaModal(false);
  };

  const addNewSchemaFormHandler = () => {
    setEditIndex(null);
    dataSchemaForm.reset();
    setListNestedFields([]);
    setOpenAddDataSchemaModal(true);
    setLocalError("");
  };

  const addSubmitSchemaHandler = (values: DataSchemaModalType) => {
    if (state.localError?.trim()) return;
    const finalValues = { ...values, nestedFields: listNestedFields };
    const parseResult = dataSchemaModal.safeParse(finalValues);
    if (!parseResult.success) {
      parseResult.error.errors.forEach((err) => {
        dataSchemaForm.setError(err.path[0] as any, {
          type: "manual",
          message: err.message,
        });
      });
      return;
    }
    const findIndex = dataSchemasList.findIndex(
      (item: any) => item["fieldName"] == values["fieldName"],
    );
    if (findIndex === -1) {
      setDataSchemasList((prev) => [
        ...prev,
        {
          id: Math.floor(1 + (100 - 1) * Math.random()),
          fieldName: values["fieldName"],
          fieldDescription: values["fieldDescription"],
          dataType: values["dataType"],
          keywords: values["keywords"],
          nestedFields:
            values.dataType === "object" || values.dataType === "list[object]"
              ? listNestedFields
              : undefined,
        },
      ]);
      dataSchemaForm.reset();
      setOpenAddDataSchemaModal(false);
    } else {
      toast.error("Duplicate data schema not allowed", {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
      dataSchemaForm.reset();
    }
  };

  const closeModal = () => {
    setEditIndex(null);
    dataSchemaForm.reset();
    setOpenAddDataSchemaModal(false);
    setLocalError("");
  };

  const cancleEdit = () => {
    setEditIndex(null);
    setLocalError("");
    dataSchemaForm.reset();
    setOpenAddDataSchemaModal(false);
    dispatch(handleDataTemplateEvents("viewDataTemplate"));
  };

  const convertDataInJson = () => {
    const extractedData = dataSchemasList.map((item) => {
      const baseItem = {
        name: item.fieldName,
        data_type: item.dataType,
        keywords: item.keywords,
        description: item.fieldDescription,
      };
      if (item.nestedFields?.length) {
        return {
          ...baseItem,
          field_schema: item.nestedFields.map((nestedField: NestedFieldData) => ({
            name: nestedField.fieldName,
            data_type: nestedField.dataType,
            description: nestedField.fieldDescription,
          })),
        };
      }
      return baseItem;
    });
    return helperFun.renderJsonSyntaxHighlight(extractedData);
  };

  // —— Nested fields ——
  const handleAddNestedField = () => {
    nestedFieldForm.reset();
    setShowAddNestedFieldForm(true);
    setEditNestedIndex(null);
  };

  const onCancelNestedField = () => {
    nestedFieldForm.reset();
    setShowAddNestedFieldForm(false);
    setEditNestedIndex(null);
  };

  const handleDeleteforsigleNestedField = (indexToDelete: number) => {
    const updatedList = listNestedFields.filter((_, index) => index !== indexToDelete);
    setListNestedFields(updatedList);
    dataSchemaForm.setValue("nestedFields", updatedList, { shouldValidate: true });
  };

  const handleDeleteNestedField = (parentIndex: number, nestedFieldIndex: number) => {
    setDataSchemasList((prevSchemas) =>
      prevSchemas.map((schema, index) => {
        if (index !== parentIndex) return schema;
        return {
          ...schema,
          nestedFields:
            schema.nestedFields?.filter((_: any, idx: number) => idx !== nestedFieldIndex) ?? [],
        };
      }),
    );
  };

  const onSaveNestedField = (data: NestedFieldSchemaType) => {
    if (editNestedIndex !== null) {
      const updatedList = [...listNestedFields];
      const isDuplicate = listNestedFields.some(
        (field, idx) => field.fieldName === data.fieldName && idx !== editNestedIndex,
      );
      if (isDuplicate) {
        toast.error("Duplicate nested field name not allowed.");
        return;
      }
      updatedList[editNestedIndex] = data;
      setListNestedFields(updatedList);
      dataSchemaForm.setValue("nestedFields", updatedList, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setEditNestedIndex(null);
      onCancelNestedField();
      return;
    }
    if (listNestedFields.some((field) => field.fieldName === data.fieldName)) {
      toast.error("Duplicate nested field name not allowed.");
      return;
    }
    const updatedList = [...listNestedFields, data];
    setListNestedFields(updatedList);
    dataSchemaForm.setValue("nestedFields", updatedList, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (updatedList.length > 0) dataSchemaForm.clearErrors("nestedFields");
    onCancelNestedField();
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setListNestedFields((items) => {
        const oldIndex = items.findIndex((_, i) => i.toString() === active.id);
        const newIndex = items.findIndex((_, i) => i.toString() === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleEditNestedFieldClick = (index: number) => setEditNestedIndex(index);
  const handleCancelEditNested = () => setEditNestedIndex(null);

  const handleSaveNestedField = (data: any, index: number) => {
    const updatedList = [...listNestedFields];
    updatedList[index] = data;
    setListNestedFields(updatedList);
    setEditNestedIndex(null);
  };

  return {
    onDragEnd,
    removeDataSchemaHandler,
    setEditDataSchemaHandler,
    cancelUpdate,
    saveEditDataSchemaHandler,
    addNewSchemaFormHandler,
    addSubmitSchemaHandler,
    closeModal,
    cancleEdit,
    convertDataInJson,
    handleAddNestedField,
    onCancelNestedField,
    handleDeleteforsigleNestedField,
    handleDeleteNestedField,
    onSaveNestedField,
    handleDragEnd,
    handleEditNestedFieldClick,
    handleCancelEditNested,
    handleSaveNestedField,
  };
}
