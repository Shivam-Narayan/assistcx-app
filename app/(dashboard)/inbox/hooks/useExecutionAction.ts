import { errorMessageHandler } from "@/helper/assistant-helper/helper";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  AgentOutputMainData,
  ExecutionMessage,
  ReviewHistoryItem,
  ToolCall,
} from "@/types/types";
import type { Dispatch, SetStateAction } from "react";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { mergeExecutionLog } from "./stream-helpers";

interface UseExecutionActionsProps {
  taskId: string;
  executionLog: ExecutionMessage[];
  agentOutputData: AgentOutputMainData | null;
  pendingReview: {
    tool_name: string;
    tool_call_id: string;
    tool_args: Record<string, unknown>;
    review_rules: string[];
    question?: string;
  };
  getTaskInformation: () => Promise<void>;
  setAgentOutputData: (data: AgentOutputMainData | null) => void;
  setIsCustomTaskLoading: (v: boolean) => void;
  setTaskStatus: (status: string | null) => void;
  setExecutionLog: (log: ExecutionMessage[]) => void;
  setPendingReview: (v: any) => void;
  setReviewHistory: Dispatch<SetStateAction<ReviewHistoryItem[]>>;
}

export function useExecutionActions({
  taskId,
  executionLog,
  agentOutputData,
  pendingReview,
  getTaskInformation,
  setAgentOutputData,
  setIsCustomTaskLoading,
  setTaskStatus,
  setExecutionLog,
  setPendingReview,
  setReviewHistory,
}: UseExecutionActionsProps) {
  const { data: session } = useSession();
  const { axiosAuth } = useAxiosAuth();

  const { tool_name, tool_call_id, tool_args } = pendingReview;

  const [editingCallId, setEditingCallId] = useState<string | null>(null);
  const [editedArgs, setEditedArgs] = useState<Record<string, string>>({});
  const [isRejecting, setIsRejecting] = useState(false);
  const [jsonValidity, setJsonValidity] = useState<Record<string, boolean>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResponseLoading, setIsResponseLoading] = useState(false);

  const selectedCall: ToolCall = {
    id: tool_call_id,
    type: "function",
    function: {
      name: tool_name,
      arguments: JSON.stringify(tool_args, null, 2),
    },
  };

  const handleCancel = () => setEditingCallId(null);

  const handleUpdate = (callId: string) => {
    setIsEditOpen(false);
    setEditingCallId(null);
  };

  const openEdit = (callId: string) => {
    setEditingCallId(callId);
    setIsEditOpen(true);
    setJsonValidity((prev) => ({ ...prev, [callId]: true }));
    setEditedArgs((prev) => ({
      ...prev,
      [callId]: JSON.stringify(tool_args, null, 2),
    }));
  };

  const handleResponse = useCallback(
    async (
      action: "approve" | "reject" | "edit",
      options?: { feedbackText?: string; editedCallId?: string },
    ) => {
      if (isResponseLoading) return;
      setIsResponseLoading(true);

      const payload = (() => {
        const userId = session?.user?.id || "";
        switch (action) {
          case "approve":
            return { action, feedback: "", user_id: userId, edited_params: {} };
          case "reject":
            return {
              action,
              feedback: options?.feedbackText ?? "",
              user_id: userId,
              edited_params: {},
            };
          case "edit": {
            const callId = options?.editedCallId;
            return {
              action,
              feedback: "",
              user_id: userId,
              edited_params: callId ? JSON.parse(editedArgs[callId]) : {},
            };
          }
        }
      })();

      const optimisticReview: ReviewHistoryItem = {
        tool_name: pendingReview.tool_name,
        tool_call_id: pendingReview.tool_call_id,
        action_taken: action,
        question: pendingReview.question || "",
        feedback: payload.feedback,
        original_params: action === "edit" ? pendingReview.tool_args : null,
        edited_params: payload.edited_params,
        user_id: payload.user_id,
        timestamp: new Date().toISOString(),
      };
      setReviewHistory((prev) => [...prev, optimisticReview]);

      let streamStarted = false;

      try {
        const response = await axiosAuth.post(
          `${url.RESUME_TASK}/${taskId}/resume`,
          payload,
          {
            responseType: "stream",
            adapter: "fetch",
            headers: {
              Accept: "text/event-stream",
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status !== 200)
          throw new Error(`HTTP error ${response.status}`);

        const reader = response.data
          .pipeThrough(new TextDecoderStream())
          .getReader();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          if (!streamStarted && Object.keys(value).length > 0) {
            streamStarted = true;
            setIsCustomTaskLoading(true);
            setTaskStatus("EXECUTING");
            setPendingReview({});
            setAgentOutputData({
              ...(agentOutputData || {}),
              agent_outputs:
                agentOutputData?.agent_outputs?.map((o: any) => ({
                  ...o,
                  output: null,
                })) || [],
              attempts: agentOutputData?.attempts || [],
              total: agentOutputData?.total || 0,
            });
          }

          buffer += value;
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            const dataLine = chunk
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            const data = dataLine.slice(6);
            if (data === "[DONE]") return;

            try {
              const parsed = JSON.parse(data);
              if (parsed?.task_status) setTaskStatus(parsed.task_status);
              if (parsed.execution_log && Array.isArray(parsed.execution_log)) {
                setExecutionLog(
                  mergeExecutionLog(executionLog, parsed.execution_log),
                );
              }
            } catch (err) {
              errorMessageHandler(err || "Stream parse error");
            }
          }
        }
      } catch (error) {
        errorMessageHandler(error);
      } finally {
        setIsResponseLoading(false);
        setIsRejecting(false);
        setEditingCallId(null);
        setIsEditOpen(false);
        setAgentOutputData(null);
        setPendingReview({});
        await getTaskInformation();
        setIsCustomTaskLoading(false);
      }
    },
    [
      taskId,
      axiosAuth,
      editedArgs,
      executionLog,
      agentOutputData,
      pendingReview,
      isResponseLoading,
      setExecutionLog,
      setTaskStatus,
      setAgentOutputData,
      setIsCustomTaskLoading,
      setPendingReview,
      setReviewHistory,
      getTaskInformation,
    ],
  );

  return {
    editingCallId,
    editedArgs,
    isRejecting,
    jsonValidity,
    isEditOpen,
    selectedCall,
    isResponseLoading,
    setIsRejecting,
    setIsEditOpen,
    setEditingCallId,
    setEditedArgs,
    setJsonValidity,
    handleCancel,
    handleUpdate,
    handleResponse,
    openEdit,
  };
}
