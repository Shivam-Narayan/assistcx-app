"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomAlertDialog from "@/components/custom-alert-dialog";
import { IssueReportSheet } from "@/components/issue-management/issue-report-sheet";
import { JumpingLoadingAnimation } from "@/components/JumpingLoadingAnimation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  errorMessageHandler,
  getStatusColor,
  successMessageHandler,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canDelete, canEdit, canView } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import {
  IAgentDetails,
  IAttachmentDetails,
  TokenUsageProps,
} from "@/types/types";
import {
  Archive,
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Clock,
  Coins,
  History,
  Mail,
  MoreVertical,
  Repeat,
  SquarePen,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AttachmentViewer } from "../attachment-viewer";
import { ChangeStatusDialog } from "./change-status-dialog";
import { EmailDetailsSheet } from "./email-details-sheet";
import { RetryTaskDialog } from "./retry-task-dialog";
import TaskActivitySheet from "./task-activity-sheet";
import TaskNavigationComponent from "./task-navigation-component";
import { TaskTokenUsageDialog } from "./task-token-usage-dialog";

interface TaskDetailHeaderProps {
  attempts?: Array<{
    id: string;
    agent_task_id: string;
    created_at: string;
  }>;
  onAttemptSelect?: (attemptId: string) => void;
  isTaskListLoading: boolean;
  isTaskInExecutionPhase: boolean;
  selectedAttemptId?: string;
  taskDetails?: any;
  taskExecutionDetails: any;
  handleRefreshPage?: () => void;
  agentOutputData?: any;
  taskStatus?: string | null;
  setTaskStatus?: (status: string | null) => void;
  isCustomTaskLoading?: boolean;
  agentDetails: IAgentDetails | null;
  tokenUsageData?: TokenUsageProps | null;
  isRootUser?: boolean;
  fetchTokenUsage: () => Promise<void>;
  fetchEmailSheetData: () => Promise<void>;
  emailSheetData: { emailData: any; taskExecutionDetail: any[] } | null;
}

