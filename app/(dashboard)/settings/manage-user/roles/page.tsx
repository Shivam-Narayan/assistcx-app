import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../../loading";
import RoleMainPage from "./role-page";

export const metadata: Metadata = {
  title: "Roles",
  description: "",
};

const RolesPage = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <RoleMainPage />
    </Suspense>
  );
};

export default RolesPage;
