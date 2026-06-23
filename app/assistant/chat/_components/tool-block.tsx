import { CollapsibleContent } from "@/components/collapsible-content";
import { SmartContentViewer } from "@/components/smart-content";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, Check, ChevronDown, ChevronRight, Zap } from "lucide-react";
import { useState } from "react";
import { SourceDocument, StreamEvent } from "./types";

const formatFunctionName = (name: string) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const ToolBlock = ({
  toolCall,
  toolResult,
  relevant_sources,
}: {
  toolCall: Extract<StreamEvent, { type: "tool_call" }>;
  toolResult?: Extract<StreamEvent, { type: "tool_result" }>;
  relevant_sources?: SourceDocument[];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = !!toolResult;

  const argsContent =
    typeof toolCall.args === "string"
      ? JSON.parse(toolCall.args)
      : toolCall.args;

  return (
    <div className="relative">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div
          className="bg-slate-50 dark:bg-slate-700/40 px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            </div>
            <code className="font-semibold text-sm text-foreground/90">
              {formatFunctionName(toolCall.tool)}
            </code>
            {isCompleted ? (
              <Check size={14} strokeWidth={2.5} className="text-emerald-500" />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <span>Running</span>
              </div>
            )}
          </div>
          <div className="text-gray-400">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>
        </div>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="tool-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2, delay: 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                opacity: { duration: 0.15 },
                height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              },
            }}
            className="overflow-hidden"
          >
            {/* Tool Input */}
            <div className="px-3 py-3 border-t border-gray-200">
              <div className="flex items-center gap-1.5 mb-2">
                <ArrowUpFromLine size={12} className="text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  Input
                </span>
              </div>
              <CollapsibleContent
                maxHeight={300}
                gradientStart="from-background"
                className="prose prose-sm dark:prose-invert max-w-none reset-prose"
              >
                <SmartContentViewer content={argsContent} />
              </CollapsibleContent>
            </div>

            {/* Tool Output */}
            {toolResult && toolResult.output?.length > 0 && (
              <div className="px-3 py-3 border-t border-gray-200">
                <div className="flex items-center gap-1.5 mb-2">
                  <ArrowDownToLine size={12} className="text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Output
                  </span>
                </div>
                <CollapsibleContent
                  gradientStart="from-background"
                  className="prose prose-sm dark:prose-invert max-w-none reset-prose"
                >
                  <SmartContentViewer
                    content={toolResult.output}
                    expandView={true}
                    withCitations={true}
                    sources={relevant_sources}
                  />
                </CollapsibleContent>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};
