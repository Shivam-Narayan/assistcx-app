import { TaskLoader } from "./task-loader";

export const TaskFallback = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full md:max-w-screen-md md:mx-auto pt-20 md:pt-12 pb-4 px-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 w-36 bg-gray-300 animate-pulse rounded-md" />
          <div className="h-8 w-24 bg-gray-300 animate-pulse rounded-md" />
        </div>
        <div className="h-10 w-full bg-gray-300 animate-pulse rounded-md mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <TaskLoader key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
