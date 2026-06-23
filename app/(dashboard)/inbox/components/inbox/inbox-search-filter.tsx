"use client";
import FilterMultiSelectPanel from "@/components/filter-multi-select-panel";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getDateRange } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { cn } from "@/lib/utils";
import { setSearchText } from "@/redux/common/search-slice";
import {
  clearFilters,
  setFilters,
} from "@/redux/new-inbox/inbox-filters-slice";
import { RootState } from "@/redux/store";
import { InboxFilters } from "@/types/types";
import { format } from "date-fns";
import {
  Bot,
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Search,
  TagIcon,
  X,
} from "lucide-react";
import React, {
  ReactElement,
  SVGProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "use-debounce";

interface FilterGroupProps {
  title: string;
  icon: ReactElement<SVGProps<SVGSVGElement>>;
  options: string[]; // Assuming options are an array of strings
  filterType: string;
  addFilter: (filterType: string, value: string, remove?: boolean) => void;
  activeFilters: string[];
  setActiveFilters?: React.Dispatch<React.SetStateAction<string[]>>;
}

export const quickDateOptions = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
];

const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  icon,
  options,
  filterType,
  addFilter,
  activeFilters,
  setActiveFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const activeOptionsForGroup = activeFilters
    .filter((filter: string) => filter.startsWith(`${filterType}:`))
    .map((filter: string) =>
      filter.replace(`${filterType}:`, "").trim().toLowerCase(),
    );

  // Check if any filter of this type is active
  const hasActiveFilters = activeFilters.some((filter: string) =>
    filter.startsWith(`${filterType}:`),
  );

  const iconClassName =
    icon.props && typeof icon.props.className === "string"
      ? icon.props.className
      : "";

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Determine the currently selected quick date option for RadioGroup value
  let currentQuickDateValue = "";

  if (filterType === "Date") {
    const activeDateFilter = activeFilters.find((f) => f.startsWith("Date:"));
    if (activeDateFilter) {
      const activeValue = activeDateFilter.substring("Date: ".length).trim();
      if (quickDateOptions.includes(activeValue)) {
        currentQuickDateValue = activeValue;
      } else if (activeValue.includes("to")) {
        const [fromStr, toStr] = activeValue.split("to").map((s) => s.trim());
        quickDateOptions.forEach((option) => {
          const range = getDateRange(option);
          if (range && range.from === fromStr && range.to === toStr) {
            currentQuickDateValue = option;
          }
        });
      }
    }
  }

  const handleQuickDateSelect = (value: string) => {
    addFilter(filterType, value);
    const range = getDateRange(value);
    if (range) {
      setDateRange({
        from: parseDateLocal(range.from),
        to: parseDateLocal(range.to),
      });
    }
  };

  function parseDateLocal(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  useEffect(() => {
    if (filterType === "Date") {
      const activeDateFilter = activeFilters.find((f) => f.startsWith("Date:"));

      if (!activeDateFilter) {
        setDateRange(undefined);
        return;
      }

      const value = activeDateFilter.replace("Date:", "").trim();

      if (value.includes("to")) {
        const [fromStr, toStr] = value.split("to").map((s) => s.trim());

        const parsedFrom = parseDateLocal(fromStr);
        const parsedTo = parseDateLocal(toStr);

        if (!isNaN(parsedFrom.getTime()) && !isNaN(parsedTo.getTime())) {
          setDateRange({
            from: parsedFrom,
            to: parsedTo,
          });
        }
      } else {
        if (quickDateOptions.includes(value)) {
          const range = getDateRange(value);

          if (range) {
            setDateRange({
              from: parseDateLocal(range.from),
              to: parseDateLocal(range.to),
            });
          }
        }
      }
    }
  }, [activeFilters, filterType]);

  useEffect(() => {
    if (filterType !== "Date") return;

    if (!dateRange?.from && !dateRange?.to) {
      const existingDateFilter = activeFilters.find((f) =>
        f.startsWith("Date:"),
      );
      if (existingDateFilter) addFilter("Date", "", true);
      return;
    }

    if (dateRange?.from && dateRange?.to) {
      const fromDateStr = format(dateRange.from, "yyyy-MM-dd");
      const toDateStr = format(dateRange.to, "yyyy-MM-dd");

      const formattedRange = `${fromDateStr} to ${toDateStr}`;

      const existingDateFilter = activeFilters.find((f) =>
        f.startsWith("Date:"),
      );

      if (!existingDateFilter || !existingDateFilter.includes(formattedRange)) {
        addFilter("Date", formattedRange);
      }
    }
  }, [dateRange]);

  return (
    <div className="pb-4 mb-4 border-b border-gray-200 dark:border-slate-700 last:border-b-0 last:mb-0 last:pb-0">
      {/* Group header with expand/collapse */}
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
              {
                activeFilters.filter((filter: string) =>
                  filter.startsWith(`${filterType}:`),
                ).length
              }
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500 dark:text-slate-400" />
        )}
      </button>

      {/* Group content - only show if expanded */}
      {isExpanded && (
        <div className="mt-3">
          {/* Filter options */}
          {filterType === "Date" ? (
            <div className="space-y-3 ">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />

                    {dateRange?.from ? (
                      dateRange?.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span className="text-muted-foreground">
                        Pick a date range
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                    }}
                    numberOfMonths={2}
                    disabled={{
                      after: new Date(),
                    }}
                  />
                </PopoverContent>
              </Popover>
              <div className="my-3 space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">
                  Quick select:
                </p>
                <RadioGroup
                  value={currentQuickDateValue}
                  onValueChange={handleQuickDateSelect}
                  className="grid grid-cols-2 gap-2 "
                >
                  {["Today", "Yesterday", "Last 7 days", "Last 30 days"].map(
                    (option) => {
                      const itemId = `${filterType}-quick-${option}`.replace(
                        /\s+/g,
                        "-",
                      );
                      return (
                        <div
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option}
                            id={itemId}
                            className="border-muted-foreground cursor-pointer"
                          />
                          <Label
                            htmlFor={itemId}
                            className="text-sm font-medium text-muted-foreground cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      );
                    },
                  )}
                </RadioGroup>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 mt-2 pl-2">
              {options.map((option: string) => {
                const isChecked = activeOptionsForGroup.includes(
                  option.toLowerCase(),
                );

                return (
                  <div
                    key={option}
                    className="flex items-center space-x-2 py-1"
                  >
                    <Checkbox
                      id={`${filterType}-${option}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        addFilter(filterType, option, !checked);
                      }}
                      className="mr-2 border-muted-foreground cursor-pointer"
                    />
                    <Label
                      htmlFor={`${filterType}-${option}`}
                      className="text-sm font-medium text-muted-foreground cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function InboxSearchFilter({ setChecklist }: any) {
  const dispatch = useDispatch();
  const { axiosAuth, loading } = useAxiosAuth();
  const [tagsList, setTagsList] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState<boolean>(false);
  const [agentFilterLoading, setAgentFilterLoading] = useState<boolean>(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy] = useState("created_at");
  const [sortOrder] = useState("desc");

  //tags
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // --- search State ---
  const [tagsSearch, setTagsSearch] = useState("");
  const [debouncedTagsSearch] = useDebounce(tagsSearch, 300);

  // Convert status names to API format
  const statusMap: { [key: string]: string } = {
    Executing: "EXECUTING",
    Successful: "SUCCESSFUL",
    Incomplete: "INCOMPLETE",
    Failed: "FAILED",
    Archived: "ARCHIVED",
    Queued: "QUEUED",
    Paused: "PAUSED",
    Resolved: "RESOLVED",
  };

  const getAgentFilterList = async () => {
    if (!loading) {
      setAgentFilterLoading(true);
      try {
        const response = await axiosAuth.get(url.LIST_AGENTS_PERVIEW);
        if (response.status === 200) {
          setAgents(response.data.agent_previews);
        }
      } catch (err: any) {
        console.error("Failed to fetch tags", err);
      } finally {
        setAgentFilterLoading(false);
      }
    }
  };

  const getTagsList = async (keyword?: string) => {
    if (!loading) {
      setLoadingTags(true);

      let API_ENDPOINT_PATH: string = "";
      if (keyword) {
        API_ENDPOINT_PATH = `${url.SEARCH_TAGS}?keyword=${keyword}&page=${page}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`;
      } else {
        API_ENDPOINT_PATH = `${url.TAGS_LIST}?page=${page}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`;
      }
      try {
        const response = await axiosAuth.get(API_ENDPOINT_PATH);
        if (response.status === 200) {
          const newData = response.data || [];
          setTagsList((prev) => {
            const merged = page === 1 ? newData : [...prev, ...newData];
            const unique = merged.filter(
              (item: any, index: any, self: any) =>
                index === self.findIndex((t: any) => t.id === item.id),
            );

            return unique;
          });

          if (newData.length < pageSize) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch tags", err);
      } finally {
        setLoadingTags(false);
        setIsFetchingMore(false);
      }
    }
  };

  useEffect(() => {
    if (debouncedTagsSearch.trim() !== "") {
      getTagsList(debouncedTagsSearch.trim());
    } else {
      getTagsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTagsSearch]);

  useEffect(() => {
    if (page === 1) return;
    if (page > 1) {
      getTagsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setTagsSearch("");
    getAgentFilterList();
    getTagsList();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFilters]);

  // Redux state
  const reduxSearchText = useSelector(
    (state: RootState) => state.searchReducer?.searchText ?? "",
  );
  const reduxFilters = useSelector(
    (state: RootState) => state.inboxFiltersReducer.filters,
  );

  // Initialize local state from Redux
  const [searchTerm, setSearchTerm] = useState<string>(() => reduxSearchText);

  // Keep local input in sync if Redux changes
  useEffect(() => {
    if (reduxSearchText !== searchTerm) {
      setSearchTerm(reduxSearchText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxSearchText]);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // Skip first dispatch after mount so we don't push an empty value to Redux
  const didHydrate = useRef(false);
  useEffect(() => {
    if (!didHydrate.current) {
      didHydrate.current = true;
      return;
    }
    if (debouncedSearchTerm !== reduxSearchText) {
      dispatch(setSearchText(debouncedSearchTerm));
    }
  }, [debouncedSearchTerm, reduxSearchText, dispatch]);

  const addFilter = (
    filterType: string,
    value: string,
    remove: boolean = false,
  ) => {
    const filterString =
      filterType === "Status"
        ? `${filterType}: ${value.toUpperCase()}`
        : `${filterType}: ${value}`;
    let nextFilters: string[];

    if (remove) {
      nextFilters = activeFilters.filter((f) => f !== filterString);
    } else {
      if (filterType === "Date") {
        nextFilters = [
          ...activeFilters.filter((f) => !f.startsWith("Date:")),
          filterString,
        ];
      } else {
        nextFilters = activeFilters.includes(filterString)
          ? activeFilters.filter((f) => f !== filterString)
          : [...activeFilters, filterString];
      }
    }

    setActiveFilters(nextFilters);

    // Build Redux filter payload from nextFilters
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    dispatch(clearFilters());
    setShowFilters(false);
  };

  const presetDateLabels = useMemo(
    () => ["Today", "Yesterday", "Last 7 days", "Last 30 days"],
    [],
  );

  const hasActiveFilters = activeFilters.some((filter) => {
    if (filter.startsWith("Date:")) {
      const value = filter.replace("Date:", "").trim();
      return value.includes("to") || presetDateLabels.includes(value);
    }
    return true;
  });

  const agentsItems = agents.map((ag: any) => ({
    value: ag.name,
    label: ag.name,
  }));
  const tagItems = tagsList.map((tag) => ({
    value: tag.name,
    label: tag.name,
    color: tag.color,
  }));

  useEffect(() => {
    if (!tagItems.length || !activeFilters.length) return;

    let updatedActiveFilters = [...activeFilters];
    let updatedReduxFilters = { ...reduxFilters };

    activeFilters.forEach((filter) => {
      if (filter.startsWith("Tags:")) {
        const value = filter.replace("Tags:", "").trim();
        const existsInItems = tagItems.some((tag) => tag.value === value);
        if (!existsInItems) {
          updatedActiveFilters = updatedActiveFilters.filter(
            (f) => f !== filter,
          );

          if (updatedReduxFilters.tags) {
            updatedReduxFilters.tags = updatedReduxFilters.tags.filter(
              (t) => t !== value,
            );
          }
        }
      }
    });

    if (updatedActiveFilters.length !== activeFilters.length) {
      setActiveFilters(updatedActiveFilters);
      dispatch(setFilters(updatedReduxFilters));
    }
  }, [tagItems, activeFilters, reduxFilters, dispatch]);

  const onApplyFilters = () => {
    const formattedFilters: any = {};

    // Status
    const statusFilters = activeFilters
      .filter((f) => f.startsWith("Status:"))
      .map((f) => statusMap[f.split(": ")[1]] || f.split(": ")[1]);
    if (statusFilters.length > 0) {
      formattedFilters.status = statusFilters;
    }

    // Agent
    const agentFilters = activeFilters
      .filter((f) => f.startsWith("Agent:"))
      .map((f) => f.split(": ")[1]);
    if (agentFilters.length > 0) {
      formattedFilters.agent = agentFilters;
    }
    // Tags
    const tagsFilters = activeFilters
      .filter((f) => f.startsWith("Tags:"))
      .map((f) => f.split(": ")[1]);
    if (tagsFilters.length > 0) {
      formattedFilters.tags = tagsFilters;
    }

    // Date
    const dateFilter = activeFilters.find((f) => f.startsWith("Date:"));
    if (dateFilter) {
      const dateValue = dateFilter.split(": ")[1];
      if (dateValue.includes(" to ")) {
        const [from, to] = dateValue.split(" to ");
        formattedFilters.date_range = { from, to };
      } else {
        formattedFilters.date_range = getDateRange(dateValue);
      }
    }
    dispatch(setFilters(formattedFilters));
    setShowFilters(false);
    toast.success("Filters applied successfully");
    setChecklist([]);
  };

  const getActiveReduxFilterCount = (reduxFilters: InboxFilters): number => {
    let count = 0;
    // Count string array filters
    if (reduxFilters.status?.length) count += reduxFilters.status.length;
    if (reduxFilters.agent?.length) count += reduxFilters.agent.length;
    if (reduxFilters.tags?.length) count += reduxFilters.tags.length;
    // Count date_range as 1 if both dates exist
    if (reduxFilters.date_range?.from && reduxFilters.date_range?.to) {
      count += 1;
    }

    return count;
  };
  useEffect(() => {
    if (showFilters) {
      const newActiveFilters: string[] = [];

      // Populate Agent filters
      if (reduxFilters.agent?.length) {
        reduxFilters.agent.forEach((a: string) => {
          newActiveFilters.push(`Agent: ${a}`);
        });
      }

      // Populate Date filter
      if (reduxFilters.date_range) {
        const { from, to } = reduxFilters.date_range;
        const matchedQuickDate = quickDateOptions.find((q) => {
          const range = getDateRange(q);
          return range && range.from === from && range.to === to;
        });

        if (matchedQuickDate) {
          newActiveFilters.push(`Date: ${matchedQuickDate}`);
        } else {
          newActiveFilters.push(`Date: ${from} to ${to}`);
        }
      }

      // Optional: populate other filters (status, tags)
      if (reduxFilters.status?.length) {
        reduxFilters.status.forEach((s) =>
          newActiveFilters.push(`Status: ${s}`),
        );
      }

      if (reduxFilters.tags?.length) {
        // reduxFilters.tags.forEach((t) => newActiveFilters.push(`Tag: ${t}`));
        if (reduxFilters.tags)
          reduxFilters.tags.forEach((a: string) =>
            newActiveFilters.push(`Tags: ${a}`),
          );
      }
      setActiveFilters(newActiveFilters);
    }
  }, [showFilters, reduxFilters]);

  const hasFilters =
    hasActiveFilters || getActiveReduxFilterCount(reduxFilters) > 0;

  return (
    <div className="flex items-center bg-white dark:bg-slate-900">
      {/* Search input */}
      <div className="relative grow max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="flex h-9 w-full items-center rounded-md border border-input bg-white pl-10 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters popover */}
      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-label="Toggle Filters"
            className={cn(
              `ml-3 px-3 py-1.5 flex items-center rounded-lg border cursor-pointer`,
              getActiveReduxFilterCount(reduxFilters) > 0
                ? "bg-primary/10 text-primary border-primary/30"
                : "border-muted-foreground/40",
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveReduxFilterCount(reduxFilters) > 0 && (
              <span
                className={cn(
                  "rounded-full w-5 h-5 flex items-center justify-center text-xs bg-primary/80 text-primary-foreground",
                )}
              >
                {getActiveReduxFilterCount(reduxFilters)}
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
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest('[data-datepicker-popover-content="true"]') ||
              target.closest("#date-picker-from-trigger") ||
              target.closest("#date-picker-to-trigger")
            ) {
              e.preventDefault();
            }
          }}
        >
          <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600 flex justify-between items-center">
            <h3 className="font-medium text-gray-700 dark:text-slate-200">
              {hasActiveFilters
                ? `Filters (${activeFilters.length})`
                : "Filters"}
            </h3>
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="text-sm cursor-pointer hover:bg-muted px-2 h-8"
                onClick={clearAllFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <FilterMultiSelectPanel
              maxRows={2}
              title="Agents"
              icon={<Bot />}
              items={agentsItems}
              filterType="Agent"
              activeFilters={activeFilters}
              addFilter={addFilter}
              setActiveFilters={setActiveFilters}
              placeholder="Select Agent..."
              searchPlaceholder="Search..."
              loading={agentFilterLoading}
            />

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
              title="Status"
              icon={<CheckCircle2 />}
              items={Object.entries(statusMap).map(([label, value]) => ({
                value,
                label,
              }))}
              filterType="Status"
              activeFilters={activeFilters}
              addFilter={addFilter}
              setActiveFilters={setActiveFilters}
              placeholder="Select Status..."
              searchPlaceholder="Search..."
              loading={agentFilterLoading}
            />

            <FilterGroup
              title="Date Range"
              icon={<Clock />}
              options={[]} // Date options are handled differently
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
    </div>
  );
}
