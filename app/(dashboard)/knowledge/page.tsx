import { Metadata } from "next";
import { Suspense } from "react";
import Collections from "./collections";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Knowledge",
  description: "Knowledge base collections",
};

const KnowledgePage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Collections />
    </Suspense>
  );
};

export default KnowledgePage;
