"use client";

import { Card } from "@/components/ui/card";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import DataTableLoader from "@/components/data-table-loader";
import * as helperFun from "@/helper/helper-function";
import { FileIcon } from "lucide-react";
import { AddEditDataTemplate } from "./add-edit-data-template";
import { columns } from "./columns";
import useGetDataTemplate from "./hook/useGetDataTemplate";
import { EmptyState } from "@/components/empty-state/empty-state";

export interface cellObject {
  id: string;
  name?: string;
  template_class: string;
  description?: string;
  data_schema: [];
  updated_at?: string;
}

export function DataTable() {
  const {
    loading,
    cellData,
    isLoading,
    handleViewDataTemplate,
    isCreateUpdateDataTemplate,
    loadTableData,
  } = useGetDataTemplate();

  if (loading || isLoading) {
    return <DataTableLoader />;
  }

  return (
    <>
      <div className="space-y-4 pb-8">
        {!cellData?.length ? (
          <EmptyState
            variant="inline"
            icon={<FileIcon />}
            title="No Data Template Configured"
            description="Configure a data template to start with the intelligent data extraction from different documents."
          />
        ) : (
          <Sheet>
            <Card className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns?.map((header, index) => {
                      return (
                        <TableHead
                          className="p-3 max-w-[150px] min-w-[150px]"
                          key={index}
                        >
                          {header}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cellData?.map((rowItem, index) => (
                    <TableRow key={"text" + index}>
                      <TableCell className="p-3 font-medium max-w-xs">
                        <ConditionalTooltip content={rowItem.name || ""}>
                          <SheetTrigger asChild>
                            <div
                              className="hover:underline cursor-pointer truncate"
                              onClick={() => handleViewDataTemplate(rowItem)}
                            >
                              {rowItem.name}
                            </div>
                          </SheetTrigger>
                        </ConditionalTooltip>
                      </TableCell>
                      <TableCell className="p-3 max-w-xs">
                        <ConditionalTooltip
                          content={rowItem.template_class || ""}
                        >
                          <SheetTrigger asChild>
                            <div className="truncate">
                              {rowItem.template_class}
                            </div>
                          </SheetTrigger>
                        </ConditionalTooltip>
                      </TableCell>
                      <TableCell className="p-3 max-w-xs">
                        <ConditionalTooltip content={rowItem.description || ""}>
                          <SheetTrigger asChild>
                            <div className="max-w-[260px] w-fit truncate">
                              {rowItem?.description}
                            </div>
                          </SheetTrigger>
                        </ConditionalTooltip>
                      </TableCell>
                      <TableCell className="p-3 w-fit min-w-[180px]">
                        {helperFun.UTCToLocalTimezon(rowItem.updated_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Sheet>
        )}
      </div>

      <AddEditDataTemplate
        loadTableData={loadTableData}
        isCreateUpdateDataTemplate={isCreateUpdateDataTemplate}
      />
    </>
  );
}
