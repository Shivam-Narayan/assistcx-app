import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Move, PencilIcon, Trash2 } from "lucide-react";
import { DataSchemaF } from "../data-schema-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
interface ViewDataSchemaProps {
  dataSchemaCard: DataSchemaF;
  openAddSchemaModal: boolean;
  editIndex: number | null;
  index: number;
  removeDataSchemaHandler: (index: number) => void;
  setEditDataSchemaHandler: (index: number) => void;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
}
const ViewDataSchema = ({
  dataSchemaCard,
  index,
  openAddSchemaModal,
  editIndex,
  removeDataSchemaHandler,
  setEditDataSchemaHandler,
  attributes,
  listeners,
}: ViewDataSchemaProps) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm font-semibold min-w-0 ">
            <ConditionalTooltip content={dataSchemaCard.fieldName}>
              <Badge
                variant="outline"
                className="text-sm inline-flex max-w-[460px] overflow-hidden"
              >
                <span className="truncate">{dataSchemaCard.fieldName}</span>
              </Badge>
            </ConditionalTooltip>
          </div>
          {dataSchemaCard.dataType && (
            <div className="flex items-center">
              <Badge variant="secondary" className="text-sm">
                {dataSchemaCard.dataType}
              </Badge>
            </div>
          )}
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 flex bg-background border rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
          <span
            className={`${
              openAddSchemaModal || editIndex !== null
                ? "cursor-not-allowed"
                : ""
            }`}
          >
            <Button
              className={`p-2 ${
                openAddSchemaModal || editIndex !== null
                  ? "pointer-events-none"
                  : "cursor-pointer"
              }`}
              variant={"ghost"}
              onClick={() => removeDataSchemaHandler(index)}
            >
              <Trash2 strokeWidth={1.5} size={20} />
            </Button>
          </span>
          <span
            className={`${
              openAddSchemaModal || editIndex !== null
                ? "cursor-not-allowed"
                : ""
            }`}
          >
            <Button
              className={`p-2 ${
                openAddSchemaModal || editIndex !== null
                  ? "pointer-events-none"
                  : "cursor-pointer"
              }`}
              variant={"ghost"}
              onClick={() => setEditDataSchemaHandler(index)}
            >
              <PencilIcon strokeWidth={1.5} size={20} />
            </Button>
          </span>
          <span
            className={`${
              openAddSchemaModal || editIndex !== null
                ? "cursor-not-allowed"
                : ""
            }`}
          >
            <Button
              {...attributes}
              {...listeners}
              variant={"ghost"}
              className={`p-2 cursor-move ${
                openAddSchemaModal || editIndex !== null
                  ? "pointer-events-none"
                  : "cursor-move"
              }`}
            >
              <Move strokeWidth={1.5} size={20} />
            </Button>
          </span>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm break-all whitespace-normal w-full">
          {dataSchemaCard.fieldDescription}
        </p>
      </div>
      {dataSchemaCard.keywords?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium">Keywords:</span>
          {dataSchemaCard.keywords
            .filter((keyword: any) => keyword?.trim() !== "")
            .map((keyword: any, idx: any) => (
              <Badge
                key={idx}
                variant="secondary"
                className="font-normal text-xs w-fit border border-gray-400"
              >
                {keyword.trim().toLowerCase()}
              </Badge>
            ))}
        </div>
      )}

      {Array.isArray(dataSchemaCard.nestedFields) &&
        dataSchemaCard.nestedFields.length > 0 && (
          <Card className="mt-4 border border-dashed p-0 gap-0">
            <CardHeader className="p-4 gap-0">
              <CardTitle className="text-md flex items-center gap-x-1">
                Nested Fields
                <span className="text-destructive text-lg">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col space-y-4 pt-0">
              {dataSchemaCard.nestedFields.map((row, index) => (
                <div
                  key={index}
                  className="border p-3 rounded-md bg-muted/50 space-y-2 relative"
                >
                  <div className="flex gap-2 font-semibold items-center">
                    <Badge variant="outline" className="text-xs">
                      {row.fieldName}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {row.dataType}
                    </Badge>
                  </div>
                  <div className="text-sm break-all whitespace-normal w-full">
                    {row.fieldDescription}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default ViewDataSchema;
