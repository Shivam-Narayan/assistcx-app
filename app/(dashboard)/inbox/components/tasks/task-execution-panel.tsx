"use client";

import type { AgentOutputMainData, ExecutionMessage, ReviewHistoryItem } from "@/types/types";
import type { Dispatch, SetStateAction } from "react";
import React, { useRef, useState } from "react";
import { AgentActionsTimeline } from "./agent-actions-timeline";
import ExecutionLoader from "./execution-loader";
import { ExecutionActions } from "./execution-actions";
import { TaskExecutionOutput } from "./task-execution-output";
import { TaskExecutionTimeline } from "./task-execution-timeline";
import { TaskPrompt } from "./task-prompt";

interface TaskExecutionPanelProps {
  agentOutputData: AgentOutputMainData | null;
  setAgentOutputData: (agentOutputData: AgentOutputMainData | null) => void;
  executionLog: ExecutionMessage[];
  isTaskInExecutionPhase: boolean;
  isTaskQueued?: boolean;
  taskStatus?: string | null;
  isCustomTaskLoading: boolean;
  setIsCustomTaskLoading: (isLoading: boolean) => void;
  setTaskStatus: (status: string | null) => void;
  setExecutionLog: (executionLog: ExecutionMessage[]) => void;
  allowTaskFollowup: boolean;
  pendingReview: any;
  setPendingReview: (actionRequired: any) => void;
  reviewHistory: ReviewHistoryItem[];
  setReviewHistory: Dispatch<SetStateAction<ReviewHistoryItem[]>>;
  getTaskInformation: () => Promise<void>;
}

export const TaskExecutionPanel: React.FC<TaskExecutionPanelProps> = ({
  agentOutputData,
  setAgentOutputData,
  executionLog,
  isTaskInExecutionPhase,
  isTaskQueued = false,
  taskStatus,
  isCustomTaskLoading,
  setIsCustomTaskLoading,
  setTaskStatus,
  setExecutionLog,
  allowTaskFollowup,
  pendingReview,
  setPendingReview,
  reviewHistory,
  setReviewHistory,
  getTaskInformation,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  if (isTaskQueued) return <ExecutionLoader />;

  const agentOutput = agentOutputData?.agent_outputs?.[0];
  const output = agentOutput?.output || "";

  let agentActions: any[] = [];
  if (agentOutput?.agent_actions) {
    try {
      const raw = agentOutput.agent_actions;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      agentActions = Array.isArray(parsed) ? parsed : [];
    } catch {
      agentActions = [];
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      setIsScrolled(e.currentTarget.scrollTop >= timelineRef.current.offsetTop);
    }
  };

  const hasPendingReview = !!pendingReview?.tool_call_id;

  const isTaskRunningOrQueued =
    isTaskInExecutionPhase ||
    isTaskQueued ||
    taskStatus === "EXECUTING" ||
    taskStatus === "QUEUED" ||
    taskStatus === "PAUSED" ||
    isCustomTaskLoading;

  const showTaskFinalOutput = Boolean(output) && !isTaskRunningOrQueued;

  const showContinueTaskBox =
    allowTaskFollowup &&
    !hasPendingReview &&
    !isTaskRunningOrQueued;

  const bottomPadding = showContinueTaskBox ? "pb-0" : "pb-6";

  return (
    <div
      className={`space-y-4 h-full overflow-y-auto px-4 xl:px-6 relative ${bottomPadding}`}
      onScroll={handleScroll}
    >
      <div className="lg:max-w-4xl mx-auto pt-8 flex flex-col gap-6 min-h-full">
        {showTaskFinalOutput && (
          <TaskExecutionOutput agentOutputData={output} />
        )}
        {executionLog.length > 0 && (
          <div ref={timelineRef}>
            <TaskExecutionTimeline
              executionLog={executionLog}
              isScrolled={isScrolled}
              isCustomTaskLoading={isCustomTaskLoading}
              isTaskInExecutionPhase={isTaskInExecutionPhase}
              reviewHistory={reviewHistory}
            />
          </div>
        )}
        {agentActions.length > 0 && (
          <AgentActionsTimeline agentActions={agentActions} />
        )}
        {showContinueTaskBox && <div className="flex-1" />}
        {hasPendingReview && (
          <ExecutionActions
            taskStatus={taskStatus}
            setIsCustomTaskLoading={setIsCustomTaskLoading}
            setTaskStatus={setTaskStatus}
            setExecutionLog={setExecutionLog}
            executionLog={executionLog}
            setAgentOutputData={setAgentOutputData}
            agentOutputData={agentOutputData}
            pendingReview={pendingReview}
            setPendingReview={setPendingReview}
            setReviewHistory={setReviewHistory}
            getTaskInformation={getTaskInformation}
          />
        )}
        {showContinueTaskBox && (
          <TaskPrompt
            taskStatus={taskStatus}
            setIsCustomTaskLoading={setIsCustomTaskLoading}
            setTaskStatus={setTaskStatus}
            setExecutionLog={setExecutionLog}
            executionLog={executionLog}
            setAgentOutputData={setAgentOutputData}
            agentOutputData={agentOutputData}
            getTaskInformation={getTaskInformation}
          />
        )}
      </div>
    </div>
  );
};