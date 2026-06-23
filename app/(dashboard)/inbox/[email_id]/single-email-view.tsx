"use client";
import { CollapsibleContent } from "@/components/collapsible-content";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { ConfirmationDialog } from "@/components/confirmation-modal";
import CustomAlertDialog from "@/components/custom-alert-dialog";
import { IssueReportSheet } from "@/components/issue-management/issue-report-sheet";
import { JumpingLoadingAnimation } from "@/components/JumpingLoadingAnimation";
import { SmartContentViewer } from "@/components/smart-content";
import TagSelectorComponent from "@/components/tag-selector-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UTCToLocalTimezon,
  errorMessageHandler,
  getAttachmentIcon,
  getSortedTags,
  getStatusColor,
  successMessageHandler,
  useCopyToClipboard,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canDelete, canEdit, canView } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import { IEmailData } from "@/types/types";
import {
  AlertCircle,
  ArchiveIcon,
  Check,
  ChevronLeft,
  Coins,
  Copy,
  Inbox,
  InboxIcon,
  Link,
  Loader,
  Loader2Icon,
  MoreVerticalIcon,
  Plus,
  Repeat,
  Trash2Icon,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AttachmentViewer } from "../components/attachment-viewer";
import { TaskList } from "../components/inbox/task-list";
import { useAgentAndTaskDetails } from "../hooks/useAgentAndTaskDetails";
import { useAttachmentOperations } from "../hooks/useAttachmentOperations";
import { useEmailOperations } from "../hooks/useEmailOperations";
import { useTagsSelect } from "../hooks/useTagsSelect";

interface EmailResponse {
  emails: IEmailData[];
}

