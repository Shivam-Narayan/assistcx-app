import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as url from "@/helper/url-helper";
import {
  errorMessageHandler,
} from "@/helper/helper-function";
import { useDebounce } from "use-debounce";

export function useTagsSelect(entity: any, type: "email" | "task", enabled: boolean = true) {
  const { axiosAuth, loading } = useAxiosAuth();
  const isPrefillDone = useRef(false);
  const hasUserInteracted = useRef(false);
  const [tagsList, setTagsListState] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [searchTagText, setSearchTagText] = useState("");
  const [searchedDebounce] = useDebounce<string>(searchTagText, 300);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy] = useState("created_at");
  const [sortOrder] = useState("desc");
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const hasFetchedOnce = useRef(false);

  const getAllTags = useCallback(
    async (isFilterOrSearch?: string) => {
      if (!loading) {
        let API_ENDPOINT_PATH: string = "";
        if (isFilterOrSearch == "search") {
          API_ENDPOINT_PATH = `${
            url.SEARCH_TAGS
          }?keyword=${searchedDebounce.trim()}&page=${page}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`;
        } else {
          API_ENDPOINT_PATH = `${url.TAGS_LIST}?page=${page}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`;
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

            if (newData.length < pageSize) {
              setHasMore(false);
            } else {
              setHasMore(true);
            }
          }
        } catch (err) {
          console.error("Failed to fetch tags", err);
        } finally {
          setIsFetchingMore(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [axiosAuth,searchedDebounce,pageSize,sortBy, sortOrder, loading ,page]
  );

  // prefill selected tags
  useEffect(() => {
    if (!entity) {
      setSelectedTags([]);
      isPrefillDone.current = true;
      hasUserInteracted.current = false;
      return;
    }

    const currentEntityTags =
      type === "email" ? entity.email_tags : entity.agent_task_tags;
    const currentEntityTagIds = (currentEntityTags || []).map((t: any) => t.id);
    const selectedIds = (selectedTags || []).map((t: any) =>
      typeof t === "object" && t != null ? t.id : t
    );

    if (JSON.stringify(selectedIds) !== JSON.stringify(currentEntityTagIds)) {
      setSelectedTags(currentEntityTags || []);
    }
    isPrefillDone.current = true;
    hasUserInteracted.current = false;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, type]);

  // API call for tags
  const applyTagsApiCall = useCallback(
    async (tags: any[]) => {
      if (loading || !entity) return;

      if (!hasUserInteracted.current && isPrefillDone.current) {
        return;
      }
      const tagIds = tags.map((t) => t.id);

      try {
        const body = { tag_ids: tagIds };
        let endpoint = "";

        if (type === "email") {
          endpoint = `${url.LIST_MAILBOX}/${entity.id}/tags`;
        } else if (type === "task") {
          endpoint = `/agent-tasks/${entity.id}/tags`;
        }

        const result = await axiosAuth.patch(endpoint, body);

        if (result?.status === 200) {
          // successMessageHandler(result?.data?.message);
        }
      } catch (error: any) {
        errorMessageHandler(error?.response?.data?.detail);
      }
    },
    [axiosAuth, entity, type, loading]
  );

  const initialMountRef = useRef(true);

  const setUserSelectedTags = useCallback((newTags: any[]) => {
    hasUserInteracted.current = true;
    setSelectedTags(newTags);
  }, []);

  const setTagsList = useCallback(
    (value: any[] | ((prev: any[]) => any[])) => {
      setTagsListState((prev) => {
        const resolved =
          typeof value === "function" ? value(prev) : value || [];
        const merged = [...resolved];
        (selectedTags || []).forEach((sel) => {
          const selId = typeof sel === "object" && sel != null ? sel.id : sel;
          if (!merged.find((t) => t?.id === selId)) merged.push(sel);
        });

        setSelectedTags((prevSel) =>
          (prevSel || []).map((sel) => {
            const selId = typeof sel === "object" && sel != null ? sel.id : sel;
            return merged.find((t) => t.id === selId) || sel;
          })
        );

        return merged;
      });
    },
    [selectedTags]
  );

  useEffect(() => {
    if (!loading && enabled) {
      if (searchedDebounce) {
        getAllTags("search");
      } else {
        getAllTags();
      }
      hasFetchedOnce.current = true;
    }
  }, [getAllTags, searchedDebounce, loading, enabled]);


  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }

    if (!isPrefillDone.current) {
      return;
    }

    if (!entity) {
      return;
    }

    if (hasUserInteracted.current) {
      applyTagsApiCall(selectedTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags, applyTagsApiCall, entity]);

  return useMemo(
    () => ({
      getTagsList: () => tagsList,
      getSelectedTags: () => selectedTags,
      setSelectedTags: setUserSelectedTags,
      setTagsList,
      searchTagText,
      setSearchTagText,
      setPage,
      page,
      hasMore,
      isFetchingMore,
      setIsFetchingMore,
    }),
    [
      tagsList,
      selectedTags,
      setUserSelectedTags,
      setTagsList,
      searchTagText,
      setSearchTagText,
      setPage,
      page,
      hasMore,
      isFetchingMore,
      setIsFetchingMore,
    ]
  );
}
