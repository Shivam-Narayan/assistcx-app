"use client";

import { errorMessageHandler } from "@/helper/helper-function";
import { LIST_COLLECTIONS, SEARCH_COLLECTIONS } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useDebounce } from "@/lib/hook/useDebounce";
import { useCallback, useEffect, useRef, useState } from "react";
import { KnowledgeItem } from "../../chat/_components/types";
import { ApiResponse } from "../_components/types";

export const useKnowledgeCollections = ({
  pageSize = 10,
}: {
  pageSize?: number;
}) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [collections, setCollections] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSearchingRef = useRef(false);

  const fetchCollections = useCallback(
    async (pageNum: number, keyword: string, isNewSearch: boolean = false) => {
      try {
        if (isNewSearch) {
          setIsLoading(true);
        } else if (pageNum > 1) {
          setIsFetchingMore(true);
        }

        const endpoint = keyword ? SEARCH_COLLECTIONS : LIST_COLLECTIONS;
        const params = keyword
          ? {
              keyword,
              page: pageNum,
              page_size: pageSize,
              filters: {
                availability: "PUBLISHED",
              },
            }
          : {
              page: pageNum,
              page_size: pageSize,
              filters: {
                availability: "PUBLISHED",
              },
            };

        const response = await axiosAuth.get<ApiResponse>(endpoint, {
          params,
          paramsSerializer: (params) => {
            const { filters, ...rest } = params;
            const base = new URLSearchParams(rest).toString();
            const filterStr = filters
              ? `&filters=${encodeURIComponent(JSON.stringify(filters))}`
              : "";
            return `${base}${filterStr}`;
          },
        });
        const newItems = response.data.data_collections || [];

        if (isNewSearch || pageNum === 1) {
          setCollections(newItems);
        } else {
          setCollections((prev) => [...prev, ...newItems]);
        }

        setHasMore(newItems.length === pageSize);
      } catch (err) {
        setError("Failed to load collections");
        errorMessageHandler(err);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [axiosAuth, pageSize],
  );

  useEffect(() => {
    if (!loading) {
      isSearchingRef.current = true;
      setPage(1);
      setHasMore(true);
      fetchCollections(1, debouncedSearch, true).finally(() => {
        setTimeout(() => {
          isSearchingRef.current = false;
        }, 500);
      });
    }
  }, [debouncedSearch, fetchCollections, loading]);

  useEffect(() => {
    if (page > 1 && !isFetchingMore && !isSearchingRef.current) {
      fetchCollections(page, debouncedSearch);
    }
    // eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoading &&
          !isFetchingMore &&
          !isSearchingRef.current
        ) {
          if (observerTimeoutRef.current) {
            clearTimeout(observerTimeoutRef.current);
          }

          observerTimeoutRef.current = setTimeout(() => {
            setPage((prev) => prev + 1);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
      if (observerTimeoutRef.current) {
        clearTimeout(observerTimeoutRef.current);
      }
    };
  }, [hasMore, isLoading, isFetchingMore]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return {
    collections,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    page,
    hasMore,
    loaderRef,
    setSearchQuery,
    handleSearchChange,
  };
};
