"use client";

import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

type ConnectionsHeaderProps = {
  searchText: string;
  onSearchChange: (value: string) => void;
};

export default function ConnectionsHeader({
  searchText,
  onSearchChange,
}: ConnectionsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight text-foreground">
          Connections
        </h2>
      </div>
      <div className="flex items-center gap-3 justify-between">
        <div className="relative grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="flex h-9 w-full items-center rounded-md border border-input bg-white pl-10 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchText && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
