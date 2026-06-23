"use client";

import type { ChatThreadAction, ChatThreadState } from "../_components/types";

export const initialChatThreadState: ChatThreadState = {
  threadMessages: [],
  isStreaming: false,
  status: "pending",
  currentChatId: null,
  isNewChat: false,
  isFetchingMore: false,
  hasMoreMessages: true,
  historyPage: 0,
  historyFetchFailed: false,
};

export function chatThreadReducer(
  state: ChatThreadState,
  action: ChatThreadAction,
): ChatThreadState {
  switch (action.type) {
    case "SET_THREAD_MESSAGES":
      return { ...state, threadMessages: action.payload };
    case "APPEND_THREAD_MESSAGES":
      return {
        ...state,
        threadMessages: state.threadMessages.concat(action.payload),
      };
    case "PREPEND_THREAD_MESSAGES":
      return {
        ...state,
        threadMessages: action.payload.concat(state.threadMessages),
      };
    case "SET_STREAMING":
      return { ...state, isStreaming: action.payload };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_CURRENT_CHAT_ID":
      return { ...state, currentChatId: action.payload };
    case "SET_IS_NEW_CHAT":
      return { ...state, isNewChat: action.payload };
    case "SET_HISTORY_STATE": {
      const { payload } = action;
      return {
        ...state,
        ...(payload.isFetchingMore !== undefined && {
          isFetchingMore: payload.isFetchingMore,
        }),
        ...(payload.hasMoreMessages !== undefined && {
          hasMoreMessages: payload.hasMoreMessages,
        }),
        ...(payload.historyPage !== undefined && {
          historyPage: payload.historyPage,
        }),
        ...(payload.historyFetchFailed !== undefined && {
          historyFetchFailed: payload.historyFetchFailed,
        }),
      };
    }
    case "RESET_THREAD":
      return { ...initialChatThreadState };
    default:
      return state;
  }
}
