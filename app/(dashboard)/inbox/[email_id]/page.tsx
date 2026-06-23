import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../components/tasks/loading";
import SingleEmailView from "../[email_id]/single-email-view";

export const metadata: Metadata = {
  title: "Email Preview",
  description: "Email Preview Page",
};

export default function InboxPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SingleEmailView />
    </Suspense>
  );
}
