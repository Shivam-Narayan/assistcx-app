"use client";

import DataTableLoader from "@/components/data-table-loader";
import { EmptyState } from "@/components/empty-state/empty-state";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import { BookKey } from "lucide-react";
import ApiKeyRow from "./api-key-row";
import { columns } from "./constants";
import { cellObject } from "./hook/useGetApiKeyData";

interface DataTableProps {
  loading: boolean;
  isLoading: boolean;
  cellData: cellObject[];
  loadTableData: (data: any, type: PostActionStateSyncAction) => void;
  isFullAccess: boolean;
  isEditAccess: boolean;
}
export function DataTable({
  loading,
  isLoading,
  cellData,
  loadTableData,
  isFullAccess,
  isEditAccess,
}: DataTableProps) {
  if (loading || isLoading) {
    return <DataTableLoader />;
  }

  return (
    <>
      {!cellData?.length ? (
        <EmptyState
          variant="inline"
          icon={<BookKey />}
          title="No Keys Configured"
          description="Create an API key to connect external system to AssistCX"
        />
      ) : (
        <div className="space-y-4 pb-8">
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns
                    .filter(
                      (header) =>
                        header !== "Actions" || isEditAccess || isFullAccess,
                    )
                    .map((header) => {
                      return (
                        <TableHead
                          className={`${header === "Actions" ? "max-w-[50px] min-w-[50px]" : "max-w-[150px] min-w-[150px]"} p-3 `}
                          key={header}
                        >
                          {header}
                        </TableHead>
                      );
                    })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cellData?.map((rowItem, index) => (
                  <ApiKeyRow
                    rowItem={rowItem}
                    key={"text" + index}
                    loadTableData={loadTableData}
                    isFullAccess={isFullAccess}
                    isEditAccess={isEditAccess}
                  />
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </>
  );
}
