import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import AccountMainPage from "./account-page";

export const metadata: Metadata = {
  title: "Account",
  description: "",
};

const TeamMembersPage = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <AccountMainPage />
    </Suspense>
  );
};

export default TeamMembersPage;
