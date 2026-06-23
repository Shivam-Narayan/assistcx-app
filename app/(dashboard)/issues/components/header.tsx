"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X } from "lucide-react";
import { IssuesFilters } from "./issue-filter";

type TabType = "ACTIVE" | "resolved";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
}

export const Header = ({
  activeTab,
  setActiveTab,
  searchText,
  setSearchText,
}: HeaderProps) => {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className=" text-2xl xl:text-3xl font-semibold tracking-tight">
          Task Issues
        </h2>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
        >
          <TabsList className={`h-9 bg-primary/10 border border-primary/20 `}>
            <TabsTrigger
              value="ACTIVE"
              className="px-4 cursor-pointer transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="resolved"
              className="px-4 cursor-pointer transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Resolved
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="flex h-9 w-full items-center rounded-md border border-input bg-white pl-10 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchText("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <IssuesFilters />
      </div>
    </div>
  );
};
