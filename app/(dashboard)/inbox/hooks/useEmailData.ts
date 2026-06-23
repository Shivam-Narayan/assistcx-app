import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import * as url from "@/helper/url-helper";
import {
  convertToUnixTimestamp,
  errorMessageHandler,
} from "@/helper/helper-function";
import {
  setEmails,
  setSelectedEmailId,
  setCurrentPage,
  setHasMore,
  setTotalEmails,
  resetEmailState,
  setIsLoading,
} from "@/redux/new-inbox/inbox-email-slice";

export const useEmailData = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch();

  const {
    emails: emailData,
    selectedEmailId,
    currentPage: page,
    hasMore,
    totalEmails,
    isLoading,
  } = useSelector((state: RootState) => state.inboxEmailReducer);

  const filters = useSelector(
    (state: RootState) => state.inboxFiltersReducer.filters
  );
  const searchText = useSelector(
    (state: RootState) => state?.searchReducer?.searchText
  );

  const prevFiltersRef = useRef(filters);
  const prevSearchTextRef = useRef(searchText);

  const limit = 10;
  const sortBy = "created_at";
  const sortOrder = "desc";

  const filtersObj = useMemo(() => {
    const obj: Record<string, any> = {};
    if (filters?.status?.length) {
      obj.status = filters.status;
    }
    if (filters.mailbox?.length) {
      obj.mailbox_email = filters.mailbox;
    }
    if (filters.tags?.length) {
      obj.tags = filters.tags;
    }

    if (filters.agent?.length) {
      obj.agent = filters.agent;
    }
    return obj;
  }, [filters]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: limit.toString(),
      sort_by: sortBy,
      sort_order: sortOrder,
    });

    if (Object.keys(filtersObj).length > 0) {
      params.append("filters", JSON.stringify(filtersObj));
    }

    if (filters.date_range) {
      const fromDate = convertToUnixTimestamp(filters.date_range.from, "start");
      const toDate = convertToUnixTimestamp(filters.date_range.to, "end");

      params.append("from_date", fromDate.toString());
      params.append("to_date", toDate.toString());
    }

    if (searchText?.trim()) {
      params.append("keyword", searchText.trim());
    }

    return params;
  }, [page, filtersObj, filters.date_range, searchText]);

  const latestRequestRef = useRef(0);

  const getEmailList = async (...args: (number | "deleteOrArchive")[]) => {
    if (loading) return;

    const requestId = ++latestRequestRef.current;

    let currentPageCount: number | undefined;
    let refetchActionType: "deleteOrArchive" | undefined;

    args.forEach((arg) => {
      if (typeof arg === "number") currentPageCount = arg;
      else refetchActionType = arg;
    });

    if (currentPageCount && currentPageCount > 10) {
      currentPageCount = 10;
    }

    try {
      dispatch(setIsLoading(true));

      if (currentPageCount) {
        queryParams.set("page", "1");
        queryParams.set(
          "page_size",
          (currentPageCount ? currentPageCount * 10 : 10).toString()
        );
      }

      const result = await axiosAuth.get(
        `${url.LIST_MAILBOX}?${queryParams.toString()}`
      );

      if (requestId !== latestRequestRef.current) {
        return;
      }

      if (result?.status === 200) {
        const data = result?.data?.emails;
        const total = result?.data?.total;

        if (typeof total === "number") {
          dispatch(setTotalEmails(total));
        }

        if (!data?.length) {
          dispatch(setHasMore(false));
          return;
        }

        if (refetchActionType !== "deleteOrArchive" || page === 1) {
          dispatch(setEmails(data));
        }
      }
    } catch (error) {
      if (requestId !== latestRequestRef.current) return;
      console.error("Error fetching emails:", error);
      errorMessageHandler(error);
      dispatch(setHasMore(false));
    } finally {
      if (requestId === latestRequestRef.current) {
        dispatch(setIsLoading(false));
      }
    }
  };

  useEffect(() => {
    const hasFilterChanges = Object.keys(filters).length > 0;
    const hasSearchChanges = searchText?.trim() !== "";

    const filtersChanged =
      JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    const searchChanged = prevSearchTextRef.current !== searchText;

    if (
      (hasFilterChanges || hasSearchChanges) &&
      (filtersChanged || searchChanged)
    ) {
      const currentSelectedId = selectedEmailId;
      dispatch(setCurrentPage(1));
      dispatch(resetEmailState());
      if (page === 1) {
        getEmailList().then(() => {
          if (currentSelectedId) {
            const emailExists = emailData.some(
              (email) => email.id === currentSelectedId
            );
            if (emailExists) {
              dispatch(setSelectedEmailId(currentSelectedId));
            }
          }
        });
      }
    } else if (
      !hasFilterChanges &&
      !hasSearchChanges &&
      (filtersChanged || searchChanged)
    ) {
      const currentSelectedId = selectedEmailId;
      dispatch(setCurrentPage(1));
      dispatch(resetEmailState());
      if (page === 1) {
        getEmailList().then(() => {
          if (currentSelectedId) {
            const emailExists = emailData.some(
              (email) => email.id === currentSelectedId
            );
            if (emailExists) {
              dispatch(setSelectedEmailId(currentSelectedId));
            }
          }
        });
      }
    }

    prevFiltersRef.current = filters;
    prevSearchTextRef.current = searchText;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchText]);

  useEffect(() => {
    if (loading) return;

    if (page === 1) {
      getEmailList();
      dispatch(setCurrentPage(1));
    } else if (page > 1) {
      getEmailList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, page]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && (totalEmails === null || emailData.length < totalEmails)) {
      dispatch(setCurrentPage(page + 1));
    }
  }, [hasMore, totalEmails, emailData, page, dispatch]);

  return {
    emailData,
    selectedEmailId,
    hasMore,
    handleLoadMore,
    isLoading,
    totalEmails,
    refreshEmailList: getEmailList,
  };
};
