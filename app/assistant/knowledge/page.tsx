import Knowledge from "@/app/assistant/knowledge/knowledge";
import { Metadata } from "next";
import { Suspense } from "react";
import { KnowledgeFallback } from "./_components/knowledge-fallback";

export const metadata: Metadata = {
  title: "Assistant",
  description:
    "AI-powered email assistant to help you manage and respond to emails efficiently.",
};
export default function KnowledgePage() {
  return (
    <Suspense fallback={<KnowledgeFallback />}>
      <Knowledge />
    </Suspense>
  );
}
