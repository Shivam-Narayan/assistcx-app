import MyFiles from "@/app/assistant/files/my-files";
import { Metadata } from "next";
import { Suspense } from "react";
import { MyFileFallback } from "./_components/my-file-fallback";
export const metadata: Metadata = {
  title: "Assistant",
  description:
    "AI-powered email assistant to help you manage and respond to emails efficiently.",
};
export default function MyFilesPage() {
  return (
    <Suspense fallback={<MyFileFallback />}>
      <MyFiles />
    </Suspense>
  );
}
