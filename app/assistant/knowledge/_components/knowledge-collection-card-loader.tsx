import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const KnowledgeCollectionCardLoader = () => {
  // Create an array of 5 items for the loading state with unique IDs
  const loadingItems = Array.from({ length: 5 }, (_, index) => ({
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
            "shadow-xs relative flex flex-col md:flex-row items-start justify-between p-4 mx-2 cursor-default animate-pulse"
          )}
        >
          <div className="flex flex-row items-center gap-3 w-full relative">
            <div className="flex flex-row items-center gap-2 w-full relative">
              <div className="px-1 flex self-start justify-center ">
                <div className="w-6 h-6 bg-gray-300 rounded border border-gray-300" />
              </div>
              <div className="flex flex-col space-y-2 flex-1">
                <div className="h-4 w-40 bg-gray-300 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
                <div className="flex gap-x-2 self-start flex-col sm:flex-row  mt-4 w-full gap-y-2 sm:gap-y-0">
                  <div className="flex flex-row items-center gap-2">
                    <div className="w-16 md:w-24 h-3 bg-card-foreground/20 rounded dark:bg-card-foreground/10" />
                    <div className="w-16 md:w-24 h-3 bg-card-foreground/20 rounded dark:bg-card-foreground/10" />
                  </div>
                  <div className="flex-col space-y-2 self-start md:flex sm:ml-auto">
                    <div className="w-24 md:w-24 h-3 bg-gray-300 rounded border border-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
