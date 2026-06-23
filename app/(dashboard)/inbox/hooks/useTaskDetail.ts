import { errorMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useAppSelector } from "@/redux/store";
import {
  AgentOutputMainData, ExecutionMessage, ReviewHistoryItem, TokenUsageProps, type IAgentDetails,
} from "@/types/types";
import { useCallback, useEffect, useRef, useState } from "react";

export const useTaskDetail = (task_id: string) => {
  const { axiosAuth, loading } = useAxiosAuth();

  // ─── State ────────────────────────────────────────────────────────────────
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [taskExecutionDetails, setTaskExecutionDetails] = useState<any>(null);
  const [agentDetails, setAgentDetails] = useState<IAgentDetails | null>(null);
  const [agentOutputData, setAgentOutputData] = useState<AgentOutputMainData | null>(null);
  const [executionLog, setExecutionLog] = useState<ExecutionMessage[]>([]);
  const [pendingReview, setPendingReview] = useState<any>({});
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([]);
  const [tokenUsageData, setTokenUsageData] = useState<TokenUsageProps | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskListLoading, setTaskListLoading] = useState(false);
  const [isCustomTaskLoading, setIsCustomTaskLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);

  const [emailSheetData, setEmailSheetData] = useState<{
    emailData: any;
    taskExecutionDetail: any[];
  } | null>(null);
  const [isEmailSheetLoading, setIsEmailSheetLoading] = useState(false);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const streamController = useRef<AbortController | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isStreaming = () => streamController.current !== null;

  // ─── Permissions ──────────────────────────────────────────────────────────
  const isRootUser = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole?.isRoot,
  );

  // ─── Derived status helpers ───────────────────────────────────────────────
  const getLastStatus = (details: any) =>
    details?.progress?.[details.progress.length - 1]?.status ?? null;

  const isExecuting = (details: any) => getLastStatus(details) === "EXECUTING";
  const isQueued = (details: any) => getLastStatus(details) === "QUEUED";
  const isPaused = (details: any) => getLastStatus(details) === "PAUSED";

  // ─── Polling ─────────────────────────────────────────────────────────────
  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(getTaskInformation, 5000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // ─── Stream ───────────────────────────────────────────────────────────────
  const stopStream = () => {
    streamController.current?.abort();
    streamController.current = null;
  };

  const startExecutionStream = async (taskUUID: string, attemptId?: string) => {
    if (!taskUUID) return;
    stopStream();

    const controller = new AbortController();
    streamController.current = controller;

    const streamUrl = attemptId
      ? `${url.AGENT_TASKS_STREAM}/${taskUUID}/stream?agent_output_uuid=${attemptId}`
      : `${url.AGENT_TASKS_STREAM}/${taskUUID}/stream`;

    try {
      const response = await axiosAuth.get(streamUrl, {
        responseType: "stream",
        signal: controller.signal,
        adapter: "fetch",
        headers: { Accept: "text/event-stream" },
      });

      if (response.status !== 200) throw new Error(`HTTP Error ${response.status}`);

      const reader = response.data.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += value;
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;
          const dataLine = chunk.split("\n").find((line: string) => line.startsWith("data: "));
          if (!dataLine) continue;

          const data = dataLine.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.execution_log) setExecutionLog(parsed.execution_log);
            if (parsed.review_history) setReviewHistory(parsed.review_history);
            if (parsed.pending_review) setPendingReview((prev: any) => ({ ...prev, ...parsed.pending_review }));
            if (parsed.attempts) {
              setAgentOutputData((prev) => ({
                agent_outputs: prev?.agent_outputs || [],
                attempts: parsed.attempts,
                total: parsed.total || prev?.total || 0,
              }));
            }
            if (parsed.agent_outputs) {
              setAgentOutputData((prev) => {
                if (attemptId && prev?.agent_outputs?.length) {
                  return {
                    ...prev,
                    agent_outputs: prev.agent_outputs.map((output: any) => {
                      const id = output.id || output.uuid || output.agent_output_uuid || output.attempt_id;
                      return id === attemptId ? { ...output, ...parsed.agent_outputs[0] } : output;
                    }),
                  };
                }
                return {
                  agent_outputs: parsed.agent_outputs,
                  attempts: prev?.attempts || parsed.attempts || [],
                  total: prev?.total || parsed.total || 0,
                };
              });
            }
          } catch (err) {
            console.warn("Failed to parse stream chunk:", data, err);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        await getTaskOutput(attemptId);
      }
    } finally {
      if (streamController.current === controller) stopStream();
    }
  };

  // ─── API calls ────────────────────────────────────────────────────────────
  const getTaskInformation = async () => {
    if (loading) return;
    try {
      setTaskListLoading(true);
      const result = await axiosAuth.get(`${url.AGENT_TASK_DETAILS}/${task_id}`);
      if (result?.status === 200) {
        setTaskDetails(result.data);
      }
    } catch (error) {
      errorMessageHandler(error || "Error fetching task details");
    } finally {
      setTaskListLoading(false);
    }
  };

  const fetchRelatedEmailTasks = useCallback(async (taskData: any) => {
    if (!taskData?.id) return;
    try {
      const emailResult = await axiosAuth.get(`${url.LIST_MAILBOX}/${taskData.email_data_id}`);
      if (emailResult?.status !== 200 || !emailResult.data?.emails?.[0]) return;

      const taskResult = await axiosAuth.get(
        `${url.EMAIL_TASK_LIST}/${taskData.email_data_id}/agent-tasks`,
      );
      if (taskResult?.status === 200) {
        const tasks = taskResult.data?.agent_tasks ?? [];
        setTaskExecutionDetails(tasks.map((item: any) => ({
          title: item.title,
          id: item.id,
          agent_id: item.agent_id,
          created_at: item.created_at,
          credits_used: item.credits_used,
          agent_name: item.agent_name,
          agent_icon: item.agent_icon,
          attachment_details: item.attachment_details,
          task_order: item.task_order || "",
          description: item.description,
          email_data_id: item.email_data_id,
          completed_at: item.completed_at,
          status: item?.progress?.length ? item.progress[item.progress.length - 1].status : null,
          timestamp: item.progress?.[0]?.timestamp || null,
        })));
      }
    } catch (error) {
      console.error("Error fetching related email tasks:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosAuth]);

  const getTaskOutput = async (attemptId?: string) => {
    if (loading) return;
    try {
      const endpoint = attemptId
        ? `${url.MAILBOX_OUTPUT_DETAILS}/${task_id}/outputs?agent_output_uuid=${attemptId}`
        : `${url.MAILBOX_OUTPUT_DETAILS}/${task_id}/outputs`;
      const result = await axiosAuth.get(endpoint);
      if (result?.status === 200) {
        setAgentOutputData(result.data);
        const rawLog = result.data?.agent_outputs?.[0]?.execution_log;
        setExecutionLog(rawLog ? (typeof rawLog === "string" ? JSON.parse(rawLog) : rawLog) : []);
        const rawReviewHistory =
          result.data?.review_history ||
          result.data?.agent_outputs?.[0]?.review_history ||
          [];
        if (rawReviewHistory.length > 0) setReviewHistory(rawReviewHistory);
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) errorMessageHandler(error || "Error fetching task output");
    }
  };

  const getAgentDetails = async (agentId: string) => {
    if (loading) return;
    try {
      const result = await axiosAuth.get(`${url.AGENTS_PREVIEW}?agent_identifier=${agentId}`);
      if (result?.status === 200) setAgentDetails(result.data.agent_previews?.[0] ?? null);
    } catch (error) {
      console.error("Error fetching agent details:", error);
    }
  };

  const fetchTokenUsage = useCallback(async () => {
    if (loading || tokenUsageData) return;
    try {
      const result = await axiosAuth.get(`${url.MAILBOX_OUTPUT_DETAILS}/${task_id}/outputs/usage`);
      if (result?.status === 200) setTokenUsageData(result.data);
    } catch (error) {
      errorMessageHandler(error || "Error fetching token usage");
    }
  }, [loading, task_id, axiosAuth, tokenUsageData]);

  const fetchEmailSheetData = useCallback(async () => {
    if (!taskDetails?.email_data_id) return;
    if (emailSheetData) return;

    try {
      setIsEmailSheetLoading(true);
      const result = await axiosAuth.get(`${url.LIST_MAILBOX}/${taskDetails.email_data_id}`);
      if (result?.status !== 200 || !result.data?.emails?.[0]) return;

      const emailData = result.data.emails[0];

      const taskResult = await axiosAuth.get(
        `${url.EMAIL_TASK_LIST}/${taskDetails.email_data_id}/agent-tasks`,
      );
      if (taskResult?.status === 200) {
        const tasks = taskResult.data?.agent_tasks ?? [];
        const SUCCESSFUL = taskResult.data?.agent_task_counts?.SUCCESSFUL || 0;
        const TOTAL = taskResult.data?.agent_task_counts?.TOTAL || 0;

        const transformed = tasks.map((item: any) => ({
          title: item.title,
          id: item.id,
          agent_id: item.agent_id,
          created_at: item.created_at,
          credits_used: item.credits_used,
          agent_name: item.agent_name,
          agent_icon: item.agent_icon,
          attachment_details: item.attachment_details,
          task_order: item.task_order || "",
          description: item.description,
          email_data_id: item.email_data_id,
          completed_at: item.completed_at,
          status: item?.progress?.length
            ? item.progress[item.progress.length - 1].status
            : null,
          timestamp: item.progress?.[0]?.timestamp || null,
        }));

        setEmailSheetData({
          emailData,
          taskExecutionDetail: [{ tasks: transformed, count: { SUCCESSFUL, TOTAL } }],
        });
      }
    } catch (error) {
      console.error("Error fetching email details:", error);
    } finally {
      setIsEmailSheetLoading(false);
    }
  }, [taskDetails?.email_data_id, emailSheetData, axiosAuth]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const clearOutputState = () => {
    setAgentOutputData(null);
    setExecutionLog([]);
    setPendingReview({});
    setReviewHistory([]);
  };

  // ─── Public actions ───────────────────────────────────────────────────────
  const handleAttemptSelect = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    clearOutputState();
    stopStream();
  };

  const handleRefreshPage = async () => {
    stopStream();
    stopPolling();
    setIsLoading(true);
    setSelectedAttemptId("");
    setTaskStatus(null);
    clearOutputState();
    setEmailSheetData(null);
    setTokenUsageData(null);

    try {
      await getTaskInformation();
    } finally {
      setIsLoading(false);
    }

    startExecutionStream(task_id);
  };

  // ─── Effects ──────────────────────────────────────────────────────────────

  // Initial load once axiosAuth is ready, or when task_id changes
  useEffect(() => {
    if (!loading) handleRefreshPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, task_id]);

  useEffect(() => {
    if (taskDetails?.email_data_id && !taskExecutionDetails) {
      fetchRelatedEmailTasks(taskDetails);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskDetails?.email_data_id]);

  // When user switches to a different attempt
  useEffect(() => {
    if (loading || !task_id || !selectedAttemptId) return;

    if (isExecuting(taskDetails)) {
      clearOutputState();
      startExecutionStream(task_id, selectedAttemptId);
    } else {
      getTaskOutput(selectedAttemptId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAttemptId]);

  useEffect(() => {
    const currentStatus = getLastStatus(taskDetails);
    const isActive = currentStatus === "QUEUED" || currentStatus === "EXECUTING";

    if (isActive && !pollRef.current) {
      startPolling();
    } else if (!isActive && pollRef.current) {
      stopPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskDetails?.progress]);

  // Stream management
  useEffect(() => {
    if (!taskDetails?.progress?.length || isCustomTaskLoading) return;

    const executing = isExecuting(taskDetails);
    const queued = isQueued(taskDetails);
    const paused = isPaused(taskDetails);

    if ((queued || executing) && !isStreaming()) {
      clearOutputState();
      if (executing) startExecutionStream(taskDetails.id, selectedAttemptId);
    }

    if (!executing && !queued && !paused && !agentOutputData) {
      getTaskOutput(selectedAttemptId);
    }

    if (paused && !pendingReview?.tool_call_id && !isStreaming()) {
      startExecutionStream(taskDetails.id, selectedAttemptId || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskDetails?.progress, pendingReview?.tool_call_id]);

  // Fetch agent details once when we learn the agent ID
  useEffect(() => {
    const agentId = agentOutputData?.agent_outputs?.[0]?.agent_id || taskDetails?.agent_id;
    if (agentId && agentId !== agentDetails?.id) getAgentDetails(agentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentOutputData, taskDetails, loading]);

  // Cleanup on unmount
  useEffect(() => () => {
    stopStream();
    stopPolling();
  }, []);

  // ─── Return ───────────────────────────────────────────────────────────────
  return {
    taskDetails,
    taskExecutionDetails,
    agentDetails,
    agentOutputData,
    setAgentOutputData,
    executionLog,
    setExecutionLog,
    pendingReview,
    setPendingReview,
    reviewHistory,
    setReviewHistory,
    tokenUsageData,
    selectedAttemptId,
    taskStatus,
    setTaskStatus,
    isLoading,
    isTaskListLoading,
    isCustomTaskLoading,
    setIsCustomTaskLoading,
    isTaskInExecutingPhase: isExecuting(taskDetails),
    isTaskQueued: isQueued(taskDetails),
    loading,
    handleAttemptSelect,
    handleRefreshPage,
    getTaskInformation,
    isRootUser,
    fetchTokenUsage,
    fetchEmailSheetData,
    emailSheetData,
    isEmailSheetLoading,
  };
};
