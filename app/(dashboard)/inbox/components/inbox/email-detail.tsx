import { CollapsibleContent } from "@/components/collapsible-content";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { ConfirmationDialog } from "@/components/confirmation-modal";
import CopyToClipboard from "@/components/copy-to-clipboard";
import IssueReportSheet from "@/components/issue-management/issue-report-sheet";
import { JumpingLoadingAnimation } from "@/components/JumpingLoadingAnimation";
import { SmartContentViewer } from "@/components/smart-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  errorMessageHandler,
  getAttachmentIcon,
  getSortedTags,
  getStatusColor,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import { canDelete, canEdit, canView } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import type {
  IAgentDetails,
  IAttachmentDetails,
  IEmailData,
} from "@/types/types";
import {
  AlertCircle,
  Archive,
  ChevronDown,
  ChevronUp,
  Coins,
  EyeIcon,
  Inbox as InboxIcon,
  Loader2Icon,
  MoreVertical,
  Plus,
  Repeat,
  Trash2,
  X,
} from "lucide-react";
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTagsSelect } from "../../hooks/useTagsSelect";
import { EmailTimelineSheet } from "./email-timeline-sheet";
const TagSelectorComponent = lazy(
  () => import("@/components/tag-selector-combobox"),
);

interface EmailDetailProps {
  selectedEmail: IEmailData;
  assignedAgent: IAgentDetails | null;
  onRetry: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  isDetailsHide: boolean;
  handleOpenAttachmentEvent: (attachment: IAttachmentDetails) => void;
  renderFrom: "email-details" | "task-details";
}

