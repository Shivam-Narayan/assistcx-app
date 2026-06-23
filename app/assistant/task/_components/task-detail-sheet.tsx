import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/assistant-sheet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  cronToJson,
  errorMessageHandler,
} from "@/helper/assistant-helper/helper";
import { DELETE_TASK, DETAIL_TASK, TASK_STATUS } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { Trash2, X } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ScheduleBlock from "./schedule-block";

import TaskHistoryDetail from "./task-history-detail";
import { ScheduleType, SelectedSourcesProps, TaskDetails } from "./types";
import TaskForm from "./task-form";

export function TaskDetailSheet({
  children,
  taskId,
  fetchTaskList,
  onStatusChange,
}: SelectedSourcesProps) {
  const { axiosAuth, loading } = useAxiosAuth();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const fetchTaskDetails = useCallback(
    async (id: string) => {
      try {
        const response = await axiosAuth.get(`${DETAIL_TASK}/${id}`);
        if (response.status === 200) {
          setTaskDetails(response.data);
        } else {
          console.error("Failed to fetch task details");
        }
      } catch (error) {
        errorMessageHandler(error);
      }
    },
    [axiosAuth],
  );
  useEffect(() => {
    if (!loading) {
      if (open && taskId) {
        fetchTaskDetails(taskId);
      }
      return () => {
        setTaskDetails(null);
      };
    }
  }, [open, taskId, loading, fetchTaskDetails]);

  const handleDelete = async () => {
    try {
      const id = taskDetails?.id;
      await axiosAuth.delete(`${DELETE_TASK}/${id}`);
      toast.success("Task deleted successfully");
      setDeleteOpen(false);
      setOpen(false);
      fetchTaskList?.();
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    }
  };
  const handlePause = async () => {
    try {
      const id = taskDetails?.id;
      await axiosAuth.post(`${TASK_STATUS}/${id}/pause`);
      toast.success("Task paused successfully");
      fetchTaskDetails(taskId);
      onStatusChange?.(id!, "paused");
    } catch (err) {
      errorMessageHandler(err);
    }
  };
  const handleResume = async () => {
    try {
      const id = taskDetails?.id;
      await axiosAuth.post(`${TASK_STATUS}/${id}/resume`);
      toast.success("Task resumed successfully");
      fetchTaskDetails(taskId);
      onStatusChange?.(id!, "active");
    } catch (err) {
      errorMessageHandler(err);
    }
  };

  const cron = (() => {
    const schedule = taskDetails?.schedule;

    if (!schedule) {
      return {
        type: "daily",
        time: "08:10",
        dayOfWeek: "Monday",
        date: undefined,
        dayOfMonth: undefined,
      };
    }

    const isEpoch = /^\d{10,13}$/.test(String(schedule));
    const raw = Number(schedule);
    const epoch = raw > 1e12 ? raw / 1000 : raw;

    return isEpoch
      ? {
          type: "once",
          time: moment.unix(epoch).format("HH:mm"),
          date: moment.unix(epoch).format("YYYY-MM-DD"),
        }
      : cronToJson(schedule);
  })();

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="md:max-w-[50vw] w-full gap-0">
          <SheetHeader className="border-b flex flex-row justify-between items-center bg-white z-1">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <SheetTitle className="text-lg font-semibold truncate">
                {taskDetails?.title}
              </SheetTitle>
              {taskDetails?.status && (
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                    taskDetails.status === "active"
                      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                      : "text-amber-600 bg-amber-50 border-amber-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      taskDetails.status === "active"
                        ? "bg-emerald-500"
                        : "bg-amber-400"
                    }`}
                  />
                  <span className="capitalize">{taskDetails.status}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer h-8 w-8 border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50"
                aria-label="Delete"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer h-8 w-8"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3">
              {taskDetails?.schedule && (
                <ScheduleBlock
                  status={taskDetails?.status}
                  schedule={taskDetails?.schedule ?? ""}
                  setEditModalOpen={setEditModalOpen}
                  handlePause={handlePause}
                  handleResume={handleResume}
                  taskDetails={taskDetails}
                />
              )}
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <TaskHistoryDetail tasks_id={taskId} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this task?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              task and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => handleDelete()}
              className="cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {editModalOpen && (
        <TaskForm
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          mode="edit"
          id={taskDetails?.id}
          fetchTaskDetails={() => fetchTaskDetails(taskId)}
          fetchTaskList={fetchTaskList}
          initialData={{
            name: taskDetails?.title || "",
            scheduleType: ([
              "once",
              "daily",
              "weekly",
              "monthly",
              "yearly",
            ].includes(cron?.type)
              ? cron.type
              : "daily") as ScheduleType,
            time: cron?.time,
            dayOfWeek: cron?.dayOfWeek,
            dayOfMonth: cron?.dayOfMonth as number | undefined,
            prompt: taskDetails?.task_prompt,
            collections: taskDetails?.collections,
            date: cron?.date ?? undefined,
            alertRecipientsemails: taskDetails?.notification_recipients,
            webSearch: taskDetails?.web_search_enabled,
          }}
        />
      )}
    </>
  );
}
