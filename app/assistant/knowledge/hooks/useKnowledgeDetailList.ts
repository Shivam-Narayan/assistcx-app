"use client";

import {
  DETAIL_COLLECTION,
  DETAIL_SEARCH_COLLECTION,
} from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useDebounce } from "@/lib/hook/useDebounce";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { UseKnowledgeDetailListParams } from "../_components/types";
import { DataFile } from "../../chat/_components/types";

export const useKnowledgeDetailList = ({
  open,
  collectionId,
  pageSize = 10,
}: UseKnowledgeDetailListParams) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [dataFile, setDataFile] = useState<DataFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedFile, setSelectedFile] = useState<DataFile | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fileViewerRef = useRef<HTMLDivElement | null>(null);
  const [isFileDetailOpen, setIsFileDetailOpen] = useState(false);
  const observerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSearchingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchCollections = useCallback(
    async (pageNum: number, keyword: string, isNewSearch: boolean = false) => {
      try {
        if (isNewSearch) {
          setIsLoading(true);
        } else if (pageNum > 1) {
          setIsFetchingMore(true);
        }

        const response = await axiosAuth.get<{
          data_files: DataFile[];
          total: number;
        }>(keyword ? DETAIL_SEARCH_COLLECTION : DETAIL_COLLECTION, {
          params: {
            collection_id: collectionId,
            keyword: keyword || undefined,
            page: pageNum,
            page_size: pageSize,
            filters: {
              status: "SUCCESSFUL",
            },
          },
        });

        const newItems = response.data.data_files || [];

        if (isNewSearch || pageNum === 1) {
          setDataFile(newItems);
        } else {
          setDataFile((prev) => [...prev, ...newItems]);
        }

        setHasMore(newItems.length === pageSize);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load files. Please try again.");
        toast.error("Failed to load files");
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [axiosAuth, collectionId, pageSize],
  );

  useEffect(() => {
    if (scrollContainerRef.current && debouncedSearch) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (scrollContainerRef.current && searchQuery === "") {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (open && scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo(0, 0);
        }
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (open && !loading) {
      isSearchingRef.current = true;
      setPage(1);
      setHasMore(true);
      setSelectedFile(null);
      fetchCollections(1, debouncedSearch, true).finally(() => {
        setTimeout(() => {
          isSearchingRef.current = false;
        }, 500);
      });
    }
  }, [debouncedSearch, fetchCollections, open, loading]);

  useEffect(() => {
    if (page > 1 && !isFetchingMore) {
      fetchCollections(page, debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const currentLoader = loaderRef.current;
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

  useEffect(() => {
    if (fileViewerRef.current) {
      fileViewerRef.current.scrollTop = 0;
    }
  }, [selectedFile]);

  return {
    dataFile,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    page,
    hasMore,
    loaderRef,
    setSearchQuery,
    handleSearchChange,
    selectedFile,
    setSelectedFile,
    isFileDetailOpen,
    setIsFileDetailOpen,
    fileViewerRef,
    scrollContainerRef,
  };
};
