"use client";

import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import CustomAlertDialog from "@/components/custom-alert-dialog";
import { setSelectedEmailId } from "@/redux/new-inbox/inbox-email-slice";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";
import { AttachmentViewer } from "./components/attachment-viewer";
import { InboxHeader } from "./components/inbox/inbox-header";
import { useEmailData } from "./hooks/useEmailData";
import { useEmailOperations } from "./hooks/useEmailOperations";
import { useAttachmentOperations } from "./hooks/useAttachmentOperations";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { EmailListContainer } from "./components/inbox/email-list-container";
import { EmailDetailContainer } from "./components/inbox/email-detail-container";
import { useEmailFiltering } from "./hooks/useEmailFiltering";
import { RootState } from "@/redux/store";

// Constants
const PANEL_SIZES = {
  EMAIL_LIST_DEFAULT: 33,
  EMAIL_LIST_MIN: 30,
  EMAIL_DETAIL_DEFAULT: 67,
  EMAIL_DETAIL_MIN: 50,
} as const;

const MIN_EMAIL_LIST_WIDTH = 300;

interface ConfirmationDialogProps {
  open: boolean;
  type: "archive" | "delete";
  onOpenChange: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  type,
  onOpenChange,
  onConfirm,
  isLoading,
}) => {
  const dialogConfig = {
    archive: {
      title: "Are you sure you want to archive this email?",
      description:
        "This action will archive the email and related tasks and remove them from your inbox list.",
    },
    delete: {
      title: "Are you sure you want to delete this archived email?",
      description:
        "This action will permanently delete the archived email and related tasks and remove them from your inbox list.",
    },
  };

  const config = dialogConfig[type];

  return (
    <CustomAlertDialog
      open={open}
      title={config.title}
      description={config.description}
      onOpenChange={onOpenChange}
      handleAlert={onConfirm}
      isLoading={isLoading}
    />
  );
};

export default function InboxView() {
  const dispatch = useDispatch();
  const detailScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { loading } = useAxiosAuth();
  const isHeaderStuck = useHeaderStuck();
  const [checkList, setChecklist] = useState<string[]>([]);

  const filters = useSelector(
    (state: RootState) => state.inboxFiltersReducer.filters
  );
  const searchText = useSelector(
    (state: RootState) => state.searchReducer.searchText
  );

  // Check if any filters are active or search text exists
  const presetDateLabels = [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 30 days",
  ];

  const hasActiveFilters =
    Object.entries(filters).some(([key, value]) => {
      if (key === "date_range") {
        return (value?.from && value?.to) || presetDateLabels.includes(value);
      }
      return Array.isArray(value) ? value.length > 0 : !!value;
    }) ||
    (searchText && searchText.trim() !== "");

  // Data hooks
  const {
    emailData,
    selectedEmailId,
    isLoading,
    hasMore,
    totalEmails,
    handleLoadMore,
    refreshEmailList,
  } = useEmailData();

  const filteredEmails = useEmailFiltering(emailData);

  // Operation hooks
  const {
    isDialogLoading,
    confirmationDialog,
    handleArchive,
    handleDelete,
    handleConfirm,
    handleCancel,
    setTargetEmailId,
  } = useEmailOperations();

  const {
    selectedDocumentData,
    openAttachmentDetails,
    handleOpenAttachmentEvent,
    closeAttachmentDetails,
  } = useAttachmentOperations();

  // Event handlers
  const handleEmailSelect = (id: string) => {
    dispatch(setSelectedEmailId(id));
  };

  const handleEmailArchive = () => {
    const selectedEmail = emailData.find(
      (email) => email.id === selectedEmailId
    );
    if (selectedEmail) {
      setTargetEmailId(selectedEmail.id);
      handleArchive();
    }
  };

  const handleEmailDelete = () => {
    const selectedEmail = emailData.find(
      (email) => email.id === selectedEmailId
    );
    if (selectedEmail) {
      setTargetEmailId(selectedEmail.id);
      handleDelete();
    }
  };

  const handleChecklistChange = (emailId: string) => {
    setChecklist((prevChecklist) =>
      prevChecklist.includes(emailId)
        ? prevChecklist.filter((id) => id !== emailId)
        : [...prevChecklist, emailId]
    );
  };

  const handleSelectAllEmails = () => {
    setChecklist(emailData.map((email) => email.id));
  };

  // clear checklist when filter is removed or when emailData changes
  useEffect(() => {
    setChecklist([]);
  }, [hasActiveFilters]);

  // Reset scroll position when email selection changes
  useEffect(() => {
    if (detailScrollContainerRef.current) {
      detailScrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedEmailId]);

  useEffect(() => {
    if (
      selectedEmailId &&
      !filteredEmails.some((email) => email.id === selectedEmailId)
    ) {
      dispatch(setSelectedEmailId(null));
    }
  }, [filteredEmails, selectedEmailId, dispatch]);

  return (
    <>
      <div className="h-screen flex flex-col">
        <div
          className={`sticky top-0 bg-background z-10 ${
            isHeaderStuck ? "border-b bg-background" : ""
          }`}
        >
          <InboxHeader
            emailIds={filteredEmails.map((e) => e.id)}
            checkList={checkList}
            hasActiveFilters={hasActiveFilters}
            setChecklist={setChecklist}
            totalEmails={totalEmails || 0}
          />
        </div>

        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 overflow-hidden min-h-0 rounded-none border-0"
        >
          <ResizablePanel
            defaultSize={PANEL_SIZES.EMAIL_LIST_DEFAULT}
            minSize={PANEL_SIZES.EMAIL_LIST_MIN}
            className={`min-w-[${MIN_EMAIL_LIST_WIDTH}px]`}
          >
            <EmailListContainer
              emails={filteredEmails}
              selectedEmailId={selectedEmailId}
              onEmailSelect={handleEmailSelect}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              isGlobalLoading={loading}
              originalEmailCount={totalEmails || 0}
              checkList={checkList}
              handleSelectAllEmails={handleSelectAllEmails}
              handleClearAllSelectedEmails={() => setChecklist([])}
              onChecklistChange={handleChecklistChange}
              hasActiveFilters={hasActiveFilters}
              selectedFilters={filters}
              setChecklist={setChecklist}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={PANEL_SIZES.EMAIL_DETAIL_DEFAULT}
            minSize={PANEL_SIZES.EMAIL_DETAIL_MIN}
            className="bg-muted/20"
          >
            <div
              ref={detailScrollContainerRef}
              className="h-full overflow-y-auto"
            >
              <EmailDetailContainer
                emailData={emailData}
                selectedEmailId={selectedEmailId}
                onArchive={handleEmailArchive}
                onDelete={handleEmailDelete}
                onOpenAttachment={handleOpenAttachmentEvent}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {openAttachmentDetails && selectedDocumentData && (
        <AttachmentViewer
          openAttachmentSheet={openAttachmentDetails}
          closeAttachmentDetailsEvent={closeAttachmentDetails}
          attachment={selectedDocumentData}
        />
      )}

      <ConfirmationDialog
        open={confirmationDialog.open}
        type={confirmationDialog.type as "archive" | "delete"}
        onOpenChange={handleCancel}
        onConfirm={handleConfirm}
        isLoading={isDialogLoading}
      />
    </>
  );
}
