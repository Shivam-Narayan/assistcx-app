import { useIssueOperation } from "@/app/(dashboard)/issues/hook/useIssueOpration";
import HeaderHoverCard from "@/components/header";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  capitalizeFirstLetter,
  errorMessageHandler,
  getTagsFromIdsOrNames,
  useCopyToClipboard,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { RootState, useAppSelector } from "@/redux/store";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Link,
  Loader2,
  MoreVertical,
  Pencil,
  RotateCcw,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CustomDeleteDialog from "../custom-delete-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { IssueActionConfirmationModal } from "./issue-action-confirmation-modal";
import { IssueComments } from "./issue-comments";
import { IssueTaskCard } from "./issue-tasks";
import UserAvatar from "../user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface Comment {
  id: string;
  comment: string;
  content: string;
  user_id: string;
  issue_id: string;
  user_name: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  progress: {
    status: "ACTIVE" | "resolved";
    reason: string | null;
    user_id: string;
    user_name: string;
    timestamp: string;
  }[];
  tag_ids: string[];
  comments: Comment[];
}
type IssueStatus = "ACTIVE" | "resolved";

interface IssueDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  onAddComment?: (comment: string) => void;
  onToggleStatus?: (
    issueId: string,
    newStatus: "ACTIVE" | "resolved",
    reason: string,
  ) => Promise<void> | void;
  data: any;
  issuesDetailsLoading: boolean;
  commentsLoading?: boolean;
  onDeleteIssue?: any;
  isDeleteLoading?: boolean;
  ondeleteComment?: (commentId: string) => void;
  deleteIssuesPermission?: boolean;
  onEditIssue?: (issue: any) => void;
  isAllowedAddingIssue?: boolean;
  onEditComment?: (commentId: string, comment: string) => Promise<void>;
  deleteCommentLoading: boolean;
}

