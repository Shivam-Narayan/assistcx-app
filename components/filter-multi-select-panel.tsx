"use client";
import { cn } from "@/lib/utils";
import React, { ReactElement, SVGProps } from "react";
import { DynamicMultiSelectCombobox } from "./dynamic-multi-select-combobox";

interface FilterHeaderProps {
  maxRows?: number;
  title: string;
  icon: ReactElement<SVGProps<SVGSVGElement>>;
  items: { value: string; label: string; color?: string }[];
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
  filterType: string;
  addFilter: (filterType: string, value: string, remove?: boolean) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  localSearch?: string;
  setLocalSearch?: (value: string) => void;
  loading?: boolean;
  setPage?: any;
  page?: any;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  setIsFetchingMore?: any;
}

const FilterMultiSelectPanel = ({
  title,
  icon,
  items,
  activeFilters,
  addFilter,
  filterType,
  localSearch,
  setLocalSearch,
  loading,
  setPage,
  page,
  hasMore,
  isFetchingMore,
  setIsFetchingMore,
  maxRows = 3,
}: FilterHeaderProps) => {
  const iconClassName =
    icon.props && typeof icon.props.className === "string"
      ? icon.props.className
      : "";

  const activeValues = activeFilters
    .filter((filter: string) => filter.startsWith(`${filterType}:`))
    .map((filter: string) => filter.replace(`${filterType}:`, "").trim());

  const hasActiveFilters = activeFilters.some((filter: string) =>
    filter.startsWith(`${filterType}:`),
  );

  return (
    <div className="pb-4 mb-4 border-b border-gray-200 dark:border-slate-700 last:border-b-0 last:mb-0 last:pb-0">
      <button className="w-full flex items-center justify-between text-left">
        <div className="flex items-center">
          {React.cloneElement(icon, {
            className: `${iconClassName} h-5 w-5 text-gray-500 dark:text-slate-400`,
          })}
          <span className="ml-2 font-medium text-gray-800 dark:text-slate-200">
            {title}
          </span>
          {hasActiveFilters && (
            <span
              className={cn(
                "ml-2 rounded-full w-5 h-5 flex items-center justify-center text-xs bg-primary/80 text-primary-foreground",
              )}
            >
              {activeValues.length}
            </span>
          )}
        </div>
      </button>

      <div className="mt-2">
        <DynamicMultiSelectCombobox
          maxRows={maxRows}
          items={items}
          value={activeValues}
          onChange={(selected: string[]) => {
            selected.forEach((s) => addFilter(filterType, s));
          }}
          placeholder="Select..."
          searchPlaceholder="Search..."
          buttonClassName="w-full"
          addFilter={addFilter}
          filterType={filterType}
          localSearch={localSearch}
          setLocalSearch={setLocalSearch}
          loading={loading}
          setPage={setPage}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
          setIsFetchingMore={setIsFetchingMore}
        />
      </div>
    </div>
  );
};

export default FilterMultiSelectPanel;
