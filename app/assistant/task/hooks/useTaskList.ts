import { cronToJson } from "@/helper/assistant-helper/helper";
import { LIST_TASKS, SEARCH_TASKS } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useDebounce } from "@/lib/hook/useDebounce";
import moment from "moment";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { TaskItem, TaskMeta, UseTaskListResult } from "../_components/types";

const PAGE_SIZE = 10;

export const useTaskList = (): UseTaskListResult => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("daily");
  const [time, setTime] = useState("08:00");
  const [day, setDay] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isTaskDetail, setIsTaskDetail] = useState(false);
  const [suggestionData, setSuggestionData] = useState<{
    name?: string;
    prompt?: string;
  } | null>(null);
  const observerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);

  const fetchTasks = useCallback(
    async (pageNum: number, keyword: string, isNewSearch: boolean = false) => {
      try {
        if (isNewSearch) {
          setIsLoading(true);
        } else if (pageNum > 1) {
          setIsFetchingMore(true);
        }

        const response = await axiosAuth.get<TaskItem[]>(
          keyword ? SEARCH_TASKS : LIST_TASKS,
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

        const newItems = response.data || [];

        if (isNewSearch || pageNum === 1) {
          setTasks(newItems);
        } else {
          setTasks((prev) => [...prev, ...newItems]);
        }

        setHasMore(newItems.length === PAGE_SIZE);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load tasks. Please try again.");
        toast.error("Failed to load tasks");
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [axiosAuth],
  );

  useEffect(() => {
    if (!loading) {
      isSearchingRef.current = true;
      setPage(1);
      setHasMore(true);
      fetchTasks(1, debouncedSearch, true).finally(() => {
        setTimeout(() => {
          isSearchingRef.current = false;
        }, 500);
      });
    }
  }, [debouncedSearch, fetchTasks, loading]);

  useEffect(() => {
    if (page > 1 && !isFetchingMore && !isSearchingRef.current) {
      fetchTasks(page, debouncedSearch);
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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTaskDetail = (
    newTab?: string,
    newTime?: string,
    newDay?: string,
    suggestion?: { name?: string; prompt?: string } | null,
  ) => {
    if (newTab) {
      setTab(newTab);
      setTime(newTime || "08:00");
      if (newDay) {
        setDay(newDay);
      }
    }
    setSuggestionData(suggestion ?? null);
    setTimeout(() => setIsTaskDetail(true), 50);
  };

  const getTaskMeta = (task: TaskItem): TaskMeta | null => {
    if (!task?.schedule) return null;
    const isEpoch = /^\d{10,13}$/.test(task?.schedule);
    const raw = Number(task?.schedule);
    const epoch = raw > 1e12 ? raw / 1000 : raw;
    return isEpoch
      ? {
          type: "once",
          time: moment.unix(epoch).format("HH:mm"),
          date: moment.unix(epoch).format("YYYY-MM-DD"),
        }
      : (cronToJson(task?.schedule) as TaskMeta);
  };

  return {
    tasks,
    setTasks,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    tab,
    time,
    day,
    hasMore,
    debouncedSearch,
    loaderRef,
    isTaskDetail,
    setIsTaskDetail,
    fetchTasks,
    handleSearchChange,
    suggestionData,
    handleTaskDetail,
    getTaskMeta,
  };
};
