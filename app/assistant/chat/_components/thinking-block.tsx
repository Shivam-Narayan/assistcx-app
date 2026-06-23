import MarkdownStreaming from "./markdown-streaming";
import { AssistantMessage, StreamEvent } from "./types";
import { AnimatePresence, motion } from "framer-motion";

export const ThinkingBlock = ({
  event,
  message,
  isAllCompleted,
  baseDelay,
  index,
  isActive,
}: {
  event: Extract<StreamEvent, { type: "thinking" }>;
  message: AssistantMessage;
  isAllCompleted: boolean;
  baseDelay: number;
  index: number;
  isActive?: boolean;
}) => (
  <motion.div
    key={`thinking-${index}`}
    animate={{ opacity: 1, y: 0 }}
    transition={
      isAllCompleted
        ? { duration: 0, delay: 0 }
        : { type: "spring", stiffness: 300, damping: 25, delay: baseDelay }
    }
    className={`relative ${isActive}`}
  >
    <div className="transition-all overflow-hidden">
      <MarkdownStreaming
        message={{
          id: message?.id,
          role: message?.role,
          answer: event.text,
        }}
        setIsStreaming={() => {}}
        streamingDisabled={false}
        sources={message?.relevant_sources}
        size="sm"
      />
    </div>
  </motion.div>
);