export const EmailDetail = memo<EmailDetailProps>(function EmailDetail({
  selectedEmail,
  assignedAgent,
  onRetry,
  onArchive,
  onDelete,
  isDetailsHide,
  handleOpenAttachmentEvent,
  renderFrom,
}) {
  const {
    getTagsList,
    getSelectedTags,
    setSelectedTags,
    setTagsList,
    searchTagText,
    setSearchTagText,
    setPage,
    page,
    hasMore,
    isFetchingMore,
    setIsFetchingMore,
  } = useTagsSelect(selectedEmail, "email");

  const tagsList = getTagsList();
  const selectedTags = getSelectedTags();
  const [confirmationBox, setConfirmationBox] = useState(false);
  const [showTimelineSheet, setShowTimelineSheet] = useState(false);
  const [showIssueManagementSheet, setShowIssueManagementSheet] =
    useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const isDeleteEmailTask = canDelete(permissions, "task_inbox");

  const canEditInbox = canEdit(permissions, "task_inbox");

  const viewIssuesPermission = canView(permissions, "task_issues");

  const deleteIssuesPermission = canDelete(permissions, "task_issues");

  const isAllowedAddingIssue = canEdit(permissions, "task_issues");

  const [showTagSelector, setShowTagSelector] = useState(false);
  const tagSelectorRef = useRef<HTMLDivElement>(null);

  const handleOpenRetrybox = () => {
    setConfirmationBox(true);
  };

  const handleConfirmRetry = useCallback(() => {
    try {
      onRetry(selectedEmail.id);
      setConfirmationBox(false);
    } catch (error) {
      errorMessageHandler(error);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRetry, selectedEmail.id]);

  const handleCancelRetry = useCallback(() => {
    setConfirmationBox(false);
  }, []);

  const handleArchiveSelect = useCallback(() => {
    onArchive(selectedEmail.id);
  }, [onArchive, selectedEmail.id]);

  const handleDeleteSelect = useCallback(() => {
    onDelete(selectedEmail.id);
  }, [onDelete, selectedEmail.id]);
  const handleTagRemove = useCallback(
    (tagId: any) => {
      setSelectedTags((selectedTags || []).filter((t: any) => t.id !== tagId));
    },
    [setSelectedTags, selectedTags],
  );

  const handleAttachmentClick = useCallback(
    (e: React.MouseEvent, attachment: IAttachmentDetails) => {
      e.preventDefault();
      handleOpenAttachmentEvent(attachment);
    },
    [handleOpenAttachmentEvent],
  );

  // for handling click outside of tag selector
  useEffect(() => {
    if (!showTagSelector) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is inside popover
      const isInsidePopover =
        target.closest('[role="dialog"]') ||
        target.closest("[data-radix-popper-content-wrapper]");

      if (
        tagSelectorRef.current &&
        !tagSelectorRef.current.contains(target) &&
        !isInsidePopover
      ) {
        setShowTagSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTagSelector]);

  useEffect(() => {
    setIsCollapsed(false);
  }, [selectedEmail]);

  const { attachment_details } = selectedEmail;

  const isTaskExecuting =
    selectedEmail?.status === "QUEUED" || selectedEmail?.status === "EXECUTING";

  return (
    <>
      {!isDetailsHide && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base xl:text-xl font-semibold text-gray-800 dark:text-slate-100">
            {selectedEmail.subject}
          </h2>

          {/* Archive Dropdown Menu with Icon Trigger */}
          {(selectedEmail?.status !== "ARCHIVED" || isDeleteEmailTask) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Email actions"
                  className={`p-1.5 rounded-md border outline-hidden ring-0 cursor-pointer transition-colors bg-muted border-slate-300 dark:border-slate-600 `}
                >
                  <MoreVertical
                    className={`h-4 w-4 transition-colors text-gray-600 dark:text-slate-400 `}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => setShowTimelineSheet(true)}
                  className="cursor-pointer"
                >
                  <EyeIcon className="mr-2 h-4 w-4" />
                  <span>View Events</span>
                </DropdownMenuItem>

                {canEditInbox && (
                  <DropdownMenuItem
                    onSelect={handleOpenRetrybox}
                    className="cursor-pointer"
                  >
                    <Repeat className="mr-2 h-4 w-4" />
                    <span>Retry Email</span>
                  </DropdownMenuItem>
                )}

                {selectedEmail?.status !== "ARCHIVED" && canEditInbox && (
                  <DropdownMenuItem
                    onSelect={handleArchiveSelect}
                    className="cursor-pointer"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    <span>Archive Email</span>
                  </DropdownMenuItem>
                )}

                {selectedEmail?.status === "ARCHIVED" && isDeleteEmailTask && (
                  <DropdownMenuItem
                    onSelect={handleDeleteSelect}
                    className="cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Email</span>
                  </DropdownMenuItem>
                )}
                {viewIssuesPermission && (
                  <DropdownMenuItem
                    onSelect={() => setShowIssueManagementSheet(true)}
                    className="cursor-pointer"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <span>View Issues</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
      {/* Email Information Card */}
      <Card
        className={`mb-8 p-0 gap-0 shadow-xs overflow-hidden divide-y transition-colors border bg-white dark:bg-slate-800 `}
      >
        <CardHeader
          className={`px-4 py-3 rounded-t-md gap-0 transition-colors cursor-pointer duration-300   bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700/50  `}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {/* Header content with status/credits */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-0">
            <div className="flex items-center space-x-2">
              <InboxIcon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              <CardTitle className=" text-base xl:text-lg text-gray-800 dark:text-slate-200">
                Email Information
              </CardTitle>

              <CopyToClipboard
                text={selectedEmail.id || ""}
                tooltipLabel="Copy email ID"
              />

              <CopyToClipboard
                text={selectedEmail.id || ""}
                tooltipLabel="Copy shareable link"
                iconType="link"
                renderFrom={renderFrom}
              />
            </div>
            <div className="flex items-center space-x-2">
              {selectedEmail.credits_used !== undefined &&
                selectedEmail.credits_used !== null && (
                  <Badge
                    variant="outline"
                    className="inline-flex items-center px-2 py-0.5 text-sm xl:text-base font-medium rounded-md border-gray-300 text-gray-600 bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-700"
                  >
                    <span className="inline-flex mr-1">
                      <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    </span>
                    {selectedEmail.credits_used}
                  </Badge>
                )}

              <Badge
                variant="outline"
                className={`${getStatusColor(
                  selectedEmail?.status,
                )}  xl:h-8 text-sm xl:text-base px-2 xl:px-3 py-0.5 xl:py-1 flex items-center gap-1 font-normal`}
              >
                {isTaskExecuting && (
                  <JumpingLoadingAnimation
                    color={
                      selectedEmail?.status === "QUEUED"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }
                  />
                )}
                <span className="leading-none p-1 text-xs xl:text-base">
                  {selectedEmail?.status}
                </span>
              </Badge>
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              )}
            </div>
          </div>
        </CardHeader>
        {!isCollapsed && (
          <CardContent className="p-4 md:p-5 text-gray-700 dark:text-slate-300 flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
              {/* From */}
              <div className="space-y-1">
                <p className="text-xs xl:text-sm text-muted-foreground dark:text-slate-400">
                  From
                </p>
                <p
                  className="text-sm xl:text-base font-medium flex flex-wrap items-baseline gap-x-1.5 truncate"
                  title={selectedEmail.email_id}
                >
                  <span className="leading-tight">
                    {selectedEmail.sender_name}
                  </span>
                  <span className="text-xs xl:text-sm font-normal text-muted-foreground leading-tight">
                    ({selectedEmail.email_id})
                  </span>
                </p>
              </div>
              {/* Mailbox */}
              <div className="space-y-1">
                <p className="text-xs xl:text-sm text-muted-foreground dark:text-slate-400">
                  Mailbox
                </p>
                <p className="text-sm xl:text-base font-medium truncate">
                  {selectedEmail.mailbox_email} |{" "}
                  <span className="text-gray-600 dark:text-slate-400">
                    {selectedEmail.mailbox_folder}
                  </span>
                </p>
              </div>

              {/* Created At */}
              <div className="space-y-1">
                <p className="text-xs xl:text-sm text-muted-foreground dark:text-slate-400">
                  Created At
                </p>
                <p className="text-sm xl:text-base font-medium">
                  {UTCToLocalTimezon(selectedEmail.created_at)}
                </p>
              </div>

              {/* Received At */}
              <div className="space-y-1">
                <p className="text-xs xl:text-sm text-muted-foreground dark:text-slate-400">
                  Received At
                </p>
                <p className="text-sm xl:text-base font-medium">
                  {UTCToLocalTimezon(selectedEmail.received_at)}
                </p>
              </div>
            </div>

            {/* Email Body */}
            <div>
              <p className="text-sm text-muted-foreground dark:text-slate-400 mb-2">
                Email Body
              </p>
              {selectedEmail?.email_body ? (
                <div className="bg-slate-50 border p-3 rounded-md text-sm relative group">
                  <CollapsibleContent
                    key={selectedEmail?.id}
                    className="prose prose-sm max-w-none dark:prose-invert"
                    gradientStart="from-slate-50"
                  >
                    <SmartContentViewer
                      expandView={true}
                      content={selectedEmail.email_body}
                      className="text-gray-700 dark:text-slate-300"
                    />
                  </CollapsibleContent>
                </div>
              ) : (
                <span className="text-base font-medium">N/A</span>
              )}
            </div>

            {/* Attachments */}
            {attachment_details?.attachments &&
              attachment_details?.attachments?.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mb-2">
                    Attachments ({attachment_details?.total})
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {attachment_details?.attachments?.map((att, index) => (
                      <a
                        key={index}
                        href="#"
                        onClick={(e) => handleAttachmentClick(e, att)}
                        className="flex items-center p-2 border border-gray-200 dark:border-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-sm text-gray-700 dark:text-slate-300 min-w-0 max-w-xs"
                      >
                        {getAttachmentIcon(att?.file_type)}

                        <div className="flex flex-1 items-center min-w-0 mr-2">
                          <ConditionalTooltip content={att?.file_name}>
                            <span className="truncate w-full block">
                              {att?.file_name}
                            </span>
                          </ConditionalTooltip>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                          {att?.file_size}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {/* Tags  */}
            <div ref={tagSelectorRef}>
              <div className="flex items-center gap-2 flex-wrap relative">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Tags
                </p>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowTagSelector((prev) => {
                      const newState = !prev;
                      if (!prev) {
                        setSearchTagText("");
                      }
                      return newState;
                    });
                  }}
                  className={`
                  inline-flex items-center justify-center 
                  h-6 w-6 rounded-md border
                  transition-colors duration-200 cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-primary/20
                `}
                  aria-label="Add tags"
                >
                  <Plus className="h-2 w-2" />
                </Button>

                <Suspense fallback={<Loader2Icon className="animate-spin" />}>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getSortedTags(selectedTags).map((tag: any) => {
                        return (
                          <Badge
                            key={tag.id}
                            className="relative flex items-center justify-center text-black-600 group px-3 py-1 rounded-full font-normal text-sm shadow-none"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                            <X
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 cursor-pointer 
             text-muted-foreground opacity-0 group-hover:opacity-100 
             hover:text-red-500 transition rounded-full bg-gray-200 p-px shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagRemove(tag.id);
                              }}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {showTagSelector && (
                    <div
                      className="absolute top-full left-0 mt-1 z-50 min-w-[300px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TagSelectorComponent
                        dataList={tagsList || []}
                        setDataList={setTagsList}
                        selectedIds={(selectedTags || []).map((t: any) =>
                          typeof t === "object" && t != null ? t.id : t,
                        )}
                        setSelectedIds={(value) => {
                          const currentIds = (selectedTags || []).map(
                            (t: any) =>
                              typeof t === "object" && t != null ? t.id : t,
                          );

                          const ids =
                            typeof value === "function"
                              ? value(currentIds)
                              : value;

                          const mergedList = [
                            ...tagsList,
                            ...selectedTags,
                          ].reduce<any[]>((acc, tag) => {
                            if (!acc.find((t) => t.id === tag.id))
                              acc.push(tag);
                            return acc;
                          }, []);

                          const newSelectedTags = ids
                            .map((id) => mergedList.find((t) => t.id === id))
                            .filter(Boolean) as any[];

                          setSelectedTags(newSelectedTags);
                        }}
                        setSelectedTags={setSelectedTags}
                        autoOpen={true}
                        localSearch={searchTagText}
                        setLocalSearch={setSearchTagText}
                        setPage={setPage}
                        page={page}
                        hasMore={hasMore}
                        isFetchingMore={isFetchingMore}
                        setIsFetchingMore={setIsFetchingMore}
                      />
                    </div>
                  )}
                </Suspense>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <EmailTimelineSheet
        isOpen={showTimelineSheet}
        onOpenChange={setShowTimelineSheet}
        emailData={selectedEmail}
      />

      <IssueReportSheet
        isOpen={showIssueManagementSheet}
        onOpenChange={setShowIssueManagementSheet}
        emailData={selectedEmail}
        isAllowedAddIssue={false}
        deleteIssuesPermission={deleteIssuesPermission}
        isAllowedAddingIssue={isAllowedAddingIssue}
      />

      {confirmationBox && (
        <ConfirmationDialog
          open={confirmationBox}
          confirm={handleConfirmRetry}
          cancel={handleCancelRetry}
          title="Are you sure you want to retry this email?"
          description="Retrying will attempt to execute the email again. Any previous email progress may be overwritten or replaced."
        />
      )}
    </>
  );
});
