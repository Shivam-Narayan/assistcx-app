"use client";

import { HistoryLoader } from "@/app/assistant/history/_components/history-loader";
import { useChatHistory } from "@/app/assistant/history/hooks/useChatHistory";
import { BoxLayout } from "@/components/assistant/box-layout";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { EmptyState } from "@/components/empty-state/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UTCToLocalTimezon } from "@/helper/helper-function";
import { DASHBOARD } from "@/lib/assistant-urls";
import { cn } from "@/lib/utils";
import { clearAttchmentCollections } from "@/redux/assistant/chat/attachment-slice";
import { setChatData } from "@/redux/assistant/chat/chat-slice";
import { clearCollections } from "@/redux/assistant/chat/collection-slice";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Archive, HistoryIcon, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

export default function History() {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    chats,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    selectedChats,
    confirmDeleteId,
    page,
    hasMore,
    loaderRef,
    setConfirmDeleteId,
    setSearchQuery,
    handleDelete,
    handleSearchChange,
  } = useChatHistory({ pageSize: 10 });

  return (
    <div className="flex flex-col items-center w-full z-0">
      <BoxLayout className="w-full h-full flex flex-col min-w-full md:max-w-full">
        <div className="sticky backdrop-blur-md top-0 z-10 ">
          <div className="md:max-w-screen-md md:mx-auto pt-20 md:pt-12 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl md:text-3xl font-semibold">
                Chat History
              </h1>
              <Button
                className="cursor-pointer !h-8 !px-3 !py-2"
                onClick={() => router.push(DASHBOARD)}
                aria-label="New chat"
              >
                <Plus className="h-4 w-4" />
                New chat
              </Button>
            </div>
            <div className="relative w-full mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search your chats..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 bg-white border border-input shadow-xs transition-colors ring-offset-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 w-full  overflow-auto md:max-w-screen-md md:mx-auto">
          <div className="space-y-3 w-full pb-6">
            {isLoading && page === 1 ? (
              Array.from({ length: 5 }).map((_, index) => (
                <HistoryLoader key={`loader-${index}`} />
              ))
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : chats.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <EmptyState
                  title="No Conversations Found!"
                  icon={HistoryIcon}
                  variant="fullpage"
                  action={
                    <Button
                      variant="outline"
                      className="cursor-pointer !h-8 !px-3 !py-2"
                      onClick={() => router.push(DASHBOARD)}
                      aria-label="New chat"
                    >
                      <Plus className="h-4 w-4" />
                      New chat
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {chats.map((chat, index) => {
                  const isSelected = selectedChats.includes(chat.id);
                  const isConfirming = confirmDeleteId === chat.id;

                  return (
                    <Card
                      key={`${chat.id}-${index}-${chat.updated_at}`}
                      className={cn(
                        "relative flex flex-row items-center justify-between shadow-xs p-4 cursor-pointer group transition-colors hover:bg-gray-100/70",
                        isSelected && "border-blue-600 border-2",
                      )}
                      onClick={() => {
                        router.push(`/assistant/chat/${chat.id}`);
                        dispatch(setChatData({ input: "", chat_id: "" }));
                        dispatch(clearCollections());
                        dispatch(clearAttchmentCollections());
                      }}
                      onMouseLeave={() => {
                        if (confirmDeleteId === chat.id) {
                          setConfirmDeleteId(null);
                        }
                      }}
                    >
                      <div className="flex-1">
                        <h2 className="text-base font-medium line-clamp-1  mb-1">
                          {chat.title ? chat.title : "NA"}
                        </h2>
                        {chat.updated_at && (
                          <p className="text-sm text-muted-foreground">
                            Updated on {UTCToLocalTimezon(chat.updated_at)}
                          </p>
                        )}
                      </div>

                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isConfirming ? (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setConfirmDeleteId(null)}
                              className="cursor-pointer h-6 w-6 md:h-8 md:w-8"
                              aria-label="Close"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              onClick={() => handleDelete(chat.id)}
                              className="cursor-pointer h-6 w-6 md:h-8 md:w-8"
                              aria-label="Delete"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <ConditionalTooltip
                            content="Archive Chat"
                            alwaysShow={true}
                            align="center"
                            showArrow={true}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(chat.id);
                              }}
                              aria-label="Delete"
                              className="cursor-pointer h-6 w-6 md:h-8 md:w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            >
                              <Archive className="h-4 w-4 text-primary" />
                            </Button>
                          </ConditionalTooltip>
                        )}
                      </div>
                    </Card>
                  );
                })}

                {hasMore && (
                  <div
                    ref={loaderRef}
                    className="w-full h-10 flex items-center justify-center"
                  >
                    {isFetchingMore && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-primary">
                          Loading more chats...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </BoxLayout>
    </div>
  );
}
