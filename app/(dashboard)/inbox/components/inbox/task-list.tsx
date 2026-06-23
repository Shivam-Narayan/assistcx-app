import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CopyToClipboard from "@/components/copy-to-clipboard";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { JumpingLoadingAnimation } from "@/components/JumpingLoadingAnimation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getAttachmentIcon,
  getStatusColor,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import type {
  IAgentDetails,
  IAttachmentDetails,
  ITaskExecution,
  ITaskExecutionDetails,
} from "@/types/types";
import { GripVertical, Inbox as InboxIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";

interface TaskListProps {
  tasks: ITaskExecutionDetails[];
  handleOpenAttachmentEvent: (attachment: IAttachmentDetails) => void;
  assignedAgent: IAgentDetails | null;
  isTaskListLoading: boolean;
}

const TaskCard = React.memo(
  ({
    task,
    assignedAgent,
    handleOpenAttachmentEvent,
  }: {
    task: ITaskExecution;
    assignedAgent: IAgentDetails | null;
    handleOpenAttachmentEvent: (attachment: IAttachmentDetails) => void;
  }) => {
    const router = useRouter();
    const { attachment_details } = task;
    const defaultIcon = getIconSvg("shapes", "agent_icons");
    const params = useParams();
    const isSameTaskId = params?.task_id === String(task.id);

    const handleCardClick = useCallback(() => {
      if (window.getSelection()?.toString().trim() !== "") return;
      router.push(`/inbox/tasks/${task.id}`);
    }, [router, task.id]);

    const isTaskExecuting =
      task?.status === "QUEUED" || task?.status === "EXECUTING";

    return (
      <Card
        className={`shadow-xs p-0 gap-0 overflow-hidden transition-shadow hover:shadow-md border bg-white dark:bg-slate-800 `}
      >
        <CardHeader
          className={`p-3! pb-3 gap-0 rounded-t-md border-b ${!isSameTaskId ? "cursor-pointer" : ""} transition-all duration-150 ease-in-out bg-muted/50 dark:bg-slate-700/30 dark:border-slate-700 hover:bg-muted dark:hover:bg-slate-600/80 `}
          onClick={handleCardClick}
        >
          <div className="flex flex-wrap overflow-hidden flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex flex-col  min-w-0 gap-0.5">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-sm px-1.5 py-0.5 whitespace-nowrap"
                >
                  {task.task_order.replace(" of ", "/")}
                </Badge>
                <CardTitle className="text-sm xl:text-base font-medium text-gray-800 dark:text-slate-200 max-w-md line-clamp-1 truncate">
                  {task.title}
                </CardTitle>
              </div>
              <div className="flex items-center text-xs text-muted-foreground dark:text-slate-400">
                <p className="text-xs text-muted-foreground pr-1">
                  Task ID: {task.id}
                </p>

                <CopyToClipboard
                  text={task.id || ""}
                  tooltipLabel="Copy task ID"
                />
              </div>
            </div>
            <div className="flex gap-2 items-center shrink-0">
              <div className="h-7 xl:h-8 inline-flex items-center gap-2 bg-muted hover:bg-muted/80 transition-colors rounded-lg px-2 py-1 border">
                <div
                  className={`w-4 h-4 flex items-center justify-center shrink-0 transition-colors text-primary `}
                  dangerouslySetInnerHTML={{
                    __html:
                      task?.agent_icon
                        ? getIconSvg(task.agent_icon, "agent_icons") || defaultIcon
                        : defaultIcon,
                  }}
                  aria-hidden="true"
                />
                <span className="text-xs xl:text-sm font-medium truncate max-w-[160px]">
                  {task.agent_name}
                </span>
              </div>
              <Badge
                variant="outline"
                className={`${getStatusColor(
                  task?.status,
                )}  h-7 xl:h-8  text-xs xl:text-sm px-2 py-1 flex items-center gap-1 font-normal`}
              >
                {isTaskExecuting && (
                  <JumpingLoadingAnimation
                    color={
                      task?.status === "QUEUED"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }
                  />
                )}
                <span className="leading-none">{task?.status}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 flex flex-col gap-3 md:p-4 text-gray-700 dark:text-slate-300">
          <p className="text-sm line-clamp-2">
            {task.description.replace(/[#*_`>\\]/g, "").replace(/\n/g, " ")}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground dark:text-slate-400">
                Created:{" "}
              </span>
              <span className="font-medium">
                {UTCToLocalTimezon(task.created_at)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground dark:text-slate-400">
                Completed:{" "}
              </span>
              <span className="font-medium">
                {task.completed_at
                  ? UTCToLocalTimezon(task.completed_at)
                  : "N/A"}
              </span>
            </div>
          </div>

          {attachment_details?.attachments.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Task Attachments ({attachment_details?.total})
              </p>
              <div className="flex flex-wrap gap-2">
                {attachment_details?.attachments.map((att, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAttachmentEvent(att);
                    }}
                    className="cursor-pointer flex items-center p-1.5 border rounded bg-muted text-xs "
                  >
                    {getAttachmentIcon(att.file_type)}

                    <div className="flex flex-1 items-center max-w-[250px] mr-2">
                      <ConditionalTooltip content={att?.file_name}>
                        <span className="truncate w-full block ">
                          {att?.file_name}
                        </span>
                      </ConditionalTooltip>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

TaskCard.displayName = "TaskCard";

export function TaskList({
  tasks,
  assignedAgent,
  isTaskListLoading,
  handleOpenAttachmentEvent,
}: TaskListProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const { tasksList, count } = useMemo(
    () => ({
      tasksList: tasks?.[0]?.tasks ?? [],
      count: tasks?.[0]?.count ?? {},
    }),
    [tasks],
  );

  // Filter tasks based on active filter
  const filteredTasksList = useMemo(() => {
    if (activeFilter === "ALL") return tasksList;

    return tasksList.filter((task) => {
      const status = task.status?.toUpperCase();

      switch (activeFilter) {
        case "SUCCESSFUL":
          return status === "SUCCESSFUL" || status === "COMPLETED";
        case "FAILED":
          return status === "FAILED" || status === "CANCELLED";
        case "EXECUTING":
          return status === "EXECUTING";
        case "QUEUED":
          return status === "QUEUED" || status === "PENDING";
        case "INCOMPLETE":
          return status === "INCOMPLETE";
        case "RESOLVED":
          return status === "RESOLVED";
        case "PAUSED":
          return status === "PAUSED";
        default:
          return true;
      }
    });
  }, [tasksList, activeFilter]);

  if (tasksList.length === 0 && !isTaskListLoading) {
    return (
      <div className="text-center py-8">
        <InboxIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-slate-400">
          No tasks associated with this email.
        </p>
      </div>
    );
  }

  const TaskStatusCounts = ({
    tasks,
    activeFilter,
    setActiveFilter,
  }: {
    tasks: ITaskExecution[];
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
  }) => {
    const statusCounts = useMemo(() => {
      const counts = {
        successful: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        executing: 0,
        queued: 0,
        pending: 0,
        incomplete: 0,
        resolved: 0,
        paused: 0,
      };

      tasks.forEach((task) => {
        const status = task.status?.toUpperCase();
        if (status === "SUCCESSFUL") counts.successful++;
        else if (status === "COMPLETED") counts.completed++;
        else if (status === "FAILED") counts.failed++;
        else if (status === "CANCELLED") counts.cancelled++;
        else if (status === "EXECUTING") counts.executing++;
        else if (status === "QUEUED") counts.queued++;
        else if (status === "PENDING") counts.pending++;
        else if (status === "INCOMPLETE") counts.incomplete++;
        else if (status === "RESOLVED") counts.resolved++;
        else if (status === "PAUSED") counts.paused++;
      });

      return {
        total: tasks.length,
        success: counts.successful + counts.completed,
        failed: counts.failed + counts.cancelled,
        inProgress: counts.executing,
        waiting: counts.queued + counts.pending,
        incomplete: counts.incomplete,
        paused: counts.paused,
        resolved: counts.resolved,
      };
    }, [tasks]);

    if (tasks.length === 0) return null;

    return (
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant="outline"
          onClick={() => setActiveFilter("ALL")}
          className={`bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 h-6 xl:h-7 text-xs xl:text-sm px-2 py-0.5 flex items-center gap-1.5 font-normal cursor-pointer transition-all ${
            activeFilter === "ALL"
              ? "ring-2 ring-slate-400 dark:ring-slate-500 ring-offset-1"
              : ""
          }`}
        >
          TOTAL
          <span className="bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded  text-xs font-semibold">
            {statusCounts.total}
          </span>
        </Badge>

        {statusCounts.success > 0 && (
          <Badge
            variant="outline"
            onClick={() => setActiveFilter("SUCCESSFUL")}
            className={`${getStatusColor(
              "SUCCESSFUL",
            )} hover:bg-green-50 dark:hover:bg-green-900/30 h-7 text-xs xl:text-sm px-2 py-0.5 flex items-center gap-1.5 font-normal cursor-pointer transition-all ${
              activeFilter === "SUCCESSFUL"
                ? "ring-2 ring-green-400 dark:ring-green-500 ring-offset-1"
                : ""
            }`}
          >
            SUCCESSFUL
            <span className="bg-green-200 dark:bg-green-900/40 px-1.5 py-0.5 rounded text-xs font-semibold">
              {statusCounts.success}
            </span>
          </Badge>
        )}

        {statusCounts.failed > 0 && (
          <Badge
            variant="outline"
            onClick={() => setActiveFilter("FAILED")}
            className={`${getStatusColor(
              "FAILED",
            )} hover:bg-red-50 dark:hover:bg-red-900/30 h-7 text-xs xl:text-sm px-2 py-0.5 flex items-center gap-1.5 font-normal cursor-pointer transition-all ${
              activeFilter === "FAILED"
                ? "ring-2 ring-red-400 dark:ring-red-500 ring-offset-1"
                : ""
            }`}
          >
            FAILED
            <span className="bg-red-200 dark:bg-red-900/40 px-1.5 py-0.5 rounded text-xs font-semibold">
              {statusCounts.failed}
            </span>
          </Badge>
        )}

        {statusCounts.inProgress > 0 && (
          <Badge
            variant="outline"
            onClick={() => setActiveFilter("EXECUTING")}
            className={`${getStatusColor(
              "EXECUTING",
            )} hover:bg-blue-50 dark:hover:bg-blue-900/30 h-7 text-xs xl:text-sm px-2 py-0.5 flex items-center gap-1.5 font-normal cursor-pointer transition-all ${
              activeFilter === "EXECUTING"
                ? "ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1"
                : ""
            }`}
          >
            EXECUTING
            <span className="bg-blue-200 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-xs font-semibold">
              {statusCounts.inProgress}
            </span>
          </Badge>
        )}

        {statusCounts.waiting > 0 && (
          <Badge
            variant="outline"
            onClick={() => setActiveFilter("QUEUED")}
            className={`${getStatusColor(
              "QUEUED",
            )} hover:bg-yellow-50 dark:hover:bg-yellow-900/30 h-7 text-xs xl:text-sm px-2 py-0.5 flex items-center gap-1.5 font-normal cursor-pointer transition-all ${
              activeFilter === "QUEUED"
                ? "ring-2 ring-yellow-400 dark:ring-yellow-500 ring-offset-1"
                : ""
            }`}
          >
            QUEUED
            <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-semibold">
              {statusCounts.waiting}
            </span>
          </Badge>
        )}

        {statusCounts.incomplete > 0 && (
          <Badge
            variant="outline"
            onClick={() => setActiveFilter("INCOMPLETE")}
            className={`${getStatusColor(
              "INCOMPLETE",
            )} hover:bg-amber-50 dark:hover:bg-amber-900/30 h-7 text-xs xl:text-sm px-2 py-0.5 flex items-center gap-1.5 font-normal cursor-pointer transition-all ${
              activeFilter === "INCOMPLETE"
                ? "ring-2 ring-amber-400 dark:ring-amber-500 ring-offset-1"
                : ""
            }`}
          >
            INCOMPLETE
            <span className="bg-amber-200 dark:bg-amber-900/40 px-1.5 py-0.5 rounded text-xs font-semibold">
              {statusCounts.incomplete}
            </span>
          </Badge>
        )}

        {statusCounts.resolved > 0 && (
          <Badge
            variant="outline"
            onClick={() => setActiveFilter("RESOLVED")}
            className={`${getStatusColor(
              "RESOLVED",
            )} hover:bg-zinc-100 dark:hover:bg-zinc-800/30 h-7 text-sm px-2 py-0.5 flex items-center gap-1.5 font-normal cursor-pointer transition-all ${
              activeFilter === "RESOLVED"
                ? "ring-2 ring-zinc-400 dark:ring-zinc-500 ring-offset-1"
                : ""
            }`}
          >
            RESOLVED
            <span className="bg-zinc-300 dark:bg-zinc-600 px-1.5 py-0.5 rounded text-xs font-semibold">
              {statusCounts.resolved}
            </span>
          </Badge>
        )}
        {statusCounts.paused > 0 && (
          <Badge
            variant="outline"
            onClick={() => setActiveFilter("PAUSED")}
            className={`${getStatusColor(
              "PAUSED",
            )} hover:bg-zinc-100 dark:hover:bg-zinc-800/30 h-7 text-sm px-2 py-0.5 flex items-center gap-1.5 font-normal cursor-pointer transition-all ${
              activeFilter === "PAUSED"
                ? "ring-2 ring-zinc-400 dark:ring-zinc-500 ring-offset-1"
                : ""
            }`}
          >
            PAUSED
            <span className="bg-zinc-300 dark:bg-zinc-600 px-1.5 py-0.5 rounded text-xs font-semibold">
              {statusCounts.paused}
            </span>
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div>
      {!isTaskListLoading && tasksList.length !== 0 ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <GripVertical
                className={`w-5 h-5 transition-colors text-primary `}
              />
              <h3 className="text-base xl:text-lg font-semibold text-gray-700 dark:text-slate-200">
                Tasks
              </h3>
              <TaskStatusCounts
                tasks={tasksList}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            </div>
          </div>
          <TooltipProvider delayDuration={100}>
            <div className="space-y-5">
              {filteredTasksList.map((task) => {
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    handleOpenAttachmentEvent={handleOpenAttachmentEvent}
                    assignedAgent={assignedAgent}
                  />
                );
              })}
            </div>
          </TooltipProvider>
        </>
      ) : null}
    </div>
  );
}
