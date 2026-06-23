"use client";
import FilterMultiSelectPanel from "@/components/filter-multi-select-panel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDateRange } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { cn } from "@/lib/utils";
import {
  clearFilters,
  setFilters,
} from "@/redux/dashboard/dashboard-filter-data-slice";
import { RootState } from "@/redux/store";
import { DashboardFilters } from "@/types/types";
import { Bot, ChevronDown, Clock, Filter } from "lucide-react";
import React, {
  ReactElement,
  SVGProps,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { FilterGroup } from "./component/filter-group";

export interface FilterGroupProps {
  title: string;
  icon: ReactElement<SVGProps<SVGSVGElement>>;
  options: string[];
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

const DEFAULT_DATE_FILTER = "";
export function DashboardFilter() {
  const dispatch = useDispatch();
  const { axiosAuth, loading } = useAxiosAuth();
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([
    `Date: ${DEFAULT_DATE_FILTER}`,
  ]);
  const [agents, setAgents] = useState<string[]>([]);
  const [agentFilterLoading, setAgentFilterLoading] = useState<boolean>(false);

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

  useEffect(() => {
    getAgentFilterList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFilters]);

  useEffect(() => {
    const dateRange = getDateRange(DEFAULT_DATE_FILTER);
    dispatch(
      setFilters({ date_range: dateRange === null ? undefined : dateRange }),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reduxFilters = useSelector(
    (state: RootState) => state.dashboardFilterReducer.filters,
  );

  useEffect(() => {
    if (showFilters) {
      const newActiveFilters: string[] = [];
      // Populate Agent filters
      if (reduxFilters.agent_id?.length) {
        reduxFilters.agent_id.forEach((a: string) => {
          newActiveFilters.push(`Agent: ${a}`);
        });
      }
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
      setActiveFilters(newActiveFilters);
    }
  }, [showFilters, reduxFilters]);

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
  };

  const onApplyFilters = () => {
    const formattedFilters: any = {};
    const agentFilters = activeFilters
      .filter((f) => f.startsWith("Agent:"))
      .map((f) => f.split(": ")[1]);
    if (agentFilters.length > 0) {
      formattedFilters.agent_id = agentFilters;
    }
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
  };
  const clearAllFilters = () => {
    dispatch(clearFilters());
    setActiveFilters([`Date: ${DEFAULT_DATE_FILTER}`]);
    dispatch(
      setFilters({
        date_range: getDateRange(DEFAULT_DATE_FILTER) || undefined,
      }),
    );
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

  const getActiveReduxFilterCount = (reduxFilters: DashboardFilters) => {
    let count = 0;
    // Count agent_id selections
    if (reduxFilters.agent_id?.length) {
      count += reduxFilters.agent_id.length;
    }
    // Count date_range as 1 if active
    if (reduxFilters.date_range?.from && reduxFilters.date_range?.to) {
      count += 1;
    }
    return count;
  };

  const agentsItems = agents.map((ag: any) => ({
    value: ag.id,
    label: ag.name,
  }));

  const hasFilters =
    hasActiveFilters ||
    (reduxFilters?.agent_id?.length ?? 0) > 0 ||
    Boolean(reduxFilters?.date_range?.from && reduxFilters?.date_range?.to);

  return (
    <Popover open={showFilters} onOpenChange={setShowFilters}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="Toggle Filters"
          className={cn(
            `cursor-pointer px-3 py-1.5 flex items-center rounded-lg border `,
            hasActiveFilters
              ? "bg-primary/10 text-primary border-primary/30"
              : "border-muted-foreground/40",
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {reduxFilters && getActiveReduxFilterCount(reduxFilters) > 0 && (
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
            {hasActiveFilters ? `Filters (${activeFilters.length})` : "Filters"}
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
  );
}
