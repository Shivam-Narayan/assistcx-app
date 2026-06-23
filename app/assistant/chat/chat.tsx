"use client";

import { ChatInput } from "@/app/assistant/chat/_components/chat-input";
import { ChatLoader } from "@/app/assistant/chat/_components/chat-loader";
import { Conversation } from "@/app/assistant/chat/_components/conversation";
import { BoxLayout } from "@/components/assistant/box-layout";
import { useChat } from "@/app/assistant/chat/hooks/useChat";

const Chat: React.FC = () => {
  const {
    loading,
    threadMessages,
    isStreaming,
    status,
    isInputDisabled,
    isNewChat,
    isFetchingMore,
    scrollConversion,
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
  } = useChat();

  return loading ? (
    <ChatLoader />
  ) : (
    <div className="flex flex-col items-center w-full h-full relative overflow-hidden">
      <div className="w-full h-full overflow-hidden">
        <div className="relative h-full flex items-center justify-center">
          <Conversation
            messages={threadMessages}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
            status={status}
            streamingDisabled={false}
            onDisabledChange={() => {}}
            onSuggestionClick={handleSuggestionClick}
            handleRetryMessage={handleRetryMessage}
            handleRegenerateMessage={handleRegenerateMessage}
            isNewChat={isNewChat}
            onScrollTop={onScrollTop}
            isFetchingMore={isFetchingMore}
            scrollConversion={scrollConversion}
            onScrolled={onScrolled}
            boxHeight={chatInputHeight}
          />
          <BoxLayout className="absolute bottom-0 w-full max-w-3xl mx-auto z-20">
            <div className="bg-background pb-4 rounded-t-3xl">
              <ChatInput
                setChatInputHeight={setChatInputHeight}
                isStreaming={isStreaming}
                isDisabled={isInputDisabled}
                className=""
                onAbort={handleAbort}
                onSubmit={handleSubmit}
              />
            </div>
          </BoxLayout>
        </div>
      </div>
    </div>
  );
};

export default Chat;
