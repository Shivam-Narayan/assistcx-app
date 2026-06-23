"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMemo } from "react";
import { ChatMessage, DotItem, MessageDotsProps } from "./types";

const getVisibleDots = (
  messages: ChatMessage[],
  activeIndex: number,
): DotItem[] => {
  const total = messages.length;
  if (total <= 20) {
    // small list, show all
    return messages.map((m) => ({ type: "msg", msg: m }));
  }

  const result: DotItem[] = [];
  const startCount = 5;
  const endCount = 5;
  const beforeAfter = 3;

  const topEnd = startCount;
  const bottomStart = total - endCount;

  const activeStart = Math.max(activeIndex - beforeAfter, topEnd);
  const activeEnd = Math.min(activeIndex + beforeAfter + 1, bottomStart);

  // Top section
  result.push(
    ...messages.slice(0, topEnd).map((m) => ({ type: "msg" as const, msg: m })),
  );

  // Left ellipsis if gap
  if (activeStart > topEnd) result.push({ type: "ellipsis", key: "left" });

  // Active section
  result.push(
    ...messages
      .slice(activeStart, activeEnd)
      .map((m) => ({ type: "msg" as const, msg: m })),
  );

  // Right ellipsis if gap
  if (activeEnd < bottomStart) result.push({ type: "ellipsis", key: "right" });

  // Bottom section
  result.push(
    ...messages
      .slice(bottomStart)
      .map((m) => ({ type: "msg" as const, msg: m })),
  );

  return result;
};

export function MessageDots({
  messages,
  activeMessageId,
  scrollToMessageById,
}: MessageDotsProps) {
  const activeIndex = messages.findIndex((m) => m.id === activeMessageId);
  const dots = useMemo(
    () => getVisibleDots(messages, activeIndex),
    [messages, activeIndex],
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-0.5 items-center">
        {dots.map((item) => {
          if (item.type === "ellipsis") {
            return (
              <span key={item.key} className="text-muted-foreground">
                ...
              </span>
            );
          }

          const { msg } = item;
          const isActive = msg.id === activeMessageId;

          return (
            <ConditionalTooltip
              key={msg.id}
              content={
                <>
                  <h3 className="text-lg font-semibold text-muted-foreground text-left">
                    {msg.role === "user" ? "You" : "Assistant"}
                  </h3>
                  <p className="text-sm line-clamp-2">
                    {msg?.content
                      ?.replace(/[#*_`>\\]/g, "")
                      .replace(/\n/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()
                      .substring(0, 200)}
                  </p>{" "}
                </>
              }
              alwaysShow={true}
              align="center"
              sideOffset={5}
              side="left"
              showArrow={true}
              className="flex-col flex gap-1 rounded-md bg-white px-3 py-1.5 text-sm text-black shadow-md border  no-arrow w-64 "
            >
              <Button
                onClick={() => scrollToMessageById(String(msg.id))}
                className={`w-10 px-2 py-2 h-auto min-h-auto bg-transparent hover:bg-gray-600 hover:text-white cursor-pointer justify-center text-center`}
              >
                <div
                  className={`bg-gray-400 content-[''] h-0.5 rounded-none  ${
                    msg.role !== "user" ? "w-4 " : "w-2 "
                  }
                          ${isActive && "bg-primary"}
                          `}
                ></div>
              </Button>
            </ConditionalTooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
