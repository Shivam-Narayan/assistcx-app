"use client";
import { BoxLayout } from "@/components/assistant/box-layout";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import { ChatContainer } from "@/components/ui/chat-container";
import { Loader } from "@/components/ui/loader";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Info, RotateCcw } from "lucide-react";
import { useConversation } from "../hooks/useConversation";
import { MessageDetail } from "./message-detail";
import { MessageDots } from "./messages-dots";
import SelectedSources from "./selected-sources";
import SuggestedQueries from "./suggested-queries";
import { AssistantMessage, ChatBasicProps } from "./types";

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function Conversation(props: ChatBasicProps) {
  const {
    messages,
    isStreaming = false,
    setIsStreaming = () => {},
    streamingDisabled = false,
    status,
    onSuggestionClick,
    handleRetryMessage,
    handleRegenerateMessage,
    isFetchingMore,
    isNewChat,
    boxHeight,
  } = props;

  const {
    showScrollButton,
    chatRef,
    topSentinelRef,
    activeMessageId,
    setActiveMessageId,
    messageRefs,
    renderThoughtAndAction,
    scrollToBottom,
    goToPreviousMessage,
    goToNextMessage,
    scrollToMessageById,
    lastMessageId,
  } = useConversation(props);

  return (
    <>
      <ChatContainer
        className="flex-1 h-full space-y-4 py-4 w-full"
        ref={chatRef}
      >
        <BoxLayout className="flex flex-col gap-6 w-full pt-16">
          {/* Top sentinel for infinite scroll */}
          <div
            ref={topSentinelRef}
            className={`h-1 ${isNewChat && "hidden"}`}
          />
          {/* Show loader for fetching more */}
          {isFetchingMore && !isNewChat && (
            <div className="flex items-center justify-center py-2">
              <span className="ml-2 text-sm text-gray-500">
                <Loader size="sm" />
              </span>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const key = `${message.id}`;
              const isAssistant = message?.role === "assistant";
              const isAllCompleted =
                (isAssistant && message?.research_complete) ?? false;
              return (
                <motion.div
                  key={key}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={messageVariants}
                  className="space-y-2"
                  id={key}
                  ref={(el) => {
                    messageRefs.current[key] = el;
                  }}
                >
                  {isAssistant &&
                    renderThoughtAndAction(message as AssistantMessage)}
                  {isAssistant &&
                    isAllCompleted &&
                    message?.answer.length <= 0 &&
                    !message?.isError &&
                    (message.isLoading || message.isStreaming) &&
                    message.id === lastMessageId && (
                      <div className="mt-4">
                        <h4 className="text-xs md:text-sm font-medium mb-3 flex items-center text-gray-700 gap-2">
                          Generating answer
                          <Loader variant="dots" size="sm" className="mt-1" />
                        </h4>
                      </div>
                    )}

                  {/* Message detail */}
                  <MessageDetail
                    message={message}
                    isStreaming={isStreaming && message.id === lastMessageId}
                    setIsStreaming={setIsStreaming}
                    streamingDisabled={streamingDisabled}
                    lastMessageId={lastMessageId}
                    status={status}
                    handleRegenerateMessage={handleRegenerateMessage}
                    sources={
                      isAssistant && message?.relevant_sources
                        ? message?.relevant_sources
                        : []
                    }
                  />

                  {/* Error banner */}
                  {isAssistant && message?.isError && (
                    <div className="w-full flex items-center justify-between gap-5 my-4 py-4 px-4 border border-red-500 rounded-md">
                      <div className="flex items-center gap-3">
                        <span className="text-lg text-red-500 ">
                          <Info className="w-5 h-5" />
                        </span>
                        <span className="text-lg text-red-500">
                          {message?.errorMessage ||
                            "Request failed. Please check your internet connection and try again."}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        aria-label="Retry"
                        className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => handleRetryMessage?.(String(message.id))}
                      >
                        Retry <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {isAssistant && message?.status === "completed" && (
                    <SelectedSources
                      sources={message?.relevant_sources || []}
                    />
                  )}
                  {/* Suggested queries */}
                  {isAssistant &&
                    Array.isArray(message?.suggested_queries) &&
                    message.suggested_queries.length > 0 && (
                      <SuggestedQueries
                        onSuggestionClick={onSuggestionClick ?? (() => {})}
                        suggestions={message.suggested_queries}
                      />
                    )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div
            className="flex items-center justify-center w-full min-h-[150px]"
            style={{ height: boxHeight }}
          />
        </BoxLayout>
      </ChatContainer>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div
          className={`absolute px-4 h-0 max-w-screen-md mx-auto w-full flex justify-end 
            `}
          style={{
            bottom: (boxHeight ?? 150) + 70,
          }}
        >
          <Button
            size="icon"
            variant="secondary"
            aria-label="Scroll to bottom"
            className="cursor-pointer h-10 w-10 rounded-full border shadow-lg bg-background hover:bg-accent"
            onClick={() => scrollToBottom()}
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
      )}

      {/* Message navigation buttons */}
      {messages.length > 3 && (
        <div className="hidden lg:flex  text-center group fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-50">
          <div className="opacity-0 group-hover:opacity-100 transition opacity ease-in-out duration-150">
            <ConditionalTooltip
              content="Previous Response"
              alwaysShow={true}
              align="center"
              showArrow={true}
            >
              <Button
                size="icon"
                variant={"secondary"}
                className="cursor-pointer h-10 w-10 rounded-full"
                onClick={goToPreviousMessage}
                disabled={
                  messages.findIndex((msg) => msg.id === activeMessageId) <=
                    0 || activeMessageId === null
                }
              >
                <ChevronUp className="size-4" />
              </Button>
            </ConditionalTooltip>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <MessageDots
              messages={messages}
              activeMessageId={activeMessageId}
              setActiveMessageId={setActiveMessageId}
              messageRefs={messageRefs}
              scrollToMessageById={scrollToMessageById}
            />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition opacity ease-in-out duration-150">
            <ConditionalTooltip
              content="Next Response"
              alwaysShow={true}
              align="center"
              showArrow={true}
            >
              <Button
                size="icon"
                variant={"outline"}
                className="cursor-pointer h-8 w-8 rounded-full  "
                onClick={goToNextMessage}
                disabled={
                  messages.findIndex((msg) => msg.id === activeMessageId) >=
                    messages.length - 1 || activeMessageId === null
                }
              >
                <ChevronDown className="size-4" />
              </Button>
            </ConditionalTooltip>
          </div>
        </div>
      )}
    </>
  );
}
