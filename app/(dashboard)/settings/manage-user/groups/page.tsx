import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../../loading";
import UserGroupMainPage from "./user-group-page";

export const metadata: Metadata = {
  title: "User Group",
  description: "",
};

const UserGroupPage = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <UserGroupMainPage />
    </Suspense>
  );
};

export default UserGroupPage;
