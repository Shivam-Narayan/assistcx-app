"use client";

import { Card } from "@/components/ui/card";
import { TaskSuggestions } from "@/lib/data/chat-data";
import { AlarmClock } from "lucide-react";
import { ScheduleType } from "./types";

interface TaskEmptyStateProps {
  onTaskDetail: (
    tab?: string,
    time?: string,
    day?: string,
    suggestion?: { name?: string; prompt?: string } | null,
  ) => void;
}

export function TaskEmptyState({ onTaskDetail }: TaskEmptyStateProps) {
  return (
    <>
      <Card
        onClick={() => {
          onTaskDetail("daily" as ScheduleType, "08:00");
        }}
        className="w-full  mx-auto p-8 gap-2 rounded-2xl border shadow-xs text-center cursor-pointer group transition-colors hover:bg-gray-100/70"
      >
        <div className="flex justify-center">
          <div className="bg-muted p-4 rounded-full border">
            <AlarmClock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className="text-lg font-semibold">Get started by adding a task</h2>
        <p className="text-sm text-muted-foreground">
          Schedule a task to automate actions and get reminders when they
          complete.
        </p>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto mt-8">
        {TaskSuggestions.map((item, index) => (
          <Card
            key={index}
            className="shadow-xs rounded-2xl p-4 duration-200 cursor-pointer group transition-colors hover:bg-gray-100/70"
            onClick={() => {
              onTaskDetail(
                item?.tab as ScheduleType,
                item?.time,
                item?.dayOfWeek,
                { name: item.title, prompt: item.prompt },
              );
            }}
          >
            <h3 className="text-sm font-semibold text-center">{item.title}</h3>
            <div className="rounded-xl border p-4 text-sm text-muted-foreground space-y-2">
              <p className="line-clamp-2">{item.description}</p>
              <p className="text-black text-sm font-medium">{item.schedule}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
