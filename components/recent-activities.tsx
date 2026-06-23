import DataTableLoader from "@/components/data-table-loader";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStatusColor } from "@/helper/helper-function";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { JumpingLoadingAnimation } from "./JumpingLoadingAnimation";
import { Badge } from "./ui/badge";
import moment from "moment";

export const columns = [
  {
    header_name: "Sender",
  },
  {
    header_name: "Mailbox",
  },
  {
    header_name: "Subject",
  },
  {
    header_name: "Created At",
  },
  {
    header_name: "Status",
  },
];

interface recentActivityData {
  // sender_email: string;
  mailbox_email: string;
  subject: string;
  intent_class: string;
  created_at: string;
  status: string;
  received_at: string;
  email_id: string;
}

interface RecentActivityProps {
  recentActivityDetails: recentActivityData[];
  isRecentActivityLoading: boolean;
}

export function RecentActivities({
  recentActivityDetails,
  isRecentActivityLoading,
}: RecentActivityProps) {
  return (
    <>
      <CardHeader className="flex space-y-1.5 p-6 border-b py-5 ">
        <CardTitle className="w-full flex justify-between items-center text-xl font-semibold leading-none tracking-tight">
          <span>Recent Emails</span>
          <Link
            className="flex items-center gap-2 text-base font-medium hover:underline text-primary"
            href="/inbox"
          >
            <span>View All</span>
            <ArrowRight className="h-5 w-5 text-primary" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((header) => {
                  return (
                    <TableHead className="p-3" key={header.header_name}>
                      {header.header_name}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivityDetails?.length !== 0 ? (
                recentActivityDetails?.map((rowItem, index) => (
                  <TableRow key={"text" + index}>
                    <TableCell className="p-3 font-medium truncate max-w-[200px]">
                      {rowItem?.email_id}
                    </TableCell>
                    <TableCell className="p-3 truncate max-w-[200px]">
                      {rowItem?.mailbox_email}
                    </TableCell>
                    <TableCell className="p-3 ">
                      <div className="max-w-[300px] w-fit truncate">
                        {rowItem?.subject}
                      </div>
                    </TableCell>
                    <TableCell className="p-3 min-w-[200px]">
                      {rowItem?.created_at}
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(
                            rowItem?.status
                          )}`}
                        >
                          {(rowItem?.status === "QUEUED" ||
                            rowItem?.status === "EXECUTING") && (
                            <JumpingLoadingAnimation
                              className="w-3 h-3"
                              color={
                                rowItem?.status === "QUEUED"
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                              }
                            />
                          )}
                          <span>
                            {rowItem?.status
                              ? rowItem.status.charAt(0).toUpperCase() +
                                rowItem.status.slice(1).toLowerCase()
                              : "NA"}
                          </span>
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {isRecentActivityLoading ? (
                      <DataTableLoader />
                    ) : recentActivityDetails?.length == 0 ? (
                      "No Result"
                    ) : null}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </>
  );
}