export const IssueDetailSheet = ({
  isOpen,
  onOpenChange,
  onClose,
  onAddComment,
  onToggleStatus,
  data,
  issuesDetailsLoading,
  commentsLoading,
  onDeleteIssue,
  isDeleteLoading,
  ondeleteComment,
  deleteIssuesPermission,
  onEditIssue,
  isAllowedAddingIssue,
  onEditComment,
  deleteCommentLoading,
}: IssueDetailSheetProps) => {
  const { axiosAuth } = useAxiosAuth();
  const [newComment, setNewComment] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const params = useParams();
  const checkTaskId = params?.task_id as string;
  const [loadingIssue, setLoadingIssue] = useState<boolean>(false);
  const [deletemodalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteCommentOpen, setIsDeleteCommentOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const { allTagsList } = useIssueOperation();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"comments" | "task">("comments");
  const [editedComment, setEditedComment] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [tasksList, setTasksList] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [isCopied, copyToClipboard] = useCopyToClipboard(1500);

  const userData = useAppSelector(
    (state: RootState) => state.userDetailsReducer.value.userData,
  );

  const handleCopyIssueLink = async (issueId: string) => {
    const issueLink = `${window.location.origin}/issues/${issueId}`;
    await copyToClipboard(issueLink);
  };

  const handleClose = () => {
    onOpenChange(false);
    setNewComment("");
    onClose?.();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await onAddComment?.(newComment);
    setNewComment("");
  };

  const handleDeleteCommentClick = (commentId: string) => {
    setDeleteCommentId(commentId);
    setIsDeleteCommentOpen(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!deleteCommentId) return;

    try {
      await ondeleteComment?.(deleteCommentId);
      setIsDeleteCommentOpen(false);
      setDeleteCommentId(null);
    } catch (error) {
      errorMessageHandler("Failed to delete comment");
    }
  };

  const handleOpenActionModal = () => {
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = async (reason: string) => {
    if (!data || !onToggleStatus) return;
    setLoadingIssue(true);
    const currentStatus = getIssueStatus(data);

    const newStatus: "ACTIVE" | "resolved" =
      currentStatus === "ACTIVE" ? "resolved" : "ACTIVE";

    try {
      await onToggleStatus(data.id, newStatus, reason);
      setIsActionModalOpen(false);
    } catch (error) {
      errorMessageHandler("Failed to update issue status");
    } finally {
      setLoadingIssue(false);
    }
  };
  const handleConfirmDelete = async () => {
    if (!data || !onDeleteIssue) return;

    try {
      await onDeleteIssue(data.id);
      setDeleteModalOpen(false);
      handleClose();
    } catch (error) {
      errorMessageHandler("Failed to delete issue");
    }
  };

  const getIssueStatus = (data: any): IssueStatus => {
    const latestProgress = data?.progress?.[data.progress.length - 1];
    return latestProgress?.status === "resolved" ? "resolved" : "ACTIVE";
  };

  const handleEditCommentClick = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditedComment(comment.comment);
  };
  const handleSaveEditedComment = async (commentId: string) => {
    if (!editedComment.trim()) return;

    try {
      setIsEditLoading(true);

      await onEditComment?.(commentId, editedComment);

      setEditingCommentId(null);
      setEditedComment("");
    } catch (error) {
      errorMessageHandler("Failed to update comment");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedComment("");
  };

  const currentStatus = getIssueStatus(data);

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

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("comments");
      setIsExpanded(false);
      handleCancelEdit();
    }
  }, [isOpen]);

  const getTasksData = async () => {
    if (!data?.id) return;
    setLoadingTasks(true);
    try {
      const result = await axiosAuth.get(`/issues/${data.id}/agent-tasks`);
      if (result.status === 200) {
        setTasksList(result.data ?? []);
      }
    } catch (error) {
      errorMessageHandler("Failed to fetch issue tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (
      isOpen ||
      (activeTab === "task" && data?.id && tasksList.length === 0)
    ) {
      getTasksData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, data?.id]);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const isOverflowing = el.scrollHeight > el.clientHeight;
    setShowToggle(isOverflowing);
  }, [data?.description]);

  const status = data ? getIssueStatus(data) : null;
  const issueTags = getTagsFromIdsOrNames(data?.tag_ids ?? [], allTagsList);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        onEscapeKeyDown={(e) => {
          if (editingCommentId) {
            e.preventDefault();
          }
        }}
        className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-y-auto bg-white dark:bg-black"
      >
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-white dark:bg-black">
          <div className="flex items-center gap-3">
            <SheetTitle className="sr-only">Issue Details</SheetTitle>
            <HeaderHoverCard
              title="Issue Details"
              message="View detailed information and comments for this issue"
              type="sheet"
            />
          </div>
          <div className="flex items-center gap-3">
            {status && (
              <>
                <div
                  className={`h-8 min-w-[72px] flex items-center justify-center rounded-md text-sm font-medium ${
                    status === "ACTIVE"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {status === "ACTIVE" ? "Active" : "Resolved"}
                </div>
              </>
            )}

            {data && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="actions"
                    className={`h-8 w-8 flex items-center justify-center rounded-md outline-hidden ring-0 cursor-pointer transition-colors bg-muted hover:bg-foreground/10`}
                  >
                    <MoreVertical
                      className={`h-4 w-4 transition-colors text-foreground/90`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAllowedAddingIssue && (
                    <DropdownMenuItem
                      onSelect={() => data && onEditIssue?.(data)}
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
                  {data && currentStatus && isAllowedAddingIssue && (
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

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleCopyIssueLink(data.id);
                    }}
                  >
                    {isCopied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Link className="h-5 w-5" />
                    )}
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <SheetClose asChild>
              <div
                className="bg-muted p-1.5 rounded-md cursor-pointer hover:bg-foreground/10"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </div>
            </SheetClose>
          </div>
        </SheetHeader>

        {issuesDetailsLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Loading issues...</span>
            </div>
          </div>
        ) : data ? (
          <div className="flex flex-col min-h-[calc(100vh-70px)]">
            <div className="px-4 py-5 pt-0 space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {capitalizeFirstLetter(data.title)}
              </h2>
              <div className="flex items-center gap-4 flex-wrap text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 ">
                  <span className="text-muted-foreground">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <span className="font-medium text-muted-foreground dark:text-white">
                    {data?.user_name || "N/A"}
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground ">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <span>{UTCToLocalTimezon(data?.created_at)}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                  <span>{UTCToLocalTimezon(data.updated_at)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground dark:text-slate-400 ">
                  Description
                </p>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-4 py-3">
                  <p
                    ref={descriptionRef}
                    className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed transition-all ${
                      isExpanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {data?.description || "No description provided."}
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

              {data?.progress?.[data.progress.length - 1]?.reason && (
                <div
                  className={`rounded-lg p-4 border-l-4 ${
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
                    {data?.progress?.[data.progress.length - 1]?.reason}
                  </p>
                </div>
              )}

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
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "comments" | "task")
              }
              className="w-full px-4 pb-4"
            >
              <TabsList className="w-full px-1 py-1 h-auto">
                <TabsTrigger
                  value="comments"
                  className="w-full px-4 py-2 cursor-pointer"
                >
                  Comments{" "}
                  <span className="text-xs text-white bg-primary rounded-full px-2 py-0.5">
                    {data.comments.length}
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
              <TabsContent
                value="comments"
                className="flex flex-col flex-1 min-h-0"
              >
                <IssueComments
                  data={data}
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
                  hightClassName="h-[calc(100vh-300px)]"
                  paddingClassName="px-4"
                />
              </TabsContent>
              <TabsContent
                value="task"
                className="flex flex-col flex-1 min-h-0 px-4 pb-4"
              >
                <IssueTaskCard
                  data={tasksList}
                  loadingTasks={loadingTasks}
                  checkTaskId={checkTaskId}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </SheetContent>

      {data && (
        <IssueActionConfirmationModal
          isOpen={isActionModalOpen}
          onOpenChange={setIsActionModalOpen}
          actionType={currentStatus === "ACTIVE" ? "resolved" : "ACTIVE"}
          issueTitle={data.title}
          onConfirm={handleConfirmAction}
          loading={loadingIssue}
        />
      )}

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

      <CustomDeleteDialog
        open={isDeleteCommentOpen}
        onOpenChange={setIsDeleteCommentOpen}
        handleAlert={handleConfirmDeleteComment}
        isLoading={deleteCommentLoading}
        title="Delete comment?"
        description="This action cannot be undone and will permanently delete this comment."
      />
    </Sheet>
  );
};

export default IssueDetailSheet;
