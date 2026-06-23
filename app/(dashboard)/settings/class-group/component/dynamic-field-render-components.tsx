import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect } from "react";
import { ClassLabelForm } from "./class-group-form";
import { SortableDataField } from "./sortable-class-lable";

interface IDataRow {
  label?: string;
  value?: string;
}
interface ClassGroupProps {
  ClassGroupInfo: IDataRow[];
}

interface DataFieldProps {
  dataFields: {
    class_name: string;
    class_description: string;
  }[];
  userEvents: string;
  removeDataField: (idx: number) => void;
  editDataField: (idx: number) => void;
  moveDataField: (oldIndex: number, newIndex: number) => void;
  setEditingIndex: (idx: number | null) => void;
  setShowClassLabelForm: (val: boolean) => void;
  editingIndex: number | null;
  showClassLabelForm: boolean;
  classLabelForm: any;
  onSubmitClassLabel: any;
  setIsAdding: (val: boolean) => void;
}
export const ViewClassGroupInfo = ({ ClassGroupInfo }: ClassGroupProps) => {
  return (
    <CardContent className="p-0 py-2 flex flex-col divide-y divide-dashed overflow-wrap-anywhere">
      {ClassGroupInfo.map((row, index) => (
        <div key={index} className="flex flex-row px-4 py-2.5">
          <div className="w-1/4 pr-4 font-semibold">
            <Badge variant="secondary" className="text-sm">
              {row.label}
            </Badge>
          </div>
          <div className="w-3/4 flex gap-4 text-sm">{row?.value}</div>
        </div>
      ))}
    </CardContent>
  );
};

export const DataFieldInfo = ({
  dataFields,
  userEvents,
  removeDataField,
  editDataField,
  moveDataField,
  setEditingIndex,
  setShowClassLabelForm,
  showClassLabelForm,
  editingIndex,
  classLabelForm,
  onSubmitClassLabel,
  setIsAdding,
}: DataFieldProps) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = dataFields.findIndex((f) => f.class_name === active.id);
      const newIndex = dataFields.findIndex((f) => f.class_name === over.id);

      moveDataField(oldIndex, newIndex);
    }
  };

  useEffect(() => {
    if (editingIndex !== null && dataFields[editingIndex]) {
      classLabelForm.reset({
        class_name: dataFields[editingIndex].class_name,
        class_description: dataFields[editingIndex].class_description,
      });
    }
  }, [editingIndex, dataFields, classLabelForm]);

  return (
    <CardContent className="flex grow flex-col gap-4 px-4 py-4">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={dataFields.map((f) => f.class_name)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {dataFields.map((field, idx) => (
              <div key={field.class_name}>
                {editingIndex !== idx && (
                  <SortableDataField
                    key={field.class_name}
                    field={field}
                    index={idx}
                    onEdit={() => {
                      setEditingIndex(idx);
                      setShowClassLabelForm(true);
                      setIsAdding(false);
                    }}
                    onDelete={removeDataField}
                    userEvents={userEvents}
                  />
                )}

                {editingIndex === idx && showClassLabelForm && (
                  <ClassLabelForm
                    classLabelForm={classLabelForm}
                    onSubmitClassLabel={onSubmitClassLabel}
                    setShowClassLabelForm={setShowClassLabelForm}
                    setEditingIndex={setEditingIndex}
                    setIsAdding={setIsAdding}
                  />
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </CardContent>
  );
};
