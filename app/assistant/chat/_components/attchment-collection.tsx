"use client";

import { FileItem } from "@/app/assistant/files/_components/types";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  formatDate,
  getIconForFileType,
} from "@/helper/assistant-helper/helper";
import { MY_FILES } from "@/lib/assistant-urls";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Check, Paperclip, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAttachment } from "../hooks/useAttachment";
import { KnowledgeCollectionLoader } from "./knowledge-collection-loader";
import { AttachmentCollectionsProps } from "./types";

export default function AttachmentCollections({
  disabled,
}: AttachmentCollectionsProps) {
  const router = useRouter();
  const {
    open,
    handleOpenChange,
    closeDialog,
    collections,
    isLoading,
    isFetchingMore,
    hasMore,
    searchTerm,
    setSearchTerm,
    selected,
    stagedSelection,
    toggleItem,
    clearAll,
    applySelection,
    loaderRef,
    scrollContainerRef,
  } = useAttachment();

  const stagedCount = stagedSelection?.length ?? 0;

  return (
    <div className="space-y-4 w-full relative">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-[36px] cursor-pointer h-[36px] bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary focus-visible:ring-0 focus-visible:border-transparent"
            disabled={disabled}
            aria-label="Attachment Collection"
          >
            {selected !== null && selected.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 min-h-4 min-w-4 text-xs font-medium absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full">
                {selected.length}
              </span>
            )}
            <Paperclip className="size-4 -rotate-45 text-primary" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-[95vw] sm:max-w-xl p-0 overflow-hidden **:data-dialog-close:hidden rounded-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white z-10">
              <DialogTitle
                className="text-lg font-semibold cursor-pointer"
                onClick={() => router.push(MY_FILES)}
              >
                My Files
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeDialog}
                className="h-8 w-8 p-0 cursor-pointer"
                aria-label="close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div
              className="flex flex-col h-full overflow-y-auto min-h-[60vh] max-h-[60vh]"
              ref={scrollContainerRef}
            >
              {/* Search */}
              <div className="p-4 sticky top-0 bg-white z-10">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search your files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 bg-white border border-input shadow-xs transition-colors ring-offset-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                  {searchTerm.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                    >
                      <Cross2Icon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* File List */}
              <div className="px-4 pb-4">
                <AnimatePresence>
                  {collections.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {collections.map((item: FileItem, index: number) => {
                        const isChecked =
                          stagedSelection !== null &&
                          stagedSelection.some((i) => i.id === item.id);
                        const iconData = getIconForFileType({
                          name: item?.name,
                          mime: item?.mime_type,
                        });
                        const IconComponent = (
                          iconData &&
                          Icons[iconData?.icon as keyof typeof Icons]
                            ? Icons[iconData?.icon as keyof typeof Icons]
                            : Icons?.File
                        ) as React.ElementType;

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card
                              className={cn(
                                "p-3 shadow-xs cursor-pointer transition-colors hover:bg-accent",
                                isChecked &&
                                  "border-primary/30 bg-primary/10 hover:bg-primary/10",
                              )}
                              onClick={() => toggleItem(item)}
                            >
                              <div className="flex items-start gap-2 w-full">
                                <IconComponent
                                  className={`${iconData ? iconData?.color : "text-gray-500"} h-5 w-5 mt-0.5`}
                                />
                                <div className="flex flex-col flex-1">
                                  <h4 className="text-sm font-medium leading-none mb-1 break-all text-left">
                                    {item.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Last updated {formatDate(item?.updated_at)}
                                  </p>
                                </div>
                                <Checkbox
                                  checked={isChecked}
                                  className="w-4 h-4 rounded border-gray-300 cursor-pointer pointer-events-none"
                                />
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : isLoading ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      <KnowledgeCollectionLoader />
                    </div>
                  ) : (
                    <div className="text-center text-lg py-4 text-muted-foreground">
                      No results found
                    </div>
                  )}
                </AnimatePresence>

                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <div
                    ref={loaderRef}
                    className="w-full h-10 flex items-center justify-center"
                  >
                    {isFetchingMore && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                        <span>Loading more collections...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
              <div className="flex items-center gap-2">
                {stagedCount > 0 ? (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground rounded-full h-8 border bg-background px-3">
                    <span>{stagedCount} selected</span>
                    <ConditionalTooltip
                      content="Clear selection"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                      className="text-xs"
                    >
                      <span
                        onClick={clearAll}
                        className="flex items-center justify-center h-5 w-5 rounded-full cursor-pointer hover:bg-red-50 transition-colors ml-0.5"
                      >
                        <Trash2 className="size-3.5 text-red-400 hover:text-red-500" />
                      </span>
                    </ConditionalTooltip>
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Select files to attach
                  </span>
                )}
              </div>
              <Button
                onClick={applySelection}
                disabled={stagedCount === 0}
                className="cursor-pointer gap-1.5"
                size="sm"
              >
                <Check className="h-4 w-4" />
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
