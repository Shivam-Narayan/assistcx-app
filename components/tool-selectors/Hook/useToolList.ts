import { FilterOption } from "@/app/(dashboard)/tools/hook/useToolsPage";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import * as url from "@/helper/url-helper";
import { getIconsData, getIconSvg } from "@/components/icon-manager/icon-render-component";
import { errorMessageHandler } from "@/helper/helper-function";

const QUERY_PARAMS = {
  pageSize: 10,
  sortBy: "created_at",
  sortOrder: "desc",
};

const useToolList = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [toolsSearch, setToolsSearch] = useState("");
  const [debouncedToolsSearch] = useDebounce(toolsSearch, 300);
  const [allTools, setAllTools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterListLoading, setFilterListLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const toolIcons = getIconsData("tool_icons");
  const defaultIcon = getIconSvg("tool-case", "tool_icons");

  const buildToolEndpoint = useCallback(
    (page: number, mode?: "search" | "filter") => {
      const baseParams = `page=${page}&page_size=${QUERY_PARAMS.pageSize}&sort_by=${QUERY_PARAMS.sortBy}&sort_order=${QUERY_PARAMS.sortOrder}`;

      if (mode === "search" && debouncedToolsSearch.trim()) {
        return `${url.SEARCH_TOOLS}?keyword=${encodeURIComponent(
          debouncedToolsSearch.trim(),
        )}&${baseParams}`;
      }

      if (mode === "filter" && selectedFilter && selectedFilter !== "all") {
        const filters = encodeURIComponent(
          JSON.stringify({ integration_key: selectedFilter }),
        );

        return `${url.LIST_TOOLS}?filters=${filters}&${baseParams}`;
      }

      return `${url.LIST_TOOLS}?${baseParams}`;
    },
   
    [debouncedToolsSearch, selectedFilter],
  );

  const getToolList = useCallback(
    async (nextPage: number, mode?: "search" | "filter") => {
      if (loading || (nextPage > 1 && isFetchingMore)) return;

      const isFirstPage = nextPage === 1;
      if (isFirstPage) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      try {
        const endpoint = buildToolEndpoint(nextPage, mode);
        const result = await axiosAuth.get(endpoint);

        if (result.status === 200) {
          const fetchedTools = result.data.agent_tools || [];
        
          setAllTools((prev = []) =>
            nextPage === 1 ? fetchedTools : [...prev, ...fetchedTools],
          );

          setHasMore(fetchedTools.length === QUERY_PARAMS.pageSize);
        }
      } catch (error :any) {
         errorMessageHandler(error)
      } finally {
        if (isFirstPage) {
          setIsLoading(false);
        } else {
          setIsFetchingMore(false);
        }
      }
    },
    
    [axiosAuth, loading, isFetchingMore, buildToolEndpoint],
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setAllTools([]);

    if (debouncedToolsSearch) {
      getToolList(1, "search");
    } else if (selectedFilter && selectedFilter !== "all") {
      getToolList(1, "filter");
    } else {
      getToolList(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedToolsSearch, selectedFilter, loading]);

  const fetchFilterOptions = async () => {
    if (loading) return;
    setFilterListLoading(true);
    try {
      const result = await axiosAuth.get(url.GET_TOOL_FILTER_LIST);
      if (result.status === 200 && result.data?.integrations) {
        const options = result.data.integrations.map((item: any) => ({
          label: item.name,
          value: item.key,
        }));
        setFilterOptions(options);
      }
    } catch (error :any) {
      errorMessageHandler(error)
    } finally {
      setFilterListLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const loadMoreTools = () => {
    if (!hasMore || loading || isFetchingMore) return;

    const next = page + 1;
    setPage(next);

    if (debouncedToolsSearch) {
      getToolList(next, "search");
    } else if (selectedFilter && selectedFilter !== "all") {
      getToolList(next, "filter");
    } else {
      getToolList(next);
    }
  };

  const toolsItems = allTools.map((item) => ({
    label: item.name,
    value: item.action,
    description: item.description,
    icon: item.icon,
    action: item.action,
    name: item.name,
    id: item.id,
    tool_config: { name: item.tool_config?.name },
    is_default: item.is_default,
    integration_key: item.integration_key,
  }));

  return {
    toolsItems,
    toolsSearch,
    setToolsSearch,
    hasMore,
    isFetchingMore,
    isLoading,
    loadMoreTools,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
    isFilterListLoading,
    toolIcons,
    defaultIcon,
  };
};

export default useToolList;
