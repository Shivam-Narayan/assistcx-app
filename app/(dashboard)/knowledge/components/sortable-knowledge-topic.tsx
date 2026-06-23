import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Move, PencilIcon, XCircle } from "lucide-react";

interface SortableKnowledgeTopicProps {
  field: {
    name: string;
    description: string;
    keywords: string[];
  };
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const SortableKnowledgeTopic: React.FC<SortableKnowledgeTopicProps> = ({
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
      key={`display-knowledge-${index}`}
      className="group py-4 px-4 my-4 border rounded-lg bg-white"
    >
      <div className="relative">
        <div className="flex flex-wrap gap-2 item-center max-w-[75%] xl:max-w-full ">
          <div className="text-sm px-3 py-1 break-words border rounded-md font-semibold">
            {field.name
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </div>
        </div>
        <div className="absolute top-0 xl:top-1/2 right-0 xl:-translate-y-1/2 flex items-center gap-1 bg-background border rounded-md shadow-xs xl:opacity-0 xl:group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(index)}
            className="h-8 w-8 p-0 cursor-pointer"
            title="Delete topic"
          >
            <XCircle strokeWidth={1.5} size={20} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(index)}
            className="h-8 w-8 p-0 hover:bg-muted cursor-pointer"
            title="Edit topic"
          >
            <PencilIcon strokeWidth={1.5} size={20} />
          </Button>
          <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            className="h-8 w-8 p-0 cursor-move touch-none"
            style={{ touchAction: "none" }}
            title="Drag to reorder"
          >
            <Move strokeWidth={1.5} size={20} />
          </Button>
        </div>
      </div>

      <div className="pl-1 mt-2 mb-2">
        <p className="text-sm break-words whitespace-normal w-full">
          {field.description}
        </p>
      </div>

      {field.keywords && field.keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {field.keywords.filter(
            (keyword: string) => keyword && keyword.trim() !== "",
          ).length > 0 && (
            <>
              <span className="text-sm font-medium">Keywords:</span>
              {field.keywords
                .filter((keyword: string) => keyword && keyword.trim() !== "")
                .map((keyword: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs font-medium w-fit border border-gray-400"
                  >
                    {keyword.trim().toLowerCase()}
                  </Badge>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SortableKnowledgeTopic;
