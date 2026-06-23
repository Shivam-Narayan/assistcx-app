"use client";

import { Button } from "@/components/ui/button";
import { cronToJson, getNextRunText } from "@/helper/assistant-helper/helper";
import { ScheduleType } from "@/helper/assistant-helper/helper-types";
import { CHAT } from "@/lib/assistant-urls";
import { setChatData } from "@/redux/assistant/chat/chat-slice";
import { setSelectedCollections } from "@/redux/assistant/chat/collection-slice";
import { setWebSearchEnabled } from "@/redux/assistant/chat/web-search-slice";
import { Pause, Pencil, Play, PlayCircle, Repeat } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { TaskDetails } from "./types";

const ScheduleBlock: React.FC<{
  schedule: string;
  status: string;
  handlePause: () => void;
  handleResume: () => void;
  taskDetails: TaskDetails | null;
  setEditModalOpen: (open: boolean) => void;
}> = ({
  schedule,
  status,
  handlePause,
  handleResume,
  taskDetails,
  setEditModalOpen,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isEpoch = /^\d{10,13}$/.test(schedule);
  const raw = Number(schedule);
  const epoch = raw > 1e12 ? raw / 1000 : raw;
  const cron = isEpoch
    ? {
        type: "once",
        time: moment.unix(epoch).format("HH:mm"),
        date: moment.unix(epoch).format("YYYY-MM-DD"),
      }
    : cronToJson(schedule);
  const handleTest = () => {
    const newId = uuidv4();
    dispatch(setSelectedCollections(taskDetails?.collections ?? []));
    dispatch(setWebSearchEnabled(taskDetails?.web_search_enabled ?? false));
    dispatch(
      setChatData({
        input: taskDetails?.task_prompt ?? "",
        chat_id: newId,
      }),
    );
    router.push(`${CHAT}/${newId}`);
  };

  return (
    <div className="space-y-3">
      {/* Schedule & Status */}
      <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === "active" ? (
              <>
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                  <Repeat className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {getNextRunText({
                      type: cron.type as ScheduleType,
                      time: cron.time,
                      dayOfWeek: cron.dayOfWeek,
                      dayOfMonth: cron.dayOfMonth
                        ? parseInt(cron.dayOfMonth)
                        : undefined,
                      date: cron?.date || undefined,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {cron.type} schedule
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50">
                  <Pause className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Paused</p>
                  <p className="text-xs text-muted-foreground">Task is currently paused</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer h-8"
              onClick={() => setEditModalOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            {cron?.type !== "once" &&
              (taskDetails?.status === "active" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer h-8"
                  onClick={handlePause}
                >
                  <Pause className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Pause</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer h-8"
                  onClick={handleResume}
                >
                  <Play className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Resume</span>
                </Button>
              ))}
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer h-8"
              onClick={handleTest}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Test</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Task Prompt */}
      {taskDetails?.task_prompt && (
        <div className="rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Instruction</p>
          <p className="text-sm leading-relaxed line-clamp-3">
            {taskDetails.task_prompt}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleBlock;
