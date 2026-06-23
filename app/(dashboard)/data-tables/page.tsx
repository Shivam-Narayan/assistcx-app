import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../settings/loading";
import DataTablesMainPage from "./data-tables-page";

export const metadata: Metadata = {
  title: "Data Tables",
  description: "Create and manage structured data tables",
};

export default async function DataTablesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DataTablesMainPage />
    </Suspense>
  );
}
