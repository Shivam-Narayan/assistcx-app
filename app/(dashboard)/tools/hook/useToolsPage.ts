import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

import PaginationService from "@/helper/pagination-service";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";

import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import {
  handleToolUpdateEvents,
  handleToolsData,
} from "@/redux/tools/tools-data-slice";

import { canEdit } from "@/lib/permissions";
import { handleToolsEvents } from "@/redux/agents/create-agents-data-slice";

export type Tool = {
  id: string;
  name: string;
  api_type: string;
  action: string;
  function: string;
  description: string;
  method: string;
  endpoint: string;
  content_type: string;
  body_template: string;
  headers: {};
  path_params: {};
  query_params: {};
  auth_config: {
    username?: string;
    password?: string;
    token?: string;
    client_id?: string;
    client_secret?: string;
    token_url?: string;
    scope?: string;
    api_key_name?: string;
    api_key?: string;
    api_key_location?: string;
  };
  icon: string;
  auth_type: string;
  integration_key: string;
  is_default: boolean;
  custom_fields?: any[] | null;
  tool_config?: {
    name?: string;
    supports_custom_fields?: boolean;
    [key: string]: any;
  } | null;
};
export type FilterOption = {
  label: string;
  value: string;
};

export type rowToolsData = {
  id: string;
  name: string;
  api_type: string;
  action: string;
  function: string;
  description: string;
  method: string;
  endpoint: string;
  content_type: string;
  body_template: string;
  headers: {};
  path_params: {};
  query_params: {};
  auth_config: {
    username?: string;
    password?: string;
    token?: string;
    client_id?: string;
    client_secret?: string;
    token_url?: string;
    scope?: string;
    api_key_name?: string;
    api_key?: string;
    api_key_location?: string;
  };
  icon: string;
  auth_type: string;
  integration_key: string;
  is_default: boolean;
  custom_fields?: any[] | null;
  tool_config?: {
    name?: string;
    supports_custom_fields?: boolean;
    [key: string]: any;
  } | null;
};

