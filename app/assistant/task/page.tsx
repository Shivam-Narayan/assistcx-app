import Task from "@/app/assistant/task/task";
import { Metadata } from "next";
import { Suspense } from "react";
import { TaskFallback } from "./_components/task-fallback";

export const metadata: Metadata = {
  title: "Assistant",
  description:
    "AI-powered email assistant to help you manage and respond to emails efficiently.",
};
export default function TaskPage() {
  return (
    <Suspense fallback={<TaskFallback />}>
      <Task />
    </Suspense>
  );
}
