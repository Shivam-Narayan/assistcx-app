"use client";

import { CHAT_STREAM_RESEARCH } from "@/lib/assistant-urls";
import type { AxiosInstance } from "axios";
import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import type {
  AssistantMessage,
  ChatMessage,
  ChatThreadAction,
  SendMessageParams,
  UserMessage,
} from "../_components/types";

export function useChatStream(
  axiosAuth: AxiosInstance | null,
  currentChatId: string | null,
  threadMessages: ChatMessage[],
  dispatch: React.Dispatch<ChatThreadAction>,
) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const threadMessagesRef = useRef<ChatMessage[]>(threadMessages);

  useEffect(() => {
    threadMessagesRef.current = threadMessages;
  }, [threadMessages]);

  const getLatestMessages = useCallback(() => threadMessagesRef.current, []);
  const setLatestMessages = useCallback((messages: ChatMessage[]) => {
    threadMessagesRef.current = messages;
  }, []);

  const sendMessage = useCallback(
    async (params: SendMessageParams) => {
      const {
        input,
        collections,
        attchments,
        webSearch,
        chat_id,
        baseMessages,
      } = params;
      if (!input.trim() || !axiosAuth) return;

      if (baseMessages !== undefined) {
        setLatestMessages(baseMessages);
      }

      let webSearchValue: boolean;
      let fileIds: string[] | null = null;
      if (
        attchments !== undefined &&
        attchments !== null &&
        attchments?.length > 0
      ) {
        webSearchValue = false;
      } else if (
        (attchments === undefined || attchments === null) &&
        (collections === undefined || collections == null)
      ) {
        webSearchValue = true;
      } else {
        webSearchValue = webSearch ?? true;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;
      dispatch({ type: "SET_STREAMING", payload: true });
      dispatch({ type: "SET_STATUS", payload: "planning" });
      const newChatId = chat_id || uuidv4();
      if (!currentChatId)
        dispatch({ type: "SET_CURRENT_CHAT_ID", payload: newChatId });

      const userMsg: UserMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: "user",
        question: input,
        collections: collections ?? undefined,
        webSearch: webSearchValue,
        attchments: attchments ?? undefined,
        content: input,
      };
      const streamId = `stream_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const assistantMsg: AssistantMessage = {
        id: streamId,
        role: "assistant",
        question: input,
        answer: "",
        citations: [],
        relevant_sources: [],
        suggested_queries: [],
        status: "planning",
        isStreaming: true,
        isLoading: true,
        isError: false,
        errorMessage: "",
        node: "",
        type: "answer",
        event: "",
        thread_id: currentChatId || newChatId,
        message_id: "",
        end_time: "",
        start_time: "",
        originalPayload: {
          input,
          collections: collections ?? undefined,
          attchments: attchments ?? undefined,
          webSearch: webSearchValue,
          chat_id: currentChatId || newChatId,
        },
        final_state_data: "",
        research_complete: false,
        stream_events: [],
        token_usage: null,
      };

      const prev =
        baseMessages !== undefined ? baseMessages : getLatestMessages();
      const resetPrev = prev.map((msg) => {
        if (msg.role !== "assistant") return msg;
        const am = msg as AssistantMessage;
        if (am.isError) {
          return {
            ...msg,
            isError: false,
            errorMessage: "",
          } as AssistantMessage;
        }
        if (am.isLoading || am.isStreaming) {
          return {
            ...msg,
            isLoading: false,
            isStreaming: false,
          } as AssistantMessage;
        }
        return msg;
      });
      const newMessages: ChatMessage[] = [...resetPrev, userMsg, assistantMsg];
      dispatch({ type: "SET_THREAD_MESSAGES", payload: newMessages });
      setLatestMessages(newMessages);

      if (
        attchments !== undefined &&
        attchments !== null &&
        attchments?.length > 0
      ) {
        fileIds = attchments.map((file) => file.id);
      }

      let currentAnswer = "";
      try {
        const response = await axiosAuth.post(
          CHAT_STREAM_RESEARCH,
          {
            query: input.trim(),
            chat_id: currentChatId || newChatId,
            collections,
            file_ids: fileIds ?? null,
            web_search_enabled: webSearchValue,
          },
          {
            responseType: "stream",
            signal: newAbortController.signal,
            adapter: "fetch",
            headers: {
              Accept: "text/event-stream",
              "Content-Type": "application/json",
            },
          },
        );
        if (response.status !== 200) {
          throw new Error(`HTTP Error ${response.status}`);
        }
        const reader = response.data
          .pipeThrough(new TextDecoderStream())
          .getReader();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";
          for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            const dataLine = chunk
              .split("\n")
              .find((line: string) => line.startsWith("data: "));
            if (!dataLine) continue;
            const data = dataLine.slice(6);
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data);
              const prevMsgs = getLatestMessages();
              const updated = prevMsgs.map((msg) => {
                if (msg.role !== "assistant" || msg.id !== streamId) return msg;
                const updatedMsg = { ...msg } as AssistantMessage;
                switch (parsed.type) {
                  case "state":
                    Object.assign(updatedMsg, {
                      status: parsed.status ?? updatedMsg.status,
                      type: parsed.type ?? updatedMsg.type,
                      relevant_sources:
                        parsed.relevant_sources ?? updatedMsg.relevant_sources,
                      citations: parsed.citations ?? updatedMsg.citations,
                    });
                    dispatch({
                      type: "SET_STATUS",
                      payload: updatedMsg.status,
                    });
                    currentAnswer = updatedMsg.answer;
                    break;
                  case "thinking":
                    if (parsed.content) {
                      const lastEvent = updatedMsg.stream_events.at(-1);
                      if (lastEvent?.type === "thinking") {
                        const events = [...updatedMsg.stream_events];
                        events[events.length - 1] = {
                          ...lastEvent,
                          text: lastEvent.text + parsed.content,
                        };
                        updatedMsg.stream_events = events;
                      } else {
                        updatedMsg.stream_events = [
                          ...updatedMsg.stream_events,
                          { type: "thinking", text: parsed.content },
                        ];
                      }
                    }
                    updatedMsg.relevant_sources =
                      parsed.relevant_sources ?? updatedMsg.relevant_sources;
                    updatedMsg.citations =
                      parsed.citations ?? updatedMsg.citations;
                    updatedMsg.status = parsed.status ?? updatedMsg.status;
                    dispatch({
                      type: "SET_STATUS",
                      payload: updatedMsg.status,
                    });
                    break;
                  case "tool_call":
                    updatedMsg.stream_events = [
                      ...updatedMsg.stream_events,
                      {
                        type: "tool_call",
                        tool_call_id: parsed.tool_call_id ?? "",
                        tool: parsed.tool ?? "",
                        args: parsed.args ?? { queries: [] },
                      },
                    ];
                    updatedMsg.relevant_sources =
                      parsed.relevant_sources ?? updatedMsg.relevant_sources;
                    updatedMsg.citations =
                      parsed.citations ?? updatedMsg.citations;
                    updatedMsg.status = parsed.status ?? updatedMsg.status;
                    dispatch({
                      type: "SET_STATUS",
                      payload: updatedMsg.status,
                    });
                    break;
                  case "tool_result":
                    updatedMsg.stream_events = [
                      ...updatedMsg.stream_events,
                      {
                        type: "tool_result",
                        tool_call_id: parsed.tool_call_id ?? "",
                        output: parsed.output ?? "",
                      },
                    ];
                    updatedMsg.relevant_sources =
                      parsed.relevant_sources ?? updatedMsg.relevant_sources;
                    updatedMsg.citations =
                      parsed.citations ?? updatedMsg.citations;
                    updatedMsg.status = parsed.status ?? updatedMsg.status;
                    dispatch({
                      type: "SET_STATUS",
                      payload: updatedMsg.status,
                    });
                    break;
                  case "answer":
                    if (parsed.content) {
                      updatedMsg.answer += parsed.content;
                      currentAnswer = updatedMsg.answer;
                      updatedMsg.content = currentAnswer;
                    }
                    updatedMsg.relevant_sources =
                      parsed.relevant_sources ?? updatedMsg.relevant_sources;
                    updatedMsg.citations =
                      parsed.citations ?? updatedMsg.citations;
                    updatedMsg.status = parsed.status ?? updatedMsg.status;
                    dispatch({
                      type: "SET_STATUS",
                      payload: updatedMsg.status,
                    });
                    break;
                  case "event":
                    updatedMsg.event = parsed.event ?? "";
                    break;
                  case "final_state":
                    updatedMsg.status = "completed";
                    updatedMsg.isStreaming = false;
                    updatedMsg.isLoading = false;
                    updatedMsg.type = "final_state";
                    updatedMsg.message_id = parsed.message_id;
                    updatedMsg.end_time =
                      parsed.end_time || updatedMsg.end_time;
                    updatedMsg.start_time =
                      parsed.start_time || updatedMsg.start_time;
                    updatedMsg.final_state_data = JSON.stringify(data) || "";
                    updatedMsg.relevant_sources =
                      parsed.relevant_sources ?? updatedMsg.relevant_sources;
                    updatedMsg.citations =
                      parsed.citations ?? updatedMsg.citations;
                    updatedMsg.suggested_queries =
                      parsed.suggested_queries ?? updatedMsg.suggested_queries;
                    updatedMsg.timestamp =
                      parsed?.timestamp ?? updatedMsg?.timestamp;
                    updatedMsg.answer =
                      parsed?.final_answer ?? updatedMsg?.answer;
                    updatedMsg.content =
                      parsed?.final_answer ?? updatedMsg?.content;
                    updatedMsg.thread_id =
                      parsed.thread_id ?? updatedMsg.thread_id;
                    updatedMsg.token_usage =
                      parsed.token_usage ?? updatedMsg.token_usage;
                    updatedMsg.credits_used =
                      parsed.credits_used ?? updatedMsg.credits_used;
                    break;
                  case "error":
                    Object.assign(updatedMsg, {
                      isError: true,
                      errorMessage: parsed.error || "An error occurred",
                      isStreaming: false,
                      isLoading: false,
                      research_complete: true,
                    });
                    dispatch({ type: "SET_STREAMING", payload: false });
                    break;
                }
                return updatedMsg;
              });
              dispatch({ type: "SET_THREAD_MESSAGES", payload: updated });
              setLatestMessages(updated);
              if (parsed.type === "final_state") {
                dispatch({
                  type: "SET_STATUS",
                  payload: parsed.status || "completed",
                });
              }
            } catch (err) {
              console.error("SSE parse error:", err, data);
            }
          }
        }
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "name" in err &&
          (err as { name?: string }).name !== "AbortError"
        ) {
          const prevMsgs = getLatestMessages();
          const withError = prevMsgs.map((msg) =>
            msg.id === streamId
              ? {
                  ...msg,
                  isError: true,
                  errorMessage:
                    "A network error occurred. Please check your connection and try again.",
                  isStreaming: false,
                  isLoading: false,
                  research_complete: true,
                }
              : msg,
          );
          dispatch({ type: "SET_THREAD_MESSAGES", payload: withError });
          setLatestMessages(withError);
          toast.error("Request failed");
        }
      } finally {
        dispatch({ type: "SET_STREAMING", payload: false });
        dispatch({ type: "SET_STATUS", payload: "completed" });
        if (abortControllerRef.current === newAbortController) {
          abortControllerRef.current = null;
        }
        const prevMsgs = getLatestMessages();
        const final = prevMsgs.map((msg) => {
          if (
            msg.role === "assistant" &&
            msg.id === streamId &&
            !(msg as AssistantMessage).isError &&
            ((msg as AssistantMessage).status !== "completed" ||
              (msg as AssistantMessage).isStreaming ||
              (msg as AssistantMessage).isLoading)
          ) {
            return {
              ...msg,
              id: `assistant_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              status: "completed" as const,
              isStreaming: false,
              isLoading: false,
              isError: false,
              errorMessage: "",
              node: "",
              research_complete: true,
              type:
                (msg as AssistantMessage).type === "final_state"
                  ? "final_state"
                  : (msg as AssistantMessage).type,
            } as AssistantMessage;
          }
          return msg;
        });
        dispatch({ type: "SET_THREAD_MESSAGES", payload: final });
        setLatestMessages(final);
      }
    },
    [axiosAuth, currentChatId, dispatch, getLatestMessages, setLatestMessages],
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    sendMessage,
    abortControllerRef,
    getLatestMessages,
    setLatestMessages,
    abort,
  };
}
