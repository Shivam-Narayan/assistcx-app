import { Card } from "@/components/ui/card";

export const KnowledgeDetailListLoader = () => {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card className="relative p-4 animate-pulse" key={index}>
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 flex-shrink-0 mt-1 bg-gray-200 rounded" />
            <div className="flex-1 min-w-0 space-y-3">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="flex items-center gap-1">
                  <div className="h-4 w-32 bg-gray-200 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
