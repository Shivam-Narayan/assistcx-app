import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import DataTableLoader from "@/components/data-table-loader";
import AddIssueModal from "@/components/issue-management/add-issue-modal";
import IssueActionConfirmationModal from "@/components/issue-management/issue-action-confirmation-modal";
import IssueDetailSheet from "@/components/issue-management/issue-detail-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserAvatar from "@/components/user-avatar";
import {
  errorMessageHandler,
  getTagsFromIdsOrNames,
  successMessageHandler,
  useCopyToClipboard,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canDelete, canEdit } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  Check,
  CircleCheck,
  Link,
  Loader2,
  Pencil,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { columns } from "./columns";
import { EmptyState } from "@/components/empty-state/empty-state";

interface TableProps {
  issuesList: any[];
  allTagsList: any[];
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMoreIssues: () => void;
  isLoading: boolean;
  updateIssueInList: (issueId: string) => void;
  refreshIssuesList: () => void;
}

const IssuesDataTable = ({
  issuesList,
  allTagsList,
  hasMore,
  isFetchingMore,
  loadMoreIssues,
  isLoading,
  updateIssueInList,
  refreshIssuesList,
}: TableProps) => {
  const { axiosAuth, loading } = useAxiosAuth();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [loadingIssue, setLoadingIssue] = useState<boolean>(false);
  const [actionType, setActionType] = useState<"resolved" | "ACTIVE" | null>(
    null,
  );
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [issuesDetailsLoading, setIssuesDetailsLoading] = useState(false);
  const [issuesDetails, setIssuesDetails] = useState<any>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);
  const [deletemodalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isAddIssueModalOpen, setIsAddIssueModalOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<any>(null);
  const [editSource, setEditSource] = useState<"table" | "detail" | null>(null);
  const [isCopied, copyToClipboard] = useCopyToClipboard(1500);

  const handleCopyIssueLink = async (issueId: string) => {
    const issueLink = `${window.location.href}/${issueId}`;
    await copyToClipboard(issueLink);
  };

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const deleteIssuesPermission = canDelete(permissions, "task_issues");

  const isAllowedAddingIssue = canEdit(permissions, "task_issues");

  const handleResolved = (data: any) => {
    setSelectedIssue(data);
    setActionType("resolved");
    setIsActionModalOpen(true);
  };

  const handleReopen = (data: any) => {
    setSelectedIssue(data);
    setActionType("ACTIVE");
    setIsActionModalOpen(true);
  };

  const handleDeleteIssue = (issue: any) => {
    setSelectedIssue(issue);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (issueId: string) => {
    if (!issueId) return;

    setIsDeleteLoading(true);
    try {
      const result = await axiosAuth.delete(`/issues/${issueId}`);
      if (result.status === 200) {
        successMessageHandler(result.data.message);
        updateIssueInList(issueId);
        setDeleteModalOpen(false);
        setSelectedIssue(null);
        setIsDetailSheetOpen(false);
      }
    } catch (error: any) {
      errorMessageHandler(
        error.response?.data?.detail || "Failed to delete issue",
      );
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleConfirmAction = async (reason: string) => {
    if (!selectedIssue?.id || !actionType) return;
    setLoadingIssue(true);

    await updateIssueStatus({
      issueId: selectedIssue.id,
      status: actionType,
      reason,
      onSuccess: () => {
        setIsActionModalOpen(false);
        setSelectedIssue(null);
        setActionType(null);
      },
    });

    setLoadingIssue(false);
  };

  const getIssueStatus = (progress: any[] = []) => {
    if (!progress.length) return "ACTIVE";
    return progress[progress.length - 1].status;
  };
  useEffect(() => {
    if (isLoading || !hasMore || isFetchingMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadMoreIssues();
      }
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, hasMore, isFetchingMore]);

  const handleCloseIssueDetail = () => {
    setSelectedIssue(null);
    setIsDetailSheetOpen(false);
  };

  const onViewDetails = (issue: any) => {
    setSelectedIssue(issue);
    setIsDetailSheetOpen(true);
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
    } catch (error: any) {
      errorMessageHandler(
        error.response.data.detail || "Failed to fetch issue details",
      );
    } finally {
      if (showLoader) {
        setIssuesDetailsLoading(false);
      }
    }
  };

  const addCommentToIssue = async (comment: string) => {
    if (!selectedIssue?.id || loading) return;
    const payload = {
      comment,
      issue_id: selectedIssue.id,
    };
    setCommentsLoading(true);
    try {
      const result = await axiosAuth.post("/comments", payload);
      if (result.status === 201) {
        successMessageHandler("Comment added successfully");
      }
      await getIssueDetailsData(selectedIssue.id, false);
    } catch (error: any) {
      errorMessageHandler(
        error.response.data.detail || "Failed to add comment",
      );
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
  const handleToggleIssueStatus = async (
    issueId: string,
    newStatus: "ACTIVE" | "resolved",
    reason: string,
  ) => {
    await updateIssueStatus({
      issueId,
      status: newStatus,
      reason,
      onSuccess: () => {
        setIsDetailSheetOpen(false);
      },
    });
  };

  const updateIssueStatus = async ({
    issueId,
    status,
    reason,
    onSuccess,
  }: {
    issueId: string;
    status: "ACTIVE" | "resolved";
    reason: string;
    onSuccess?: () => void;
  }) => {
    const payload = {
      status,
      reason,
    };

    try {
      const result = await axiosAuth.put(
        `/issues/${issueId}/progress`,
        payload,
      );
      if (result.status === 200 || result.status === 201) {
        successMessageHandler("Issue status updated successfully");
        updateIssueInList(issueId);
        onSuccess?.();
      }
    } catch (error: any) {
      errorMessageHandler(
        error.response.data.detail || "Failed to update issue status",
      );
    }
  };

  useEffect(() => {
    if (isDetailSheetOpen && selectedIssue?.id) {
      getIssueDetailsData(selectedIssue.id);
    }

    if (!isDetailSheetOpen) {
      setIssuesDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailSheetOpen, selectedIssue?.id]);

  const handleEditIssue = (issue: any) => {
    setEditIssue(issue);
    setIsAddIssueModalOpen(true);
    setEditSource("table");
  };

  if (loading || isLoading) {
    return <DataTableLoader />;
  }

  if (issuesList.length === 0 && !isLoading && !isFetchingMore) {
    return (
      <EmptyState
        variant="fullpage"
        title="No Issues Found"
        description="No issues have been reported for the selected task."
        icon={ShieldAlert}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-0 gap-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((header, index) => (
                <TableHead className="p-3" key={index}>
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {issuesList.map((rowItem: any) => {
              const status = getIssueStatus(rowItem.progress);
              const tags = getTagsFromIdsOrNames(rowItem.tag_ids, allTagsList);

              return (
                <TableRow key={rowItem.id}>
                  <TableCell className="p-3 min-w-[300px] max-w-[400px]">
                    <ConditionalTooltip content={rowItem.title}>
                      <span
                        className="block font-medium truncate hover:underline cursor-pointer"
                        onClick={() => onViewDetails(rowItem)}
                      >
                        {rowItem.title}
                      </span>
                    </ConditionalTooltip>
                  </TableCell>

                  <TableCell className="p-3">
                    <ConditionalTooltip content={rowItem.user_name}>
                      <div className="flex items-center gap-2 max-w-[150px]">
                        <UserAvatar name={rowItem.user_name} size="sm" />
                        <span className="truncate font-medium">
                          {rowItem.user_name}
                        </span>
                      </div>
                    </ConditionalTooltip>
                  </TableCell>
                  <TableCell className="p-3">
                    {UTCToLocalTimezon(rowItem.created_at)}
                  </TableCell>
                  <TableCell className="p-3">
                    {UTCToLocalTimezon(rowItem.updated_at)}
                  </TableCell>

                  <TableCell className="p-3 max-w-[50px] min-w-[50px]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-pointer"
                          >
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </span>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-[160px]">
                        {isAllowedAddingIssue && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => handleEditIssue(rowItem)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}

                        {deleteIssuesPermission && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => handleDeleteIssue(rowItem)}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            Delete
                          </DropdownMenuItem>
                        )}
                        {status === "ACTIVE" && isAllowedAddingIssue && (
                          <DropdownMenuItem
                            className="cursor-pointer border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950"
                            onSelect={() => handleResolved(rowItem)}
                          >
                            <CircleCheck className="mr-2 h-4 w-4 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950" />
                            Resolve
                          </DropdownMenuItem>
                        )}

                        {status === "resolved" && isAllowedAddingIssue && (
                          <DropdownMenuItem
                            className="cursor-pointer border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-600 dark:text-amber-500 dark:hover:bg-amber-950"
                            onSelect={() => handleReopen(rowItem)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-600 dark:text-amber-500 dark:hover:bg-amber-950" />
                            Reopen
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault();
                            handleCopyIssueLink(rowItem.id);
                          }}
                        >
                          {isCopied ? (
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <Link className="mr-2 h-4 w-4" />
                          )}
                          <span>Copy Link</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}

            {hasMore && !isFetchingMore && (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <div ref={loadMoreRef} className="h-6 w-full" />
                </TableCell>
              </TableRow>
            )}

            {isFetchingMore && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-4 text-center"
                >
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-500" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedIssue && actionType && (
        <IssueActionConfirmationModal
          isOpen={isActionModalOpen}
          onOpenChange={setIsActionModalOpen}
          actionType={actionType}
          issueTitle={selectedIssue.title}
          onConfirm={handleConfirmAction}
          loading={loadingIssue}
        />
      )}

      <AddIssueModal
        isOpen={isAddIssueModalOpen}
        onOpenChange={(open) => {
          setIsAddIssueModalOpen(open);
          if (!open) setEditIssue(null);
        }}
        editIssue={editIssue}
        refreshIssues={refreshIssuesList}
        refreshIssueDetails={
          editSource === "detail"
            ? (issueId: string) => getIssueDetailsData(issueId, false)
            : undefined
        }
      />

      <IssueDetailSheet
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        onClose={handleCloseIssueDetail}
        data={issuesDetails}
        issuesDetailsLoading={issuesDetailsLoading}
        onAddComment={addCommentToIssue}
        commentsLoading={commentsLoading}
        onToggleStatus={handleToggleIssueStatus}
        onDeleteIssue={handleConfirmDelete}
        isDeleteLoading={isDeleteLoading}
        ondeleteComment={handleDeleteComment}
        deleteIssuesPermission={deleteIssuesPermission}
        onEditIssue={(issue) => {
          setEditIssue(issue);
          setEditSource("detail");
          setIsAddIssueModalOpen(true);
        }}
        isAllowedAddingIssue={isAllowedAddingIssue}
        onEditComment={handleEditComment}
        deleteCommentLoading={deleteCommentLoading}
      />

      <CustomDeleteDialog
        open={deletemodalOpen}
        onOpenChange={setDeleteModalOpen}
        handleAlert={() => handleConfirmDelete(selectedIssue.id)}
        isLoading={isDeleteLoading}
        title={"Are you sure you want to delete this issue?"}
        description={
          "This action cannot be undone and will permanently delete the issue."
        }
      />
    </div>
  );
};

export default IssuesDataTable;
