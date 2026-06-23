"use client";
import { TaskTokenUsageDialog } from "@/app/(dashboard)/inbox/components/tasks/task-token-usage-dialog";
import { MarkdownPdf } from "@/components/assistant/markdown-pdf";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message, MessageContent } from "@/components/ui/message";
import { timeCount } from "@/helper/assistant-helper/helper";
import { UTCToLocalTimezon } from "@/helper/helper-function";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  Check,
  Coins,
  Copy,
  MoreVertical,
  Paperclip,
  RefreshCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useMessageActions } from "../hooks/useMessageActions";
import { FeedbackDialog } from "./feedback-dialog";
import { JsonViewDialog } from "./json-view-dialog";
import MarkdownStreaming from "./markdown-streaming";
import { AssistantMessage, ChatMessageProps } from "./types";

export function MessageDetail({
  message,
  isStreaming,
  setIsStreaming,
  streamingDisabled = false,
  lastMessageId,
  sources,
  status,
  handleRegenerateMessage,
}: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const assistantMessage = isAssistant ? (message as AssistantMessage) : null;
  const isLastMessage = message.id === lastMessageId;

  const {
    isCopied,
    handleCopy,
    sentiment,
    categories,
    comment,
    handleLike,
    handleDislike,
    handleFeedbackSubmit,
    showFeedback,
    setShowFeedback,
    showJson,
    setShowJson,
    isRootUser,
    showTokenUsageSheet,
    setShowTokenUsageSheet,
  } = useMessageActions(message);

  const showActionBar =
    message?.message_id ||
    (!isStreaming &&
      assistantMessage?.answer &&
      status === "completed" &&
      !assistantMessage?.isError &&
      assistantMessage?.message_id) ||
    streamingDisabled;

  return (
    <>
      <Message className={isAssistant ? "justify-start w-full" : "justify-end"}>
        <div className={`${isAssistant ? "max-w-full w-full" : "max-w-[70%]"}`}>
          {isAssistant ? (
            <div className="group">
              <MarkdownStreaming
                message={message}
                setIsStreaming={setIsStreaming}
                isStreaming={isStreaming}
                streamingDisabled={streamingDisabled}
                sources={sources}
              />

              {showActionBar && (
                <div className="flex gap-2 items-center mt-2">
                  <div className="flex w-full items-center gap-1 text-muted-foreground text-sm">
                    {/* Copy */}

                    <ConditionalTooltip
                      content="Copy"
                      alwaysShow={true}
                      align="center"
                      className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm text-black shadow-md border"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="cursor-pointer rounded-full h-[36px] w-[36px] flex items-center justify-center hover:bg-black/10 hover:border-text-secondary"
                        aria-label="Copy"
                      >
                        {isCopied ? (
                          <Check className="size-4 text-green-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </ConditionalTooltip>

                    {/* Like */}

                    <ConditionalTooltip
                      content="Helpful"
                      alwaysShow={true}
                      align="center"
                      className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm text-black shadow-md border"
                    >
                      <Button
                        onClick={handleLike}
                        variant="ghost"
                        size="icon"
                        aria-label="Helpful"
                        className={`cursor-pointer rounded-full h-[36px] w-[36px] flex items-center justify-center hover:bg-black/10 hover:border-text-secondary ${
                          sentiment === "POSITIVE"
                            ? "text-green-500 hover:text-green-600"
                            : ""
                        }`}
                      >
                        <ThumbsUp className="size-4" />
                      </Button>
                    </ConditionalTooltip>

                    {/* Dislike */}

                    <ConditionalTooltip
                      content="Not Helpful"
                      alwaysShow={true}
                      align="center"
                      className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm text-black shadow-md border"
                    >
                      <Button
                        onClick={handleDislike}
                        variant="ghost"
                        size="icon"
                        aria-label="Not Helpful"
                        className={`cursor-pointer rounded-full h-[36px] w-[36px] flex items-center justify-center hover:bg-black/10 hover:border-text-secondary ${
                          sentiment === "NEGATIVE"
                            ? "text-red-500 hover:text-red-600"
                            : ""
                        }`}
                      >
                        <ThumbsDown className="size-4" />
                      </Button>
                    </ConditionalTooltip>

                    {/* Regenerate */}
                    {isLastMessage && (
                      <ConditionalTooltip
                        content="Regenerate"
                        alwaysShow={true}
                        align="center"
                        className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-sm text-black shadow-md border"
                      >
                        <Button
                          onClick={() =>
                            handleRegenerateMessage?.(String(message?.id))
                          }
                          variant="ghost"
                          size="icon"
                          aria-label="Regenerate"
                          className="cursor-pointer rounded-full h-[36px] w-[36px] flex items-center justify-center hover:bg-black/10 hover:border-text-secondary"
                        >
                          <RefreshCcw className="size-4" />
                        </Button>
                      </ConditionalTooltip>
                    )}
                    {/* More options */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="cursor-pointer hover:text-foreground hover:bg-black/10 transition w-[32px] h-[32px] flex items-center justify-center rounded-full">
                          <MoreVertical className="size-4" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setShowFeedback(true)}
                          className="cursor-pointer"
                        >
                          Report Issue
                        </DropdownMenuItem>
                        {isRootUser && message?.final_state_data && (
                          <DropdownMenuItem
                            onClick={() => setShowJson(true)}
                            className="cursor-pointer"
                          >
                            View State
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem className="cursor-pointer" asChild>
                          <PDFDownloadLink
                            document={
                              <MarkdownPdf
                                question={message?.question}
                                content={message?.answer}
                                timeStamp={UTCToLocalTimezon(
                                  message?.created_at,
                                )}
                                sources={message?.relevant_sources || []}
                              />
                            }
                            fileName={`${message?.thread_id}${
                              message?.created_at
                                ? `_${message?.created_at}`
                                : message?.timestamp
                                  ? `_${message?.timestamp}`
                                  : ""
                            }.pdf`}
                          >
                            Export PDF
                          </PDFDownloadLink>
                        </DropdownMenuItem>
                        {isRootUser && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setShowTokenUsageSheet(true)}
                              className="cursor-pointer"
                            >
                              View Usage
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="ml-auto flex items-center gap-1">
                      {message?.start_time && message?.end_time && (
                        <div className="px-1.5 py-0.5 flex items-center border rounded-md">
                          <span className="text-sm text-muted-foreground">
                            {timeCount(message.start_time, message.end_time)}
                          </span>
                        </div>
                      )}
                      {message?.credits_used !== undefined && (
                        <ConditionalTooltip
                          content="Credits used"
                          alwaysShow={true}
                          align="center"
                          showArrow={true}
                        >
                          <div className=" px-1.5 py-0.5 flex items-center border rounded-md">
                            <span className="inline-flex mr-1">
                              <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {message?.credits_used}
                            </span>
                          </div>
                        </ConditionalTooltip>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {message?.question && (
                <MessageContent>{message.question}</MessageContent>
              )}
              {message?.attchments?.map((file, index) => (
                <div
                  key={index}
                  className="mt-2 rounded-lg p-3 text-foreground bg-secondary prose wrap-break-word whitespace-normal line-height-5"
                >
                  <div className="text-black break-all flex items-center gap-1">
                    <Paperclip className="size-4" />
                    {file.name}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Message>

      <FeedbackDialog
        feedback={{
          sentiment: sentiment || "",
          comment: comment || "",
          category: categories || [],
        }}
        open={showFeedback}
        onOpenChange={setShowFeedback}
        onSubmit={handleFeedbackSubmit}
      />

      {isAssistant && (
        <JsonViewDialog
          open={showJson}
          onOpenChange={setShowJson}
          data={message?.final_state_data}
        />
      )}
      {isAssistant && (
        <TaskTokenUsageDialog
          open={showTokenUsageSheet}
          onOpenChange={setShowTokenUsageSheet}
          creditsUsed={message?.credits_used}
          tokenUsage={message?.token_usage}
        />
      )}
    </>
  );
}
