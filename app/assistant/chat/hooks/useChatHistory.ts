"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import type { AxiosInstance } from "axios";
import { CHAT_THREAD } from "@/lib/assistant-urls";
import {
  parseStreamEventsFromHistory,
  sortedMessages,
} from "@/helper/assistant-helper/helper";
import type { ChatMessage, ChatThreadAction } from "../_components/types";
import { TokenUsagePayload } from "@/app/(dashboard)/inbox/components/tasks/task-token-usage-dialog";
import { CollectionData } from "@/redux/assistant/chat/chat-slice";

export function useChatHistory(
  axiosAuth: AxiosInstance | null,
  routeChatId: string | undefined,
  options: {
    isNewChat: boolean;
    isFetchingMore: boolean;
    hasMoreMessages: boolean;
    historyPage: number;
    historyFetchFailed: boolean;
  },
  dispatch: React.Dispatch<ChatThreadAction>,
  onCollectionFound?: (collections: CollectionData[]) => void,
) {
  const {
    isNewChat,
    isFetchingMore,
    hasMoreMessages,
    historyPage,
    historyFetchFailed,
  } = options;

  const fetchHistory = useCallback(async () => {
    if (
      isNewChat ||
      isFetchingMore ||
      !routeChatId ||
      !hasMoreMessages ||
      historyFetchFailed ||
      !axiosAuth
    ) {
      return;
    }
    dispatch({ type: "SET_HISTORY_STATE", payload: { isFetchingMore: true } });
    try {
      const res = await axiosAuth.get(
        `${CHAT_THREAD}/${routeChatId}/chat-messages`,
        { params: { page: historyPage + 1, page_size: 10 } },
      );
      const newMessages: ChatMessage[] = res.data || [];
      if (newMessages.length === 0) {
        dispatch({
          type: "SET_HISTORY_STATE",
          payload: { hasMoreMessages: false },
        });
        return;
      }
      const formatted = sortedMessages(newMessages).map((msg, index, arr) => {
        if (msg.role === "user") {
          return {
            ...msg,
            question: msg.content ?? "",
            message_id: msg.id,
          };
        }
        if (msg.role === "assistant") {
          const prevUser = [...arr]
            .slice(0, index)
            .reverse()
            .find((m) => m.role === "user");
          const streamEvents = parseStreamEventsFromHistory(
            (msg as { graph_state?: { messages?: unknown[] } }).graph_state
              ?.messages ?? [],
          );
          return {
            ...msg,
            question: prevUser?.content ?? "",
            answer: msg.content,
            relevant_sources:
              (msg as { graph_state?: { relevant_sources?: unknown[] } })
                .graph_state?.relevant_sources || [],
            start_time:
              (msg as { graph_state?: { start_time?: string } }).graph_state
                ?.start_time || "",
            end_time:
              (msg as { graph_state?: { end_time?: string } }).graph_state
                ?.end_time || "",
            suggested_queries:
              (msg as { graph_state?: { suggested_queries?: string[] } })
                .graph_state?.suggested_queries || [],
            message_id: msg.id,
            feedback: (msg as { feedback?: unknown }).feedback,
            research_complete: true,
            stream_events: streamEvents,
            isStreaming: false,
            isLoading: false,
            status: "completed" as const,
            token_usage: (msg?.token_usage as TokenUsagePayload) ?? null,
            credits_used:
              (msg as { credits_used?: number }).credits_used ?? null,
          };
        }
        return msg;
      });
      if (historyPage === 0) {
        const firstUserMsg = formatted.find((msg) => msg.role === "user");
        const collections = (
          firstUserMsg as { context?: { collections?: CollectionData[] } }
        )?.context?.collections;

        if (collections && collections.length > 0) {
          onCollectionFound?.(collections);
        }
      }
      dispatch({
        type: "PREPEND_THREAD_MESSAGES",
        payload: formatted as ChatMessage[],
      });
      dispatch({
        type: "SET_HISTORY_STATE",
        payload: { historyPage: historyPage + 1 },
      });
    } catch (error) {
      toast.error("Failed to load more messages");
      dispatch({
        type: "SET_HISTORY_STATE",
        payload: { hasMoreMessages: false, historyFetchFailed: true },
      });
    } finally {
      dispatch({
        type: "SET_HISTORY_STATE",
        payload: { isFetchingMore: false },
      });
    }
  }, [
    axiosAuth,
    routeChatId,
    isNewChat,
    isFetchingMore,
    hasMoreMessages,
    historyPage,
    historyFetchFailed,
    dispatch,
  ]);

  return { fetchHistory };
}
