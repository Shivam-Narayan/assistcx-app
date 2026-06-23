import { ChatLoader } from "@/app/assistant/chat/_components/chat-loader";
import Chat from "@/app/assistant/chat/chat";
import { Metadata } from "next";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Assistant",
  description:
    "AI-powered email assistant to help you manage and respond to emails efficiently.",
};
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoader />}>
      <Chat />
    </Suspense>
  );
}
