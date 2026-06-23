"use client";
import { ChatContainer } from "@/components/ui/chat-container";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you're using shadcn/ui
import { BoxLayout } from "@/components/assistant/box-layout";

export function ChatLoader() {
  return (
    <div className="flex flex-col items-center w-full h-full relative overflow-hidden">
      <div className="w-full h-full overflow-hidden">
        <div className="relative h-full flex items-center justify-center">
          <ChatContainer className="flex-1 h-full space-y-4 py-4 w-full">
            <BoxLayout className="flex flex-col gap-6 w-full pt-16">
              <div className="flex flex-col space-y-6 w-full">
                <div className="flex flex-1 justify-end  w-full">
                  <Skeleton className="h-8 w-[70%]  bg-gray-300 " />
                </div>
                <div className="flex-1 justify-start w-full">
                  <div className=" space-y-2">
                    <Skeleton className="h-6 w-24 mb-2 bg-gray-300 " />
                    <Skeleton className="h-4 w-full bg-gray-300 " />
                    <Skeleton className="h-4 w-[100%] bg-gray-300 " />
                    <Skeleton className="h-4 w-[100%] bg-gray-300 " />
                    <Skeleton className="h-4 w-[100%] bg-gray-300 " />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4 w-full border p-4 border-gray-200 pt-4 rounded-md">
                  <Skeleton className="h-6 w-6 bg-gray-300 rounded-full " />
                  <Skeleton className="h-5 flex-1 bg-gray-300 rounded " />
                </div>
                <div className="mb-4 flex justify-between items-center">
                  <div className="h-5 w-40 bg-gray-300 rounded " />
                  <div className="h-6 w-16 bg-gray-200 rounded " />
                </div>
                <div className="flex flex-wrap gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 p-4 border rounded-md animate-pulse w-full sm:w-[47%] md:w-[30%] h-[100px]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-gray-300 rounded-full" />
                        <div className="h-4 w-2/3 bg-gray-300 rounded" />
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded" />
                      <div className="h-3 w-4/5 bg-gray-200 rounded" />
                    </div>
                  ))}
                  <div className="flex items-center justify-center w-full sm:w-[47%] md:w-[30%] h-[100px] border rounded-md animate-pulse">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-1">
                        <div className="h-5 w-5 bg-gray-300 rounded-full" />
                        <div className="h-5 w-5 bg-gray-300 rounded-full" />
                      </div>
                      <div className="h-4 w-24 bg-gray-300 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </BoxLayout>
          </ChatContainer>
        </div>
      </div>
    </div>
  );
}
