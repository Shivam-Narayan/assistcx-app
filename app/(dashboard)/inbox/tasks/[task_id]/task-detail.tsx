"use client";

import { Button } from "@/components/ui/button";
import { PanelRightOpen } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Loading from "../../components/tasks/loading";
import { TaskDetailHeader } from "../../components/tasks/task-detail-header";
import { TaskExecutionPanel } from "../../components/tasks/task-execution-panel";
import { TaskInfoPanel } from "../../components/tasks/task-info-panel";
import { useTaskDetail } from "../../hooks/useTaskDetail";

export default function TaskDetail() {
  const { task_id } = useParams() as { task_id: string };
  const [expandInfoPanel, setExpandInfoPanel] = useState(false);

  const {
    taskDetails,
    taskExecutionDetails,
    isLoading,
    taskStatus,
    setTaskStatus,
    agentDetails,
    agentOutputData,
    setAgentOutputData,
    selectedAttemptId,
    isTaskInExecutingPhase,
    isTaskQueued,
    isTaskListLoading,
    isCustomTaskLoading,
    setIsCustomTaskLoading,
    executionLog,
    setExecutionLog,
    loading,
    handleAttemptSelect,
    handleRefreshPage,
    getTaskInformation,
    tokenUsageData,
    pendingReview,
    setPendingReview,
    reviewHistory,
    setReviewHistory,
    isRootUser,
    fetchTokenUsage,
    fetchEmailSheetData,
    emailSheetData,
  } = useTaskDetail(task_id);

  const stillInitializing = loading || (isLoading && !isTaskInExecutingPhase && !isTaskQueued);
  if (stillInitializing) return <Loading />;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <TaskDetailHeader
        isTaskListLoading={isTaskListLoading}
        taskDetails={taskDetails}
        taskExecutionDetails={taskExecutionDetails}
        attempts={agentOutputData?.attempts}
        onAttemptSelect={handleAttemptSelect}
        isTaskInExecutionPhase={isTaskInExecutingPhase}
        selectedAttemptId={selectedAttemptId}
        handleRefreshPage={handleRefreshPage}
        agentOutputData={agentOutputData}
        taskStatus={taskStatus}
        setTaskStatus={setTaskStatus}
        isCustomTaskLoading={isCustomTaskLoading}
        agentDetails={agentDetails}
        tokenUsageData={tokenUsageData}
        isRootUser={isRootUser}
        fetchTokenUsage={fetchTokenUsage}
        fetchEmailSheetData={fetchEmailSheetData}
        emailSheetData={emailSheetData}
      />

      <div className="relative flex-1 min-h-0">
        <div className="flex h-full overflow-hidden">

          {/* Main execution panel  */}
          <div className={`flex flex-col min-h-0 transition-all duration-300 ease-in-out ${
            expandInfoPanel ? "w-7/12 lg:w-3/5" : "w-full"
          }`}>
            <div className="w-full h-full bg-muted/30">
              <TaskExecutionPanel
                agentOutputData={agentOutputData}
                setAgentOutputData={setAgentOutputData}
                executionLog={executionLog}
                setExecutionLog={setExecutionLog}
                isTaskInExecutionPhase={isTaskInExecutingPhase}
                isTaskQueued={isTaskQueued}
                taskStatus={taskStatus}
                setTaskStatus={setTaskStatus}
                isCustomTaskLoading={isCustomTaskLoading}
                setIsCustomTaskLoading={setIsCustomTaskLoading}
                allowTaskFollowup={agentDetails?.agent_config?.allow_task_followup ?? false}
                pendingReview={pendingReview}
                setPendingReview={setPendingReview}
                reviewHistory={reviewHistory}
                setReviewHistory={setReviewHistory}
                getTaskInformation={getTaskInformation}
              />
            </div>
          </div>

          {/* Slide-in info panel */}
          <div className={`flex flex-col min-h-0 transition-all duration-300 ease-in-out ${
            expandInfoPanel
              ? "w-5/12 lg:w-2/5 opacity-100 translate-x-0"
              : "w-0 opacity-0 translate-x-full overflow-hidden"
          }`}>
            <div className="h-full w-full border-l overflow-hidden">
              <TaskInfoPanel
                taskDetails={taskDetails}
                agentDetails={agentDetails}
                isTaskListLoading={isTaskListLoading}
                isOpen={expandInfoPanel}
                onClose={() => setExpandInfoPanel(false)}
              />
            </div>
          </div>
        </div>

        {/* Floating toggle  */}
        {!expandInfoPanel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandInfoPanel(true)}
            className="absolute top-6 right-0.5 z-20 flex items-center gap-1.5 cursor-pointer rounded-l-full pl-3! pr-4! py-2 h-auto border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary shadow-sm hover:shadow-md hover:shadow-primary/10 transition-all duration-200 hover:scale-103"
          >
            <PanelRightOpen className="h-4 w-4" />
            <span className="text-sm font-medium">Task Overview</span>
          </Button>
        )}
      </div>
    </div>
  );
}
