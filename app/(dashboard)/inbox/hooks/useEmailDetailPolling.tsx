import { errorMessageHandler } from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  replaceEmailById,
  setIsRetry,
} from "@/redux/new-inbox/inbox-email-slice";
import { RootState } from "@/redux/store";
import { IEmailData } from "@/types/types";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

interface UseEmailDetailPollingProps {
  selectedEmailId: string;
  selectedEmailData: IEmailData;
}

export const useEmailDetailPolling = ({
  selectedEmailId,
  selectedEmailData,
}: UseEmailDetailPollingProps) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch();
  const { isRetry } = useSelector(
    (state: RootState) => state.inboxEmailReducer
  );
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestEmailRef = useRef<IEmailData>(selectedEmailData);
  const getEmailDetail = useCallback(async () => {
    if (!selectedEmailId) return;

    try {
      const response = await axiosAuth.get(`/emails/${selectedEmailId}`);
      const latestEmailData = response?.data?.emails[0];
      if (
        selectedEmailData?.status !== latestEmailData?.status ||
        selectedEmailData?.agent_task_counts !==
          latestEmailData?.agent_task_counts
      ) {
        dispatch(
          replaceEmailById({
            id: selectedEmailId,
            updatedEmail: latestEmailData,
          })
        );
        latestEmailRef.current = latestEmailData;
        if (
          ["SUCCESSFUL", "INCOMPLETE", "FAILED"].includes(
            latestEmailData.status
          )
        ) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          dispatch(setIsRetry(false));
        }
      }
    } catch (error) {
      errorMessageHandler(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosAuth, selectedEmailId, dispatch]);

  useEffect(() => {
    if (!selectedEmailId) return;
    pollingIntervalRef.current = setInterval(() => {
      const status = latestEmailRef.current.status;
      if (status === "EXECUTING" || status === "QUEUED") {
        getEmailDetail();
      }
    }, 5000);
    getEmailDetail();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmailId, isRetry]);

  return {
    selectedEmail: selectedEmailId ? selectedEmailData : null,
    getEmailDetail,
  };
};
