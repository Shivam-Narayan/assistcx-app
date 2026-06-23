import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const TaskLoader = () => {
  // Create an array of 5 items for the loading state with unique IDs

  return (
    <div className="space-y-2">
      <Card
        tabIndex={-1}
        className={cn(
          "relative flex flex-row items-start justify-between shadow-xs px-4 py-3 mx-2 cursor-default animate-pulse"
        )}
      >
        <div className="flex flex-row items-center gap-3 w-full relative">
          <div className="flex flex-col space-y-2 flex-1">
            <div className="h-4 w-40 bg-gray-300 rounded" />
            <div className="h-3 w-40 bg-gray-300 rounded" />
            <Separator className="my-2" />
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="h-3 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