export default function SingleEmailDetailView() {
  const { axiosAuth, loading } = useAxiosAuth();
  const router = useRouter();
  const params = useParams<{ email_id: string }>();

  const [showTagSelector, setShowTagSelector] = useState(false);
  const [isCopied, copyToClipboard] = useCopyToClipboard();
  const [confirmationBox, setConfirmationBox] = useState(false);
  const [isSharableLinkCopied, copyToClipboardSharableLink] =
    useCopyToClipboard();
  const [showIssueManagementSheet, setShowIssueManagementSheet] =
    useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // State with proper typing
  const [selectedEmail, setSelectedEmail] = useState<IEmailData | null>(null);

  const [isDetailsLoading, setIsDetailsLoading] = useState(true);

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const isDeleteEmailTask = canDelete(permissions, "task_inbox");
  const isEditEmailTask = canEdit(permissions, "task_inbox");

  const viewIssuesPermission = canView(permissions, "task_issues");

  const deleteIssuesPermission = canDelete(permissions, "task_issues");

  const isAllowedAddingIssue = canEdit(permissions, "task_issues");

  const { agentDetails, taskExecutionDetails, isTaskListLoading } =
    useAgentAndTaskDetails(selectedEmail);
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

  const {
    selectedDocumentData,
    openAttachmentDetails,
    handleOpenAttachmentEvent,
    closeAttachmentDetails,
  } = useAttachmentOperations();

  const {
    isDialogLoading,
    isConfirmationTrue,
    confirmationDialog,
    handleArchive,
    handleDelete,
    handleConfirm,
    handleCancel,
    setTargetEmailId,
  } = useEmailOperations();

  const handleEmailArchive = useCallback(() => {
    if (selectedEmail) {
      setTargetEmailId(selectedEmail.id);
      handleArchive();
    }
  }, [selectedEmail, setTargetEmailId, handleArchive]);

  const handleEmailDelete = useCallback(() => {
    if (selectedEmail) {
      setTargetEmailId(selectedEmail.id);
      handleDelete();
    }
  }, [selectedEmail, setTargetEmailId, handleDelete]);

  // Archive and Delete handlers for dropdown
  const handleDropdownArchive = useCallback(() => {
    setShowDropdown(false);
    handleEmailArchive();
  }, [handleEmailArchive]);

  const handleDropdownDelete = useCallback(() => {
    setShowDropdown(false);
    handleEmailDelete();
  }, [handleEmailDelete]);

  const handleCopy = (actionType: string = "copy_id") => {
    if (!selectedEmail) return;

    if (actionType === "copy_id") {
      copyToClipboard(selectedEmail.id);
    } else if (actionType === "sharable_link") {
      copyToClipboardSharableLink(`${window.location.href}`);
    }
  };

  const fetchEmailById = useCallback(
    async (emailId: string) => {
      if (loading) return;
      setIsDetailsLoading(true);
      try {
        const emailResponse = await axiosAuth.get<EmailResponse>(
          `${url.LIST_MAILBOX}/${emailId}`,
        );

        const email = emailResponse.data?.emails[0] || null;
        setSelectedEmail(email);
      } catch (e: any) {
        errorMessageHandler(e.response.data.detail);
      }
      setIsDetailsLoading(false);
    },
    [axiosAuth, loading],
  );

  useEffect(() => {
    if (!loading && params?.email_id) {
      fetchEmailById(params.email_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.email_id, loading]);

  useEffect(() => {
    if (isConfirmationTrue && !confirmationDialog.open && params?.email_id) {
      if (confirmationDialog.type === "delete") {
        // Redirect to inbox after successful delete
        router.push("/inbox");
      } else if (confirmationDialog.type === "archive") {
        // Refetch email details after successful archive
        fetchEmailById(params.email_id);
      }
    }
  }, [
    isConfirmationTrue,
    confirmationDialog.open,
    params?.email_id,
    confirmationDialog.type,
    router,
    fetchEmailById,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);

  //tags
  const handleTagRemove = useCallback(
    (tagId: any) => {
      setSelectedTags((selectedTags || []).filter((t: any) => t.id !== tagId));
    },
    [setSelectedTags, selectedTags],
  );

  // retry email
  const handleRetryEmail = () => {
    setConfirmationBox(true);
  };

  const handleConfirmRetryApi = async (emailId: string) => {
    let API_ENDPOINT_PATH = `/emails/${emailId}/reprocess`;
    try {
      const result = await axiosAuth.post(API_ENDPOINT_PATH);
      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        startPolling(emailId);
        fetchEmailById(emailId);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    }
  };

  const startPolling = useCallback(
    (emailId: string) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsRetrying(true);

      intervalRef.current = setInterval(async () => {
        try {
          const emailResponse = await axiosAuth.get<EmailResponse>(
            `${url.LIST_MAILBOX}/${emailId}`,
          );
          const email = emailResponse.data?.emails[0] || null;
          setSelectedEmail(email);

          if (
            email?.status === "SUCCESSFUL" ||
            email?.status === "FAILED" ||
            email?.status === "INCOMPLETE"
          ) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
              setIsRetrying(false);
            }
          }
        } catch (err: any) {
          errorMessageHandler(err.response.data.detail);
        }
      }, 5000);
    },
    [axiosAuth],
  );

  return (
    <div className="flex flex-col gap-4 xl:gap-6 py-6 min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className=" xl:max-w-4xl mx-auto w-full px-6">
        <div
          className={`rounded-lg shadow-xs p-4 flex items-center justify-between border transition-colors`}
        >
          <h1
            className={`text-lg xl:text-xl font-semibold transition-colors text-slate-900 dark:text-white`}
          >
            Email Preview
          </h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={`h-auto flex items-center gap-2 px-3 py-1.5 xl:text-sm text-xs font-medium rounded-md transition-colors border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600`}
              onClick={() => router.push(`/inbox`)}
            >
              <ChevronLeft className="w-4 h-4" />
              Back To Emails
            </Button>

            {selectedEmail && (
              <div className="relative">
                <Button
                  variant="outline"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className={`h-auto xl:p-2 py-1.5 !px-1 rounded-md transition-colors border`}
                >
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>

                {showDropdown && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg border z-50 transition-colors bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 `}
                  >
                    <div className="py-1">
                      {isEditEmailTask && (
                        <button
                          onClick={handleRetryEmail}
                          className="cursor-pointer flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Repeat className="mr-2 h-4 w-4" />
                          Retry Email
                        </button>
                      )}

                      {selectedEmail?.status !== "ARCHIVED" &&
                        isEditEmailTask && (
                          <button
                            onClick={handleDropdownArchive}
                            className="cursor-pointer flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <ArchiveIcon className="mr-2 h-4 w-4" />
                            Archive Email
                          </button>
                        )}

                      {selectedEmail?.status === "ARCHIVED" &&
                        isDeleteEmailTask && (
                          <button
                            onClick={handleDropdownDelete}
                            className={`flex items-center w-full px-3 py-2 text-sm transition-colors text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 `}
                          >
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            Delete Email
                          </button>
                        )}
                      {viewIssuesPermission && (
                        <button
                          onClick={() => setShowIssueManagementSheet(true)}
                          className="cursor-pointer flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <AlertCircle className="mr-2 h-4 w-4" />
                          View Issues
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {loading || isDetailsLoading ? (
        <main className="flex flex-1 items-center justify-center min-h-[60vh]">
          <Loader className="h-10 w-10 mt-6 animate-spin text-primary" />
        </main>
      ) : selectedEmail ? (
        <div className="xl:max-w-4xl min-w-full xl:min-w-auto mx-auto px-6">
          <div className="">
            {/* Email Information */}
            <Card
              className={`mb-8 p-0 gap-0 shadow-xs rounded-md divide-y-1 transition-colors`}
            >
              <CardHeader
                className={`px-4 py-3 rounded-t-md gap-0 transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <InboxIcon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    <CardTitle className="text-sm xl:text-base font-medium text-gray-800 dark:text-slate-200 max-w-md line-clamp-1 truncate">
                      {selectedEmail?.subject || "Loading..."}
                    </CardTitle>

                    <ConditionalTooltip
                      content={isCopied ? "Copied!" : "Copy email ID"}
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={() => handleCopy("copy_id")}
                      >
                        {isCopied ? (
                          <Check className="h-3.5! w-3.5! text-green-500" />
                        ) : (
                          <Copy className="h-3.5! w-3.5! text-slate-500" />
                        )}
                      </Button>
                    </ConditionalTooltip>

                    <ConditionalTooltip
                      content={
                        isSharableLinkCopied ? "Copied!" : "Copy shareable link"
                      }
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={() => handleCopy("sharable_link")}
                      >
                        {isSharableLinkCopied ? (
                          <Check className="h-3.5! w-3.5! text-green-500" />
                        ) : (
                          <Link className="h-3.5! w-3.5! text-slate-500" />
                        )}
                      </Button>
                    </ConditionalTooltip>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedEmail?.credits_used !== undefined &&
                      selectedEmail?.credits_used !== null && (
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
                    {selectedEmail?.status && (
                      <Badge
                        variant="outline"
                        className={`px-2  xl:px-2.5 py-0.5 xl:py-1 text-sm xl:text-base font-medium rounded-md uppercase ${getStatusColor(
                          selectedEmail?.status,
                        )}`}
                      >
                        {isRetrying && (
                          <JumpingLoadingAnimation
                            color={
                              selectedEmail?.status === "QUEUED"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }
                          />
                        )}
                        <span className="leading-none p-1">
                          {selectedEmail?.status}{" "}
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-5 py-5 space-y-6">
                {/* Email Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      From
                    </p>
                    <p
                      className="text-base font-medium flex flex-wrap items-baseline gap-x-1.5 truncate"
                      title={selectedEmail.email_id}
                    >
                      <span className="leading-tight">
                        {selectedEmail.sender_name}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground leading-tight">
                        ({selectedEmail.email_id})
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Mailbox
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedEmail?.mailbox_email || "Loading..."} |{" "}
                      <span className="text-gray-600 dark:text-slate-400">
                        {selectedEmail?.mailbox_folder || "inbox"}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Created At
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedEmail?.created_at
                        ? UTCToLocalTimezon(selectedEmail.created_at)
                        : "Loading..."}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Received At
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedEmail?.received_at
                        ? UTCToLocalTimezon(selectedEmail.received_at)
                        : "Loading..."}
                    </p>
                  </div>
                </div>

                {/* Email Body */}
                <div>
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mb-2">
                    Email Body
                  </p>
                  {selectedEmail?.email_body ? (
                    <div className="bg-slate-100 border dark:bg-slate-700/40 p-3 rounded-md text-sm relative group">
                      <CollapsibleContent
                        key={selectedEmail?.id}
                        className="prose prose-sm max-w-none dark:prose-invert"
                        gradientStart="from-slate-100"
                      >
                        <SmartContentViewer
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
                {selectedEmail?.attachment_details?.attachments &&
                  selectedEmail?.attachment_details?.attachments?.length >
                    0 && (
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-slate-400 mb-2">
                        Attachments ({selectedEmail?.attachment_details?.total})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedEmail?.attachment_details?.attachments?.map(
                          (att, index) => (
                            <a
                              key={index}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenAttachmentEvent(att);
                              }}
                              className="flex items-center p-2 border border-gray-200 dark:border-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-sm text-gray-700 dark:text-slate-300"
                            >
                              {getAttachmentIcon(att?.file_type)}

                              <div className="flex flex-1 items-center min-w-0 mr-2">
                                <ConditionalTooltip content={att?.file_name}>
                                  <span className="truncate w-full block">
                                    {att?.file_name}
                                  </span>
                                </ConditionalTooltip>
                              </div>

                              <span className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                {att?.file_size}
                              </span>
                            </a>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Tags  */}
                <div>
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

                    <Suspense
                      fallback={<Loader2Icon className="animate-spin" />}
                    >
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
                               hover:text-red-500 transition rounded-full bg-gray-200 p-[1px] shadow-sm"
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
                                .map((id) =>
                                  mergedList.find((t) => t.id === id),
                                )
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
            </Card>

            {/* Tasks */}
            {taskExecutionDetails ? (
              <TaskList
                assignedAgent={agentDetails}
                tasks={taskExecutionDetails}
                handleOpenAttachmentEvent={handleOpenAttachmentEvent}
                isTaskListLoading={isTaskListLoading}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full px-6">
          <Card className="w-full text-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            <CardContent className="py-16">
              <div className="flex flex-col items-center space-y-5">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <Inbox className="w-8 h-8 text-gray-500 dark:text-gray-300" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    No Email Found
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    This email could not be found or is no longer available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {openAttachmentDetails && selectedDocumentData && (
        <AttachmentViewer
          openAttachmentSheet={openAttachmentDetails}
          closeAttachmentDetailsEvent={closeAttachmentDetails}
          attachment={selectedDocumentData}
        />
      )}

      <CustomAlertDialog
        open={confirmationDialog.open}
        title={
          confirmationDialog.type === "archive"
            ? "Are you sure you want to archive this email?"
            : "Are you sure you want to delete this archived email?"
        }
        description={
          confirmationDialog.type === "archive"
            ? "This action will archive the email and related tasks and remove them from your inbox list."
            : "This action will permanently delete the archived email and related tasks and remove them from your inbox list."
        }
        onOpenChange={handleCancel}
        handleAlert={handleConfirm}
        isLoading={isDialogLoading}
      />

      {confirmationBox && (
        <ConfirmationDialog
          open={confirmationBox}
          confirm={() => handleConfirmRetryApi(selectedEmail!.id)}
          cancel={() => setConfirmationBox(false)}
          title="Are you sure you want to retry this email?"
          description="Retrying will attempt to execute the email again. Any previous email progress may be overwritten or replaced."
        />
      )}

      <IssueReportSheet
        isOpen={showIssueManagementSheet}
        onOpenChange={setShowIssueManagementSheet}
        emailData={selectedEmail}
        isAllowedAddIssue={false}
        isAllowedAddingIssue={isAllowedAddingIssue}
        deleteIssuesPermission={deleteIssuesPermission}
      />
    </div>
  );
}
