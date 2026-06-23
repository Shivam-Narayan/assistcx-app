"use client";

import { useTaskList } from "@/app/assistant/task/hooks/useTaskList";
import { BoxLayout } from "@/components/assistant/box-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskData } from "@/lib/data/chat-data";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Plus, Search } from "lucide-react";
import { TaskCard } from "./_components/task-card";
import { TaskDetailSheet } from "./_components/task-detail-sheet";
import { TaskEmptyState } from "./_components/task-empty-state";
import TaskForm from "./_components/task-form";
import { TaskLoader } from "./_components/task-loader";
import { ScheduleType, TaskItem } from "./_components/types";

export default function Task() {
  const {
    tasks,
    setTasks,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    setSearchQuery,
    page,
    tab,
    time,
    day,
    hasMore,
    loaderRef,
    isTaskDetail,
    setIsTaskDetail,
    fetchTasks,
    handleSearchChange,
    suggestionData,
    handleTaskDetail,
    getTaskMeta,
  } = useTaskList();

  return (
    <div className="flex flex-col items-center w-full z-0">
      <BoxLayout className="w-full h-full flex flex-col min-w-full md:max-w-full">
        <div className="sticky top-0 backdrop-blur-md z-10">
          <div className="md:max-w-screen-md md:mx-auto pt-20 md:pt-12 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl md:text-3xl font-semibold">Tasks</h1>
              <Button
                className="cursor-pointer !h-8 !px-3 !py-2"
                onClick={() => {
                  handleTaskDetail("daily" as ScheduleType, "08:00");
                }}
                aria-label="New chat"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>

            {TaskData?.length !== 0 && (
              <div className="relative w-full mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search your tasks..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10 bg-white border border-input shadow-xs transition-colors ring-offset-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <Cross2Icon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 w-full  overflow-auto md:max-w-screen-md md:mx-auto">
          <div className="space-y-3 w-full pb-6">
            {isLoading && page === 1 ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TaskLoader key={`loader-${index}`} />
              ))
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : (
              <>
                {tasks?.length !== 0 ? (
                  tasks?.map((task: TaskItem, index: number) => {
                    if (!task?.schedule) return null; // Skip tasks without a schedule
                    const cron = getTaskMeta(task);
                    if (!cron?.time) return null;
                    return (
                      <TaskDetailSheet
                        key={`${task.id}-${index}`}
                        taskId={task?.id}
                        fetchTaskList={() => fetchTasks(1, "", true)}
                        onStatusChange={(id, status) => {
                          setTasks((prev) =>
                            prev.map((t) =>
                              t.id === id ? { ...t, status } : t,
                            ),
                          );
                        }}
                      >
                        <TaskCard task={task} cron={cron} />
                      </TaskDetailSheet>
                    );
                  })
                ) : (
                  <TaskEmptyState onTaskDetail={handleTaskDetail} />
                )}

                {hasMore && (
                  <div
                    ref={loaderRef}
                    className="w-full h-10 flex items-center justify-center"
                  >
                    {isFetchingMore && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span>Loading more tasks...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </BoxLayout>
      {isTaskDetail && (
        <TaskForm
          tab={tab as ScheduleType}
          open={isTaskDetail}
          time={time as string}
          day={day}
          onOpenChange={setIsTaskDetail}
          fetchTaskList={() => fetchTasks(1, "", true)}
          initialData={
            suggestionData
              ? {
                  name: suggestionData.name,
                  prompt: suggestionData.prompt,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