export const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({
  attempts = [],
  onAttemptSelect,
  isTaskListLoading,
  isTaskInExecutionPhase,
  selectedAttemptId,
  taskDetails,
  taskExecutionDetails,
  handleRefreshPage,
  agentOutputData,
  taskStatus,
  setTaskStatus,
  isCustomTaskLoading,
  agentDetails,
  tokenUsageData,
  isRootUser = false,
  fetchTokenUsage,
  fetchEmailSheetData,
  emailSheetData,
}) => {
  const [selectedAttempt, setSelectedAttempt] = useState(attempts[0]?.id || "");
  const [retryDialogOpen, setRetryDialogOpen] = useState(false);
  const [retryTaskDetails, setRetryTaskDetails] = useState<any>(null);
  const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);
  const [showIssueManagementSheet, setShowIssueManagementSheet] =
    useState(false);
  const [isEmailSheetOpen, setIsEmailSheetOpen] = useState(false);
  const [selectedDocumentData, setSelectedDocumentData] =
    useState<IAttachmentDetails | null>(null);
  const [openAttachmentDetails, setOpenAttachmentDetails] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTokenUsageSheet, setShowTokenUsageSheet] = useState(false);
  const { axiosAuth, loading } = useAxiosAuth();
  const router = useRouter();

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const isupdateAgentTask = canEdit(permissions, "task_inbox");
  const isRetryAllowed = canEdit(permissions, "task_inbox");
  const isAllowedAddingIssue = canEdit(permissions, "task_issues");
  const viewIssuesPermission = canView(permissions, "task_issues");
  const deleteIssuesPermission = canDelete(permissions, "task_issues");

  useEffect(() => {
    if (selectedAttemptId) {
      setSelectedAttempt(selectedAttemptId);
    } else if (attempts.length > 0) {
      setSelectedAttempt(attempts[0].id);
    }
  }, [selectedAttemptId, attempts]);

  const handleAttemptSelect = (attemptId: string) => {
    setSelectedAttempt(attemptId);
    onAttemptSelect?.(attemptId);
  };

  useEffect(() => {
    if (isCustomTaskLoading) return;

    if (selectedAttemptId && agentOutputData?.agent_outputs) {
      const selectedOutput = agentOutputData.agent_outputs.find(
        (output: any) => {
          const outputId =
            output.id ||
            output.uuid ||
            output.agent_output_uuid ||
            output.attempt_id;
          return outputId === selectedAttemptId;
        },
      );

      if (selectedOutput) {
        try {
          if (selectedOutput.output) {
            const parsedOutput =
              typeof selectedOutput.output === "string"
                ? JSON.parse(selectedOutput.output)
                : selectedOutput.output;

            const attemptStatus = parsedOutput?.task_status;

            if (attemptStatus) {
              const displayStatus =
                attemptStatus.toUpperCase() === "COMPLETED"
                  ? "SUCCESSFUL"
                  : attemptStatus.toUpperCase();
              setTaskStatus?.(displayStatus);
              return;
            }
          }
        } catch (error) {
          console.error("Error parsing output:", error);
        }

        const attemptStatus =
          selectedOutput?.status ||
          selectedOutput?.execution_status ||
          selectedOutput?.agent_status;

        if (attemptStatus) {
          const displayStatus =
            attemptStatus.toUpperCase() === "COMPLETED"
              ? "SUCCESSFUL"
              : attemptStatus;
          setTaskStatus?.(displayStatus);
          return;
        }
      }
    }

    const status =
      taskDetails?.progress && taskDetails?.progress?.length !== 0
        ? taskDetails?.progress[taskDetails?.progress?.length - 1]["status"]
        : null;
    setTaskStatus?.(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskDetails, selectedAttemptId, agentOutputData, isCustomTaskLoading]);

  const handleRetryTask = () => {
    if (taskDetails?.id && taskDetails?.agent_id) {
      setRetryTaskDetails({
        agent_id: taskDetails.agent_id,
        agent_task_id: taskDetails.id,
      });
      setRetryDialogOpen(true);
    }
  };

  const handleArchiveTask = async () => {
    if (!loading && taskDetails?.id) {
      setIsArchiveLoading(true);
      try {
        const requestBody = {
          agent_task_ids: [taskDetails.id],
          status: "ARCHIVED",
        };

        const result = await axiosAuth.post(
          `${url.CHANGE_TASK_STATUS}`,
          requestBody,
        );
        if (result?.status === 200) {
          successMessageHandler(result?.data?.message);
          handleRefreshPage?.();
          setArchiveDialogOpen(false);
        }
      } catch (error) {
        console.error(error);
        errorMessageHandler(error);
      } finally {
        setIsArchiveLoading(false);
      }
    }
  };

  const handleViewEmail = async () => {
    await fetchEmailSheetData();
    setIsEmailSheetOpen(true);
  };

  const handleOpenTokenUsage = async () => {
    setShowTokenUsageSheet(true);
    await fetchTokenUsage();
  };

  const handleOpenAttachmentEvent = (attachment: IAttachmentDetails) => {
    setSelectedDocumentData(attachment);
    setOpenAttachmentDetails(true);
  };
  const closeAttachmentDetails = () => {
    setOpenAttachmentDetails(false);
    setSelectedDocumentData(null);
  };

  return (
    <>
      <div className="flex  flex-wrap xl:items-center justify-between px-4 py-3 border-b dark:border-slate-700 bg-card sticky top-0 z-10">
        {/* Left Side: Back button and Title */}
        <div className="flex items-center gap-3 w-full xl:w-auto  max-w-full mb-2 xl:mb-0">
          <Button
            variant="outline"
            className={`h-8 cursor-pointer transition-colors`}
            onClick={() => router.push("/inbox")}
          >
            <ArrowLeft className="h-5 w-5" />

            <span className="sr-only">Back to Inbox</span>
          </Button>
          <h2 className="text-lg xl:text-xl font-semibold truncate line-clamp-1  md:max-w-full xl:max-w-sm">
            {taskDetails?.title || "Task Details"}
          </h2>
        </div>
        <TaskNavigationComponent
          taskExecutionDetails={taskExecutionDetails}
          taskDetails={taskDetails}
          isTaskListLoading={isTaskListLoading}
        />

        {/* Right Side: Attempt selector, Status and Actions Menu */}
        <div className="flex items-center gap-3">
          {isRootUser &&
            taskDetails?.credits_used !== undefined &&
            taskDetails?.credits_used !== null && (
              <ConditionalTooltip
                content="Credits used"
                alwaysShow={true}
                showArrow={true}
              >
                <Badge
                  variant="outline"
                  className="h-8 text-sm px-3 py-1 flex items-center gap-1.5 font-normal rounded-md cursor-default bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{taskDetails.credits_used}</span>
                </Badge>
              </ConditionalTooltip>
            )}

          {taskStatus && (
            <Badge
              variant="outline"
              className={`${getStatusColor(
                taskStatus,
              )}  h-8 text-sm px-3 py-1 flex items-center gap-1 font-normal`}
            >
              {(isTaskInExecutionPhase || isCustomTaskLoading) && (
                <JumpingLoadingAnimation
                  color={
                    taskStatus === "QUEUED" ? "bg-yellow-500" : "bg-blue-500"
                  }
                />
              )}
              <span className="leading-none p-1">{taskStatus}</span>
            </Badge>
          )}

          {/* Attempt selector */}
          {!isTaskInExecutionPhase && attempts.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 h-8 focus-visible:ring-0 focus:outline-hidden focus-visible:outline-hidden cursor-pointer transition-colors  `}
                >
                  <History className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
                    Attempt{" "}
                    {attempts.length -
                      attempts.findIndex((a) => a.id === selectedAttempt)}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-auto p-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mb-1">
                  Previous Attempts
                </div>
                <DropdownMenuRadioGroup
                  value={selectedAttempt}
                  onValueChange={handleAttemptSelect}
                >
                  {attempts.map((attempt, index) => (
                    <React.Fragment key={attempt.id}>
                      {index > 0 && <DropdownMenuSeparator className="my-1" />}
                      <DropdownMenuRadioItem
                        value={attempt.id}
                        className="py-2 cursor-pointer"
                        disabled={isTaskInExecutionPhase}
                      >
                        <div className="flex gap-2 justify-start items-center w-full">
                          <span className="font-medium">
                            Attempt {attempts.length - index}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {UTCToLocalTimezon(attempt.created_at)}
                          </span>
                        </div>
                      </DropdownMenuRadioItem>
                    </React.Fragment>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {taskStatus !== "ARCHIVED" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 ring-0 outline-hidden focus-visible:ring-0 cursor-pointer transition-colors`}
                >
                  <MoreVertical className={`h-4 w-4`} />
                  <span className="sr-only">Open actions menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {taskStatus !== "PAUSED" && isRetryAllowed && (
                  <DropdownMenuItem
                    onClick={handleRetryTask}
                    disabled={isTaskInExecutionPhase}
                    className={`${
                      isTaskInExecutionPhase
                        ? "text-gray-400 cursor-not-allowed"
                        : ""
                    } cursor-pointer`}
                  >
                    <Repeat className="mr-2 h-4 w-4" />
                    <span>Retry Task</span>
                  </DropdownMenuItem>
                )}

                {taskStatus !== "PAUSED" && isupdateAgentTask && (
                  <DropdownMenuItem
                    onClick={() => setChangeStatusDialogOpen(true)}
                    disabled={isTaskInExecutionPhase}
                    className={`${
                      isTaskInExecutionPhase
                        ? "text-gray-400 cursor-not-allowed"
                        : ""
                    } cursor-pointer`}
                  >
                    <SquarePen className="mr-2 h-4 w-4" />
                    <span>Change Status</span>
                  </DropdownMenuItem>
                )}
                {isupdateAgentTask && (
                  <DropdownMenuItem
                    onClick={() => setArchiveDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    <span>Archive Task</span>
                  </DropdownMenuItem>
                )}
                {viewIssuesPermission && (
                  <DropdownMenuItem
                    onSelect={() => setShowIssueManagementSheet(true)}
                    className="cursor-pointer"
                  >
                    <TriangleAlert className="mr-2 h-4 w-4" />
                    <span>Report Issues</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleViewEmail}
                  className="cursor-pointer"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  <span>View Email</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={isTaskInExecutionPhase}
                  onClick={() => setShowHistoryModal(true)}
                  className="cursor-pointer"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <span>View Activity</span>
                </DropdownMenuItem>

                {isRootUser && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleOpenTokenUsage}
                      className="cursor-pointer"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>View Usage</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <RetryTaskDialog
        open={retryDialogOpen}
        onOpenChange={setRetryDialogOpen}
        retryTaskDetails={retryTaskDetails}
        onRetrySuccess={handleRefreshPage}
      />

      <ChangeStatusDialog
        open={changeStatusDialogOpen}
        onOpenChange={setChangeStatusDialogOpen}
        onStatusChangeSuccess={handleRefreshPage}
        taskDetails={taskDetails}
      />

      <CustomAlertDialog
        open={archiveDialogOpen}
        title="Are you sure you want to archive this task?"
        description="This action will archive the task and remove it from your inbox list."
        onOpenChange={setArchiveDialogOpen}
        handleAlert={handleArchiveTask}
        isLoading={isArchiveLoading}
      />

      {showIssueManagementSheet && (
        <IssueReportSheet
          isOpen={showIssueManagementSheet}
          onOpenChange={setShowIssueManagementSheet}
          isAllowedAddIssue={true}
          emailData={taskDetails}
          isAllowedAddingIssue={isAllowedAddingIssue}
          deleteIssuesPermission={deleteIssuesPermission}
        />
      )}

      <EmailDetailsSheet
        isOpen={isEmailSheetOpen}
        onOpenChange={setIsEmailSheetOpen}
        emailData={emailSheetData?.emailData ?? null}
        agentDetails={agentDetails}
        taskExecutionDetails={emailSheetData?.taskExecutionDetail ?? []}
        onOpenAttachment={handleOpenAttachmentEvent}
        isDetailsHide={true}
        onArchive={() => {}}
        onDelete={() => {}}
        isTaskListLoading={isTaskListLoading}
      />

      <TaskActivitySheet
        isOpen={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        taskDetails={taskDetails}
      />

      <TaskTokenUsageDialog
        open={showTokenUsageSheet}
        onOpenChange={setShowTokenUsageSheet}
        taskId={taskDetails?.id}
        creditsUsed={tokenUsageData?.credits_used}
        tokenUsage={tokenUsageData?.token_usage}
      />
      {openAttachmentDetails && (
        <AttachmentViewer
          openAttachmentSheet={openAttachmentDetails}
          closeAttachmentDetailsEvent={closeAttachmentDetails}
          attachment={selectedDocumentData}
        />
      )}
    </>
  );
};
