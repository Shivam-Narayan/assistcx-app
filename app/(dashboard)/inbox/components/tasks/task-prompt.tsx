"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { errorMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import { mergeExecutionLog } from "@/app/(dashboard)/inbox/hooks/stream-helpers";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { AgentOutputMainData, ExecutionMessage } from "@/types/types";
import { SendIcon, SquarePlay } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

export const TaskPrompt: React.FC<{
  setAgentOutputData: (agentOutputData: AgentOutputMainData | null) => void;
  agentOutputData: AgentOutputMainData | null;
  taskStatus?: string | null;
  setIsCustomTaskLoading: (isLoading: boolean) => void;
  setTaskStatus: (status: string | null) => void;
  setExecutionLog: (executionLog: ExecutionMessage[]) => void;
  executionLog: ExecutionMessage[];
  getTaskInformation: () => Promise<void>;
}> = ({
  setAgentOutputData,
  agentOutputData,
  taskStatus,
  setIsCustomTaskLoading,
  setTaskStatus,
  setExecutionLog,
  executionLog,
  getTaskInformation,
}) => {
  const params = useParams() as { task_id: string };
  const { task_id: taskId } = params;
  const [prompt, setPrompt] = useState("");
  const { axiosAuth } = useAxiosAuth();

  const handleSubmit = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    let streamStarted = false;
    try {
      const response = await axiosAuth.post(
        `${url.AGENT_TASK_CONTINUE}/${taskId}/continue`,
        { message: trimmedPrompt },
        {
          responseType: "stream",
          adapter: "fetch",
          headers: {
            Accept: "text/event-stream",
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.data
        .pipeThrough(new TextDecoderStream())
        .getReader();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (!streamStarted && Object.keys(value).length > 0) {
          streamStarted = true;
          setIsCustomTaskLoading(true);
          setTaskStatus("EXECUTING");
          setAgentOutputData({
            ...(agentOutputData || {}),
            agent_outputs:
              agentOutputData?.agent_outputs?.map((o: any) => ({
                ...o,
                output: null,
              })) || [],
            attempts: agentOutputData?.attempts || [],
            total: agentOutputData?.total || 0,
          });
          setPrompt("");
        }

        buffer += value;
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;
          const dataLine = chunk
            .split("\n")
            .find((line) => line.startsWith("data: "));
          if (!dataLine) continue;

          const data = dataLine.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            if (parsed?.task_status) setTaskStatus(parsed.task_status);
            if (parsed.execution_log && Array.isArray(parsed.execution_log)) {
              setExecutionLog(mergeExecutionLog(executionLog, parsed.execution_log));
            }
          } catch (err) {
            errorMessageHandler(err || "Stream parse error");
          }
        }
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setPrompt("");
      setAgentOutputData(null);
      await getTaskInformation();
      setIsCustomTaskLoading(false);
    }
  }, [
    prompt,
    taskId,
    axiosAuth,
    executionLog,
    setExecutionLog,
    setTaskStatus,
    agentOutputData,
    setAgentOutputData,
    getTaskInformation,
    setIsCustomTaskLoading,
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxHeight = 250;
  const isDisabled = taskStatus === "EXECUTING" || taskStatus === "QUEUED";

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky z-20 bottom-0 left-0 pb-4 bg-background/80 backdrop-blur-xl rounded-t-xl">
      <Card className="rounded-b-none rounded-xl py-0 gap-0 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3),0_4px_12px_-2px_rgba(0,0,0,0.2)]">
        <CardHeader className="px-4 py-3 gap-0">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
              <SquarePlay className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col justify-center min-h-9">
              <h3 className="text-base font-semibold text-foreground leading-tight">
                Continue Task
              </h3>
              <p className="text-xs text-muted-foreground">
                Provide a follow-up instruction to continue the task execution.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-0">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isDisabled}
              rows={1}
              className="w-full resize-none rounded-lg border border-border bg-muted/30 dark:bg-slate-700/30 px-4 py-3 pr-14 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                maxHeight: `${maxHeight}px`,
                overflowY: prompt.split("\n").length > 1 ? "auto" : "hidden",
              }}
            />
            <Button
              variant="default"
              size="icon"
              className="absolute bottom-3.5 right-2.5 text-white h-8 w-8 rounded-full bg-primary hover:bg-primary/80 transition cursor-pointer"
              onClick={handleSubmit}
              type="button"
              disabled={prompt.trim().length === 0 || isDisabled}
              aria-label="Send"
            >
              <SendIcon className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
