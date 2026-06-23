import { Loader } from "@/components/ui/loader";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, SquareChartGantt } from "lucide-react";
import { useMemo } from "react";
import { ThinkingBlock } from "./thinking-block";
import { ToolBlock } from "./tool-block";
import { AssistantMessage, StreamEvent } from "./types";

export const ThoughtAndAction = ({
  message,
  isPlanExpanded,
  isAnswer,
  research_complete,
  onPlanExpandedChange,
}: {
  message: AssistantMessage;
  isPlanExpanded: boolean;
  isAnswer: boolean;
  research_complete: boolean;
  onPlanExpandedChange: (expanded: boolean) => void;
}) => {
  const isAllCompleted = research_complete;
  const baseDelay = 0;

  const togglePlan = () => onPlanExpandedChange(!isPlanExpanded);

  const visibleEvents = message.stream_events ?? [];
  const lastEventIndex = visibleEvents.length - 1;

  // Group tool_call + tool_result by tool_call_id into combined blocks
  type GroupedEvent =
    | {
        type: "thinking";
        event: Extract<StreamEvent, { type: "thinking" }>;
        index: number;
      }
    | {
        type: "tool";
        toolCall: Extract<StreamEvent, { type: "tool_call" }>;
        toolResult?: Extract<StreamEvent, { type: "tool_result" }>;
        index: number;
      };

  const groupedEvents = useMemo(() => {
    const result: GroupedEvent[] = [];
    const toolResultMap = new Map<
      string,
      Extract<StreamEvent, { type: "tool_result" }>
    >();

    // First pass: index all tool_results by tool_call_id
    for (const event of visibleEvents) {
      if (event.type === "tool_result") {
        toolResultMap.set(event.tool_call_id, event);
      }
    }

    // Second pass: build grouped list, skip standalone tool_results
    for (let i = 0; i < visibleEvents.length; i++) {
      const event = visibleEvents[i];
      if (event.type === "thinking") {
        result.push({ type: "thinking", event, index: i });
      } else if (event.type === "tool_call") {
        result.push({
          type: "tool",
          toolCall: event,
          toolResult: toolResultMap.get(event.tool_call_id),
          index: i,
        });
      }
      // tool_result is consumed by its matching tool_call above
    }
    return result;
  }, [visibleEvents]);
  return (
    <>
      <div
        className={`relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-gray-200 
        `}
      >
        <motion.div
          className={`bg-gray-50 px-2.5 py-2.5 cursor-pointer hover:bg-gray-100 transition-all ${
            isPlanExpanded ? "border-b border-gray-200" : ""
          }`}
          initial={false}
          animate={{ backgroundColor: "#f9fafb" }}
          transition={{ duration: 0.2 }}
          onClick={togglePlan}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              togglePlan();
            }
          }}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 text-foreground/90 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mr-3">
              <SquareChartGantt size={18} className="text-primary" />
            </div>
            <div className="grow">
              <h1 className="text-lg flex items-center gap-2">
                Thoughts and Actions{" "}
              </h1>
            </div>
            <div className="text-gray-400 hover:text-gray-600">
              {isPlanExpanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isPlanExpanded && (
            <motion.div
              key="tasks-container"
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                transition: {
                  opacity: { duration: 0.2 },
                  height: { duration: 0.3, ease: "easeOut" },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  opacity: { duration: 0.2 },
                  height: { duration: 0.3, ease: "easeIn" },
                },
              }}
              className="relative overflow-hidden"
            >
              <div className="space-y-4 p-4">
                {groupedEvents.map((grouped) => {
                  if (grouped.type === "thinking") {
                    const isLast = grouped.index === lastEventIndex;
                    const isActive = isLast && !isAllCompleted && !isAnswer;
                    return (
                      <ThinkingBlock
                        key={grouped.index}
                        event={grouped.event}
                        message={message}
                        isAllCompleted={isAllCompleted}
                        baseDelay={baseDelay}
                        index={grouped.index}
                        isActive={isActive}
                      />
                    );
                  }
                  return (
                    <ToolBlock
                      key={grouped.index}
                      toolCall={grouped.toolCall}
                      toolResult={grouped.toolResult}
                      relevant_sources={message?.relevant_sources}
                    />
                  );
                })}
                {!isAllCompleted &&
                  !isAnswer &&
                  !message.isError &&
                  !message.answer?.length &&
                  visibleEvents.length > 0 && (
                    <div className="flex items-center  mt-4 justify-center gap-3">
                      <h5>Processing</h5>
                      <Loader variant="dots" size="sm" className="mt-1" />
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
