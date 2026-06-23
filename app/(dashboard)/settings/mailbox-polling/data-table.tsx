"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomAlertDialog from "@/components/custom-alert-dialog";
import DataTableLoader from "@/components/data-table-loader";
import { EmptyState } from "@/components/empty-state/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import {
  postActionStateSync,
  PostActionStateSyncAction,
} from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleEmailData } from "@/redux/settings/mailbox-polling/mailbox-data-slice";
import { handleUserEvents } from "@/redux/settings/mailbox-polling/mailbox-events-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import {
  CheckCircledIcon,
  CircleBackslashIcon,
  DotsHorizontalIcon,
  SymbolIcon,
} from "@radix-ui/react-icons";
import { MailIcon } from "lucide-react";
import * as React from "react";
import { useDispatch } from "react-redux";
import { getDefaultParams } from "../settings-filter-params";
import { AddEditMailboxPolling } from "./add-edit-mailbox-polling";

export interface mailboxPollingInterface {
  email_id: string;
  folder: string;
  frequency: number | undefined;
  description: string;
  data_store: {
    storage_type: string;
    storage_bucket: string;
    mount_path: string;
    storage_folder: string;
    storage_region: string;
  };
  polling_config: {
    pdf_parsing: string;
    copy_email_data: boolean;
    mailbox_priority: number | undefined;
    split_pdf_pages: boolean;
    notification_recipients: Array<string>;
    send_notifications: boolean;
    fix_page_rotation: boolean;
    data_parsing: boolean;
    ocr_parser: boolean;
  };
  status: string;
  id: string;
  delta_link: string;
  task_name: string;
  created_at?: string;
  updated_at?: string;
}

const baseColumns = [
  { header_name: "Email ID" },
  { header_name: "Folder" },
  { header_name: "Frequency" },
  { header_name: "Updated At" },
  { header_name: "Status" },
];

