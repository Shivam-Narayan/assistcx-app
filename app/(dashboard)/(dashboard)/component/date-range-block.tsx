"use client";
import { formatDateRange } from "@/helper/helper-function";
import { RootState, useAppSelector } from "@/redux/store";
import React, { useEffect } from "react";

export const DateRangeBlock = () => {
  const [dateRange, setDateRange] = React.useState<string | undefined>(
    undefined
  );
  const reduxFilters = useAppSelector(
    (state: RootState) => state.dashboardFilterReducer.filters
  );

  useEffect(() => {
    if (reduxFilters.date_range?.from && reduxFilters.date_range?.to) {
      const formatted = formatDateRange(
        reduxFilters.date_range.from,
        reduxFilters.date_range.to
      );
      setDateRange(formatted);
    } else {
      const from = new Date();
      from.setDate(from.getDate() - 29);
      const to = new Date();
      const formatted = formatDateRange(
        from.toISOString().split("T")[0],
        to.toISOString().split("T")[0]
      );
      setDateRange(formatted);
    }
  }, [reduxFilters.date_range]);
  return (
    <div
      className={`hidden sm:inline-flex px-3 py-1.5 flex items-center rounded-lg border text-sm h-9 font-medium bg-primary/10 text-primary border-primary/30 `}
    >
      {dateRange}
    </div>
  );
};
