import {
  convertToUnixTimestamp,
  errorMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  replaceEmails,
  setHasMore,
  setTotalEmails,
} from "@/redux/new-inbox/inbox-email-slice";
import { RootState } from "@/redux/store";
import { IEmailData } from "@/types/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

export const pendingUpdatesRef = {
  current: {
    emails: [] as IEmailData[],
    count: 0,
    isInitialLoad: true,
  },
};

export const useEmailPolling = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch();
  const store = useStore<RootState>();

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousEmailsRef = useRef<IEmailData[]>([]);
  const isInitialLoadRef = useRef(true);
  const lastQueryHashRef = useRef<string | null>(null);
  const prevTopReceivedAtRef = useRef<number>(0);
  const latestEmailDataRef = useRef<Map<string, IEmailData>>(new Map());
  const prevTotalCountRef = useRef<number>(0);

  const pendingUpdatesStateRef = useRef<{
    emails: IEmailData[];
    count: number;
  }>({
    emails: [],
    count: 0,
  });

  const [pendingUpdates, setPendingUpdates] = useState<{
    emails: IEmailData[];
    count: number;
  }>({
    emails: [],
    count: 0,
  });

  useEffect(() => {
    pendingUpdatesStateRef.current = pendingUpdates;
  }, [pendingUpdates]);

  const { emails: currentEmails, currentPage: page } = useSelector(
    (state: RootState) => state.inboxEmailReducer
  );
  const filters = useSelector(
    (state: RootState) => state.inboxFiltersReducer.filters
  );
  const searchText = useSelector(
    (state: RootState) => state?.searchReducer?.searchText
  );

  const filtersObj = useMemo(() => {
    const obj: Record<string, any> = {};
    if (filters?.status?.length) obj.status = filters.status;
    if (filters?.mailbox?.length) obj.mailbox_email = filters.mailbox;
    if (filters?.agent?.length) obj.agent = filters.agent;
    if (filters?.tags?.length) obj.tags = filters.tags;
    return obj;
  }, [filters]);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams({
      page: "1",
      page_size: "10",
      sort_by: "created_at",
      sort_order: "desc",
    });

    if (Object.keys(filtersObj).length > 0) {
      params.append("filters", JSON.stringify(filtersObj));
    }

    if (filters?.date_range) {
      const fromDate = convertToUnixTimestamp(filters.date_range.from, "start");
      const toDate = convertToUnixTimestamp(filters.date_range.to, "end");
      if (fromDate) params.append("from_date", String(fromDate));
      if (toDate) params.append("to_date", String(toDate));
    }

    if (searchText && typeof searchText === "string" && searchText.trim()) {
      params.append("keyword", searchText.trim());
    }

    return params;
  }, [filtersObj, filters?.date_range, searchText]);

  const applyPendingUpdates = useCallback(() => {
    const freshState = store.getState();
    const freshEmails = freshState.inboxEmailReducer.emails;
    const currentPendingUpdates = pendingUpdatesStateRef.current;

    if (currentPendingUpdates.emails.length > 0) {
      const latestPendingEmails = currentPendingUpdates.emails.map(
        (pendingEmail) => {
          const latestFromRef = latestEmailDataRef.current.get(pendingEmail.id);
          return (
            latestFromRef ||
            freshEmails.find((email) => email.id === pendingEmail.id) ||
            pendingEmail
          );
        }
      );

      const existingEmailsMap = new Map(
        freshEmails
          .filter(
            (email) =>
              !currentPendingUpdates.emails.some(
                (updatedEmail) => updatedEmail.id === email.id
              )
          )
          .map((email) => [email.id, email])
      );

      const sortedNewEmails = [...latestPendingEmails].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const sortedExistingEmails = Array.from(existingEmailsMap.values()).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const mergedEmails = [...sortedNewEmails, ...sortedExistingEmails];

      dispatch(replaceEmails(mergedEmails));
      setPendingUpdates({ emails: [], count: 0 });
    }
  }, [store, dispatch]);

  const getEmailList = useCallback(async () => {
    if (loading) return;

    try {
      const freshState = store.getState();
      const stateEmails = freshState.inboxEmailReducer.emails;
      const currentPage = freshState.inboxEmailReducer.currentPage;
      const prevTopSnapshot = prevTopReceivedAtRef.current;
      const queryParams = buildQueryParams();

      const result = await axiosAuth.get(
        `${url.LIST_MAILBOX}?${queryParams.toString()}`
      );

      if (result?.status === 200) {
        const newEmails: IEmailData[] = result?.data?.emails || [];

        const newTotalCount = result?.data?.total || 0;
        const prevTotalCount = prevTotalCountRef.current; // update the latest email data
        newEmails.forEach((email) => {
          latestEmailDataRef.current.set(email.id, email);
        });

        if (!filters?.status?.includes("ARCHIVED")) {
          previousEmailsRef.current = previousEmailsRef.current.filter(
            (e) => e.status !== "ARCHIVED"
          );
        }

        const currentQueryHash = queryParams.toString();
        const queryChanged = currentQueryHash !== lastQueryHashRef.current;

        // SCENARIO 1: Initial load or query changed (filters/search changed)
        if (isInitialLoadRef.current || queryChanged) {
          const sortedEmails = [...newEmails].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          // dispatch(replaceEmails(sortedEmails));
          dispatch(setHasMore(newEmails.length >= 10));
          setPendingUpdates({ emails: [], count: 0 });

          // Reset refs for new query
          isInitialLoadRef.current = false;
          previousEmailsRef.current = newEmails;
          lastQueryHashRef.current = currentQueryHash;

          const newestInNewQuery =
            newEmails.length > 0
              ? new Date(newEmails[0].created_at).getTime()
              : 0;
          prevTopReceivedAtRef.current = newestInNewQuery;
          prevTotalCountRef.current = newTotalCount;
        }
        // SCENARIO 2: Polling updates
        else {
          // Detect brand new emails
          const brandNew: IEmailData[] = [];
          const prevIds = new Set(previousEmailsRef.current.map((e) => e.id));

          for (const newEmail of newEmails) {
            const matchingPrev = prevIds.has(newEmail.id);
            if (!matchingPrev) {
              const receivedTime = new Date(newEmail.created_at).getTime();
              if (receivedTime > prevTopSnapshot) {
                brandNew.push(newEmail);
              }
            }
          }

          if (currentPage === 1) {
            const currentPage1Count = Math.min(10, stateEmails.length);
            const currentPage1Ids = new Set(
              stateEmails.slice(0, currentPage1Count).map((e) => e.id)
            );

            const page2PlusEmails = stateEmails.slice(currentPage1Count);

            const freshPage1Emails = [...newEmails];

            const allEmails = [...freshPage1Emails, ...page2PlusEmails];

            const sortedEmails = allEmails.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );

            const hasChanged =
              sortedEmails.length !== stateEmails.length ||
              sortedEmails.some((email, idx) => {
                if (!stateEmails[idx]) return true;
                return (
                  JSON.stringify(email) !== JSON.stringify(stateEmails[idx])
                );
              });

            if (hasChanged) {
              if (
                newTotalCount !== prevTotalCount &&
                Object.keys(filtersObj).length > 0
              ) {
                prevTotalCountRef.current = newTotalCount;
                dispatch(setTotalEmails(newTotalCount));
                dispatch(replaceEmails(sortedEmails));
              } else {
                const prevIds = new Set(stateEmails.map((e) => e.id));
                const updatedExisting = newEmails
                  .filter((e) => prevIds.has(e.id))
                  .map((e) => latestEmailDataRef.current.get(e.id) || e);
                const updatedMap = new Map(stateEmails.map((e) => [e.id, e]));
                updatedExisting.forEach((email) =>
                  updatedMap.set(email.id, email)
                );
                const merged = Array.from(updatedMap.values()).sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
                dispatch(replaceEmails(merged));
              }
              prevTotalCountRef.current = newTotalCount;
            }

            // Queue brand new emails
            if (brandNew.length > 0) {
              setPendingUpdates((prev) => {
                const allQueued = [...prev.emails, ...brandNew];
                const uniqueQueued = Array.from(
                  new Map(allQueued.map((email) => [email.id, email])).values()
                );
                return { emails: uniqueQueued, count: uniqueQueued.length };
              });
            }
          } else {
            const emailMap = new Map(stateEmails.map((e) => [e.id, e]));
            let hasUpdates = false;

            // Update emails that exist in state with fresh data
            for (const email of newEmails) {
              if (emailMap.has(email.id)) {
                const existing = emailMap.get(email.id);

                if (JSON.stringify(existing) !== JSON.stringify(email)) {
                  emailMap.set(email.id, email);
                  hasUpdates = true;
                }
              }
            }

            if (hasUpdates) {
              const mergedEmails = Array.from(emailMap.values()).sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );
              dispatch(replaceEmails(mergedEmails));
            }

            // Queue brand new emails
            if (brandNew.length > 0) {
              setPendingUpdates((prev) => {
                const allQueued = [...prev.emails, ...brandNew];
                const uniqueQueued = Array.from(
                  new Map(allQueued.map((email) => [email.id, email])).values()
                );
                return { emails: uniqueQueued, count: uniqueQueued.length };
              });
            }
          }

          // Update refs after successful polling
          previousEmailsRef.current = newEmails;
          lastQueryHashRef.current = currentQueryHash;

          const newestInBatch =
            newEmails.length > 0
              ? new Date(newEmails[0].created_at).getTime()
              : prevTopReceivedAtRef.current;

          if (newestInBatch > prevTopReceivedAtRef.current) {
            prevTopReceivedAtRef.current = newestInBatch;
          }
        }
      }
    } catch (error) {
      errorMessageHandler(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, axiosAuth, loading, dispatch, buildQueryParams, filters?.status]);

  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      getEmailList();
    }, 5000);

    getEmailList();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [getEmailList]);

  useEffect(() => {
    latestEmailDataRef.current.clear();
  }, [filtersObj, searchText]);

  return { applyPendingUpdates, pendingUpdates };
};
