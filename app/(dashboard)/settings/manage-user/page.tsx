import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import ManageUserTabs from "./manage-user-tabs";

export const metadata: Metadata = {
  title: "Manage User",
  description: "Manage users, roles, and groups for your organization.",
};

const ManageUserPage = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <ManageUserTabs />
    </Suspense>
  );
};

export default ManageUserPage;
