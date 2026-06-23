"use client";

import { errorMessageHandler } from "@/helper/helper-function";
import {
  HISTORY_ARCHIVE,
  LIST_HISTORY,
  SEARCH_HISTORY,
} from "@/lib/assistant-urls";
import { useDebounce } from "@/lib/hook/useDebounce";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { ChatItem } from "../_components/types";

export const useChatHistory = ({ pageSize = 10 }: { pageSize?: number }) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSearchingRef = useRef(false);

  const fetchChats = useCallback(
    async (pageNum: number, keyword: string, isNewSearch: boolean = false) => {
      try {
        if (isNewSearch) {
          setIsLoading(true);
        } else if (pageNum > 1) {
          setIsFetchingMore(true);
        }

        const response = await axiosAuth.get<ChatItem[]>(
          keyword ? SEARCH_HISTORY : LIST_HISTORY,
          {
            params: {
              keyword: keyword || undefined,
              page: pageNum,
              page_size: pageSize,
              sort_by: "updated_at",
              sort_order: "desc",
            },
          },
        );

        const newItems = response.data || [];

        if (isNewSearch || pageNum === 1) {
          setChats(newItems);
        } else {
          setChats((prev) => [...prev, ...newItems]);
        }

        setHasMore(newItems.length === pageSize);
      } catch (err) {
        setError("Failed to load chats. Please try again.");
        toast.error("Failed to load chats");
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [axiosAuth, pageSize],
  );

  // Initial load and search effect
  useEffect(() => {
    if (!loading) {
      isSearchingRef.current = true;
      setPage(1);
      setHasMore(true);
      fetchChats(1, debouncedSearch, true).finally(() => {
        setTimeout(() => {
          isSearchingRef.current = false;
        }, 500);
      });
    }
  }, [debouncedSearch, fetchChats, loading]);

  // Load more effect - only run when page changes
  useEffect(() => {
    if (page > 1 && !isFetchingMore && !isSearchingRef.current) {
      fetchChats(page, debouncedSearch);
    }
    // eslint-disable-next-line
  }, [page]);

  // Infinite scroll observer
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

  const handleDelete = async (id: string) => {
    try {
      await axiosAuth.post(`${HISTORY_ARCHIVE}/${id}/archive`);
      setChats((prev) => prev.filter((chat) => chat.id !== id));
      setSelectedChats((prev) => prev.filter((chatId) => chatId !== id));
      setConfirmDeleteId(null);
      toast.success("Chat Thread is archived successfully.");
    } catch (error) {
      errorMessageHandler(error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return {
    chats,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    selectedChats,
    confirmDeleteId,
    page,
    hasMore,
    loaderRef,
    setConfirmDeleteId,
    setSearchQuery,
    setSelectedChats,
    handleDelete,
    handleSearchChange,
  };
};
