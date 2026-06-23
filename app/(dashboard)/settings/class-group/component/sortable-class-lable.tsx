import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Move, Pencil, Trash2 } from "lucide-react";

interface SortableDataFieldProps {
  key: string;
  field: { class_name: string; class_description: string };
  index: number;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
  userEvents: string;
}

export const SortableDataField: React.FC<SortableDataFieldProps> = ({
  field,
  index,
  onEdit,
  onDelete,
  userEvents,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.class_name });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative border p-3 rounded-md group flex flex-col gap-2 group transition-all bg-white"
    >
      <div>
        <div className="font-semibold text-sm">{field.class_name}</div>
        <div className="text-sm text-muted-foreground">
          {field.class_description}
        </div>
      </div>

      {userEvents !== "viewClassGroup" && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background border rounded-md px-1 py-0.5 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(index)}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Delete"
          >
            <Trash2 strokeWidth={1.5} size={18} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(index)}
            className="h-8 w-8 p-0 hover:bg-muted cursor-pointer"
            title="Edit"
          >
            <Pencil width={18} height={18} />
          </Button>

          <Button
            {...attributes}
            {...listeners}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 cursor-move"
            title="Move"
          >
            <Move strokeWidth={1.5} size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};
