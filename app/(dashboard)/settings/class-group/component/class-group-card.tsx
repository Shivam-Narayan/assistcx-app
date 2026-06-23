import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassGroupForm } from "./class-group-form";
import { ViewClassGroupInfo } from "./dynamic-field-render-components";

interface Props {
  userEvents: string;
  mainForm: any;
  handleClassGroupField: any;
  ClassGroupInfo: any[];
}

export default function ClassGroupCard({
  userEvents,
  mainForm,
  handleClassGroupField,
  ClassGroupInfo,
}: Props) {
  return (
    <Card className="shadow-none p-0 gap-0 mt-1">
      <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle
          className="flex gap-3 items-center text-lg font-medium
           leading-none tracking-tight"
        >
          <span>Class Group Info</span>
        </CardTitle>
      </CardHeader>
      {(userEvents === "addClassGroup" || userEvents === "editClassGroup") && (
        <CardContent className="p-0 pb-2 flex flex-col ">
          <div className="p-4">
            <ClassGroupForm
              mainForm={mainForm}
              handleClassGroupField={handleClassGroupField}
            />
          </div>
        </CardContent>
      )}

      {userEvents === "viewClassGroup" && (
        <ViewClassGroupInfo ClassGroupInfo={ClassGroupInfo} />
      )}
    </Card>
  );
}
