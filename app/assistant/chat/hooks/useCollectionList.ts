"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  KnowledgeCollectionListItem,
  KnowledgeCollectionSelectedItem,
  UseCollectionListOptions,
  UseCollectionListReturn,
} from "../_components/types";

const DEFAULT_SEARCH_DEBOUNCE_MS = 500;

export function useCollectionList({
  open,
  selected,
  fetchCollections,
  authLoading = false,
  maxSelections = 50,
  onOpenWithNoSelection,
  searchDebounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
}: UseCollectionListOptions): UseCollectionListReturn {
  const [collections, setCollections] = useState<KnowledgeCollectionListItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tempSelected, setTempSelected] = useState<
    KnowledgeCollectionSelectedItem[] | null
  >(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetch = useCallback(
    async (pageNum: number, keyword: string, isNewSearch: boolean) => {
      try {
        if (isNewSearch) {
          setIsLoading(true);
        } else if (pageNum > 1) {
          setIsFetchingMore(true);
        }
        const { items: newItems, hasMore: more } = await fetchCollections(
          pageNum,
          keyword,
          isNewSearch,
        );
        if (isNewSearch || pageNum === 1) {
          setCollections(newItems);
        } else {
          setCollections((prev) => [...prev, ...newItems]);
        }
        setHasMore(more);
      } catch (err) {
        console.error("Fetch collections error:", err);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [fetchCollections],
  );

  // Debounce search
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(searchTerm),
      searchDebounceMs,
    );
    return () => clearTimeout(t);
  }, [searchTerm, searchDebounceMs]);

  // Scroll to top when debounced search or search term changes
  useEffect(() => {
    if (scrollContainerRef.current && debouncedSearch) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (scrollContainerRef.current && searchTerm === "") {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [searchTerm]);

  // Scroll to top when modal opens
  useEffect(() => {
    if (open && scrollContainerRef.current) {
      setTimeout(() => scrollContainerRef.current?.scrollTo(0, 0), 100);
    }
  }, [open]);

  // Initial fetch when open / debouncedSearch / auth changes
  useEffect(() => {
    if (!authLoading && open) {
      isSearchingRef.current = true;
      setPage(1);
      setHasMore(true);
      fetch(1, debouncedSearch, true).finally(() => {
        setTimeout(() => {
          isSearchingRef.current = false;
        }, 500);
      });
    }
  }, [debouncedSearch, fetch, authLoading, open]);

  // Load more when page increments
  useEffect(() => {
    if (page > 1 && !isFetchingMore && !isSearchingRef.current) {
      fetch(page, debouncedSearch, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Sync temp selection when modal opens or selected changes
  useEffect(() => {
    if (open) {
      setTempSelected(selected ?? null);
    }
  }, [open, selected]);

  // Notify when opened with no selection
  useEffect(() => {
    if (open && selected === null) {
      onOpenWithNoSelection?.();
    }
  }, [open, selected, onOpenWithNoSelection]);

  const toggleItem = useCallback(
    (item: KnowledgeCollectionListItem) => {
      setTempSelected((current) => {
        const list = current ?? [];
        const isSelected = list.some((i) => i.id === item.id);
        const isNoneSelected = list.some((i) => i.id === "none");

        if (isSelected) {
          const updated = list.filter((i) => i.id !== item.id);
          return updated.length === 0 ? null : updated;
        }
        if (list.length >= maxSelections) {
          toast.error(
            `You can select a maximum of ${maxSelections} collections.`,
            { id: "select-max-length-error" },
          );
          return current;
        }

        const newItem: KnowledgeCollectionSelectedItem = {
          id: item.id,
          name: item.name,
          description: item.description,
          index_name: item.index_name,
          icon: item.icon,
          availability: item.availability,
        };
        if (isNoneSelected) {
          return [newItem];
        }
        return [...list, newItem];
      });
    },
    [maxSelections],
  );

  const clearTempSelected = useCallback((onClearAll?: () => void) => {
    setTempSelected(null);
    onClearAll?.();
  }, []);

  const resetToInitial = useCallback(() => {
    setSearchTerm("");
    setTempSelected(selected ?? null);
  }, [selected]);

  return {
    collections,
    isLoading,
    isFetchingMore,
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    hasMore,
    tempSelected,
    setTempSelected,
    loaderRef,
    scrollContainerRef,
    toggleItem,
    clearTempSelected,
    resetToInitial,
  };
}
