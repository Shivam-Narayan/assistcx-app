import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../../loading";
import TeamMembersMainPage from "./team-member";

export const metadata: Metadata = {
  title: "Team Members",
  description: "",
};

const TeamMembersPage = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <TeamMembersMainPage />
    </Suspense>
  );
};

export default TeamMembersPage;
