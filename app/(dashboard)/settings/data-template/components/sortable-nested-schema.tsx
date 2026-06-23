import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { Move, PencilIcon, Trash2 } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";

export const SortableNestedSchema = ({
  id,
  row,
  nestedIndex,
  handleDeleteNestedFieldLocal,
  handleEditNestedFieldClick,
}: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative border p-3 rounded-md bg-muted group flex flex-col gap-2 group/card hover:shadow-sm transition-all"
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-2 font-semibold items-center">
          <Badge variant="outline">{row.fieldName}</Badge>
          <Badge variant="secondary">{row.dataType}</Badge>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {row.fieldDescription}
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1 bg-background border rounded-md px-1 py-0.5 shadow-xs opacity-0 group-hover/card:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-muted cursor-pointer"
          onClick={() => handleDeleteNestedFieldLocal(nestedIndex)}
        >
          <Trash2 strokeWidth={1.5} size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:bg-muted cursor-pointer"
          onClick={() => handleEditNestedFieldClick(nestedIndex)}
        >
          <PencilIcon width={18} height={18} />
        </Button>
        <Button
          {...attributes}
          {...listeners}
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-move hover:bg-muted"
        >
          <Move strokeWidth={1.5} size={18} />
        </Button>
      </div>
    </div>
  );
};
