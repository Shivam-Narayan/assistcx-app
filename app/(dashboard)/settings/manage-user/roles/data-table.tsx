"use client";

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
import { UTCToLocalTimezon } from "@/helper/helper-function";
import {
  postActionStateSync,
  PostActionStateSyncAction,
} from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleRolesEvents } from "@/redux/settings/roles/role-event-slice";
import {
  handleRolesData,
  RolePermissionsPayload,
} from "@/redux/settings/roles/roles-data-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { Briefcase } from "lucide-react";
import * as React from "react";
import { useDispatch } from "react-redux";
import { getDefaultParams } from "../../settings-filter-params";
import { AddEditViewRoles } from "./add-edit-view-roles";
import { columns } from "./columns";

export interface cellObject {
  id?: string;
  name?: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  default_role: boolean;
  role_key: string;
  role_permissions?: RolePermissionsPayload;
}

export function DataTable() {
  const params = getDefaultParams();
  const { axiosAuth, loading } = useAxiosAuth(); // User Session
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const dispatch = useDispatch<AppDispatch>();
  const searchData = useAppSelector(
    (state) => state?.searchDataReducer?.value?.searchData,
  );
  const [cellData, setCellData] = React.useState<cellObject[]>([]);
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const isCreateUpdateRole = canEdit(permissions, "user_management");

  const getTeamMembersData = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";
      if (searchData != "") {
        API_ENDPOINT_PATH =
          url.GET_ROLES_SEARCH + "?keyword=" + searchData.trim();
      } else {
        API_ENDPOINT_PATH = url.USER_ROLES;
      }

      try {
        setIsLoading(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH, { params });
        if (result?.status === 200) {
          setCellData(result?.data?.user_roles);
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

  const loadTableData = (data: cellObject, type: PostActionStateSyncAction) => {
    setCellData(
      (prevData) =>
        postActionStateSync(
          prevData as any,
          data as any,
          type,
        ) as cellObject[],
    );
  };

  //===============[Function::: View Roles List details]===============================//
  const handleViewRoles = (rowItem: cellObject) => {
    if (rowItem) {
      dispatch(handleSheetEvents(true));
      dispatch(handleRolesEvents("viewRoles"));
      dispatch(handleRolesData(rowItem));
    }
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
            icon={<Briefcase />}
            title="No Roles Configured"
            description="Create a role to manage and assign permissions to users."
          />
        ) : (
          <Sheet>
            <Card className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((header, index) => {
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
                      <TableCell className="p-3 max-w-[180px]">
                        <SheetTrigger asChild>
                          <div
                            className="hover:underline cursor-pointer"
                            onClick={() => {
                              handleViewRoles(rowItem);
                            }}
                          >
                            {rowItem?.name}
                          </div>
                        </SheetTrigger>
                      </TableCell>
                      {/* <TableCell className="p-3 max-w-[440px] min-w-[260px] truncate font-medium">{rowItem?.description}</TableCell> */}
                      <TableCell className="p-3 max-w-[180px]">
                        {UTCToLocalTimezon(rowItem?.created_at)}
                      </TableCell>
                      <TableCell className="p-3 max-w-[180px]">
                        {UTCToLocalTimezon(rowItem?.updated_at)}
                      </TableCell>
                      <TableCell className="p-3 max-w-[180px]">
                        <Badge variant="secondary">
                          {rowItem?.default_role ? "Default" : "Custom"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Sheet>
        )}
      </div>

      <AddEditViewRoles
        loadTableData={loadTableData}
        isCreateUpdateRole={isCreateUpdateRole}
      />
    </>
  );
}
