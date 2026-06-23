"use client";

import { Button } from "@/components/ui/button";
import { handleSearchData } from "@/redux/common/search-data-slice";
import { AppDispatch } from "@/redux/store";
import { PlusCircleIcon, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";
import HeaderHoverCard from "../header";

interface CommonHeaderProps {
  title: string;
  infoMessage: string;
  searchPlaceholder?: string;
  buttonText?: string;
  onSearch?: (query: string) => void;
  onButtonClick?: () => void;
  handleAdd?: () => void;
  showSearch?: boolean;
  showAddButton?: boolean;
  tabsSlot?: ReactNode;
}

export const SettingCommonHeader = ({
  title,
  infoMessage,
  searchPlaceholder = "Search...",
  buttonText,
  onSearch,
  onButtonClick,
  handleAdd,
  showSearch = true,
  showAddButton = true,
  tabsSlot,
}: CommonHeaderProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [text, setText] = useState("");
  const [query] = useDebounce(text, 300);

  useEffect(() => {
    dispatch(handleSearchData(query || ""));
  }, [query, dispatch]);

  return (
    <div className="flex flex-wrap w-full gap-2 items-center justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <HeaderHoverCard title={title} message={infoMessage} type="page" />
        {tabsSlot && tabsSlot}
      </div>

      <div className="flex items-center gap-3 justify-between">
        {showSearch && (
          <>
            <div className="relative grow max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="flex h-9 w-full items-center rounded-md border border-input bg-white pl-10 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                placeholder={searchPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {text && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setText("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}

        {showAddButton && (
          <Button onClick={handleAdd} className="cursor-pointer">
            <PlusCircleIcon className="h-4 w-4" /> Add New
          </Button>
        )}
      </div>
    </div>
  );
};
