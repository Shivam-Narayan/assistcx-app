import { useState, useCallback } from "react";
import { IAttachmentDetails } from "@/types/types";

export const useAttachmentOperations = () => {
  const [selectedDocumentData, setSelectedDocumentData] =
    useState<IAttachmentDetails | null>(null);
  const [openAttachmentDetails, setOpenAttachmentDetailsEvent] =
    useState(false);

  const handleOpenAttachmentEvent = useCallback(
    (attachment: IAttachmentDetails) => {
      setSelectedDocumentData(attachment);
      setOpenAttachmentDetailsEvent(true);
    },
    []
  );

  const closeAttachmentDetails = useCallback(() => {
    setOpenAttachmentDetailsEvent(false);
    setSelectedDocumentData(null);
  }, []);

  return {
    selectedDocumentData,
    openAttachmentDetails,
    handleOpenAttachmentEvent,
    closeAttachmentDetails,
  };
};
