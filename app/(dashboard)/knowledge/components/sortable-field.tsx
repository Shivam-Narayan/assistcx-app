import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { capitalize } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Move, PencilIcon, XCircle } from "lucide-react";

interface SortableFieldProps {
  field: {
    name: string;
    description: string;
    keywords: string[];
    data_type: string;
  };
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const SortableField: React.FC<SortableFieldProps> = ({
  field,
  index,
  onEdit,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.name });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      key={`display-smart-${index}`}
      className="group py-4 px-4 my-4 border rounded-lg bg-white"
    >
      <div className="relative">
        <div className="flex flex-wrap gap-2 item-center max-w-[75%] xl:max-w-full ">
          <div className="text-sm px-3 py-1 break-words border rounded-md font-semibold">
            {field.name
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </div>

          {field.data_type && (
            <Badge variant="secondary" className="text-sm w-fit break-words">
              <span className="truncate">{capitalize(field.data_type)}</span>
            </Badge>
          )}
        </div>
        <div className="absolute top-0 xl:top-1/2 right-0 xl:-translate-y-1/2 flex items-center gap-1 bg-background border rounded-md shadow-xs xl:opacity-0 xl:group-hover:opacity-100 xl:transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(index)}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Delete field"
          >
            <XCircle strokeWidth={1.5} size={20} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(index)}
            className="h-8 w-8 p-0 hover:bg-muted cursor-pointer"
            title="Edit field"
          >
            <PencilIcon strokeWidth={1.5} size={20} />
          </Button>
          <Button
            {...attributes}
            {...listeners}
            variant={"ghost"}
            className="p-2 cursor-move touch-none"
            style={{ touchAction: "none" }}
          >
            <Move strokeWidth={1.5} size={20} />
          </Button>
        </div>
      </div>

      <div className="pl-1 mt-2 mb-2">
        <p className="text-sm break-all w-full">{field.description}</p>
      </div>

      {field.keywords?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium">Keywords:</span>
          {field.keywords
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
    </div>
  );
};

export default SortableField;
