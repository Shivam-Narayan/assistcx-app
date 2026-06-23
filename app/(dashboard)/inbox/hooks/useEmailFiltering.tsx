import { useMemo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { debounce } from "lodash";
import { RootState } from "@/redux/store";
import { IEmailData } from "@/types/types";

interface FilterCriteria {
  status?: string[];
  mailbox?: string[];
  agent?: string[];
  date_range?: {
    from?: string;
    to?: string;
  };
}

export const useEmailFiltering = (
  emails: IEmailData[],
  isSearchData: boolean = false
): IEmailData[] => {
  const filters = useSelector(
    (state: RootState) => state.inboxFiltersReducer.filters
  );
  const searchText = useSelector(
    (state: RootState) => state?.searchReducer?.searchText
  );

  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearchText(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchText);
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [searchText, debouncedSetSearch]);

  return useMemo(() => {
    if (!emails?.length) {
      return [];
    }

    const hasActiveFilters = hasFiltersApplied(filters);
    const hasSearch = Boolean(debouncedSearchText?.trim());

    if (!hasActiveFilters && !hasSearch) {
      return [...emails].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // const filteredEmails = emails.filter((email) => {
    //   const statusMatch = checkStatusFilter(email, filters);
    //   const mailboxMatch = checkMailboxFilter(email, filters);
    //   const dateMatch = checkDateFilter(email, filters);

    //   return statusMatch && mailboxMatch && dateMatch;
    // });

    return emails;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails, filters, debouncedSearchText, isSearchData]);
};

const hasFiltersApplied = (filters: FilterCriteria): boolean => {
  return Boolean(
    filters?.status?.length ||
      filters?.mailbox?.length ||
      filters?.agent?.length ||
      (filters?.date_range?.from && filters?.date_range?.to)
  );
};

const checkStatusFilter = (
  email: IEmailData,
  filters: FilterCriteria
): boolean => {
  if (!filters?.status?.length) return true;
  return filters.status.includes(email.status);
};

const checkMailboxFilter = (
  email: IEmailData,
  filters: FilterCriteria
): boolean => {
  if (!filters?.mailbox?.length) return true;
  return filters.mailbox.includes(email.mailbox_email);
};

const checkDateFilter = (
  email: IEmailData,
  filters: FilterCriteria
): boolean => {
  if (!filters?.date_range?.from || !filters?.date_range?.to) return true;

  try {
    const emailDate = new Date(email.created_at);
    if (isNaN(emailDate.getTime())) return true;

    // Parse fromDate as UTC start of day
    const fromParts = filters.date_range.from.split("-").map(Number);
    const fromDate = new Date(
      Date.UTC(fromParts[0], fromParts[1] - 1, fromParts[2], 0, 0, 0, 0)
    );

    // Parse toDate as UTC end of day
    const toParts = filters.date_range.to.split("-").map(Number);
    const toDate = new Date(
      Date.UTC(toParts[0], toParts[1] - 1, toParts[2], 23, 59, 59, 999)
    );

    return emailDate >= fromDate && emailDate <= toDate;
  } catch (error) {
    console.warn("Error in date filtering:", error);
    return true;
  }
};
