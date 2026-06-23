"use client";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import DataTableLoader from "@/components/data-table-loader";
import { EmptyState } from "@/components/empty-state/empty-state";
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
import {
  getCardHeaderTitle,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import {
  postActionStateSync,
  PostActionStateSyncAction,
} from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleTeamMembersEvents } from "@/redux/settings/team-members/team-members-event-slice";
import { handleTeamMembersData } from "@/redux/settings/team-members/team-members-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { Users } from "lucide-react";
import * as React from "react";
import { useDispatch } from "react-redux";
import { getDefaultParams } from "../../settings-filter-params";
import { AddEditTeamMebers } from "./add-edit-team-members";
import { columns } from "./columns";

export interface cellObject {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at?: string;
  account_status: string;
  last_login: string;
  role_id: string;
  data_access?: any;
  role_key: any;
}

export function DataTable({
  isCreateUpdateUser,
}: {
  isCreateUpdateUser: boolean;
}) {
  const params = getDefaultParams();
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const dispatch = useDispatch<AppDispatch>();
  const searchData = useAppSelector(
    (state) => state?.searchDataReducer?.value?.searchData,
  );
  const [cellData, setCellData] = React.useState<cellObject[]>([]);

  const handleViewTeamMember = (rowItem: cellObject) => {
    if (rowItem) {
      dispatch(handleSheetEvents(true));
      dispatch(handleTeamMembersEvents("viewTeamMember"));
      dispatch(handleTeamMembersData(rowItem));
    }
  };

  const getTeamMembersData = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";
      if (searchData != "") {
        // API_ENDPOINT_PATH = url.SEARCH_TEAM_MEMBERS +'?page='+pageNo+'&page_size='+pageSize+'&sort_by='+sortBy+'&sort_order='+sortOrder+'&keyword='+searchData.trim()
        API_ENDPOINT_PATH =
          url.SEARCH_TEAM_MEMBERS + "?keyword=" + searchData.trim();
      } else {
        // API_ENDPOINT_PATH = url.LIST_TEAM_MEMBERS +'?page='+pageNo+'&page_size='+pageSize+'&sort_by='+sortBy+'&sort_order='+sortOrder
        API_ENDPOINT_PATH = url.LIST_TEAM_MEMBERS;
      }

      try {
        setIsLoading(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH, { params });
        if (result?.status === 200) {
          setCellData(result?.data.users);
        } else {
          console.log("error");
          return;
        }
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    getTeamMembersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, loading]);

  const loadTableData = (
    data: cellObject,
    type: PostActionStateSyncAction,
    changes?: Record<string, any>,
  ) => {
    setCellData((prevData) =>
      postActionStateSync(prevData, data, type, changes),
    );
  };

  if (loading || isLoading) {
    return <DataTableLoader />;
  }

  return (
    <>
      <div className="space-y-4 pb-8">
        {!cellData?.length ? (
          <EmptyState
            variant="inline"
            icon={<Users />}
            title="No Users Found"
            description="Start by adding users to collaborate and assign roles with specific permissions."
          />
        ) : (
          <Sheet>
            <Card className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((header, index) => {
                      return (
                        <TableHead className="p-3" key={index}>
                          {header}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cellData?.map((rowItem, index) => (
                    <TableRow key={"text" + index}>
                      {/* Name */}
                      <TableCell className="p-3 font-medium w-fit min-w-[140px] max-w-[200px] 2xl:max-w-[260px]">
                        <ConditionalTooltip
                          content={
                            rowItem?.first_name && rowItem?.last_name
                              ? `${rowItem.first_name} ${rowItem.last_name}`
                              : "N/A"
                          }
                        >
                          <SheetTrigger asChild>
                            <span
                              className="hover:underline cursor-pointer truncate inline-block max-w-[200px] 2xl:max-w-[260px]"
                              onClick={() => handleViewTeamMember(rowItem)}
                            >
                              {rowItem?.first_name && rowItem?.last_name
                                ? `${rowItem.first_name} ${rowItem.last_name}`
                                : "N/A"}
                            </span>
                          </SheetTrigger>
                        </ConditionalTooltip>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="p-3 text-sm">
                        <ConditionalTooltip
                          content={rowItem?.email?.toLowerCase() || ""}
                        >
                          <SheetTrigger asChild>
                            <span className="truncate inline-block w-fit max-w-[180px] 2xl:max-w-[260px] cursor-default">
                              {rowItem?.email?.toLowerCase()}
                            </span>
                          </SheetTrigger>
                        </ConditionalTooltip>
                      </TableCell>

                      {/* Role */}
                      <TableCell className="p-3 max-w-[120px] md:min-w-[150px]">
                        <Badge variant="outline" className="text-sm">
                          {getCardHeaderTitle(rowItem?.role_key)}
                        </Badge>
                      </TableCell>

                      {/* Last Login */}
                      <TableCell className="p-3 w-fit min-w-[180px] 2xl:max-w-[260px]">
                        {rowItem?.last_login
                          ? UTCToLocalTimezon(rowItem?.last_login)
                          : null}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="p-3 max-w-[120px] min-w-[120px]">
                        {rowItem?.account_status === "active" ? (
                          <Badge variant="secondary" className="text-sm">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-sm">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Sheet>
        )}
      </div>

      <AddEditTeamMebers
        loadTableData={loadTableData}
        isCreateUpdateUser={isCreateUpdateUser}
      />
    </>
  );
}
