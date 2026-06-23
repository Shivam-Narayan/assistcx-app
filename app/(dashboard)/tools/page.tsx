import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import ToolsMainPage from "./tools-page";

export const metadata: Metadata = {
  title: "Agents Tools",
  description: "Agents Tools",
};

export default async function ToolPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ToolsMainPage />
    </Suspense>
  );
}
