"use client";

import { Loader } from "@/components/ui/loader";
import { Markdown } from "@/components/ui/markdown";
import { errorMessageHandler } from "@/helper/helper-function";
import { CHAT_THREAD } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useCallback, useEffect, useState } from "react";
import { ChatMessage } from "../../chat/_components/types";
import { TaskDetails, TaskResponseDetailProps } from "./types";

export default function TaskResponseDetail({
  taskId,
}: TaskResponseDetailProps) {
  const { axiosAuth } = useAxiosAuth();
  const [data, setData] = useState<TaskDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await axiosAuth.get(`${CHAT_THREAD}/${taskId}/chat-messages`);
      setData(res?.data);
      const assistant = res?.data.filter(
        (msg: ChatMessage) => msg.role === "assistant",
      );
      setContent(assistant?.[0]?.content);
    } catch (err) {
      errorMessageHandler(err);
    } finally {
      setLoading(false);
    }
  }, [axiosAuth, taskId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          Loading task <Loader variant="dots" className="mt-1" />
        </div>
      </div>
    );
  if (!data) return <p>No data available</p>;

  return (
    <Markdown className="flex flex-col gap-2" size="sm">
      {content ?? ""}
    </Markdown>
  );
}
