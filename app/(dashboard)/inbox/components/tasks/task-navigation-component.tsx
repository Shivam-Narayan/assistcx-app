import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface TaskNavigationProps {
  taskExecutionDetails: any[];
  taskDetails: any;
  isTaskListLoading: boolean;
}

const TaskNavigationComponent: React.FC<TaskNavigationProps> = ({
  taskExecutionDetails,
  taskDetails,
  isTaskListLoading,
}) => {
  const router = useRouter();

  const getTaskPositionText = () => {
    if (
      !taskExecutionDetails ||
      taskExecutionDetails.length === 0 ||
      !taskDetails
    ) {
      return "Task - of -";
    }

    const totalTasks = taskExecutionDetails.length;
    const currentIndex = taskExecutionDetails.findIndex(
      (task: any) => task.id === taskDetails.id,
    );

    if (currentIndex === -1) {
      return `Task - of ${totalTasks}`;
    }

    return `Task ${currentIndex + 1} of ${totalTasks}`;
  };

  const handleTaskNavigation = (direction: "prev" | "next") => {
    if (
      !taskExecutionDetails ||
      taskExecutionDetails.length === 0 ||
      !taskDetails
    ) {
      return;
    }

    const currentIndex = taskExecutionDetails.findIndex(
      (task: any) => task.id === taskDetails.id,
    );

    if (currentIndex === -1) return;

    let newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= taskExecutionDetails.length) {
      return; // out of bounds
    }

    const newTaskId = taskExecutionDetails[newIndex].id;
    router.push(`/inbox/tasks/${newTaskId}`);
  };

  return (
    <>
      <div
        className={`inline-flex xl:flex items-center rounded-md overflow-hidden shadow-xs transition-colors border`}
      >
        <Button
          variant="ghost"
          size="icon"
          disabled={
            isTaskListLoading ||
            !taskExecutionDetails?.length ||
            !taskDetails ||
            taskExecutionDetails.findIndex(
              (t: any) => t.id === taskDetails?.id,
            ) === 0
          }
          onClick={() => handleTaskNavigation("prev")}
          className={`h-8 w-8 rounded-none 
            disabled:opacity-50 
            disabled:pointer-events-auto 
            disabled:cursor-not-allowed 
            disabled:hover:bg-transparent 
            disabled:hover:text-inherit cursor-pointer transition-colors border-r `}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="px-3 text-sm font-medium text-foreground min-w-8 text-center">
          {getTaskPositionText()}
        </span>

        <Button
          variant="ghost"
          size="icon"
          disabled={
            isTaskListLoading ||
            !taskExecutionDetails?.length ||
            !taskDetails ||
            taskExecutionDetails.findIndex(
              (t: any) => t.id === taskDetails?.id,
            ) ===
              taskExecutionDetails.length - 1
          }
          onClick={() => handleTaskNavigation("next")}
          className={`h-8 w-8 rounded-none 
            disabled:opacity-50 
            disabled:pointer-events-auto 
            disabled:cursor-not-allowed 
            disabled:hover:bg-transparent 
            disabled:hover:text-inherit cursor-pointer transition-colors border-l  `}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default TaskNavigationComponent;
