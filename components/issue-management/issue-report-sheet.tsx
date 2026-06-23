import HeaderHoverCard from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { Loader2, Plus, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { AddIssueModal } from "./add-issue-modal";
import { IssueCard, type ExtendedIssue } from "./issue-card";
import { IssueDetailSheet } from "./issue-detail-sheet";
import { EmptyState } from "../empty-state/empty-state";

interface IssueReportSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAllowedAddIssue: boolean;
  emailData?: any;
  isAllowedAddingIssue?: boolean;
  deleteIssuesPermission?: boolean;
}

export const IssueReportSheet = ({
  isOpen,
  onOpenChange,
  emailData,
  isAllowedAddIssue = true,
  isAllowedAddingIssue,
  deleteIssuesPermission,
}: IssueReportSheetProps) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [issuesDetailsLoading, setIssuesDetailsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);
  const [issuesDetails, setIssuesDetails] = useState<any>(null);
  const [issuesList, setIssuesList] = useState<ExtendedIssue[]>([]);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "resolved" | null>(
    null,
  );
  const [isAddIssueModalOpen, setIsAddIssueModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ExtendedIssue | null>(
    null,
  );
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 300);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [editIssue, setEditIssue] = useState<ExtendedIssue | null>(null);

  const queryParams = {
    pageSize: 10,
    sortBy: "updated_at",
    sortOrder: "desc",
  };

  const handleOpenIssueDetail = (issue: ExtendedIssue) => {
    setSelectedIssue(issue);
    setIsDetailSheetOpen(true);
  };

  const handleCloseIssueDetail = () => {
    setSelectedIssue(null);
  };

  const getIssuesApiPath = (data: any, encodedFilters: string) => {
    //  api end points for agent task
    if (data?.email_data_id) {
      return `/agent-tasks/${data.id}/issues?filters=${encodedFilters}`;
    }

    // api end points this is emails
    return `/emails/${data.id}/issues?filters=${encodedFilters}`;
  };

  const getIssueList = async (keywords?: string, pageNumber = 1) => {
    if (!emailData?.id || !activeTab || isFetchingMore) return;

    const filters = {
      status: activeTab,
    };
    const encodedFilters = encodeURIComponent(JSON.stringify(filters));
    pageNumber === 1 ? setIsLoading(true) : setIsFetchingMore(true);
    try {
      const basePath = getIssuesApiPath(emailData, encodedFilters);
      const keywordQuery = keywords?.trim()
        ? `&keyword=${encodeURIComponent(keywords.trim())}`
        : "";

      const API_ENDPOINT_PATH = `
      ${basePath}
      ${keywordQuery}
      &page=${pageNumber}
      &page_size=${queryParams.pageSize}
      &sort_by=${queryParams.sortBy}
      &sort_order=${queryParams.sortOrder}
    `.replace(/\s+/g, "");
      const result = await axiosAuth.get(API_ENDPOINT_PATH);
      if (result.status === 200) {
        const newIssues = result.data || [];

        setIssuesList((prev) =>
          pageNumber === 1 ? newIssues : [...prev, ...newIssues],
        );

        setHasMore(newIssues.length === queryParams.pageSize);
        setPage(pageNumber);
      }
    } catch (error) {
      errorMessageHandler("Failed to fetch issues");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!activeTab) return;
    if (!emailData?.id || loading) return;

    getIssueList(debouncedSearch, 1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, emailData?.id, activeTab, loading]);

  const refreshIssues = () => {
    getIssueList();
  };

  const getIssueDetailsData = async (
    issueId: string,
    showLoader: boolean = true,
  ) => {
    if (!issueId || loading) return;
    if (showLoader) {
      setIssuesDetailsLoading(true);
    }
    try {
      const result = await axiosAuth.get(`/issues/${issueId}`);
      if (result.status === 200) {
        setIssuesDetails(result.data);
      }
    } catch (error) {
      errorMessageHandler("Failed to fetch issue details");
    } finally {
      if (showLoader) {
        setIssuesDetailsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isDetailSheetOpen) {
      setIssuesDetails(null);
      return;
    }

    if (selectedIssue?.id) {
      getIssueDetailsData(selectedIssue.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailSheetOpen]);

  const addCommentToIssue = async (comment: string) => {
    if (!selectedIssue?.id || loading) return;
    const payload = {
      comment,
      issue_id: selectedIssue.id,
    };
    setCommentsLoading(true);
    try {
      const result = await axiosAuth.post("/comments", payload);
      if (result.status === 200) {
        successMessageHandler("Comment added successfully");
      }
      await getIssueDetailsData(selectedIssue.id, false);
    } catch (error) {
      errorMessageHandler("Failed to add comment");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleEditComment = async (
    commentId: string,
    updatedComment: string,
  ) => {
    if (!selectedIssue?.id || loading) return;
    try {
      const result = await axiosAuth.patch(`/comments/${commentId}`, {
        comment: updatedComment,
      });
      if (result.status === 200) {
        successMessageHandler("Comment Updated successfully");
      }
      await getIssueDetailsData(selectedIssue.id, false);
    } catch (error: any) {
      errorMessageHandler(
        error?.response?.data?.message || "Failed to edit comment",
      );
    }
  };

  const handleToggleIssueStatus = async (
    issueId: string,
    newStatus: "ACTIVE" | "resolved",
    reason: string,
  ) => {
    const payload = {
      status: newStatus,
      reason,
    };

    try {
      const result = await axiosAuth.put(
        `/issues/${issueId}/progress`,
        payload,
      );

      if (result.status === 200) {
        successMessageHandler("Issue status updated successfully");
        setIsDetailSheetOpen(false);
        setIssuesList((prev) => prev.filter((issue) => issue.id !== issueId));
      }
    } catch (error: any) {
      errorMessageHandler(
        error.response.data.detail || "Failed to update issue status",
      );
    }
  };
  const handleDeleteIssue = async (issueId: string) => {
    if (!issueId) return;
    setIsDeleteLoading(true);
    try {
      const result = await axiosAuth.delete(`/issues/${issueId}`);
      if (result.status === 200) {
        successMessageHandler(result.data.message);
        setIssuesList((prev) => prev.filter((i) => i.id !== issueId));
        setIsDetailSheetOpen(false);
      }
    } catch (error: any) {
      errorMessageHandler(error.response?.data?.detail);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedIssue?.id || loading) return;
    setDeleteCommentLoading(true);
    try {
      const result = await axiosAuth.delete(`/comments/${commentId}`);
      if (result.status === 200) {
        successMessageHandler("Comment deleted successfully");
      }
      await getIssueDetailsData(selectedIssue.id, false);
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setDeleteCommentLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab("ACTIVE");
    } else {
      setActiveTab(null);
      setIssuesList([]);
      setPage(1);
      setHasMore(true);
    }
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (
      scrollHeight - scrollTop <= clientHeight + 100 &&
      hasMore &&
      !isFetchingMore
    ) {
      getIssueList(debouncedSearch, page + 1);
    }
  };

  const handleEditIssue = (issue: ExtendedIssue) => {
    setEditIssue(issue);
    setIsAddIssueModalOpen(true);
  };

  const handleCloseAddModal = (open: boolean) => {
    setIsAddIssueModalOpen(open);
    if (!open) setEditIssue(null);
  };
  const refreshIssueDetails = async (issueId: string) => {
    await getIssueDetailsData(issueId, false);
  };
  const canAddIssue =
    isAllowedAddIssue && isAllowedAddingIssue && activeTab === "ACTIVE";

  const tabLabel =
    activeTab === "ACTIVE"
      ? "Active"
      : activeTab === "resolved"
        ? "Resolved"
        : "";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto bg-white dark:bg-black">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b border-gray-300 dark:border-gray-700 space-y-0 bg-white dark:bg-black">
          <div className="w-full flex justify-start items-center gap-4">
            <SheetTitle className="sr-only">Issues</SheetTitle>
            <HeaderHoverCard
              title="Issues"
              message={`View and manage issues related to this ${
                isAllowedAddIssue ? "task" : "email"
              }`}
              type="sheet"
            />
            <Tabs
              value={activeTab ?? undefined}
              onValueChange={(value) =>
                setActiveTab(value as "ACTIVE" | "resolved")
              }
            >
              <TabsList className="h-8">
                <TabsTrigger
                  value="ACTIVE"
                  className="px-4 cursor-pointer text-xs"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="resolved"
                  className="px-4 cursor-pointer text-xs"
                >
                  Resolved
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-3">
            {canAddIssue && (
              <Button
                size="sm"
                className="h-8 gap-1.5 cursor-pointer"
                onClick={() => {
                  setEditIssue(null);
                  setIsAddIssueModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Add Issue
              </Button>
            )}
            <SheetClose asChild>
              <div
                className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </div>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="grow overflow-y-auto px-4 pb-4" onScroll={handleScroll}>
          {/* search bar */}
          {/* <div className="relative flex items-center justify-between mb-4 -mt-[15px] ">
            <div className="flex flex-1 items-center">
              <Search
                placeholder="Search..."
                className="h-10 w-full pr-10"
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
              />
              {searchText && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchText("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div> */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Loading issues...</span>
              </div>
            </div>
          ) : issuesList?.length === 0 ? (
            <EmptyState
              variant="inline"
              icon={<ShieldAlert className="w-6 h-6 text-gray-400" />}
              title="No Issues"
              description="There are no issues at the moment. Create a new issue to track problems."
              removeOuterPadding
            />
          ) : (
            <div className="space-y-3">
              {issuesList.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onViewDetails={handleOpenIssueDetail}
                />
              ))}

              {isFetchingMore && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>

      {/* Add Issue Modal */}
      <AddIssueModal
        isOpen={isAddIssueModalOpen}
        onOpenChange={handleCloseAddModal}
        emailData={emailData}
        refreshIssues={refreshIssues}
        editIssue={editIssue}
        refreshIssueDetails={refreshIssueDetails}
        existingIssuesList={issuesList}
      />

      {/* Issue Detail Sheet */}
      <IssueDetailSheet
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        onClose={handleCloseIssueDetail}
        issuesDetailsLoading={issuesDetailsLoading}
        data={issuesDetails}
        onAddComment={addCommentToIssue}
        commentsLoading={commentsLoading}
        onToggleStatus={handleToggleIssueStatus}
        onDeleteIssue={handleDeleteIssue}
        deleteCommentLoading={deleteCommentLoading}
        isDeleteLoading={isDeleteLoading}
        ondeleteComment={handleDeleteComment}
        deleteIssuesPermission={deleteIssuesPermission}
        onEditIssue={handleEditIssue}
        isAllowedAddingIssue={isAllowedAddingIssue}
        onEditComment={handleEditComment}
      />
    </Sheet>
  );
};

export default IssueReportSheet;
