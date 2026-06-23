import { Metadata } from "next";
import { Suspense } from "react";
import ManageAgent from "./manage-agent";

export const metadata: Metadata = {
  title: "Agents",
  description: "Agents page",
};

export default function Page() {
  return (
    <Suspense>
      <ManageAgent />
    </Suspense>
  );
}
