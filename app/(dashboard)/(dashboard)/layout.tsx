"use client";

import { clearFilters } from "@/redux/dashboard/dashboard-filter-data-slice";
import { AppDispatch } from "@/redux/store";
import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    return () => {
      dispatch(clearFilters());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}
