"use client";

import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { DASHBOARD } from "@/lib/assistant-urls";
import { useResizeObserver } from "@/lib/hook/useResizeObserver";
import { setSelectedAttchmentCollections } from "@/redux/assistant/chat/attachment-slice";
import {
  AttachmentData,
  CollectionData,
} from "@/redux/assistant/chat/chat-slice";
import { setSelectedCollections } from "@/redux/assistant/chat/collection-slice";
import { useAppSelector } from "@/redux/store";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";
import { usePathname } from "next/dist/client/components/navigation";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import AttachmentCollections from "./attchment-collection";
import CollectionMenuTrigger from "./collection-menu-trigger";
import { SelectedAttachmentDialog } from "./selected-attchment-dialog";
import { ChatInputProps } from "./types";

export const ChatInput: React.FC<ChatInputProps> = React.memo(
  ({
    onSubmit,
    className,
    isStreaming,
    isDisabled,
    onAbort,
    setChatInputHeight,
  }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const isNewChatPage = pathname === DASHBOARD;
    const [input, setInput] = useState<string>("");
    const [boxRef, boxSize] = useResizeObserver<HTMLDivElement>();
    const [collectionSheetOpen, setCollectionSheetOpen] = useState(false);
    const [attchmentSheetOpen, setAttachmentSheetOpen] = useState(false);
    const stableSelectedCollection = useAppSelector(
      (state) => state.collectionReducer.selected,
    );
    const selectedCollection = useMemo(
      () => stableSelectedCollection,
      [stableSelectedCollection],
    );

    const selectedAttachment = useAppSelector(
      (state) => state.attachmentReducer.selected,
    );
    const webSearchEnabled = useAppSelector(
      (state) => state.webSearchReducer?.enabled,
    );
    const defaultIcon = getIconSvg("folder02", "collection_icons");
    const resetInput = useCallback(() => {
      setInput("");
    }, []);

    const handleSubmit = useCallback(() => {
      const trimmedInput = input.trim();
      const hasAttachments =
        selectedAttachment === null || selectedAttachment.length > 0;
      const hasCollections =
        selectedCollection === null || selectedCollection?.length > 0;
      const inputTooLong = trimmedInput.length > 2000;

      if (
        !trimmedInput &&
        !hasAttachments &&
        !hasCollections &&
        !webSearchEnabled
      ) {
        return;
      }
      if (inputTooLong) {
        toast.error("Maximum input length is 2000 characters", {
          id: "input-length-error",
        });
        return;
      }

      onSubmit?.(
        trimmedInput,
        selectedCollection,
        selectedAttachment,
        webSearchEnabled,
        "",
        resetInput,
      );
    }, [
      input,
      onSubmit,
      resetInput,
      selectedCollection,
      selectedAttachment,
      webSearchEnabled,
    ]);

    const handleRemoveFile = useCallback(
      (item: AttachmentData) => {
        const current = selectedAttachment ?? [];
        const updated = current.filter((i) => i.id !== item.id);
        if (updated.length === 0) {
          dispatch(setSelectedAttchmentCollections(null));
        } else {
          dispatch(setSelectedAttchmentCollections(updated));
        }
      },
      [dispatch, selectedAttachment],
    );
    const handleRemoveCollection = useCallback(
      (collection: CollectionData) => {
        const current = selectedCollection ?? [];
        const updated = current.filter((i) => i.id !== collection.id);
        dispatch(setSelectedCollections(updated.length === 0 ? null : updated));
        if (!isNewChatPage) {
          router.push(DASHBOARD);
        }
      },
      [dispatch, selectedCollection],
    );
    useEffect(() => {
      if (boxSize.height) {
        if (setChatInputHeight) {
          setChatInputHeight(boxSize.height);
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boxSize]);

    return (
      <>
        <div className="w-full" ref={boxRef}>
          <PromptInput
            value={input}
            onValueChange={setInput}
            onSubmit={handleSubmit}
            maxHeight={250}
            className={`w-full max-w-3xl mx-auto rounded-3xl border border-border bg-white backdrop-blur-md shadow-[0_9px_9px_0px_rgba(0,0,0,0.01),0_2px_5px_0px_rgba(0,0,0,0.06)] ${className}`}
          >
            {selectedAttachment !== null && selectedAttachment.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {selectedAttachment.map((file, index) => {
                  if (index < 3)
                    return (
                      <div
                        key={index}
                        className="bg-secondary flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm"
                      >
                        <Paperclip className="size-4" />
                        <span className="max-w-[120px] truncate">
                          {file.name}
                        </span>
                        <div
                          onClick={() => handleRemoveFile(file)}
                          className="hover:bg-secondary/50 rounded-full cursor-pointer"
                        >
                          <X className="size-4" />
                        </div>
                      </div>
                    );
                })}
                {selectedAttachment.length > 3 && (
                  <div
                    onClick={() => setAttachmentSheetOpen(true)}
                    className="cursor-pointer bg-secondary flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm max-w-full"
                  >
                    +{selectedAttachment.length - 3} more
                  </div>
                )}
              </div>
            )}

            {selectedCollection !== null && selectedCollection?.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {selectedCollection.map((collection: CollectionData, index) => {
                  if (index < 3)
                    return (
                      <div
                        key={index}
                        className="bg-secondary flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm max-w-full"
                      >
                        {collection?.icon && (
                          <div
                            className="flex items-center [&>svg]:size-4"
                            dangerouslySetInnerHTML={{
                              __html:
                                getIconSvg(
                                  collection.icon,
                                  "collection_icons",
                                ) || defaultIcon,
                            }}
                          />
                        )}
                        <span className="max-w-[calc(100%-40px)] truncate">
                          {collection.name}
                        </span>
                        <div
                          onClick={() => handleRemoveCollection(collection)}
                          className="hover:bg-secondary/50 rounded-full cursor-pointer"
                        >
                          <X className="size-4" />
                        </div>
                      </div>
                    );
                })}
                {selectedCollection.length > 3 && (
                  <div
                    onClick={() => setCollectionSheetOpen(true)}
                    className="cursor-pointer bg-secondary flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm"
                  >
                    +{selectedCollection.length - 3} more
                  </div>
                )}
              </div>
            )}

            <PromptInputTextarea
              placeholder="Ask me anything..."
              className="min-h-[56px] md:text-xl px-1"
              disabled={isStreaming || isDisabled}
            />
            <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <AttachmentCollections />
                <CollectionMenuTrigger />
              </div>

              <PromptInputAction
                tooltip={isStreaming ? "Stop generation" : "Send message"}
              >
                {isStreaming || isDisabled ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-[36px] w-[36px] rounded-full transition cursor-pointer text-primary bg-primary/10 hover:bg-primary/20"
                    type="button"
                    aria-label="Pause"
                    onClick={() => onAbort?.()}
                  >
                    <Square className="size-4 fill-current text-primary" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="icon"
                    className="h-[36px] w-[36px] rounded-full transition cursor-pointer text-primary bg-primary/10 hover:bg-primary/20"
                    onClick={handleSubmit}
                    type="button"
                    disabled={
                      isStreaming || isDisabled || input.trim().length === 0
                    }
                    aria-label="Send"
                  >
                    <ArrowUp className="size-5 text-primary" />
                  </Button>
                )}
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
        {selectedAttachment !== null && (
          <SelectedAttachmentDialog
            open={attchmentSheetOpen}
            onOpenChange={setAttachmentSheetOpen}
            selectedAttachment={selectedAttachment}
            onRemove={handleRemoveFile}
          />
        )}
      </>
    );
  },
);
ChatInput.displayName = "ChatInput";
