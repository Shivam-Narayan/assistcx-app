"use client";

import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  DATA_TABLE_LIST_PAGE_SIZE,
  type DynamicTable,
} from "../types/table-types";
import {
  createTableApi,
  deleteTableApi,
  getTablesApi,
  searchTablesApi,
  updateTableApi,
} from "./useTableApi";

interface UseTableListOptions {
  enabled?: boolean;
}

export function useTableList({ enabled = true }: UseTableListOptions = {}) {
  const { axiosAuth, loading } = useAxiosAuth();

  const [tables, setTables] = useState<DynamicTable[]>([]);
  const [isListLoading, setListLoading] = useState(enabled);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [searchedDebounce] = useDebounce<string>(searchText, 500);
  const isSearchingRef = useRef(false);

  const fetchPage = useCallback(
    async (pageNum: number, keyword: string, replace: boolean) => {
      if (!enabled || loading) return;

      if (replace) {
        setListLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      try {
        const params = {
          page: pageNum,
          page_size: DATA_TABLE_LIST_PAGE_SIZE,
        };
        const result =
          keyword.trim() !== ""
            ? await searchTablesApi(axiosAuth, keyword, params)
            : await getTablesApi(axiosAuth, params);

        setTables((prev) => {
          if (replace) return result;
          const seen = new Set(prev.map((t) => t.id));
          const next = result.filter((t) => !seen.has(t.id));
          return [...prev, ...next];
        });
        setHasMore(result.length >= DATA_TABLE_LIST_PAGE_SIZE);
      } catch (error) {
        console.error("Failed to load data tables:", error);
        if (replace) setTables([]);
        setHasMore(false);
      } finally {
        setListLoading(false);
        setIsFetchingMore(false);
      }
    },
    [enabled, loading, axiosAuth],
  );

  useEffect(() => {
    if (!enabled) {
      setListLoading(false);
      return;
    }
    if (loading) return;

    isSearchingRef.current = true;
    setPage(1);
    setHasMore(true);
    fetchPage(1, searchedDebounce, true).finally(() => {
      setTimeout(() => {
        isSearchingRef.current = false;
      }, 300);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, loading, searchedDebounce]);

  useEffect(() => {
    if (
      !enabled ||
      page <= 1 ||
      isListLoading ||
      isFetchingMore ||
      isSearchingRef.current
    ) {
      return;
    }
    fetchPage(page, searchedDebounce, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchTables = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchPage(1, searchedDebounce, true);
  }, [fetchPage, searchedDebounce]);

  const loadMoreTables = useCallback(() => {
    if (!hasMore || isListLoading || isFetchingMore || isSearchingRef.current) {
      return;
    }
    setPage((prev) => prev + 1);
  }, [hasMore, isListLoading, isFetchingMore]);

  const createTable = async (
    name: string,
    description: string,
    icon: string,
    availability: string,
  ): Promise<string | null> => {
    if (loading) return null;
    const newTable = await createTableApi(
      axiosAuth,
      name,
      description,
      icon,
      availability,
    );
    if (newTable) {
      setTables((prev) => [newTable, ...prev]);
      return newTable.id;
    }
    return null;
  };

  const deleteTable = async (tableId: string): Promise<boolean> => {
    if (loading) return false;
    const success = await deleteTableApi(axiosAuth, tableId);
    if (success) {
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    }
    return success;
  };

  const updateTable = async (
    tableId: string,
    name: string,
    description: string,
    icon: string,
    availability: string,
  ): Promise<boolean> => {
    if (loading) return false;
    const updatedTable = await updateTableApi(axiosAuth, tableId, {
      name,
      description,
      icon,
      availability,
    });
    if (updatedTable) {
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? updatedTable : t)),
      );
    }
    return !!updatedTable;
  };

  return {
    tables,
    isListLoading,
    isFetchingMore,
    hasMore,
    loading,
    searchText,
    setSearchText,
    fetchTables,
    loadMoreTables,
    createTable,
    updateTable,
    deleteTable,
  };
}
