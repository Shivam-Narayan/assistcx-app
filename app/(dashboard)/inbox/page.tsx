import { Metadata } from "next";
import InboxView from "./inbox-view";

export const metadata: Metadata = {
  title: "Task Inbox",
  description: "A task and issue tracker build using Tanstack Table.",
};

export default function InboxPage() {
  return <InboxView />;
}
