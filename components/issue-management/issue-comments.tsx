import { getTimeAgo } from "@/helper/helper-function";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircleIcon,
  MoreHorizontal,
  PencilIcon,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TextareaWithActions from "../textarea-with-action";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Textarea } from "../ui/textarea";
import UserAvatar from "../user-avatar";
import { EmptyState } from "../empty-state/empty-state";

interface IssueComment {
  id: string;
  comment: string;
  content: string;
  user_id: string;
  issue_id: string;
  user_name: string;
  created_at: string;
  updated_at: string;
}

interface IssueCommentsProp {
  data: {
    comments: IssueComment[];
  };
  handleEditCommentClick: (comment: IssueComment) => void;
  handleDeleteCommentClick: (commentId: string) => void;
  handleSaveEditedComment: (commentId: string) => void;
  handleCancelEdit: () => void;
  userData?: {
    id?: string;
  };
  editingCommentId: string | null;
  editedComment: string;
  setEditedComment: (value: string) => void;
  isEditLoading: boolean;
  newComment: string;
  setNewComment: (value: string) => void;
  handleAddComment: () => void;
  commentsLoading?: boolean;
  hightClassName?: string;
  paddingClassName?: string;
}

export const IssueComments = ({
  data,
  handleEditCommentClick,
  userData,
  handleDeleteCommentClick,
  handleCancelEdit,
  setEditedComment,
  editingCommentId,
  editedComment,
  handleSaveEditedComment,
  isEditLoading,
  newComment,
  setNewComment,
  handleAddComment,
  commentsLoading,
  hightClassName,
  paddingClassName,
}: IssueCommentsProp) => {
  const commentRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});
  const [toggleMap, setToggleMap] = useState<Record<string, boolean>>({});
  const MAX_COMMENT_LENGTH = 1000;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150,
      )}px`;
    }
  }, [newComment]);

  useEffect(() => {
    const newToggleMap: Record<string, boolean> = {};

    data?.comments?.forEach((comment) => {
      const el = commentRefs.current[comment.id];
      if (el) {
        newToggleMap[comment.id] = el.scrollHeight > el.clientHeight;
      }
    });

    setToggleMap(newToggleMap);
  }, [data?.comments]);

  return (
    <div className={cn("flex flex-col", hightClassName)}>
      <div className={cn("flex-1 space-y-5", paddingClassName)}>
        {data.comments.length === 0 ? (
          <EmptyState
            variant="card"
            compact
            icon={<MessageCircleIcon />}
            title="No Comments Available"
            description="No comments have been added yet. Use the comment section below to collaborate."
          />
        ) : (
          <div className="space-y-4">
            {data.comments.map((comment: any) => (
              <div
                key={comment.id}
                className="group relative bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <UserAvatar
                    name={comment.user_name}
                    size="md"
                    className="mt-1"
                  />

                  {/* Content Container */}
                  <div className="flex-1 min-w-0">
                    {/* Header with username, timestamp, and actions */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground/90">
                        {comment.user_name}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(comment.updated_at)}
                      </span>
                      <div className="ml-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-foreground/90 xl:opacity-0 xl:group-hover:opacity-100  hover:bg-foreground/10 data-[state=open]:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {comment?.user_id === userData?.id && (
                              <DropdownMenuItem
                                onClick={() => handleEditCommentClick(comment)}
                                className="cursor-pointer"
                              >
                                <PencilIcon className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteCommentClick(comment.id)
                              }
                              className="cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Comment content or edit mode */}
                    {editingCommentId === comment.id ? (
                      <TextareaWithActions
                        mode="normal"
                        value={editedComment}
                        onChange={setEditedComment}
                        placeholder="Edit comment..."
                        maxLength={MAX_COMMENT_LENGTH}
                        onCancel={handleCancelEdit}
                        onSave={() => handleSaveEditedComment(comment.id)}
                        disabled={isEditLoading}
                      />
                    ) : (
                      <>
                        <p
                          ref={(el) => {
                            commentRefs.current[comment.id] = el;
                          }}
                          className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${
                            expandedComments[comment.id] ? "" : "line-clamp-3"
                          }`}
                        >
                          {comment.comment}
                        </p>
                        {toggleMap[comment.id] && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              setExpandedComments((prev) => ({
                                ...prev,
                                [comment.id]: !prev[comment.id],
                              }))
                            }
                            className="p-0 mt-2 h-auto cursor-pointer text-primary hover:text-primary/80"
                          >
                            {expandedComments[comment.id]
                              ? "Show Less"
                              : "Show More"}
                            <span className="inline-flex items-center ml-1">
                              {expandedComments[comment.id] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </span>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment Input */}
      <div className="sticky bottom-0 p-4 mt-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="relative flex items-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 pl-3 pr-2 py-1.5  focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            rows={1}
            className="flex-1 resize-none bg-transparent border-none shadow-none outline-none focus-visible:ring-0 text-sm min-h-[32px] max-h-[150px] py-1 px-0"
          />

          <Button
            onClick={handleAddComment}
            disabled={
              !newComment.trim() ||
              newComment.length > MAX_COMMENT_LENGTH ||
              commentsLoading
            }
            size="icon"
            className="cursor-pointer h-8 w-8 shrink-0 rounded-xl self-end mb-0.5"
          >
            {commentsLoading ? (
              <Loader2 className="w-2 h-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {newComment.length > MAX_COMMENT_LENGTH && (
          <div className="text-xs text-red-500 mt-1">
            Maximum 1000 characters allowed
          </div>
        )}
      </div>
    </div>
  );
};
