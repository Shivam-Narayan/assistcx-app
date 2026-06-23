"use client";

import { SheetHeader, SheetTitle } from "@/components/ui/assistant-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Search, X } from "lucide-react";
import { KnowledgeDetailHeaderProps } from "./types";

export function KnowledgeDetailHeader({
  name,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onClose,
}: KnowledgeDetailHeaderProps) {
  return (
    <SheetHeader className="border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white sticky top-0 z-10">
      <div className="w-full sm:w-auto md:flex gap-6">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <SheetTitle className="text-xl font-semibold break-all line-clamp-1">
            {name}
          </SheetTitle>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer h-8 w-8 sm:hidden"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative mt-0 sm:mt-0 w-full sm:w-auto min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={onSearchChange}
            className="pl-10 pr-10 bg-white border border-input shadow-xs transition-colors ring-offset-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <Cross2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer h-9 w-9 hidden sm:flex"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </SheetHeader>
  );
}
