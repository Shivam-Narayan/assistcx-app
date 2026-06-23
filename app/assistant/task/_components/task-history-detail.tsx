"use client";

import { ChatItem } from "@/app/assistant/history/_components/types";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { EmptyState } from "@/components/empty-state/empty-state";
import { Button } from "@/components/ui/button";
import {
  errorMessageHandler,
  formatDate,
} from "@/helper/assistant-helper/helper";
import { CHAT, TASK_HISTORY } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  ChevronLeft,
  ChevronRight,
  History,
  MessageSquareShare,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TaskHistoryLoader } from "./task-history-loader";
import TaskResponseDetail from "./task-response-detail";

// ---------------- Main ----------------
export default function TaskHistoryDetail({ tasks_id }: { tasks_id: string }) {
  const { axiosAuth, loading } = useAxiosAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchTaskHistory = useCallback(
    async (pageNum: number) => {
      try {
        setIsLoading(true);
        if (pageNum === 1) {
          setHasMore(true);
          setTasks([]);
        }
        const response = await axiosAuth.get<ChatItem[]>(
          `${TASK_HISTORY}/${tasks_id}/tasks`,
          {
            params: {
              page: pageNum,
              page_size: PAGE_SIZE,
              sort_by: "updated_at",
              sort_order: "desc",
            },
          },
        );

        const data = response.data || [];

        if (pageNum === 1) {
          setTasks(data);
        } else {
          setTasks((prev) => [...prev, ...data]);
        }

        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }

        // default select
        if (pageNum === 1 && data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (err) {
        setError("Failed to load tasks. Please try again.");
        errorMessageHandler(err);
      } finally {
        setIsLoading(false);
      }
    },
    [axiosAuth, tasks_id],
  );

  useEffect(() => {
    if (!loading) {
      fetchTaskHistory(1);
    }
  }, [fetchTaskHistory, loading]);

  useEffect(() => {
    if (page > 1) {
      const startIdx = (page - 1) * PAGE_SIZE;
      const newTasks = tasks.slice(startIdx);
      if (newTasks.length > 0) {
        setSelectedId(newTasks[0].id);
      }
    }
  }, [tasks, page]);

  const handleNext = async () => {
    if (!selectedId || tasks.length === 0) return;
    const idx = tasks.findIndex((t) => t.id === selectedId);
    if (idx < tasks.length - 1) {
      setSelectedId(tasks[idx + 1].id);
    } else if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchTaskHistory(nextPage);
    }
  };

  const handlePrevious = () => {
    if (!selectedId || tasks.length === 0) return;
    const idx = tasks.findIndex((t) => t.id === selectedId);
    if (idx > 0) {
      setSelectedId(tasks[idx - 1].id);
    }
  };

  const currentIndex = selectedId
    ? tasks.findIndex((t) => t.id === selectedId)
    : -1;
  const isFirst = currentIndex <= 0;
  const isLast = !hasMore && currentIndex === tasks.length - 1;

  return (
    <div className="mx-4 flex-1 overflow-hidden mb-4 rounded-xl border">
      {isLoading && tasks.length === 0 ? (
        <TaskHistoryLoader />
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="py-4 text-muted-foreground h-full flex flex-col items-center justify-center gap-2">
          <EmptyState
            title="No execution history yet"
            variant="inline"
            icon={History}
          />
        </div>
      ) : (
        <div className="relative h-full flex flex-1 flex-col overflow-auto">
          {/* Run header */}
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sticky top-0 bg-background z-10">
            <div className="flex-1 min-w-0">
              {tasks
                .filter((item) => item.id === selectedId)
                .map((item) => (
                  <div key={item.id}>
                    <h2 className="text-sm font-medium line-clamp-1">
                      {item?.title || "Untitled Task"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(item?.created_at)}
                    </p>
                  </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1.5">
              <ConditionalTooltip
                content="Newer run"
                alwaysShow={true}
                align="center"
                showArrow={true}
                side="bottom"
              >
                <Button
                  onClick={handlePrevious}
                  disabled={isFirst}
                  className="cursor-pointer h-8 w-8"
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </ConditionalTooltip>

              <ConditionalTooltip
                content="Older run"
                alwaysShow={true}
                align="center"
                showArrow={true}
                side="bottom"
              >
                <Button
                  onClick={handleNext}
                  disabled={isLast}
                  size="icon"
                  className="cursor-pointer h-8 w-8"
                  variant="outline"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </ConditionalTooltip>

              <div className="w-px h-5 bg-border mx-0.5" />

              <ConditionalTooltip
                content="Latest run"
                alwaysShow={true}
                align="center"
                showArrow={true}
                side="bottom"
              >
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Latest Run"
                  className="cursor-pointer h-8 w-8"
                  onClick={() => {
                    setPage(1);
                    fetchTaskHistory(1);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </ConditionalTooltip>

              <ConditionalTooltip
                content="Continue in chat"
                alwaysShow={true}
                align="center"
                showArrow={true}
                side="bottom"
              >
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Continue in Chat"
                  className="cursor-pointer h-8 w-8"
                  onClick={() => router.push(`${CHAT}/${selectedId}`)}
                >
                  <MessageSquareShare className="h-3.5 w-3.5" />
                </Button>
              </ConditionalTooltip>
            </div>
          </div>

          {/* Response content */}
          <div className="p-4 overflow-auto flex-1 scrollbar-gutter-stable">
            {selectedId ? (
              <TaskResponseDetail taskId={selectedId} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Select a run to view details
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
