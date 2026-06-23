import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import SingleIssuesDetails from "./single-issues-details";

export const metadata: Metadata = {
  title: "Issue Detail",
  description: "Issue Detail",
};

export default function InboxPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SingleIssuesDetails />
    </Suspense>
  );
}
