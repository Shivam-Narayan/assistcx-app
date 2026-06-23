"use client";

import { errorMessageHandler, getDateRange } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  clearAppliedFilters,
  setAppliedFilters,
} from "@/redux/issues/issues-filters-slice";
import { useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

export function useIssuesFilters() {
  const dispatch = useDispatch();
  const { axiosAuth, loading } = useAxiosAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [tagsList, setTagsList] = useState<any[]>([]);
  const [tagsSearch, setTagsSearch] = useState("");
  const [debouncedTagsSearch] = useDebounce(tagsSearch, 300);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsersList, setLoadingUsersList] = useState<boolean>(false);

  const [userPage, setuserPage] = useState(1);
  const [userHasMore, setuserHasMore] = useState(true);
  const [isUserFetchingMore, setIsUserFetchingMore] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");
  const [debouncedUsersSearch] = useDebounce(usersSearch, 300);

  const queryParams = {
    pageSize: 10,
    sortBy: "created_at",
    sortOrder: "desc",
  };

  const appliedFilters = useAppSelector(
    (state) => state.issuesFilters.appliedFilters
  );

  const getTagsList = async (keyword?: string) => {
    if (!loading) {
      setLoadingTags(true);

      let API_ENDPOINT_PATH: string = "";
      if (keyword) {
        API_ENDPOINT_PATH = `${url.SEARCH_TAGS}?keyword=${keyword}&page=${page}&page_size=${queryParams.pageSize}&sort_by=${queryParams.sortBy}&sort_order=${queryParams.sortOrder}`;
      } else {
        API_ENDPOINT_PATH = `${url.TAGS_LIST}?page=${page}&page_size=${queryParams.pageSize}&sort_by=${queryParams.sortBy}&sort_order=${queryParams.sortOrder}`;
      }
      try {
        const response = await axiosAuth.get(API_ENDPOINT_PATH);
        if (response.status === 200) {
          const newData = response.data || [];
          setTagsList((prev) => {
            const merged = page === 1 ? newData : [...prev, ...newData];
            const unique = merged.filter(
              (item: any, index: any, self: any) =>
                index === self.findIndex((t: any) => t.id === item.id)
            );

            return unique;
          });

          if (newData.length < queryParams.pageSize) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }
      } catch (err: any) {
        errorMessageHandler(
          err.response?.data?.detail || "Failed to fetch tags"
        );
      } finally {
        setLoadingTags(false);
        setIsFetchingMore(false);
      }
    }
  };

  const getUsersList = async (keyword?: string) => {
    if (!loading) {
      setLoadingUsersList(true);

      let API_ENDPOINT_PATH: string = "";
      if (keyword) {
        API_ENDPOINT_PATH = `${url.USERS_SEARCH}?keyword=${keyword}&page=${userPage}&page_size=${queryParams.pageSize}&sort_by=issue_count&sort_order=${queryParams.sortOrder}`;
      } else {
        API_ENDPOINT_PATH = `${url.USERS_LIST}?page=${userPage}&page_size=${queryParams.pageSize}&sort_by=issue_count &sort_order=${queryParams.sortOrder}`;
      }
      try {
        const response = await axiosAuth.get(API_ENDPOINT_PATH);
        if (response.status === 200) {
          const newData = response.data.users || [];

          setUsersList((prev) => {
            const merged = userPage === 1 ? newData : [...prev, ...newData];
            const unique = merged.filter(
              (item: any, index: any, self: any) =>
                index === self.findIndex((t: any) => t.user_id === item.user_id)
            );
            return unique;
          });

          if (newData.length < queryParams.pageSize) {
            setuserHasMore(false);
          } else {
            setuserHasMore(true);
          }
        }
      } catch (err: any) {
        errorMessageHandler(
          err.response?.data?.detail || "Failed to fetch users"
        );
      } finally {
        setLoadingUsersList(false);
        setIsUserFetchingMore(false);
      }
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    getTagsList(debouncedTagsSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTagsSearch, loading]);

  useEffect(() => {
    if (page > 1) {
      getTagsList(debouncedTagsSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setuserPage(1);
    setuserHasMore(true);
    getUsersList(debouncedUsersSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUsersSearch, loading]);

  useEffect(() => {
    if (userPage > 1) {
      getUsersList(debouncedUsersSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPage]);

  const addFilter = (filterType: string, value: string, remove = false) => {
    const filterString = `${filterType}: ${value}`;
    let nextFilters: string[] = [];
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

  //  apply filters
  const onApplyFilters = () => {
    const formatted: any = {};

    // Date Filter
    const dateFilter = activeFilters.find((f) => f.startsWith("Date:"));
    if (dateFilter) {
      const val = dateFilter.split(": ")[1];
      if (val.includes(" to ")) {
        const [from, to] = val.split(" to ");
        formatted.date_range = { from, to };
      } else {
        formatted.date_range = getDateRange(val);
      }
    }

    // Tags Filter
    const selectedTags = activeFilters
      .filter((f) => f.startsWith("Tags:"))
      .map((t) => t.split(": ")[1]);

    if (selectedTags.length > 0) {
      formatted.tags = selectedTags;
    }
    // User
    const selectedUserIds = activeFilters
      .filter((f) => f.startsWith("User:"))
      .map((u) => u.split(": ")[1]);

    if (selectedUserIds.length > 0) {
      formatted.user = selectedUserIds;
    }

    dispatch(setAppliedFilters(formatted));
    setShowFilters(false);
    toast.success("Filters applied successfully");
  };

  const clearAll = () => {
    setActiveFilters([]);
    dispatch(clearAppliedFilters());
    setShowFilters(false);
  };

  useEffect(() => {
    let restoredFilters: string[] = [];

    if (appliedFilters.date_range?.from && appliedFilters.date_range?.to) {
      restoredFilters.push(
        `Date: ${appliedFilters.date_range.from} to ${appliedFilters.date_range.to}`
      );
    }

    if (appliedFilters.tags?.length) {
      appliedFilters.tags.forEach((tag) => {
        restoredFilters.push(`Tags: ${tag}`);
      });
    }

    if (appliedFilters.user?.length && usersList.length) {
      appliedFilters.user.forEach((userId) => {
        const user = usersList.find((u) => u.user_id === userId);
        if (user) {
          restoredFilters.push(`User: ${user.user_id}`);
        }
      });
    }

    setActiveFilters(restoredFilters);
  }, [appliedFilters, showFilters, usersList]);

  return {
    // UI
    showFilters,
    setShowFilters,

    // Filters
    activeFilters,
    setActiveFilters,
    addFilter,
    onApplyFilters,
    clearAll,
    appliedFilters,

    // Tags
    tagsList,
    loadingTags,
    hasMore,
    isFetchingMore,
    setIsFetchingMore,
    page,
    setPage,
    tagsSearch,
    setTagsSearch,
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
  };
}
