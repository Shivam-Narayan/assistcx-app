"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessageHandler } from "@/helper/helper-function";
import { DELETE_FILES, LIST_FILES, SEARCH_FILES } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useDebounce } from "@/lib/hook/useDebounce";
import toast from "react-hot-toast";
import { DataFiles, FileItem } from "@/app/assistant/files/_components/types";

export const useMyFiles = ({ pageSize = 10 }: { pageSize?: number } = {}) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSearchingRef = useRef(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const fetchFiles = useCallback(
    async (pageNum: number, keyword: string, isNewSearch: boolean = false) => {
      try {
        if (isNewSearch) {
          setIsLoading(true);
        } else if (pageNum > 1) {
          setIsFetchingMore(true);
        }

        const response = await axiosAuth.get<DataFiles>(
          keyword ? SEARCH_FILES : LIST_FILES,
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
        const newItems = response.data?.data_files || [];

        if (isNewSearch || pageNum === 1) {
          setFiles(newItems);
        } else {
          setFiles((prev) => [...prev, ...newItems]);
        }

        setHasMore(newItems.length === pageSize);
      } catch (err) {
        setError("Failed to load files. Please try again.");
        toast.error("Failed to load files");
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
      fetchFiles(1, debouncedSearch, true).finally(() => {
        setTimeout(() => {
          isSearchingRef.current = false;
        }, 500);
      });
    }
  }, [debouncedSearch, fetchFiles, loading]);

  useEffect(() => {
    if (page > 1 && !isFetchingMore && !isSearchingRef.current) {
      fetchFiles(page, debouncedSearch);
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

  const handleDelete = async (id: string) => {
    const responseBody = { data_file_ids: [id] };
    setIsDeleting(id);
    try {
      await axiosAuth.delete(DELETE_FILES, {
        data: responseBody,
      });
      setFiles((prev) => prev.filter((file) => file.id !== id));
      setSelectedFiles((prev) => prev.filter((fileId) => fileId !== id));
      setConfirmDeleteId(null);
      toast.success("file deleted successfully");
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setIsDeleting(null); // ← set loader OFF
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const refetchFiles = useCallback(() => {
    return fetchFiles(1, debouncedSearch, true);
  }, [fetchFiles, debouncedSearch]);

  return {
    files,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    selectedFiles,
    confirmDeleteId,
    page,
    hasMore,
    loaderRef,
    setConfirmDeleteId,
    setSearchQuery,
    setSelectedFiles,
    handleDelete,
    handleSearchChange,
    refetchFiles,
    isDeleting,
  };
};
