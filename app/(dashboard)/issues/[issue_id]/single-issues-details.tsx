"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import AddIssueModal from "@/components/issue-management/add-issue-modal";
import IssueActionConfirmationModal from "@/components/issue-management/issue-action-confirmation-modal";
import { IssueComments } from "@/components/issue-management/issue-comments";
import { IssueTaskCard } from "@/components/issue-management/issue-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  capitalizeFirstLetter,
  errorMessageHandler,
  getTagsFromIdsOrNames,
  successMessageHandler,
  useCopyToClipboard,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canDelete, canEdit } from "@/lib/permissions";
import { RootState, useAppSelector } from "@/redux/store";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Link,
  Loader,
  MoreVertical,
  Pencil,
  RotateCcw,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIssueOperation } from "../hook/useIssueOpration";

type IssueStatus = "ACTIVE" | "resolved";

const SingleIssuesDetails = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const router = useRouter();
  const params = useParams<{ issue_id: string }>();
  const checkTaskId = params?.issue_id as string;
  const [issuesDetailsLoading, setIssuesDetailsLoading] = useState(false);
  const [issuesDetails, setIssuesDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"comments" | "task">("comments");
  const { allTagsList } = useIssueOperation();
  const [isAddIssueModalOpen, setIsAddIssueModalOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<any>(null);
  const [editSource, setEditSource] = useState<"table" | "detail" | null>(null);
  const [deletemodalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [loadingIssue, setLoadingIssue] = useState<boolean>(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteCommentOpen, setIsDeleteCommentOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [isCopied, copyToClipboard] = useCopyToClipboard(1500);

  const handleCopyIssueLink = async () => {
    await copyToClipboard(window.location.href);
  };

  const userData = useAppSelector(
    (state: RootState) => state.userDetailsReducer.value.userData,
  );

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const deleteIssuesPermission = canDelete(permissions, "task_issues");

  const isAllowedAddingIssue = canEdit(permissions, "task_issues");

  const getIssueStatus = (data: any): IssueStatus => {
    const latestProgress = data?.progress?.[data.progress.length - 1];
    return latestProgress?.status === "resolved" ? "resolved" : "ACTIVE";
  };
  const currentStatus = useMemo(
    () => (issuesDetails ? getIssueStatus(issuesDetails) : null),
    [issuesDetails],
  );

  const actionLabel =
    currentStatus === "ACTIVE" ? (
      <>
        <CheckCircle2 className="w-4 h-4 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950" />
        Resolve
      </>
    ) : (
      <>
        <RotateCcw className="w-4 h-4 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-600 dark:text-amber-500 dark:hover:bg-amber-950" />
        Reopen
      </>
    );

  const fetchIssueDetailsById = async (
    issueId: string,
    showLoader: boolean = true,
  ) => {
    if (loading) return;
    if (showLoader) setIssuesDetailsLoading(true);
    try {
      const response = await axiosAuth.get(`/issues/${issueId}`);
      setIssuesDetails(response.data);
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
  const handleConfirmDelete = async () => {
    if (!issuesDetails?.id) return;
    setIsDeleteLoading(true);
    try {
      const result = await axiosAuth.delete(`/issues/${issuesDetails?.id}`);
      if (result.status === 200) {
        successMessageHandler(result.data.message);
        router.push(`/issues`);
        setDeleteModalOpen(false);
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
    if (!issuesDetails) return;
    setLoadingIssue(true);
    const currentStatus = getIssueStatus(issuesDetails);

    const newStatus: "ACTIVE" | "resolved" =
      currentStatus === "ACTIVE" ? "resolved" : "ACTIVE";

    const payload = {
      status: newStatus,
      reason,
    };

    try {
      const result = await axiosAuth.put(
        `/issues/${issuesDetails.id}/progress`,
        payload,
      );
      if (result.status === 200 || result.status === 201) {
        successMessageHandler("Issue status updated successfully");
        fetchIssueDetailsById(issuesDetails.id);
        setIsActionModalOpen(false);
      }
    } catch (error: any) {
      errorMessageHandler(
        error.response.data.detail || "Failed to update issue status",
      );
    } finally {
      setLoadingIssue(false);
    }
  };

  const getTasksData = async () => {
    if (!issuesDetails?.id) return;
    setLoadingTasks(true);
    try {
      const result = await axiosAuth.get(
        `/issues/${issuesDetails.id}/agent-tasks`,
      );
      if (result.status === 200) {
        setTasksList(result.data ?? []);
      }
    } catch (error) {
      errorMessageHandler("Failed to fetch issue tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleEditCommentClick = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditedComment(comment.comment);
  };
  const handleSaveEditedComment = async (commentId: string) => {
    if (!editedComment.trim()) return;

    try {
      setIsEditLoading(true);

      await handleEditComment?.(commentId, editedComment);

      setEditingCommentId(null);
      setEditedComment("");
    } catch (error) {
      errorMessageHandler("Failed to update comment");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditComment = async (
    commentId: string,
    updatedComment: string,
  ) => {
    if (!issuesDetails?.id || loading) return;
    try {
      const result = await axiosAuth.patch(`/comments/${commentId}`, {
        comment: updatedComment,
      });
      if (result.status === 200) {
        successMessageHandler("Comment Updated successfully");
      }
      await fetchIssueDetailsById(issuesDetails.id, false);
    } catch (error: any) {
      errorMessageHandler(
        error?.response?.data?.message || "Failed to edit comment",
      );
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addCommentToIssue?.(newComment);
    setNewComment("");
  };

  const addCommentToIssue = async (comment: string) => {
    if (!issuesDetails?.id || loading) return;
    const payload = {
      comment,
      issue_id: issuesDetails.id,
    };
    setCommentsLoading(true);
    try {
      const result = await axiosAuth.post("/comments", payload);
      if (result.status === 201) {
        successMessageHandler("Comment added successfully");
        setNewComment("");
      }
      await fetchIssueDetailsById(issuesDetails.id, false);
    } catch (error: any) {
      errorMessageHandler(
        error.response.data.detail || "Failed to add comment",
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteCommentClick = (commentId: string) => {
    setDeleteCommentId(commentId);
    setIsDeleteCommentOpen(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!deleteCommentId) return;

    setDeleteCommentLoading(true);
    try {
      const result = await axiosAuth.delete(`/comments/${deleteCommentId}`);
      if (result.status === 200) {
        successMessageHandler("Comment deleted successfully");
      }
      setIsDeleteCommentOpen(false);
      setDeleteCommentId(null);
      await fetchIssueDetailsById(issuesDetails?.id, false);
    } catch (error) {
      errorMessageHandler("Failed to delete comment");
    } finally {
      setDeleteCommentLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedComment("");
  };

  useEffect(() => {
    if (!loading && params?.issue_id) {
      fetchIssueDetailsById(params.issue_id);
      getTasksData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.issue_id, loading]);

  useEffect(() => {
    if (activeTab && issuesDetails?.id && tasksList.length === 0) {
      getTasksData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.issue_id, activeTab, issuesDetails?.id]);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const isOverflowing = el.scrollHeight > el.clientHeight;
    setShowToggle(isOverflowing);
  }, [issuesDetails?.description]);

  const status = issuesDetails ? getIssueStatus(issuesDetails) : null;

  const issueTags = useMemo(
    () => getTagsFromIdsOrNames(issuesDetails?.tag_ids ?? [], allTagsList),
    [issuesDetails?.tag_ids, allTagsList],
  );

  return (
    <>
      <div className="flex flex-col gap-4 xl:gap-6 py-6  bg-slate-50 dark:bg-slate-900 ">
        <header className="xl:max-w-4xl mx-auto w-full px-6">
          <div
            className={`rounded-lg shadow-xs p-4 flex items-center justify-between border transition-colors`}
          >
            <h1
              className={`text-lg xl:text-xl font-semibold transition-colors text-slate-900 dark:text-white`}
            >
              Issue Detail
            </h1>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className={`h-auto flex items-center gap-2 px-3 py-1.5 xl:text-sm text-xs font-medium rounded-md transition-colors border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600`}
                onClick={() => router.push(`/issues`)}
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Issues
              </Button>

              {issuesDetails && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={loading}
                      className={`h-8 w-8 flex items-center justify-center rounded-md outline-hidden ring-0 cursor-pointer transition-colors`}
                    >
                      <MoreVertical
                        className={`h-4 w-4 transition-colors text-foreground/90`}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAllowedAddingIssue && (
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditIssue(issuesDetails);
                          setEditSource("detail");
                          setIsAddIssueModalOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <Pencil className="h-5 w-5" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                    )}
                    {deleteIssuesPermission && (
                      <DropdownMenuItem
                        onSelect={() => setDeleteModalOpen(true)}
                        className="cursor-pointer"
                      >
                        <Trash2 className="w-6 h-6 text-red-500" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    )}
                    {issuesDetails && currentStatus && isAllowedAddingIssue && (
                      <DropdownMenuItem
                        onSelect={() => setIsActionModalOpen(true)}
                        className={`h-8 cursor-pointer ${
                          currentStatus === "ACTIVE"
                            ? "border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950"
                            : "border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-600 dark:text-amber-500 dark:hover:bg-amber-950"
                        }`}
                      >
                        {actionLabel}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {loading || issuesDetailsLoading ? (
          <main className="flex flex-1 items-center justify-center min-h-[60vh]">
            <Loader className="h-10 w-10 mt-6 animate-spin text-primary" />
          </main>
        ) : issuesDetails ? (
          <div className="xl:max-w-4xl mx-auto w-full px-6">
            <Card
              className={`mb-8 p-0 gap-0 shadow-xs rounded-md divide-y-1 transition-colors`}
            >
              <CardHeader
                className={`px-4 py-3 rounded-t-md gap-0 transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    <CardTitle className="text-sm xl:text-base font-medium text-gray-800 dark:text-slate-200 max-w-md line-clamp-1 truncate">
                      {capitalizeFirstLetter(issuesDetails?.title)}
                    </CardTitle>

                    <ConditionalTooltip
                      content={isCopied ? "Copied!" : "Copy shareable link"}
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={handleCopyIssueLink}
                      >
                        {isCopied ? (
                          <Check className="h-3.5! w-3.5! text-green-500" />
                        ) : (
                          <Link className="h-3.5! w-3.5! text-slate-500" />
                        )}
                      </Button>
                    </ConditionalTooltip>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status && (
                      <div
                        className={`h-8 min-w-[72px] flex items-center justify-center rounded-md text-sm font-medium ${
                          status === "ACTIVE"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {status === "ACTIVE" ? "Active" : "Resolved"}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-5 py-5 space-y-6 border-b-0">
                <div className="flex items-center gap-4 flex-wrap text-sm text-slate-600 dark:text-slate-300 py-2">
                  <div className="flex items-center gap-2 ">
                    <span className="text-muted-foreground">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <span className="font-medium text-muted-foreground dark:text-white">
                      {issuesDetails?.user_name || "N/A"}
                    </span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground ">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <span>{UTCToLocalTimezon(issuesDetails?.created_at)}</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      <CalendarCheck className="h-5 w-5" />
                    </span>
                    <span>{UTCToLocalTimezon(issuesDetails.updated_at)}</span>
                  </div>
                </div>

                {/* description */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground dark:text-slate-400">
                    Description
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-4 py-3">
                    <p
                      ref={descriptionRef}
                      className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed transition-all ${
                        isExpanded ? "" : "line-clamp-3"
                      }`}
                    >
                      {issuesDetails?.description || "No description provided."}
                    </p>

                    {showToggle && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-0 mt-2 h-auto cursor-pointer text-primary hover:text-primary/80"
                      >
                        {isExpanded ? "Show Less" : "Show More"}
                        <span className="inline-flex items-center ml-1">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
                {/* reason */}

                {issuesDetails?.progress?.[issuesDetails.progress.length - 1]
                  ?.reason && (
                  <div
                    className={`mt-3 rounded-lg p-4 border-l-4 ${
                      currentStatus === "ACTIVE"
                        ? "bg-amber-50 dark:bg-amber-950/30 border-l-amber-500"
                        : "bg-green-50 dark:bg-green-950/30 border-l-green-500"
                    }`}
                  >
                    <h4
                      className={`text-sm font-medium mb-2 ${
                        currentStatus === "ACTIVE"
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-green-700 dark:text-green-400"
                      }`}
                    >
                      Reason for{" "}
                      {currentStatus === "ACTIVE" ? "reopening" : "resolving"}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {
                        issuesDetails?.progress?.[
                          issuesDetails.progress.length - 1
                        ]?.reason
                      }
                    </p>
                  </div>
                )}
                {/* tags */}
                {issueTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium ">Tags:</span>
                    {issueTags.map((tag: any) => (
                      <Badge
                        key={tag.id}
                        className="flex items-center justify-center text-black! px-2 py-0.5 rounded-full font-normal text-xs shadow-none"
                        style={
                          tag.color
                            ? { backgroundColor: tag.color }
                            : { backgroundColor: "#e5e7eb" }
                        }
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className=" space-y-6">
                {/* tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as "comments" | "task")
                  }
                  className="w-full px-5"
                >
                  <TabsList className="w-full px-1 py-1 h-auto">
                    <TabsTrigger
                      value="comments"
                      className="w-full px-4 py-2 cursor-pointer"
                    >
                      Comments{" "}
                      <span className="text-xs text-white bg-primary rounded-full px-2 py-0.5">
                        {issuesDetails?.comments?.length ?? 0}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="task"
                      className="w-full px-4 py-2 cursor-pointer"
                    >
                      Tasks{" "}
                      <span className="text-xs text-white bg-primary rounded-full px-2 py-0.5">
                        {tasksList.length}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Tabs value={activeTab}>
                  <TabsContent value="comments" className="flex flex-col">
                    <IssueComments
                      data={{ comments: issuesDetails?.comments ?? [] }}
                      handleEditCommentClick={handleEditCommentClick}
                      userData={userData}
                      handleDeleteCommentClick={handleDeleteCommentClick}
                      handleCancelEdit={handleCancelEdit}
                      setEditedComment={setEditedComment}
                      editingCommentId={editingCommentId}
                      editedComment={editedComment}
                      handleSaveEditedComment={handleSaveEditedComment}
                      isEditLoading={isEditLoading}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      handleAddComment={handleAddComment}
                      commentsLoading={commentsLoading}
                      hightClassName={
                        issuesDetails?.comments?.length === 0
                          ? "h-[calc(100vh-300px)]"
                          : ""
                      }
                      paddingClassName="px-5"
                    />
                  </TabsContent>
                  <TabsContent value="task" className="flex flex-col px-5 pb-5">
                    <IssueTaskCard
                      data={tasksList}
                      loadingTasks={loadingTasks}
                      checkTaskId={checkTaskId}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full px-6">
            <Card className="w-full text-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl">
              <CardContent className="py-16">
                <div className="flex flex-col items-center space-y-5">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
                    <ShieldAlert className="w-8 h-8 text-gray-500 dark:text-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      No Issues Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      This issue doesn’t exist or may have been removed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AddIssueModal
        isOpen={isAddIssueModalOpen}
        onOpenChange={(open) => {
          setIsAddIssueModalOpen(open);
          if (!open) setEditIssue(null);
        }}
        editIssue={editIssue}
        refreshIssueDetails={
          editSource === "detail"
            ? (issueId: string) => fetchIssueDetailsById(issueId)
            : undefined
        }
      />

      <CustomDeleteDialog
        open={deletemodalOpen}
        onOpenChange={setDeleteModalOpen}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title={"Are you sure you want to delete this issue?"}
        description={
          "This action cannot be undone and will permanently delete the issue."
        }
      />

      {issuesDetails && (
        <IssueActionConfirmationModal
          isOpen={isActionModalOpen}
          onOpenChange={setIsActionModalOpen}
          actionType={currentStatus === "ACTIVE" ? "resolved" : "ACTIVE"}
          issueTitle={issuesDetails.title}
          onConfirm={handleConfirmAction}
          loading={loadingIssue}
        />
      )}

      <CustomDeleteDialog
        open={isDeleteCommentOpen}
        onOpenChange={setIsDeleteCommentOpen}
        handleAlert={handleConfirmDeleteComment}
        isLoading={deleteCommentLoading}
        title="Delete comment?"
        description="This action cannot be undone and will permanently delete this comment."
      />
    </>
  );
};

export default SingleIssuesDetails;
