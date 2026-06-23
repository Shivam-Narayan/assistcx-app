import History from "@/app/assistant/history/history";
import { Metadata } from "next";
import { Suspense } from "react";
import { HistoryFallback } from "./_components/history-fallback";

export const metadata: Metadata = {
  title: "Assistant",
  description:
    "AI-powered email assistant to help you manage and respond to emails efficiently.",
};

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistoryFallback />}>
      <History />
    </Suspense>
  );
}
