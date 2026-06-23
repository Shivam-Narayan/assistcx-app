"use client";

import { Markdown } from "@/components/ui/markdown";
import { useTextStream } from "@/components/ui/response-stream";
import React, { useEffect, useState } from "react";
import { MarkdownStreamingProps } from "./types";

const MarkdownStreaming: React.FC<MarkdownStreamingProps> = ({
  message,
  setIsStreaming,
  streamingDisabled = false,
  sources,
  size = "base",
}) => {
  const markdownText = message.answer?.replace(/\\n/g, "\n");

  const { startStreaming } = useTextStream({
    textStream: markdownText || "",
    mode: "typewriter",
    speed: 100,
    onComplete: () => {
      if (setIsStreaming) {
        setIsStreaming(false);
      }
    },
  });

  const [textToRender, setTextToRender] = useState<string>(
    streamingDisabled ? markdownText || "" : "",
  );

  useEffect(() => {
    if (streamingDisabled) {
      setTextToRender(markdownText || "");
    } else {
      startStreaming();
      if (setIsStreaming) setIsStreaming(true);
    }

    return () => {
      if (setIsStreaming) setIsStreaming(false);
    };
  }, [streamingDisabled, markdownText, setIsStreaming, startStreaming]);

  // Choose what text to show
  const finalText = streamingDisabled ? textToRender : markdownText;

  return (
    <div className="text-foreground prose rounded-lg py-2 break-words">
      <Markdown
        enableCitations={true}
        citations={sources}
        className="flex flex-col gap-2"
        size={size}
      >
        {finalText || ""}
      </Markdown>
    </div>
  );
};

export default MarkdownStreaming;
