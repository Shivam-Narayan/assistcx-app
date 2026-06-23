import { CollapsibleContent as ExpandableContent } from "@/components/collapsible-content";
import { SmartContentViewer } from "@/components/smart-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLabel, UTCToLocalTimezon } from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { ITaskActivity } from "@/types/types";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";

interface TaskExecutionHistoryProps {
  taskId: string;
}

export const TaskExecutionHistory: React.FC<TaskExecutionHistoryProps> = ({
  taskId,
}) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [history, setHistory] = useState<ITaskActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!loading && taskId) {
        try {
          setIsLoading(true);
          const response = await axiosAuth.get(
            `/entities/${taskId}/activity-logs`,
          );
          if (response?.status === 200 && response.data) {
            setHistory(response.data);
            setIsLoading(false);
          }
        } catch (error) {
          setIsLoading(false);
          console.error("Error fetching activity logs:", error);
        }
      }
    };

    fetchActivityLogs();
  }, [taskId, loading, axiosAuth]);

  const onPrev = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, history.length - 1));
  };

  const onNext = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (isLoading || !history || history?.length === 0) {
    return;
  }
  const item = history[currentIndex];

  return (
    <Card className="p-0 gap-0 border shadow-xs rounded-md bg-white dark:bg-slate-800 divide-y-1">
      <CardHeader className="bg-slate-100 dark:bg-slate-700/50 px-4 py-3 rounded-t-md gap-0">
        <div className="flex items-center space-x-2 justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            <CardTitle className="text-base xl:text-lg text-gray-800 dark:text-slate-200">
              Activity Log
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 ">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={currentIndex >= history.length - 1}
              className="h-8 bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden xl:inline">Previous</span>
            </Button>
            <span className="text-sm text-muted-foreground">
              {history.length - currentIndex} / {history.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={currentIndex <= 0}
              className="h-8 bg-white"
            >
              <span className="hidden xl:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-5 text-gray-700 dark:text-slate-300">
        {/* Task Name */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              Name Of Activity
            </p>
          </div>
          <h3 className="text-base xl:text-lg font-semibold text-gray-800 dark:text-slate-100">
            {formatLabel(item?.activity_type)}
          </h3>
        </div>

        {/* Date, Time and User Info */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-4 pb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              User Name
            </p>
            <div className="text-sm font-medium flex items-center gap-2">
              {/* <CalendarDays className="h-4 w-4 text-muted-foreground" /> */}
              <span className="text-sm">
                {item?.user_name || (
                  <span className="text-base font-medium">N/A</span>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              Date & Time
            </p>
            <div className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{UTCToLocalTimezon(item?.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Status Change */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground dark:text-slate-400">
              Change Status
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                  item?.previous_state?.status
                )}`}
              >
                {item?.previous_state?.status || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant="outline"
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                  item?.new_state?.status
                )}`}
              >
                {item?.new_state?.status || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </Badge>
            </div>
          </div>
        </div> */}

        {/* Comments */}
        <div>
          <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">
            Comments
          </p>
          {item?.note ? (
            <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-md border text-sm break-words">
              <ExpandableContent
                className="prose prose-sm dark:prose-invert max-w-none reset-prose"
                maxHeight={50}
                gradientStart="from-slate-50"
              >
                <SmartContentViewer content={item?.note} />
              </ExpandableContent>
            </div>
          ) : (
            <span className="text-base font-medium">N/A</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
