"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import DataTableLoader from "@/components/data-table-loader";
import { Badge } from "@/components/ui/badge";
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
import * as helperFun from "@/helper/helper-function";
import { UserCog } from "lucide-react";
import { columns } from "./columns";
import useGetUserGroupData from "./hook/useGetUserGroupData";
import { AddEditUserGroup } from "./user-group-sheet";
import { EmptyState } from "@/components/empty-state/empty-state";

export function DataTable() {
  const {
    loading,
    searchData,
    cellData,
    isLoading,
    handleViewUserGroup,
    loadTableData,
  } = useGetUserGroupData();

  if (loading || isLoading) {
    return <DataTableLoader />;
  }

  return (
    <>
      <div className="space-y-4 pb-8">
        {!cellData?.length ? (
          <EmptyState
            variant="inline"
            icon={<UserCog />}
            title="No User Groups"
            description="Create a user group to manage and assign permissions to a group of users."
          />
        ) : (
          <Sheet>
            <Card className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((header) => {
                      return (
                        <TableHead
                          className="p-3 max-w-[150px] min-w-[150px]"
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
                    <TableRow key={"text" + index}>
                      <TableCell className="p-3 font-medium max-w-xs">
                        <ConditionalTooltip content={rowItem.name || ""}>
                          <SheetTrigger asChild>
                            <div
                              className="hover:underline cursor-pointer truncate"
                              onClick={() => handleViewUserGroup(rowItem)}
                            >
                              {rowItem.name}
                            </div>
                          </SheetTrigger>
                        </ConditionalTooltip>
                      </TableCell>

                      <TableCell className="p-3">
                        <ConditionalTooltip content={rowItem?.key || ""}>
                          <SheetTrigger asChild>
                            <Badge
                              variant="outline"
                              className="truncate inline-block max-w-[200px] 2xl:max-w-[280px]"
                            >
                              {rowItem?.key}
                            </Badge>
                          </SheetTrigger>
                        </ConditionalTooltip>
                      </TableCell>

                      <TableCell className="p-3 max-w-xs">
                        <ConditionalTooltip
                          content={rowItem?.description || ""}
                        >
                          <SheetTrigger asChild>
                            <div className="truncate max-w-[180px] 2xl:max-w-[260px]">
                              {rowItem?.description}
                            </div>
                          </SheetTrigger>
                        </ConditionalTooltip>
                      </TableCell>

                      <TableCell className="p-3 w-fit min-w-[180px]">
                        {helperFun.UTCToLocalTimezon(rowItem?.updated_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Sheet>
        )}
      </div>

      <AddEditUserGroup loadTableData={loadTableData} />
    </>
  );
}
