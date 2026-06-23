import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../../settings/loading";
import DataTablesMainPage from "../data-tables-page";

export const metadata: Metadata = {
  title: "Data Tables",
  description: "Create and manage structured data tables",
};

interface DataTableDetailPageProps {
  params: Promise<{
    tableId: string;
  }>;
}

export default async function DataTableDetailPage({
  params,
}: DataTableDetailPageProps) {
  const { tableId } = await params;

  return (
    <Suspense fallback={<Loading />}>
      <DataTablesMainPage initialTableId={tableId} />
    </Suspense>
  );
}
