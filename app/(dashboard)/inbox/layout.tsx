"use client";
import { resetSearchState } from "@/redux/common/search-slice";
import { resetEmailState } from "@/redux/new-inbox/inbox-email-slice";
import { clearFilters } from "@/redux/new-inbox/inbox-filters-slice";
import { AppDispatch } from "@/redux/store";
import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";

export default function NewInboxLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    return () => {
      dispatch(resetSearchState());
      dispatch(clearFilters());
      dispatch(resetEmailState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}
