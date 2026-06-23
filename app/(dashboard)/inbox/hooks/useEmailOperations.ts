import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import * as url from "@/helper/url-helper";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import {
  setCurrentPage,
  resetEmailState,
  setSelectedEmailId,
} from "@/redux/new-inbox/inbox-email-slice";
import { useEmailData } from "./useEmailData";

export const useEmailOperations = () => {
  const { axiosAuth } = useAxiosAuth();
  const { refreshEmailList } = useEmailData();
  const dispatch = useDispatch();
  const [isDialogLoading, setDialogLoading] = useState(false);
  const [isConfirmationTrue, setIsConfirmationTrue] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    type: "archive",
    targetId: null as string | null,
  });

  const handleArchive = useCallback(() => {
    setIsConfirmationTrue(false);
    setConfirmationDialog((prev) => ({
      ...prev,
      open: true,
      type: "archive",
    }));
  }, []);

  const handleDelete = useCallback(() => {
    setIsConfirmationTrue(false);
    setConfirmationDialog((prev) => ({
      ...prev,
      open: true,
      type: "delete",
    }));
  }, []);

  const setTargetEmailId = useCallback((emailId: string) => {
    setConfirmationDialog((prev) => ({
      ...prev,
      targetId: emailId,
    }));
  }, []);

  const handleConfirm = async () => {
    if (!confirmationDialog.targetId) return;

    setDialogLoading(true);
    setIsConfirmationTrue(false);
    try {
      if (confirmationDialog.type === "archive") {
        const requestBody = {
          email_ids: [confirmationDialog.targetId],
        };
        const result = await axiosAuth.post(url.ARCHIVE_EMAIL, requestBody);
        if (result.status === 200) {
          successMessageHandler(result.data.message);
          dispatch(setCurrentPage(1));
          dispatch(resetEmailState());
          dispatch(setSelectedEmailId(""));
          refreshEmailList();
          setIsConfirmationTrue(true);
        }
      } else if (confirmationDialog.type === "delete") {
        const requestBody = {
          email_ids: [confirmationDialog.targetId],
        };
        const result = await axiosAuth.delete(url.EMAIL_DELETE, {
          data: requestBody,
        });
        if (result.status === 200) {
          successMessageHandler(result.data.message);
          dispatch(setCurrentPage(1));
          dispatch(resetEmailState());
          dispatch(setSelectedEmailId(""));
          refreshEmailList();
          setIsConfirmationTrue(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      errorMessageHandler(error);
    } finally {
      setDialogLoading(false);
      setConfirmationDialog({
        ...confirmationDialog,
        open: false,
        targetId: null,
      });
    }
  };

  const handleCancel = useCallback(() => {
    // Reset confirmation state when canceling
    setIsConfirmationTrue(false);
    setConfirmationDialog((prev) => ({
      ...prev,
      open: false,
      targetId: null,
    }));
  }, []);

  return {
    isDialogLoading,
    isConfirmationTrue,
    confirmationDialog,
    handleArchive,
    handleDelete,
    handleConfirm,
    handleCancel,
    setTargetEmailId,
  };
};
