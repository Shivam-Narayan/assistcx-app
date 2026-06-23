import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import ClassGroupMainPage from "./class-group-main-page";

export const metadata: Metadata = {
  title: "Class Group",
  description: "",
};

const ClassGroupPage = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <ClassGroupMainPage />
    </Suspense>
  );
};

export default ClassGroupPage;
