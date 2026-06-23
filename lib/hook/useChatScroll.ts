import { useEffect, useRef, useCallback, RefObject } from "react";

type UseChatScrollProps = {
  chatRef: RefObject<HTMLDivElement | null>;
  topSentinelRef: RefObject<HTMLDivElement | null>;
  isStreaming: boolean;
  onScrollTop?: () => void;
};

export function useChatScroll({
  chatRef,
  topSentinelRef,
  isStreaming,
  onScrollTop,
}: UseChatScrollProps) {
  // Track if user manually scrolled up to disable auto scroll
  const userHasManuallyScrolled = useRef(false);
  // Track if we are prepending (infinite scroll) and need to adjust scroll position
  const pendingScrollAdjust = useRef(false);
  const prevScrollHeight = useRef(0);

  // Scroll to bottom utility
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      if (!chatRef.current) return;
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior,
      });
      userHasManuallyScrolled.current = false;
    },
    [chatRef]
  );

  // Main effect: scroll button visibility, user scroll detection, resize observer, streaming autoscroll
  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chat;
      const atBottom = scrollHeight - scrollTop - clientHeight < 10;
      userHasManuallyScrolled.current = !atBottom;
    };

    chat.addEventListener("scroll", onScroll);

    const resizeObserver = new ResizeObserver(() => {
      if (!userHasManuallyScrolled.current) scrollToBottom("auto");
    });
    resizeObserver.observe(chat);

    let rafId: number;
    const streamLoop = () => {
      if (isStreaming && !userHasManuallyScrolled.current) {
        scrollToBottom("auto");
        rafId = requestAnimationFrame(streamLoop);
      }
    };
    if (isStreaming) rafId = requestAnimationFrame(streamLoop);

    return () => {
      chat.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [chatRef, isStreaming, scrollToBottom]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!topSentinelRef.current || !onScrollTop) return;

    const chat = chatRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          prevScrollHeight.current = chat?.scrollHeight ?? 0;
          pendingScrollAdjust.current = true;
          onScrollTop();
        }
      },
      { root: chat, threshold: 1.0 }
    );
    observer.observe(topSentinelRef.current);

    return () => observer.disconnect();
  }, [chatRef, onScrollTop, topSentinelRef]);

  // Return values and refs necessary to manage scroll behavior from component
  return {
    userHasManuallyScrolled,
    pendingScrollAdjust,
    prevScrollHeight,
    scrollToBottom,
  };
}
