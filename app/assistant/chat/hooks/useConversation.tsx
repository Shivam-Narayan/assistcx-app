import { Loader } from "@/components/ui/loader";
import { useChatScroll } from "@/lib/hook/useChatScroll";
import { useDebouncedObserver } from "@/lib/hook/useDebouncedObserver";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThoughtAndAction } from "../_components/thought-and-action";
import { AssistantMessage, ChatBasicProps } from "../_components/types";

export function useConversation({
  messages,
  isStreaming = false,
  onScrollTop,
  scrollConversion,
  onScrolled,
}: ChatBasicProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>(
    {},
  );

  const chatRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const userScrolling = useRef(false);

  const {
    userHasManuallyScrolled,
    pendingScrollAdjust,
    prevScrollHeight,
    scrollToBottom,
  } = useChatScroll({
    chatRef,
    topSentinelRef,
    isStreaming,
    onScrollTop,
  });

  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    messages.forEach((message) => {
      if (
        message.role === "assistant" &&
        message.answer &&
        message.answer.length > 0 &&
        expandedPlans[message.id] === undefined
      ) {
        setExpandedPlans((prev) => ({
          ...prev,
          [message.id]: false,
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    if (!chatRef.current) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatRef.current!;
      const atBottom = scrollHeight - scrollTop - clientHeight < 10;
      setShowScrollButton(!atBottom);
    };

    const chat = chatRef.current;
    chat.addEventListener("scroll", onScroll);
    return () => chat.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!userHasManuallyScrolled.current && !pendingScrollAdjust.current) {
      scrollToBottom("auto");
    }
  }, [messages, scrollToBottom, userHasManuallyScrolled, pendingScrollAdjust]);

  useEffect(() => {
    if (pendingScrollAdjust.current && chatRef.current) {
      const chat = chatRef.current;
      const scrollDiff = chat.scrollHeight - prevScrollHeight.current;
      chat.scrollTop = chat.scrollTop + scrollDiff;
      pendingScrollAdjust.current = false;
    }
  }, [messages, pendingScrollAdjust, prevScrollHeight]);

  useEffect(() => {
    if (scrollConversion) {
      setTimeout(() => {
        scrollToBottom("smooth");
      }, 0);
      onScrolled?.();
    }
  }, [scrollConversion, scrollToBottom, onScrolled]);

  const renderThoughtAndAction = useCallback(
    (message: AssistantMessage) => {
      if (
        message.role !== "assistant" ||
        !message.stream_events ||
        message.stream_events.length <= 0
      )
        return (
          (message.role !== "assistant" ||
            !("answer" in message) ||
            (message as AssistantMessage).answer?.length <= 0) &&
          message.role === "assistant" &&
          !message.isError && (
            <div className="w-full flex items-center gap-2 ">
              Thinking <Loader variant="dots" size="sm" className="mt-1" />
            </div>
          )
        );

      return (
        <div className="w-full">
          <ThoughtAndAction
            message={message}
            isPlanExpanded={expandedPlans[message.id] ?? true}
            isAnswer={!!(message.answer && message.answer.length > 0)}
            research_complete={message?.research_complete ?? false}
            onPlanExpandedChange={(expanded) => {
              setExpandedPlans((prev) => ({
                ...prev,
                [message.id]: expanded,
              }));
            }}
          />
        </div>
      );
    },
    [expandedPlans],
  );

  const scrollToMessage = useCallback(
    (index: number) => {
      if (index < 0 || index >= messages.length) return;

      const message = messages[index];
      const chat = chatRef.current;
      if (!chat) return;

      userScrolling.current = true;
      userHasManuallyScrolled.current = true;

      setActiveMessageId(String(message.id));

      setTimeout(() => {
        const messageEl = messageRefs.current[message.id];
        if (!messageEl || !chat) {
          userScrolling.current = false;
          return;
        }

        const offsetTop = messageEl.offsetTop;
        chat.scrollTo({ top: offsetTop, behavior: "smooth" });

        setTimeout(() => {
          userScrolling.current = false;
        }, 100);
      }, 50);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages],
  );

  const goToPreviousMessage = useCallback(() => {
    userHasManuallyScrolled.current = true;
    const currentIndex = messages.findIndex(
      (msg) => msg.id === activeMessageId,
    );
    if (currentIndex > 0) {
      scrollToMessage(currentIndex - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeMessageId, scrollToMessage]);

  const goToNextMessage = useCallback(() => {
    const currentIndex = messages.findIndex(
      (msg) => msg.id === activeMessageId,
    );
    if (currentIndex < messages.length - 1) {
      scrollToMessage(currentIndex + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeMessageId, scrollToMessage]);

  const scrollToMessageById = useCallback(
    (id: string) => {
      userHasManuallyScrolled.current = true;
      const index = messages.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        scrollToMessage(index);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, scrollToMessage],
  );

  useEffect(() => {
    if (!chatRef.current || activeMessageId !== null || messages.length === 0)
      return;

    const chat = chatRef.current;
    const chatTop = chat.scrollTop + 20;

    let closestMessage = null;
    let minDistance = Infinity;

    Object.entries(messageRefs.current).forEach(([messageId, element]) => {
      if (!element) return;

      const elementTop = element.offsetTop;

      const distance = Math.abs(elementTop - chatTop);

      if (distance < minDistance) {
        minDistance = distance;
        closestMessage = messageId;
      }
    });

    if (closestMessage && minDistance < chat.clientHeight) {
      setActiveMessageId(closestMessage);
    }
  }, [messages, activeMessageId, isStreaming]);

  useDebouncedObserver({
    root: chatRef.current,
    targets: Object.values(messageRefs.current).filter(
      Boolean,
    ) as HTMLElement[],
    delay: 150,
    currentActiveId: activeMessageId,
    skip: userScrolling.current,
    onActiveChange: (id: string | null) => setActiveMessageId(id),
  });

  return {
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
  };
}
