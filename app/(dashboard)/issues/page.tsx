import React, { Suspense } from "react";
import { Metadata } from "next";
import Loading from "./loading";
import IssueManagementPage from "./issue-management";

export const metadata: Metadata = {
  title: "Issues",
  description: "Issue Management",
};

const IssuePage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <IssueManagementPage />
    </Suspense>
  );
};

export default IssuePage;
