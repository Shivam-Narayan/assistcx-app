import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../../components/tasks/loading";
import TaskDetail from "./task-detail";

export const metadata: Metadata = {
  title: "Task Details",
  description: "Task Details Page",
};

export default function InboxPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TaskDetail />
    </Suspense>
  );
}
