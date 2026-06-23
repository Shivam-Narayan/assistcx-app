import { EmptyState } from "@/components/empty-state/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import {
  errorMessageHandler,
  formatLabel,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { ITaskActivity } from "@/types/types";
import { ActivityIcon, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface HistoryCardProps {
  taskId: string;
}

export const TaskActivityCard: React.FC<HistoryCardProps> = ({ taskId }) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [history, setHistory] = useState<ITaskActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const noteRef = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [toggleMap, setToggleMap] = useState<Record<string, boolean>>({});

  const fetchActivityLogs = async () => {
    try {
      setIsLoading(true);
      const response = await axiosAuth.get(`/entities/${taskId}/activity-logs`);
      if (response?.status === 200 && response.data) {
        setHistory(response.data);
      }
    } catch (error: any) {
      errorMessageHandler(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && taskId) {
      fetchActivityLogs();
    }
  }, [taskId, loading]);

  useEffect(() => {
    const newToggleMap: Record<string, boolean> = {};

    history?.forEach((historyItem) => {
      const noteElement = noteRef.current[historyItem.id];
      if (noteElement) {
        newToggleMap[historyItem.id] =
          noteElement.scrollHeight > noteElement.clientHeight;
      }
    });

    setToggleMap(newToggleMap);
  }, [history]);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Loading...
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <EmptyState
        variant="card"
        compact
        icon={<ActivityIcon />}
        title="No Activity Found"
        description="No activity found for this task."
      />
    );
  }

  return (
    <div className="space-y-3 relative">
      {history.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 items-start">
          {index > 0 && (
            <div
              className="absolute left-[7px] w-0.5 bg-gray-400 dark:bg-gray-600"
              style={{
                top: 0,
                height: "24px",
              }}
            ></div>
          )}
          {(history.length === 1 || index < history.length - 1) && (
            <div
              className="absolute left-[7px] w-0.5 bg-gray-400 dark:bg-gray-600"
              style={{
                top: "25px",
                height: "calc(100% - 8px)",
              }}
            ></div>
          )}

          <div className="shrink-0 pt-6">
            <div className="w-4 h-4 rounded-full bg-muted-foreground dark:bg-white relative z-10"></div>
          </div>

          <Card className="w-full flex-1 group gap-3 py-3 transition-all">
            <CardHeader className="py-0 px-4 gap-0">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-semibold leading-tight">
                  <span>{formatLabel(item.activity_type)}</span>
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="px-4 py-1 -mt-2.5">
              {item?.note && (
                <>
                  <CardDescription
                    ref={(el) => {
                      noteRef.current[item.id] = el;
                    }}
                    className={`text-xs leading-relaxed text-gray-600 dark:text-gray-300 ${
                      !expanded[item.id] ? "line-clamp-2" : ""
                    }`}
                  >
                    {item.note}
                  </CardDescription>

                  {toggleMap[item.id] && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [item.id]: !prev[item.id],
                        }))
                      }
                      className="flex text-xs items-center justify-start self-start p-0 mt-2 h-auto cursor-pointer text-primary hover:text-primary/80"
                    >
                      {expanded[item.id] ? "Show Less" : "Show More"}
                      <span className="inline-flex items-center ml-1">
                        {expanded[item.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </Button>
                  )}
                </>
              )}
            </CardContent>

            <CardFooter className="px-4 !pt-2 pb-0 mt-0 justify-between border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1 text-[11px]">
                <UserAvatar name={item.user_name} size="sm" />

                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {item.user_name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                <Calendar className="w-3 h-3" />
                <span>{UTCToLocalTimezon(item.created_at)}</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
};
