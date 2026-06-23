"use client";
import {
  convertToUnixTimestamp,
  errorMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useAppSelector } from "@/redux/store";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

export const useIssueOperation = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [searchText , setSearchText] = useState<string>("")
  const [debouncedSearch] = useDebounce(searchText, 300);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "resolved">("ACTIVE");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [issuesList, setIssuesList] = useState<any[]>([]);
  const [allTagsList, setAllTagsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const appliedFilters = useAppSelector(
    (state) => state.issuesFilters.appliedFilters
  );
  const queryParams = {
    pageSize: 20,
    sortBy: "updated_at",
    sortOrder: "desc",
  };

  const finalFilters = useMemo(() => {
    const filters: any = {
      status: activeTab,
    };

    if (appliedFilters?.tags && appliedFilters.tags.length > 0) {
      filters.tag_ids = appliedFilters.tags;
    }

    if (appliedFilters?.user && appliedFilters.user.length > 0) {
      filters.created_by = appliedFilters.user;
    }

    return filters;
  }, [activeTab, appliedFilters]);

  const getAllIssueList = async (pageToLoad = 1) => {
    if (isFetchingMore) return;

    pageToLoad === 1 ? setIsLoading(true) : setIsFetchingMore(true);

    const params = new URLSearchParams();

    params.append("page", pageToLoad.toString());
    params.append("page_size", queryParams.pageSize.toString());
    params.append("sort_by", queryParams.sortBy);
    params.append("sort_order", queryParams.sortOrder);

    params.append("filters", JSON.stringify(finalFilters));

    if (appliedFilters?.date_range) {
      const fromDate = convertToUnixTimestamp(
        appliedFilters.date_range.from,
        "start"
      );
      const toDate = convertToUnixTimestamp(
        appliedFilters.date_range.to,
        "end"
      );

      params.append("from_date", fromDate.toString());
      params.append("to_date", toDate.toString());
    }

    // search
    if (debouncedSearch?.trim()) {
      params.append("keyword", debouncedSearch);
    }

    const API_ENDPOINT_PATH = debouncedSearch
      ? `${url.ISSUES_SEARCH}?${params.toString()}`
      : `${url.ISSUES_LIST}?${params.toString()}`;

    try {
      const result = await axiosAuth.get(API_ENDPOINT_PATH);

      if (result.status === 200) {
        const newData = result.data || [];

        setIssuesList((prev) =>
          pageToLoad === 1 ? newData : [...prev, ...newData]
        );

        if (newData.length < queryParams.pageSize) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      errorMessageHandler("Failed to fetch issues");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    setIssuesList([]);
    setPage(1);
    setHasMore(true);
    getAllIssueList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, finalFilters, debouncedSearch]);

  const getAllTagList = async () => {
    if (loading) return;

    try {
      const result = await axiosAuth.get(url.TAGS_LIST);
      if (result.status === 200) {
        setAllTagsList(result.data);
      } else {
        throw new Error("Failed to fetch tags");
      }
    } catch (error) {
      errorMessageHandler("Failed to fetch tags");
    }
  };
  useEffect(() => {
    getAllTagList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const loadMoreIssues = () => {
    if (page === 1 && isLoading) return;

    if (!hasMore || isFetchingMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    getAllIssueList(nextPage);
  };

  const updateIssueInList = (issueId: string) => {
    setIssuesList((prev) => prev.filter((issue) => issue.id !== issueId));
  };

const refreshIssuesList = async () => {
  setIsFetchingMore(false); 
  setIsLoading(false);
  setIssuesList([]);
  setPage(1);
  setHasMore(true);

  await getAllIssueList(1);
};

  return {
    activeTab,
    setActiveTab,
    issuesList,
    isLoading,
    page,
    setPage,
    hasMore,
    isFetchingMore,
    setIsFetchingMore,
    allTagsList,
    loadMoreIssues,
    updateIssueInList,
    refreshIssuesList,
    searchText,
    setSearchText,
  };
};
