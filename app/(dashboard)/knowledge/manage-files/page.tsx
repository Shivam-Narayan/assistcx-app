import React, { Suspense } from "react";
import { Metadata } from "next";
import DataFiles from "./data-files";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Files",
  description: "Files",
};

const ManageFilesPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <DataFiles />
    </Suspense>
  );
};

export default ManageFilesPage;
