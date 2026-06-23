import HeaderHoverCard from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { PlusCircleIcon, Tag } from "lucide-react";
import { ClassLabelForm } from "./class-group-form";
import { DataFieldInfo } from "./dynamic-field-render-components";
import { EmptyState } from "@/components/empty-state/empty-state";

interface Props {
  userEvents: string;
  dataFields: any[];
  showClassLabelForm: boolean;
  setShowClassLabelForm: (val: boolean) => void;
  removeDataField: (index: number) => void;
  classLabelForm: any;
  onSubmitClassLabel: any;
  editDataField: (index: number) => void;
  moveDataField: (oldIndex: number, newIndex: number) => void;
  editingIndex: number | null;
  setEditingIndex: (index: number | null) => void;
  isAdding: boolean;
  setIsAdding: (val: boolean) => void;
}

export default function ClassLabelCard({
  userEvents,
  dataFields,
  showClassLabelForm,
  setShowClassLabelForm,
  removeDataField,
  classLabelForm,
  onSubmitClassLabel,
  editDataField,
  moveDataField,
  editingIndex,
  setEditingIndex,
  isAdding,
  setIsAdding,
}: Props) {
  const showAddButton =
    userEvents !== "viewClassGroup" &&
    showClassLabelForm == false &&
    dataFields.length !== 0;

  return (
    <Card className="shadow-none p-0 gap-0 mt-0 overflow-hidden">
      <CardHeader
        className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0 text-xl font-semibold 
           leading-none tracking-tight"
      >
        <HeaderHoverCard
          title="Class Label"
          message="A class label is the target category a AI model is trained to predict"
          type="card"
          isRequired={true}
        />
      </CardHeader>

      {dataFields.length != 0 && (
        <DataFieldInfo
          dataFields={dataFields}
          userEvents={userEvents}
          removeDataField={removeDataField}
          editDataField={editDataField}
          moveDataField={moveDataField}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
          showClassLabelForm={showClassLabelForm}
          setShowClassLabelForm={setShowClassLabelForm}
          classLabelForm={classLabelForm}
          onSubmitClassLabel={onSubmitClassLabel}
          setIsAdding={setIsAdding}
        />
      )}

      {dataFields.length === 0 && !showClassLabelForm && (
        <CardContent className="p-4">
          <EmptyState
            variant="card"
            compact
            icon={<Tag />}
            title="No Class Labels Added"
            description="Add labels to define and organize categories within this class group."
            action={
              <Button
                className="cursor-pointer"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingIndex(null);
                  setIsAdding(true);
                  classLabelForm.reset({
                    class_name: "",
                    class_description: "",
                  });
                  setShowClassLabelForm(true);
                }}
              >
                <PlusCircleIcon className="h-4 w-4" /> Add New Class Label
              </Button>
            }
          />
        </CardContent>
      )}

      {isAdding && showClassLabelForm && editingIndex === null && (
        <CardContent className="p-0">
          <div className="p-4 ">
            <ClassLabelForm
              classLabelForm={classLabelForm}
              onSubmitClassLabel={onSubmitClassLabel}
              setShowClassLabelForm={setShowClassLabelForm}
              setEditingIndex={setEditingIndex}
              setIsAdding={setIsAdding}
            />
          </div>
        </CardContent>
      )}
      {showAddButton && (
        <CardFooter className="flex items-center justify-center px-4 py-3 bg-accent gap-2">
          <div
            className="flex justify-center items-center cursor-pointer font-medium hover:underline"
            onClick={() => {
              setEditingIndex(null);
              setIsAdding(true);
              classLabelForm.reset({
                class_name: "",
                class_description: "",
              });
              setShowClassLabelForm(true);
            }}
          >
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            <span>Add New Class Label</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
