"use client";
import { CardContent } from "@/components/ui/card";
import {
  dataSchemaModal,
  DataSchemaModalType,
  nestedFieldSchema,
  NestedFieldSchemaType,
} from "@/lib/schemas/settings/data-templates-schemas";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import EditDataSchema from "./components/edit-data-schema";
import ViewDataSchema from "./components/view-data-schema";

interface NestedField {
  fieldName: string;
  fieldDescription: string;
  dataType: string;
}

export interface DataSchemaF {
  id: number;
  fieldName: string;
  fieldDescription: string;
  dataType: string;
  keywords?: any;
  nestedFields?: NestedField[];
}

interface AgentRulesListProps {
  dataSchemaCard: DataSchemaF;
  index: number;
  openAddSchemaModal: boolean;
  removeDataSchemaHandler: (index: number) => void;
  setEditDataSchemaHandler: (index: number) => void;
  saveEditDataSchemaHandler: (
    index: number | null,
    saveRule: DataSchemaF,
  ) => void;
  cancelUpdate: (index: number) => void;
  handleDeleteNestedField: (index: number, nestedFieldIndex: number) => void;
  editIndex: number | null;
}

const DataSchemaList = ({
  index,
  dataSchemaCard,
  openAddSchemaModal,
  removeDataSchemaHandler,
  setEditDataSchemaHandler,
  saveEditDataSchemaHandler,
  cancelUpdate,
  handleDeleteNestedField,
  editIndex,
}: AgentRulesListProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: dataSchemaCard.id });
  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const [editNestedIndex, setEditNestedIndex] = useState<number | null>(null);
  const [isNestedFormOpen, setIsNestedFormOpen] = useState(false);
  const [localError, setLocalError] = useState("");

  const dataSchemaUpdateForm = useForm<DataSchemaModalType>({
    resolver: zodResolver(dataSchemaModal),
    defaultValues: {
      fieldName: dataSchemaCard.fieldName,
      fieldDescription: dataSchemaCard.fieldDescription,
      dataType: dataSchemaCard.dataType,
      keywords: dataSchemaCard.keywords,
    },
    mode: "onChange",
  });

  useEffect(() => {
    dataSchemaUpdateForm.reset({
      fieldName: dataSchemaCard.fieldName,
      fieldDescription: dataSchemaCard.fieldDescription,
      dataType: dataSchemaCard.dataType,
      keywords: dataSchemaCard.keywords,
      nestedFields: dataSchemaCard.nestedFields || [],
    });

    // Close nested form if parent edit is cancelled
    if (editIndex !== index) {
      setIsNestedFormOpen(false);
      setEditNestedIndex(null);
      setLocalError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editIndex, dataSchemaCard]);

  //for edite nested fields
  const selectedDataType = useWatch({
    control: dataSchemaUpdateForm.control,
    name: "dataType",
  });

  const nestedFields: NestedField[] =
    useWatch({
      control: dataSchemaUpdateForm.control,
      name: "nestedFields",
    }) || [];

  const nestedFieldForm = useForm<NestedFieldSchemaType>({
    resolver: zodResolver(nestedFieldSchema),
    defaultValues: {
      fieldName: "",
      dataType: "",
      fieldDescription: "",
    },
    mode: "onChange",
  });
  const SaveUpdate = (index: number | null) => {
    if (localError && localError.trim() !== "") {
      return;
    }
    const formData = dataSchemaUpdateForm.getValues();
    const finalValues = {
      ...formData,
      nestedFields:
        formData.dataType === "object" || formData.dataType === "list[object]"
          ? formData.nestedFields || []
          : [],
    };

    const parsed = dataSchemaModal.safeParse(finalValues);
    if (!parsed.success) {
      parsed.error.errors.forEach((err) => {
        dataSchemaUpdateForm.setError(err.path[0] as any, {
          type: "manual",
          message: err.message,
        });
      });
      return;
    }

    saveEditDataSchemaHandler(index, {
      id: dataSchemaCard.id,
      ...finalValues,
    });

    // Reset form with latest saved values
    dataSchemaUpdateForm.reset(finalValues);
  };

  const handleAddNestedFieldClick = () => {
    nestedFieldForm.reset({
      fieldName: "",
      dataType: "",
      fieldDescription: "",
    });
    setEditNestedIndex(null);
    setIsNestedFormOpen(true);
  };

  const handleEditNestedFieldClick = (nestedIndex: number) => {
    const nestedField = nestedFields[nestedIndex];
    nestedFieldForm.reset({
      fieldName: nestedField?.fieldName,
      dataType: nestedField?.dataType,
      fieldDescription: nestedField?.fieldDescription,
    });
    setEditNestedIndex(nestedIndex);
    setIsNestedFormOpen(true);
  };

  const handleCancelNestedField = () => {
    setIsNestedFormOpen(false);
    setEditNestedIndex(null);
    nestedFieldForm.reset();
  };
  const onNestedSubmit = (data: NestedFieldSchemaType) => {
    // Always read the current nested fields from the form, not from props
    const currentNestedFields =
      dataSchemaUpdateForm.getValues("nestedFields") || [];
    let updatedNestedFields;

    if (editNestedIndex !== null) {
      // Edit existing
      updatedNestedFields = [...currentNestedFields];
      updatedNestedFields[editNestedIndex] = data;
    } else {
      // Add new
      updatedNestedFields = [...currentNestedFields, data];
    }

    dataSchemaUpdateForm.setValue("nestedFields", updatedNestedFields, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setIsNestedFormOpen(false);
    setEditNestedIndex(null);
    nestedFieldForm.reset();
  };

  const handleDeleteNestedFieldLocal = (nestedIndex: number) => {
    const currentNestedFields =
      dataSchemaUpdateForm.getValues("nestedFields") || [];
    const updatedNestedFields = currentNestedFields.filter(
      (_, i) => i !== nestedIndex,
    );
    dataSchemaUpdateForm.setValue("nestedFields", updatedNestedFields, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onNestedDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentNested = dataSchemaUpdateForm.getValues("nestedFields") || [];
    const oldIndex = currentNested.findIndex(
      (_: any, i: number) => `${currentNested[i].fieldName}-${i}` === active.id,
    );
    const newIndex = currentNested.findIndex(
      (_: any, i: number) => `${currentNested[i].fieldName}-${i}` === over.id,
    );

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(currentNested, oldIndex, newIndex);
    dataSchemaUpdateForm.setValue("nestedFields", reordered, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (selectedDataType !== "object" && selectedDataType !== "list[object]") {
      dataSchemaUpdateForm.clearErrors("nestedFields");
    }
  }, [selectedDataType, dataSchemaUpdateForm]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 group border rounded-lg ${
        index === editIndex ? "bg-muted/30" : "bg-white "
      }`}
    >
      <CardContent className="px-4 py-4">
        {index !== editIndex ? (
          <ViewDataSchema
            dataSchemaCard={dataSchemaCard}
            index={index}
            openAddSchemaModal={openAddSchemaModal}
            removeDataSchemaHandler={removeDataSchemaHandler}
            setEditDataSchemaHandler={setEditDataSchemaHandler}
            attributes={attributes}
            listeners={listeners}
            editIndex={editIndex}
          />
        ) : (
          <EditDataSchema
            index={index}
            dataSchemaUpdateForm={dataSchemaUpdateForm}
            nestedFieldForm={nestedFieldForm}
            selectedDataType={selectedDataType}
            nestedFields={nestedFields}
            isNestedFormOpen={isNestedFormOpen}
            editNestedIndex={editNestedIndex}
            localError={localError}
            setLocalError={setLocalError}
            onNestedDragEnd={onNestedDragEnd}
            onNestedSubmit={onNestedSubmit}
            handleAddNestedFieldClick={handleAddNestedFieldClick}
            handleCancelNestedField={handleCancelNestedField}
            handleEditNestedFieldClick={handleEditNestedFieldClick}
            handleDeleteNestedFieldLocal={handleDeleteNestedFieldLocal}
            cancelUpdate={cancelUpdate}
            SaveUpdate={SaveUpdate}
          />
        )}
      </CardContent>
    </div>
  );
};

export default DataSchemaList;
