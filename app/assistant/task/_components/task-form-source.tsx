import { KnowledgeCollectionMenu } from "@/components/assistant/knowledge-collection-menu";
import { cn } from "@/lib/utils";
import { BookOpen, Globe, X } from "lucide-react";
import { TaskFormSourceProps } from "./types";

export function TaskFormSource({
  isWebSearchMode,
  isKnowledgeMode,
  selectedCollections,
  onWebSearchToggle,
  onSelectionChange,
  onClearAll,
}: TaskFormSourceProps) {
  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-medium">Source</h2>
      <div className="flex items-center gap-2">
        <div
          onClick={onWebSearchToggle}
          className={cn(
            "flex items-center gap-2 whitespace-nowrap rounded-lg text-sm px-3 h-9 border cursor-pointer transition-colors",
            isWebSearchMode
              ? "bg-primary/10 text-primary border-primary/20"
              : "text-muted-foreground border-border hover:bg-muted/50",
          )}
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span>Web Search</span>
        </div>

        <div className="relative flex items-center">
          <KnowledgeCollectionMenu
            selected={selectedCollections}
            onSelectionChange={onSelectionChange as any}
            onClearAll={onClearAll}
            maxSelection={1}
            trigger={
              <div
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-lg text-sm h-9 border cursor-pointer transition-colors",
                  isKnowledgeMode ? "pl-3 pr-2" : "px-3",
                  isKnowledgeMode
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-muted-foreground border-border hover:bg-muted/50",
                )}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>Knowledge</span>
                {isKnowledgeMode && (
                  <>
                    <span className="w-px h-4 bg-primary/20" />
                    <span className="flex items-center gap-1.5 bg-background rounded-md px-2 py-0.5 text-xs font-medium border border-primary/20 pr-6">
                      {selectedCollections![0].name}
                    </span>
                  </>
                )}
              </div>
            }
          />
          {isKnowledgeMode && (
            <span
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClearAll();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-primary hover:text-red-500 transition-colors cursor-pointer z-10"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
