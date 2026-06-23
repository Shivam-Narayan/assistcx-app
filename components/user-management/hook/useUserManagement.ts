"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";

export interface User {
  id?: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  user_id?: string;
  email_id?: string;
  
}

const QUERY_PARAMS = {
  pageSize: 10,
  sortBy: "updated_at",
  sortOrder: "desc",
};

export const useUsersListManagement = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [debouncedUserSearch] = useDebounce(userSearch, 500);

  const getUsersList = async (pageNumber = 1, searchText = "") => {
    if (loading) return;

    if (pageNumber === 1) setUsersLoading(true);
    else setIsFetchingMore(true);

    try {
      const isSearch = searchText.trim().length > 0;

      const baseUrl = isSearch
        ? url.SEARCH_TEAM_MEMBERS
        : url.LIST_TEAM_MEMBERS;

      const params = new URLSearchParams({
        page: String(pageNumber),
        page_size: String(QUERY_PARAMS.pageSize),
        sort_by: QUERY_PARAMS.sortBy,
        sort_order: QUERY_PARAMS.sortOrder,
        filters: JSON.stringify({ account_status: "active" }),
      });

      if (isSearch) {
        params.append("keyword", searchText.trim());
      }

      const result = await axiosAuth.get(`${baseUrl}?${params.toString()}`);

      if (result?.status === 200) {
        const newUsers = result?.data?.users || result?.data || [];

        setUsersList((prev) =>
          pageNumber === 1 ? newUsers : [...prev, ...newUsers]
        );

        setHasMore(newUsers.length >= QUERY_PARAMS.pageSize);
      }
    } catch (error) {
      console.error("getUsersList error:", error);
    } finally {
      setUsersLoading(false);
      setIsFetchingMore(false);
    }
  };

  // reset on search change
  useEffect(() => {
    setPage(1);
    setUsersList([]);
  }, [debouncedUserSearch]);

  // initial + search load
  useEffect(() => {
    if (!loading) {
      getUsersList(1, debouncedUserSearch);
    }
  }, [debouncedUserSearch, loading]);

  // pagination load
  useEffect(() => {
    if (page > 1) {
      getUsersList(page, debouncedUserSearch);
    }
  }, [page]);

  return {
    usersList,
    usersLoading,
    page,
    setPage,
    hasMore,
    isFetchingMore,
    setIsFetchingMore,
    userSearch,
    setUserSearch,
  };
};