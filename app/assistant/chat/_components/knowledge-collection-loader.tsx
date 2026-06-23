import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const KnowledgeCollectionLoader = ({
  length = 5,
}: {
  length?: number;
}) => {
  const loadingItems = Array.from({ length: length }, (_, index) => ({
    id: `loader-${index}-${Date.now()}`,
    index,
  }));

  return (
    <div className="space-y-2">
      {loadingItems.map(({ id }) => (
        <Card
          key={id}
          tabIndex={-1}
          className={cn(
            "relative flex flex-row items-start justify-between p-4 mx-2 cursor-default animate-pulse",
          )}
        >
          <div className="flex flex-row items-start gap-3 w-full relative">
            <div className="px-1 flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full border border-gray-300" />
            </div>

            <div className="flex flex-col space-y-2 flex-1">
              <div className="h-4 w-40 bg-gray-300 rounded" />
              <div className="h-2 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded mt-1" />
              <div className="flex space-y-2 flex-1 gap-2">
                <div className="h-3 w-20 bg-gray-300 rounded" />
                <div className="h-3 w-20 bg-gray-300 rounded" />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="w-4 h-4 bg-gray-300 rounded border border-gray-300" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
