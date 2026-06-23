import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { Move, X } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";

interface SortableInstructionItemProps {
  instruction: string;
  index: number;
  id: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onBlur: (value: string) => void;
}

export const SortableInstructionItem: React.FC<
  SortableInstructionItemProps
> = ({ instruction, index, id, onChange, onRemove, onBlur }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group bg-white">
      <AutoGrowingTextarea
        id={`instruction-${id}`}
        name={`instruction-${id}`}
        value={instruction}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur(e.target.value.trim())}
        placeholder="Enter instruction..."
        maxLength={2000}
        autoFocus={false}
        maxHeight={280}
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background border rounded-md shadow-xs flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="px-1 h-6 w-6 cursor-pointer"
        >
          <X className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          {...attributes}
          {...listeners}
          className="px-1 h-6 w-6 cursor-move"
        >
          <Move strokeWidth={1.5} size={16} />
        </Button>
      </div>
    </div>
  );
};
