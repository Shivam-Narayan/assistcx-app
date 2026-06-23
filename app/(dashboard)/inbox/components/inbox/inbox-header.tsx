import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  convertToUnixTimestamp,
  downloadBase64File,
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import { RootState } from "@/redux/store";
import { SymbolIcon } from "@radix-ui/react-icons";
import { ChevronDown, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useEmailData } from "../../hooks/useEmailData";
import { InboxSearchFilter } from "./inbox-search-filter";

interface InboxHeaderProps {
  emailIds: string[];
  checkList: string[];
  hasActiveFilters: any;
  setChecklist: any;
  totalEmails: number;
}

export function InboxHeader({
  emailIds,
  checkList,
  hasActiveFilters,
  setChecklist,
  totalEmails,
}: InboxHeaderProps) {
  const { axiosAuth, loading } = useAxiosAuth();
  const [exporting, setExporting] = useState<null | "emails" | "tasks">(null);
  const { refreshEmailList } = useEmailData();
  const permissions = useSelector(
    (state: RootState) =>
      state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const canEditInbox = canEdit(permissions, "task_inbox");
  const filters = useSelector(
    (state: RootState) => state.inboxFiltersReducer.filters,
  );
  const { currentPage: page } = useSelector(
    (state: RootState) => state.inboxEmailReducer,
  );
  const searchText = useSelector(
    (state: RootState) => state?.searchReducer?.searchText,
  );
  const sortBy = "created_at";
  const sortOrder = "desc";

  const filtersObj = useMemo(() => {
    const obj: Record<string, any> = {};
    if (filters?.status?.length) {
      obj.status = filters.status;
    }
    if (filters.mailbox?.length) {
      obj.mailbox_email = filters.mailbox;
    }
    if (filters.tags?.length) {
      obj.tags = filters.tags;
    }

    if (filters.agent?.length) {
      obj.agent = filters.agent;
    }
    return obj;
  }, [filters]);

  const handleExport = async (type: "emails" | "tasks") => {
    if (loading || exporting) return;
    if (!emailIds.length) return;
    setExporting(type);
    try {
      let query: any = {
        page,
        page_size: totalEmails,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (Object.keys(filtersObj).length > 0) {
        query.filters = JSON.stringify(filtersObj);
      }

      if (filters.date_range) {
        query.from_date = convertToUnixTimestamp(
          filters.date_range.from,
          "start",
        );
        query.to_date = convertToUnixTimestamp(filters.date_range.to, "end");
      }
      if (searchText?.trim()) {
        query.keyword = searchText.trim();
      }
      const queryString = new URLSearchParams(query).toString();
      const endpoint =
        type === "emails" ? url.EMAILS_EXPORT : url.AGENT_TASK_EXPORT;
      const result = await axiosAuth.post(endpoint + `?${queryString}`);
      if (result.status === 200) {
        downloadBase64File(
          result.data.content,
          result.data.file_name,
          result.data.mime_type,
        );
        successMessageHandler(
          type === "emails"
            ? "Emails exported successfully"
            : "Tasks exported successfully",
        );
      }
    } catch (error) {
      console.error(error);
      errorMessageHandler(error);
    } finally {
      setExporting(null);
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInboxRefresh = () => {
    setIsLoading(true);
    try {
      refreshEmailList(page);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleExportEmails = () => handleExport("emails");
  const handleExportTasks = () => handleExport("tasks");

  return (
    <div
      className={`sticky top-0 z-10 border-b px-6 py-3.5 flex items-center justify-between`}
    >
      <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight">
        Task Inbox
      </h2>
      <div className="flex items-center gap-3">
        {hasActiveFilters && canEditInbox ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 py-1.5 border-muted-foreground/40 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleExportEmails}
                disabled={!!exporting}
                className="cursor-pointer"
              >
                {exporting === "emails"
                  ? "Exporting Emails..."
                  : "Export Emails"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportTasks}
                disabled={!!exporting}
                className="cursor-pointer"
              >
                {exporting === "tasks" ? "Exporting Tasks..." : "Export Tasks"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <InboxSearchFilter setChecklist={setChecklist} />
        <ConditionalTooltip
          content="Refresh"
          alwaysShow={true}
          align="center"
          showArrow={true}
        >
          <Button
            onClick={() => handleInboxRefresh()}
            variant="outline"
            className="gap-2 py-1.5 border border-muted-foreground/40 cursor-pointer"
          >
            <SymbolIcon
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </ConditionalTooltip>
      </div>
    </div>
  );
}
