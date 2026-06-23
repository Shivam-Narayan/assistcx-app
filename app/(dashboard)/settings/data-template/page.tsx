import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import DataTemplateMainPage from "./data-template-page";

export const metadata: Metadata = {
  title: "Data Template",
  description: "",
};

export default async function DataSchemasPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DataTemplateMainPage />
    </Suspense>
  );
}
