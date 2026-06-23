import { LIST_FILES, SEARCH_FILES } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useDebounce } from "@/lib/hook/useDebounce";
import { setSelectedAttchmentCollections } from "@/redux/assistant/chat/attachment-slice";
import { setSelectedCollections } from "@/redux/assistant/chat/collection-slice";
import { useAppSelector } from "@/redux/store";
import { DataFiles, FileItem } from "@/app/assistant/files/_components/types";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { toast as sonnerToast } from "sonner";
import { useDispatch } from "react-redux";
import { AttachmentData } from "@/redux/assistant/chat/chat-slice";

const PAGE_SIZE = 10;

export function useAttachment() {
  const dispatch = useDispatch();
  const { axiosAuth, loading } = useAxiosAuth();

  const selected = useAppSelector((state) => state?.attachmentReducer.selected);
  const selectedCollections = useAppSelector(
    (state) => state?.collectionReducer.selected,
  );

  const [open, setOpen] = useState(false);
  const [stagedSelection, setStagedSelection] = useState<
    AttachmentData[] | null
  >(null);
  const [collections, setCollections] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);

  const fetchCollections = useCallback(
    async (pageNum: number, keyword: string, isNewSearch = false) => {
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
              page_size: PAGE_SIZE,
              sort_by: "updated_at",
              sort_order: "desc",
            },
          },
        );

        const newItems = response.data?.data_files || [];

        if (isNewSearch || pageNum === 1) {
          setCollections(newItems);
        } else {
          setCollections((prev) => [...prev, ...newItems]);
        }

        setHasMore(newItems.length === PAGE_SIZE);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load files. Please try again.");
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [axiosAuth],
  );

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (debouncedSearch) scrollToTop();
  }, [debouncedSearch, scrollToTop]);

  useEffect(() => {
    if (searchTerm === "") scrollToTop();
  }, [searchTerm, scrollToTop]);

  useEffect(() => {
    if (open) {
      setTimeout(scrollToTop, 100);
    }
  }, [open, scrollToTop]);

  useEffect(() => {
    if (!loading && open) {
      isSearchingRef.current = true;
      setPage(1);
      setHasMore(true);
      fetchCollections(1, debouncedSearch, true).finally(() => {
        setTimeout(() => {
          isSearchingRef.current = false;
        }, 500);
      });
    }
  }, [debouncedSearch, fetchCollections, loading, open]);

  useEffect(() => {
    if (page > 1 && !isFetchingMore && !isSearchingRef.current) {
      fetchCollections(page, debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoading &&
          !isFetchingMore &&
          !isSearchingRef.current
        ) {
          if (observerTimeoutRef.current)
            clearTimeout(observerTimeoutRef.current);
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
      if (observerTimeoutRef.current) clearTimeout(observerTimeoutRef.current);
    };
  }, [hasMore, isLoading, isFetchingMore]);

  // Toggle updates staged selection only (not Redux)
  const toggleItem = useCallback(
    (item: FileItem) => {
      const current = stagedSelection ?? [];
      const isSelected = current.some((i) => i.id === item.id);

      if (isSelected) {
        const updated = current.filter((i) => i.id !== item.id);
        setStagedSelection(updated.length === 0 ? null : updated);
        return;
      }

      if (current.length >= 5) {
        toast.error("You can select a maximum of 5 attachments.", {
          id: "select-max-length-error",
        });
        return;
      }

      const newItem = { id: item.id, name: item.name };
      setStagedSelection([...current, newItem]);
    },
    [stagedSelection],
  );

  // Clear staged selection only
  const clearAll = useCallback(() => {
    setStagedSelection(null);
  }, []);

  // Apply: commit staged selection to Redux, handle mode switch
  const applySelection = useCallback(() => {
    if (
      selectedCollections !== null &&
      selectedCollections.length > 0 &&
      stagedSelection !== null
    ) {
      dispatch(setSelectedCollections(null));
      sonnerToast.info("Switched to Files mode", {
        description: "Previously selected knowledge has been cleared.",
        id: "mode-switch",
      });
    }
    dispatch(setSelectedAttchmentCollections(stagedSelection));
    setOpen(false);
    setSearchTerm("");
  }, [stagedSelection, selectedCollections, dispatch]);

  // On open: initialize staged from Redux. No mode switch here.
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setStagedSelection(selected);
      }
      setOpen(isOpen);
      if (!isOpen) setSearchTerm("");
    },
    [selected],
  );

  const closeDialog = useCallback(() => {
    setOpen(false);
    setSearchTerm("");
  }, []);

  return {
    open,
    handleOpenChange,
    closeDialog,
    collections,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    searchTerm,
    setSearchTerm,
    selected,
    stagedSelection,
    selectedCollections,
    toggleItem,
    clearAll,
    applySelection,
    loaderRef,
    scrollContainerRef,
  };
}