export const useToolsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { axiosAuth, loading } = useAxiosAuth();
  const { data: session } = useSession();
  const [tools, setTools] = useState<Tool[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isFilterListLoading, setFilterListLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [pager, setPager] = useState<any>({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy] = useState("updated_at");
  const [sortOrder] = useState("desc");

  const sheetEvent = useAppSelector(
    (state) => state.sheetTriggerReducer.value.sheetEvent,
  );
  const toolUpdatedEvent = useAppSelector(
    (state) =>
      state.triggerToolUpdateReducer.triggerToolUpdateReducer.value
        .toolUpdatedEvent,
  );
  const permissions = useAppSelector(
    (state) => state.conditionalPermissionReducer.value.permissionsRole,
  );

  // Debounce search text to avoid excessive API calls
  const [searchedDebounce] = useDebounce<string>(searchText, 500);

  // Ignore stale responses (race condition fix)
  const requestIdRef = useRef(0);
  const filterOptionsFetchedRef = useRef(false);
  // Prevent duplicate API calls when effect runs multiple times for same search/filters (e.g. Strict Mode, ref churn)
  const lastFetchKeyRef = useRef<string>("");

  // --- Computed Values ---
  const isCreatUpdateAgentTool = useMemo(
    () => canEdit(permissions, "agent_tools"),
    [permissions],
  );

  // --- get tools API Calls ---
  // When isFilterOrSearch/searchKeyword omitted, mode is derived from current search/filter state.
  const getToolsList = async (
    currentPage: number,
    isFilterOrSearch?: string,
    searchKeyword?: string,
  ) => {
    if (loading) return;

    // Derive mode from state when not explicitly passed (e.g. for pagination / tool update refetch)
    const mode =
      isFilterOrSearch ??
      (searchedDebounce.trim()
        ? "search"
        : selectedFilters.length
          ? "filter"
          : undefined);
    const keyword =
      searchKeyword ??
      (mode === "search" ? searchedDebounce.trim() : undefined);

    const id = ++requestIdRef.current;
    setPageNo(currentPage);

    let API_ENDPOINT_PATH: string = "";

    if (mode === "search" && keyword) {
      API_ENDPOINT_PATH = `${url.SEARCH_TOOLS}?keyword=${encodeURIComponent(keyword)}&page=${currentPage}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    } else if (mode === "filter" && selectedFilters.length > 0) {
      const filters = { integration_key: selectedFilters };
      const encodedFilters = encodeURIComponent(JSON.stringify(filters));
      API_ENDPOINT_PATH = `${url.LIST_TOOLS}?filters=${encodedFilters}&page=${currentPage}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    } else {
      API_ENDPOINT_PATH = `${url.LIST_TOOLS}?page=${currentPage}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    }

    try {
      setIsLoading(true);
      setPageLoading(true);
      const result = await axiosAuth.get(API_ENDPOINT_PATH);
      // Only apply response if this is still the latest request (avoids race condition)
      if (id !== requestIdRef.current) return;
      if (result.status === 200) {
        setTools(result.data.agent_tools);
        setTotalRecords(result.data.total);
        setPager(
          PaginationService.getPager(result.data.total, currentPage, pageSize),
        );
      } else {
        throw new Error("Failed to fetch tools");
      }
    } catch (error) {
      if (id !== requestIdRef.current) return;
      console.error("Error fetching tools:", error);
      setTools([]);
      setTotalRecords(0);
      setPager(PaginationService.getPager(0, 1, pageSize));
    } finally {
      if (id === requestIdRef.current) {
        setIsLoading(false);
        setPageLoading(false);
      }
    }
  };

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
    } catch (error) {
      console.error("Error fetching filter options:", error);
    } finally {
      setFilterListLoading(false);
    }
  };

  // Single effect: fetch tools when auth is ready or when search/filters change. Only one request per unique (search, filters).
  useEffect(() => {
    if (loading) return;
    if (!filterOptionsFetchedRef.current) {
      fetchFilterOptions();
      filterOptionsFetchedRef.current = true;
    }
    const fetchKey = `${searchedDebounce}|${selectedFilters.slice().sort().join(",")}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    lastFetchKeyRef.current = fetchKey;
    getToolsList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, searchedDebounce, selectedFilters]);

  // Effect to clean up search text on unmount
  useEffect(() => {
    return () => {
      setSearchText("");
    };
  }, [dispatch]);

  useEffect(() => {
    if (toolUpdatedEvent) {
      getToolsList(1);
      dispatch(handleToolUpdateEvents(false));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolUpdatedEvent]);

  const handlePageChange = (newPage: number) => {
    getToolsList(newPage);
  };

  const handleSetSearch = (text: string) => {
    setSearchText(text);
    if (text.trim()) {
      setSelectedFilters([]);
    }
  };

  const handleSetFilters = (filters: string[]) => {
    setSelectedFilters(filters);
    if (filters.length > 0) {
      setSearchText("");
    }
  };

  const resetAllFiltersAndSearch = () => {
    setSearchText("");
    setSelectedFilters([]);
  };

  const editTool = (item: rowToolsData) => {
    dispatch(handleToolsEvents("editTool"));
    dispatch(handleSheetEvents(true));
    dispatch(handleToolsData(item));
  };

  const viewTool = (item: rowToolsData) => {
    dispatch(handleToolsEvents("viewTool"));
    dispatch(handleSheetEvents(true));
    dispatch(handleToolsData(item));
  };

  const closeAddToolSheetEventHandler = () => {
    dispatch(handleSheetEvents(false));
  };

  // --- Returned values for the component ---
  return {
    // State
    tools,
    totalRecords,
    isLoading,
    isFilterListLoading,
    pager,
    searchText,
    setSearchText,
    filterOptions,
    selectedFilters,
    openAddNewToolModal: sheetEvent,
    // Permissions
    isCreatUpdateAgentTool,
    // Handlers
    setPageNo,
    handlePageChange,
    handleSetSearch,
    handleSetFilters,
    resetAllFiltersAndSearch,
    editTool,
    viewTool,
    closeAddToolSheetEventHandler,
  };
};
