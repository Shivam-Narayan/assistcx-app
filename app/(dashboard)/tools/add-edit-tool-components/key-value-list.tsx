import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { EmptyState } from "@/components/empty-state/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, Sparkles, SquarePen, Trash2 } from "lucide-react";

const LIST_HEADERS = [
  { label: "Key", className: "flex-1 min-w-0" },
  { label: "Value", className: "flex-1 min-w-0" },
  { label: "Actions", className: "shrink-0", hideOnView: true },
];

interface KeyValueListProps {
  title: string;
  items: any[];
  userEvents: string;
  onAdd: () => void;
  onEdit: (item: any, index: number) => void;
  onDelete: (index: number) => void;
  showDynamicIcon?: boolean;
}

export function KeyValueList({
  title,
  items,
  userEvents,
  onAdd,
  onEdit,
  onDelete,
  showDynamicIcon = true,
}: KeyValueListProps) {
  return (
    <Card className="shadow-none p-0 gap-0">
      <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between">
        <CardTitle className="flex gap-3 text-lg font-medium  text-foreground/80">
          {title}
        </CardTitle>

        {userEvents !== "viewTool" && (
          <Button
            className="cursor-pointer"
            size="sm"
            type="button"
            variant="outline"
            onClick={onAdd}
          >
            Add New
          </Button>
        )}
      </CardHeader>

      <CardContent className="px-4 py-4 pb-2">
        <div className="space-y-2 pb-4">
          {items.length > 0 ? (
            <>
              <div className="flex items-center gap-2 px-2">
                {LIST_HEADERS.filter(
                  (header) => !(header.hideOnView && userEvents === "viewTool"),
                ).map((header) => (
                  <div
                    key={header.label}
                    className={`${header.className} px-3 py-1`}
                  >
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {header.label}
                    </div>
                  </div>
                ))}
              </div>
              {items.map((row, index) => {
                const isDynamic =
                  showDynamicIcon &&
                  row.value?.includes("{") &&
                  row.value?.includes("}");

                return (
                  <div
                    key={title + index}
                    className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0 px-3 py-2 bg-muted rounded-md">
                      <div className="text-sm font-medium truncate">
                        {row.your_key}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 px-3 py-2 bg-muted rounded-md flex items-center justify-between gap-2">
                      {isDynamic ? (
                        <Badge
                          variant="outline"
                          className="truncate text-primary border-primary"
                        >
                          {row.value}
                        </Badge>
                      ) : (
                        <div className="text-sm truncate flex-1 text-foreground">
                          {row.value}
                        </div>
                      )}

                      {isDynamic && (
                        <ConditionalTooltip
                          content="Dynamic field"
                          alwaysShow={true}
                          align="center"
                          showArrow={true}
                        >
                          <div className="bg-primary rounded-md p-1 shrink-0 cursor-help">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                        </ConditionalTooltip>
                      )}
                    </div>
                    {userEvents !== "viewTool" && (
                      <div className="flex items-center gap-1 shrink-0">
                        <ConditionalTooltip
                          content="Edit"
                          alwaysShow={true}
                          align="center"
                          showArrow={true}
                        >
                          <button
                            onClick={() => onEdit(row, index)}
                            className="p-1.5 rounded-md hover:bg-secondary cursor-pointer"
                            type="button"
                          >
                            <SquarePen className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </ConditionalTooltip>

                        <ConditionalTooltip
                          content="Delete"
                          alwaysShow={true}
                          align="center"
                          showArrow={true}
                        >
                          <button
                            onClick={() => onDelete(index)}
                            className="p-1.5 rounded-md hover:bg-secondary cursor-pointer"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </ConditionalTooltip>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <EmptyState
              variant="card"
              compact
              icon={<FileCode />}
              title={`No ${title.toLowerCase()} added`}
              description={`Define parameters as required by the external API to control request behavior and authentication.`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
