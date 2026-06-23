"use client";
import FilterMultiSelectPanel from "@/components/filter-multi-select-panel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, Clock, Filter, TagIcon, User } from "lucide-react";
import { useMemo } from "react";
import { FilterGroup } from "../../(dashboard)/component/filter-group";
import { useIssuesFilters } from "../hook/useIssueFilter";

export function IssuesFilters() {
  const {
    showFilters,
    setShowFilters,
    activeFilters,
    setActiveFilters,
    addFilter,
    clearAll,
    onApplyFilters,
    appliedFilters,
    tagsList,
    loadingTags,
    tagsSearch,
    setTagsSearch,
    page,
    setPage,
    hasMore,
    isFetchingMore,
    setIsFetchingMore,
    usersList,
    loadingUsersList,
    userPage,
    setuserPage,
    userHasMore,
    setuserHasMore,
    isUserFetchingMore,
    setIsUserFetchingMore,
    usersSearch,
    setUsersSearch,
  } = useIssuesFilters();

  const tagItems = tagsList.map((tag) => ({
    value: tag.id,
    label: tag.name,
    color: tag.color,
  }));

  const usersListItems = usersList.map((user) => ({
    value: user.user_id,
    label: user.user_name,
  }));
  const appliedCount = useMemo(() => {
    let count = 0;

    if (appliedFilters.date_range) count += 1;

    if (appliedFilters.tags && appliedFilters.tags.length > 0) {
      count += appliedFilters.tags.length;
    }
    if (appliedFilters.user && appliedFilters.user.length > 0) {
      count += appliedFilters.user.length;
    }

    return count;
  }, [appliedFilters]);

  const hasAppliedFilters =
    (appliedFilters.date_range &&
      Object.keys(appliedFilters.date_range).length > 0) ||
    (appliedFilters.tags && appliedFilters.tags.length > 0) ||
    (appliedFilters.user && appliedFilters.user.length > 0);

  const handlePopoverInteractOutside = (e: any) => {
    const target = e.target as HTMLElement;

    const isDatePopover =
      target.closest('[data-datepicker-popover-content="true"]') ||
      target.closest("#date-picker-from-trigger") ||
      target.closest("#date-picker-to-trigger");

    if (isDatePopover) {
      e.preventDefault();
    }
  };

  const hasFilters = useMemo(() => {
    const hasActiveFilters =
      Array.isArray(activeFilters) && activeFilters.length > 0;

    const hasApplied =
      !!appliedFilters.date_range ||
      (appliedFilters.tags?.length ?? 0) > 0 ||
      (appliedFilters.user?.length ?? 0) > 0;

    return hasActiveFilters || hasApplied;
  }, [activeFilters, appliedFilters]);

  return (
    <Popover open={showFilters} onOpenChange={setShowFilters}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="Toggle Filters"
          className={cn(
            `cursor-pointer px-3 py-1.5 flex items-center rounded-lg border `,
            hasAppliedFilters
              ? "bg-primary/10 text-primary border-primary/30"
              : "border-muted-foreground/40",
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasAppliedFilters && (
            <span className="ml-2 bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {appliedCount}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transform transition-transform duration-150 ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl z-20 border border-gray-200 dark:border-slate-700 overflow-hidden p-0"
        align="end"
        onInteractOutside={handlePopoverInteractOutside}
      >
        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600 flex justify-between items-center">
          <h3 className="font-medium text-gray-700 dark:text-slate-200">
            {hasAppliedFilters
              ? `Filters (${activeFilters.length})`
              : "Filters"}
          </h3>
          {hasAppliedFilters && (
            <Button
              variant="outline"
              className="text-sm cursor-pointer hover:bg-muted px-2 h-8"
              onClick={clearAll}
            >
              Clear Filters
            </Button>
          )}
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <FilterMultiSelectPanel
            maxRows={2}
            title="Tags"
            icon={<TagIcon />}
            items={tagItems}
            filterType="Tags"
            activeFilters={activeFilters}
            addFilter={addFilter}
            setActiveFilters={setActiveFilters}
            placeholder="Select Tags..."
            searchPlaceholder="Search..."
            localSearch={tagsSearch}
            setLocalSearch={setTagsSearch}
            loading={loadingTags}
            setPage={setPage}
            page={page}
            hasMore={hasMore}
            isFetchingMore={isFetchingMore}
            setIsFetchingMore={setIsFetchingMore}
          />

          <FilterMultiSelectPanel
            maxRows={2}
            title="User"
            icon={<User />}
            items={usersListItems}
            filterType="User"
            activeFilters={activeFilters}
            addFilter={addFilter}
            setActiveFilters={setActiveFilters}
            placeholder="Select Users..."
            searchPlaceholder="Search..."
            localSearch={usersSearch}
            setLocalSearch={setUsersSearch}
            loading={loadingUsersList}
            setPage={setuserPage}
            page={userPage}
            hasMore={userHasMore}
            isFetchingMore={isUserFetchingMore}
            setIsFetchingMore={setIsUserFetchingMore}
          />
          <FilterGroup
            title="Date Range"
            icon={<Clock />}
            options={[]}
            filterType="Date"
            addFilter={addFilter}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <Button
            className="w-full cursor-pointer"
            onClick={onApplyFilters}
            disabled={!hasFilters}
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
