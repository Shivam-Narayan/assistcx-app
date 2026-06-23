import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

export const TaskHistoryLoader = () => {
  // Create an array of 5 items for the loading state with unique IDs

  return (
    <div className="space-y-2 w-full h-full">
      <div
        tabIndex={-1}
        className={cn(
          "relative flex flex-row items-start justify-between shadow-xs p-4 mx-2 cursor-default animate-pulse"
        )}
      >
        <div className="flex flex-row items-center gap-3 w-full relative">
          <div className="flex flex-col space-y-2 flex-1">
            <div className="h-4 w-40 bg-gray-300 rounded" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
          <div className="px-1 flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded border border-gray-300" />
            <div className="w-8 h-8 bg-gray-300 rounded border border-gray-300" />
            <div className="w-8 h-8 bg-gray-300 rounded border border-gray-300" />
            <div className="w-8 h-8 bg-gray-300 rounded border border-gray-300" />
          </div>
        </div>
      </div>
      <div className="p-4 h-full w-full  rounded-b-lg scrollbar-gutter-stable ">
        <Loader
          variant="dots"
          className="w-full h-full justify-center items-center"
        />
      </div>
    </div>
  );
};