export function DataTable() {
  const params = getDefaultParams();
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const searchData = useAppSelector(
    (state) => state?.searchDataReducer?.value?.searchData,
  );
  const [cellData, setCellData] = React.useState<mailboxPollingInterface[]>([]);
  const [open, setOpen] = React.useState(false);
  const [isLoadings, setLoading] = React.useState(false);
  const [statusData, setStatusData] = React.useState<any>(null);
  const [mountPaths, setMountPaths] = React.useState<any>([]);

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const isCreateUpdatePolling = canEdit(permissions, "mailbox_pollings");

  const columns = isCreateUpdatePolling
    ? [...baseColumns, { header_name: "Action" }]
    : baseColumns;

  const getDetailsById = async (id: string) => {
    try {
      const response = await axiosAuth.get(`${url.LIST_MAILBOX_POLLING}/${id}`);
      if (response?.status === 200) {
        return response.data.mailbox_pollings[0];
      }
    } catch (error: any) {
      console.error(error);
      return null;
    }
  };

  //=============[Function:: Handle View Polling]====================================///
  const handleViewMailboxPolling = async (rowItem: mailboxPollingInterface) => {
    if (rowItem) {
      const data = await getDetailsById(rowItem.id);
      dispatch(handleSheetEvents(true));
      dispatch(handleUserEvents("viewMailboxPolling"));
      dispatch(handleEmailData(data));
    }
  };

  //=============[Function:: Get Mailbox Polling List Data]==========================///
  const getMailboxPollingData = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH;

      if (searchData !== "") {
        API_ENDPOINT_PATH = `${
          url.SEARCH_MAILBOX_POLLING
        }?keyword=${encodeURIComponent(searchData.trim())}`;
      } else {
        API_ENDPOINT_PATH = `${url.LIST_MAILBOX_POLLING}`;
      }
      try {
        setIsLoading(true);
        const response = await axiosAuth.get(API_ENDPOINT_PATH, { params });
        if (response?.status === 200) {
          setCellData(response.data.mailbox_pollings);
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

  const getMountPaths = async () => {
    if (!loading) {
      try {
        const result = await axiosAuth.get(url.AGENT_MOUNT_PATHS);
        setMountPaths(result.data?.storage_mount_points);
      } catch (error: any) {
        setMountPaths([]);
        console.error(error);
      }
    }
  };

  React.useEffect(() => {
    getMountPaths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  //=============[Function:: Update Mailbox Polling list whenever search by email]==========================///
  React.useEffect(() => {
    getMailboxPollingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, loading]);

  //=============[Function:: Loading Mailbox Polling List Details]==========================///
  const loadTableData = (
    data: mailboxPollingInterface,
    type: PostActionStateSyncAction,
    changes?: Record<string, any>,
  ) => {
    setCellData((prevData) =>
      postActionStateSync(prevData, data, type, changes),
    );
  };

  //=====================[Function:: Handle Stop Polling]======================///
  async function handleStartAndStopPolling(selectedOption: string) {
    if (statusData && statusData != null && statusData != "") {
      if (!loading) {
        if (statusData?.status != undefined) {
          let task_name = statusData?.task_name;
          try {
            setLoading(true);

            let body: any = {};
            let API_ENDPOINT_PATH = "";

            // Determine the endpoint and body based on current status and selected option
            if (statusData?.status == "RUNNING") {
              API_ENDPOINT_PATH =
                url.STOP_MAILBOX_POLLING + `/${task_name}/stop`;
            } else {
              API_ENDPOINT_PATH =
                url.START_MAILBOX_POLLING + `/${task_name}/start`;

              // Add polling_start_time
              if (selectedOption !== "Continue") {
                const now = new Date();
                let daysToSubtract = 0;

                switch (selectedOption) {
                  case "one":
                    daysToSubtract = 1;
                    break;
                  case "seven":
                    daysToSubtract = 7;
                    break;
                  case "fifteen":
                    daysToSubtract = 15;
                    break;
                }

                const pastDate = new Date(
                  now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000,
                );

                // Format as YYYY-MM-DDTHH:MM:SSZ
                body.polling_start_time =
                  pastDate.toISOString().split(".")[0] + "Z";
              }
            }

            const result = await axiosAuth.post(API_ENDPOINT_PATH, body);

            if (result?.status === 200) {
              if (statusData?.status == "RUNNING") {
                successMessageHandler(messages.stop_polling_successfully);
                loadTableData(statusData, "update", {
                  status: "STOPPED",
                });
              } else {
                successMessageHandler(messages.start_polling_successfully);
                const updatedItem = result.data;
                loadTableData(updatedItem, "update");
              }
              setOpen(false);
              setLoading(false);
              setStatusData(null);
            } else {
              console.log("error");
              setLoading(false);
              errorMessageHandler(result);
            }
          } catch (error: any) {
            console.error(error);
            setLoading(false);
            errorMessageHandler(error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    }
  }

  //=====================[Function: Open Dialog]=================================///
  const setOpenDialog = (rowItem: any) => {
    setOpen(true);
    setStatusData(rowItem);
  };

  // api fetching
  if (loading || isLoading) {
    return <DataTableLoader />;
  }

  return (
    <>
      <div className="space-y-4 pb-8">
        {!cellData?.length ? (
          <EmptyState
            variant="inline"
            icon={<MailIcon />}
            title="No Mailbox Polling Configured"
            description="Start monitoring your mailboxes by setting up automatic email polling. Connect your email accounts and configure polling intervals to stay on top of incoming messages."
          />
        ) : (
          <Sheet>
            <Card className="shadow-none p-0 gap-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((header, index) => (
                      <TableHead className="p-3" key={index}>
                        {header.header_name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {cellData.map((rowItem, index) => (
                    <TableRow key={"text" + index}>
                      <TableCell className="p-3 font-medium min-w-[180px] max-w-[260px]">
                        <ConditionalTooltip
                          content={rowItem?.email_id.toLowerCase() || ""}
                        >
                          <SheetTrigger asChild>
                            <div
                              className="hover:underline cursor-pointer max-w-[180px] 2xl:max-w-[260px] truncate"
                              onClick={() => {
                                handleViewMailboxPolling(rowItem);
                              }}
                            >
                              {rowItem?.email_id.toLowerCase()}
                            </div>
                          </SheetTrigger>
                        </ConditionalTooltip>
                      </TableCell>

                      <TableCell className="p-3 w-fit max-w-[100px] min-w-[100px]">
                        {rowItem?.folder}
                      </TableCell>

                      <TableCell className="p-3 w-fit max-w-[100px] min-w-[100px]">
                        {rowItem?.frequency} sec
                      </TableCell>

                      <TableCell className="p-3 max-w-[240px]">
                        <span>
                          {helperFun.UTCToLocalTimezon(rowItem?.updated_at)}
                        </span>
                      </TableCell>

                      <TableCell className="p-3 max-w-[160px]">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                              rowItem?.status === "RUNNING"
                                ? "border-green-500 text-green-600 bg-green-50"
                                : rowItem?.status === "STOPPED"
                                  ? "border-red-500 text-red-600 bg-red-50"
                                  : rowItem?.status === "CREATED"
                                    ? "border-blue-500 text-blue-600 bg-blue-50"
                                    : "border-muted text-muted-foreground"
                            }`}
                          >
                            {rowItem?.status === "STOPPED" && (
                              <CircleBackslashIcon className="h-4 w-4" />
                            )}
                            {rowItem?.status === "RUNNING" && (
                              <SymbolIcon className="h-4 w-4" />
                            )}
                            {rowItem?.status === "CREATED" && (
                              <CheckCircledIcon className="h-4 w-4" />
                            )}
                            {rowItem?.status}
                          </span>
                        </div>
                      </TableCell>

                      {isCreateUpdatePolling && (
                        <TableCell className="p-3 max-w-[50px] min-w-[50px]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
                              >
                                <DotsHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="w-[160px]"
                            >
                              {(rowItem?.status === "STOPPED" ||
                                rowItem?.status === "CREATED") && (
                                <DropdownMenuItem
                                  onClick={() => setOpenDialog(rowItem)}
                                >
                                  Start Polling
                                </DropdownMenuItem>
                              )}

                              {rowItem?.status === "RUNNING" && (
                                <DropdownMenuItem
                                  onClick={() => setOpenDialog(rowItem)}
                                >
                                  Stop Polling
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Sheet>
        )}
      </div>

      <AddEditMailboxPolling
        mountPaths={mountPaths}
        loadTableData={loadTableData}
        isCreateUpdatePolling={isCreateUpdatePolling}
      />

      <CustomAlertDialog
        open={open}
        onOpenChange={setOpen}
        handleAlert={handleStartAndStopPolling}
        isLoading={isLoadings}
        title={
          statusData?.status === "RUNNING"
            ? "Stop polling this mailbox"
            : "Start polling this mailbox"
        }
        description={
          statusData?.status === "RUNNING"
            ? "This action will stop mailbox polling and no new emails will be fetched."
            : "This action will start mailbox polling and fetch emails periodically."
        }
        isMailboxStart={statusData?.status !== "RUNNING"}
      />
    </>
  );
}
