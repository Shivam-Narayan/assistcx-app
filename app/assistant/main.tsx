"use client";

import { ChatInput } from "@/app/assistant/chat/_components/chat-input";
import { Guideline } from "@/components/assistant/guideline";
import { CHAT } from "@/lib/assistant-urls";

import {
  AttachmentData,
  CollectionData,
  setChatData,
} from "@/redux/assistant/chat/chat-slice";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";

const Main: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col items-center w-full h-full p-2 mx-auto justify-center sm:p-4 sm:gap-9 xl:w-4/5 isolate">
      <div className="flex flex-col items-center gap-6 sm:gap-9 min-h-0 h-[450px] w-full sm:pt-10 isolate">
        <div className="flex flex-col items-start justify-center w-full sm:px-4 px-2 gap-6 sm:gap-4 xl:w-4/5 flex-initial pb-0 max-w-204">
          <h1 className="mb-6 w-full text-2xl flex flex-col gap-1 tracking-tight sm:text-3xl text-primary items-center justify-center text-center">
            <span className="text-[24px] text-muted-foreground">
              Welcome to AssistCX AI
            </span>
            <span className="text-foreground/80">
              How can I help you today?
            </span>
          </h1>
          <ChatInput
            prompt={true}
            onSubmit={(
              input: string,
              selectedCollection: CollectionData[] | null,
              selectedAttachment: AttachmentData[] | null,
              webSearchEnabled: boolean,
              chat_id: string,
              reset: () => void,
            ) => {
              const chatId = uuidv4();
              dispatch(
                setChatData({
                  input,
                  chat_id: chatId,
                }),
              );
              router.push(`${CHAT}/${chatId}`);
              reset();
            }}
          />
          <div className="w-full mt-4">
            <Guideline />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
