"use client";

import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import type {
  AttachmentData,
  CollectionData,
} from "@/redux/assistant/chat/chat-slice";
import { resetChatData } from "@/redux/assistant/chat/chat-slice";
import { setSelectedCollections } from "@/redux/assistant/chat/collection-slice";
import { useAppSelector } from "@/redux/store";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AssistantMessage, UserMessage } from "../_components/types";
import { chatThreadReducer, initialChatThreadState } from "./chatThreadReducer";
import { useChatHistory } from "./useChatHistory";
import { useChatStream } from "./useChatStream";

export function useChat() {
  const dispatch = useDispatch();
  const { axiosAuth, loading } = useAxiosAuth();
  const { id: routeChatId } = useParams() as { id?: string };

  const [threadState, threadDispatch] = useReducer(
    chatThreadReducer,
    initialChatThreadState,
  );

  const chatData = useAppSelector((state) => state.chatReducer);
  const collections = useAppSelector(
    (state) => state?.collectionReducer.selected,
  );
  const attchments = useAppSelector(
    (state) => state.attachmentReducer.selected,
  );
  const webSearch = useAppSelector((state) => state.webSearchReducer?.enabled);

  const {
    threadMessages,
    isStreaming,
    status,
    currentChatId,
    isNewChat,
    isFetchingMore,
    hasMoreMessages,
    historyFetchFailed,
  } = threadState;

  const [scrollConversion, setScrollConversion] = useState(false);
  const [chatInputHeight, setChatInputHeight] = useState(0);

  const isInputDisabled = useMemo(
    () => isStreaming || status === "planning" || status === "executing",
    [isStreaming, status],
  );

  const { sendMessage, abortControllerRef, abort } = useChatStream(
    axiosAuth,
    currentChatId,
    threadMessages,
    threadDispatch,
  );
  const { fetchHistory } = useChatHistory(
    axiosAuth,
    routeChatId,
    {
      isNewChat,
      isFetchingMore,
      hasMoreMessages,
      historyPage: threadState.historyPage,
      historyFetchFailed,
    },
    threadDispatch,
    (collections) => {
      dispatch(setSelectedCollections(collections));
    },
  );

  const fetchHistoryRef = useRef(fetchHistory);
  const hasMoreMessagesRef = useRef(hasMoreMessages);
  useEffect(() => {
    fetchHistoryRef.current = fetchHistory;
    hasMoreMessagesRef.current = hasMoreMessages;
  });

  const prevRouteChatIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (prevRouteChatIdRef.current !== routeChatId) {
      prevRouteChatIdRef.current = routeChatId;
      threadDispatch({ type: "RESET_THREAD" });
    }
  }, [routeChatId]);

  useEffect(() => {
    if (loading) return;
    let isMounted = true;
    const initializeChat = async () => {
      if (!isMounted) return;
      if (chatData?.chat_id) {
        const chatId = chatData.chat_id;
        if (!currentChatId)
          threadDispatch({ type: "SET_CURRENT_CHAT_ID", payload: chatId });
        threadDispatch({ type: "SET_IS_NEW_CHAT", payload: true });

        await sendMessage({
          input: chatData.input,
          collections,
          attchments,
          webSearch,
          chat_id: chatId,
        });
        dispatch(resetChatData());
      } else if (routeChatId && !currentChatId) {
        threadDispatch({ type: "SET_CURRENT_CHAT_ID", payload: routeChatId });
        threadDispatch({ type: "SET_IS_NEW_CHAT", payload: false });
        await fetchHistory();
      }
    };
    initializeChat();
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loading]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({
      input: suggestion,
      collections,
      attchments,
      webSearch,
      chat_id: currentChatId || routeChatId,
    });
  };

  const handleRetryMessage = async (messageId: string) => {
    try {
      const failedMessageIndex = threadMessages.findIndex(
        (msg) =>
          msg.role === "assistant" &&
          msg.id === messageId &&
          (msg as AssistantMessage).isError,
      );
      if (failedMessageIndex === -1) {
        toast.error("Cannot retry this message");
        return;
      }
      const failedMessage = threadMessages[
        failedMessageIndex
      ] as AssistantMessage;
      if (!failedMessage.originalPayload) {
        toast.error("Cannot retry this message - missing original payload");
        return;
      }
      const userMessageIndex = failedMessageIndex - 1;
      const isUserMessage =
        userMessageIndex >= 0 &&
        threadMessages[userMessageIndex].role === "user";
      const messagesWithoutFailedPair = threadMessages.filter(
        (_, index) =>
          index !== failedMessageIndex &&
          !(isUserMessage && index === userMessageIndex),
      );
      const {
        input,
        attchments: a,
        collections: c,
        webSearch: w,
        chat_id,
      } = failedMessage.originalPayload;
      await sendMessage({
        input,
        collections: c,
        attchments: a,
        webSearch: w,
        chat_id,
        baseMessages: messagesWithoutFailedPair,
      });
    } catch (error) {
      toast.error("Failed to retry message");
    }
  };

  const handleRegenerateMessage = async (messageId: string) => {
    try {
      if (isStreaming) {
        toast.error("Wait for the current response to complete.");
        return;
      }
      const assistantIndex = threadMessages.findIndex(
        (msg) => msg.role === "assistant" && msg.id === messageId,
      );
      if (assistantIndex === -1) {
        toast.error("Assistant message not found");
        return;
      }
      const userIndex = assistantIndex - 1;
      if (userIndex < 0 || threadMessages[userIndex].role !== "user") {
        toast.error("User message not found");
        return;
      }
      const userMessage = threadMessages[userIndex] as UserMessage;
      const messagesWithoutPair = threadMessages.filter(
        (_, idx) => idx !== assistantIndex && idx !== userIndex,
      );
      await sendMessage({
        input: userMessage.question,
        collections: userMessage.collections,
        attchments: userMessage.attchments,
        webSearch: userMessage.webSearch,
        chat_id: userMessage.chat_id,
        baseMessages: messagesWithoutPair,
      });
    } catch (err) {
      toast.error("Failed to regenerate message.");
    }
  };

  const handleAbort = () => {
    abort();
    toast.success("Generation stopped");
  };

  const handleSubmit = (
    input: string,
    selectedCollections: CollectionData[] | null | undefined,
    selectedAttachments: AttachmentData[] | null | undefined,
    webSearchEnabled: boolean,
    chat_id: string | undefined,
    reset: () => void,
  ) => {
    setScrollConversion(true);
    sendMessage({
      input,
      collections: selectedCollections,
      attchments: selectedAttachments,
      webSearch: webSearchEnabled,
      chat_id: currentChatId || routeChatId,
    });
    reset();
    threadDispatch({ type: "SET_STATUS", payload: "completed" });
  };

  const setIsStreaming = useCallback((value: boolean) => {
    threadDispatch({ type: "SET_STREAMING", payload: value });
  }, []);

  const onScrollTop = useCallback(() => {
    if (hasMoreMessagesRef.current) fetchHistoryRef.current();
  }, []);

  const onScrolled = useCallback(() => setScrollConversion(false), []);

  return {
    loading,
    threadMessages,
    isStreaming,
    status,
    isInputDisabled,
    isNewChat,
    isFetchingMore,
    hasMoreMessages,
    scrollConversion,
    setScrollConversion,
    chatInputHeight,
    setChatInputHeight,
    handleSuggestionClick,
    handleRetryMessage,
    handleRegenerateMessage,
    handleAbort,
    handleSubmit,
    setIsStreaming,
    onScrollTop,
    onScrolled,
  };
}
