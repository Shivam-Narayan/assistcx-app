"use client";
import { Button } from "@/components/ui/button";
import { MultiSelectComboBox } from "@/components/custom-combobox/custom-multi-select-combobox";
import { Search, X } from "lucide-react";
import React from "react";
import { FilterOption } from "./hook/useToolsPage";
import Toolbar from "./toolbar";

interface toolsProps {
  searchText: string;
  handleSetSearch: (text: string) => void;
  filterOptions: FilterOption[];
  selectedFilters: string[];
  handleSetFilters: (filters: string[]) => void;
  isCreateAgentsTools: boolean;
}

const HeaderSidebar = ({
  searchText,
  handleSetSearch,
  filterOptions,
  selectedFilters,
  handleSetFilters,
  isCreateAgentsTools,
}: toolsProps) => {
  const handleResetSearch = () => {
    handleSetSearch("");
  };

  return (
    <React.Fragment>
      <div className="flex items-center justify-between">
        {/* 1. LEFT ITEM: Title */}
        <h2 className=" text-2xl xl:text-3xl font-semibold tracking-tight shrink-0">
          Agent Tools
        </h2>

        {/* 2. RIGHT ITEM: A group for Search Bar Filter and Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="flex h-9 w-full items-center rounded-md border border-input bg-white pl-10 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => handleSetSearch(e.target.value)}
            />
            {searchText && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSetSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="max-w-[300px]">
            <MultiSelectComboBox
              items={filterOptions}
              value={selectedFilters}
              onChange={handleSetFilters}
              placeholder="Filter tools"
              searchPlaceholder="Search tools"
              buttonClassName="w-44"
            />
          </div>
          <div>{isCreateAgentsTools && <Toolbar />}</div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default HeaderSidebar;
