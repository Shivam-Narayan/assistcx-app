import { Context, Feedback } from "../../chat/_components/types";

export interface ChatMessage {
  role: string;
  content: string;
  context: Context;
  feedback: Feedback;
  message_metadata: Record<string, unknown>;
  id: string;
  thread_id: string;
  created_at: string;
  updated_at: string;
  total: number;
}

export type ChatItem = {
  title: string;
  thread_metadata?: Record<string, unknown>;
  id: string;
  user_id: string;
  is_archived: boolean;
  chat_messages?: ChatMessage;
  created_at?: string;
  updated_at?: string;
};
