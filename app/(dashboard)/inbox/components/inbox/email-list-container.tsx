import Loader from "@/components/loader";
import { IEmailData } from "@/types/types";
import { Inbox } from "lucide-react";
import React from "react";
import { EmailList } from "../inbox/email-list";
import { EmptyState } from "@/components/empty-state/empty-state";

interface EmailListContainerProps {
  emails: IEmailData[];
  selectedEmailId: string | null;
  onEmailSelect: (id: string) => void;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isGlobalLoading: boolean;
  originalEmailCount: number;
  checkList: string[];
  handleSelectAllEmails: () => void;
  handleClearAllSelectedEmails: () => void;
  onChecklistChange: (emailId: string) => void;
  hasActiveFilters: any;
  selectedFilters: any;
  setChecklist: any;
}

export const EmailListContainer: React.FC<EmailListContainerProps> = ({
  emails,
  selectedEmailId,
  onEmailSelect,
  isLoading,
  hasMore,
  onLoadMore,
  isGlobalLoading,
  originalEmailCount,
  checkList,
  handleSelectAllEmails,
  handleClearAllSelectedEmails,
  onChecklistChange,
  hasActiveFilters,
  selectedFilters,
  setChecklist,
}) => {
  // Show loader during initial load
  if (isGlobalLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    );
  }

  // Show empty state when no emails exist at all
  if (!isLoading && originalEmailCount === 0) {
    return <EmptyState variant="fullpage" title="No emails found" icon={Inbox} />;
  }

  // Show filtered empty state when emails exist but none match filters
  if (!isLoading && originalEmailCount > 0 && emails.length === 0) {
    return (
      <EmptyState
        variant="fullpage"
        title="No emails match your current filters"
        icon={Inbox}
      />
    );
  }

  return (
    <EmailList
      emails={emails}
      totalEmailCount={originalEmailCount}
      selectedEmailId={selectedEmailId}
      onEmailSelect={onEmailSelect}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      checkList={checkList}
      handleSelectAllEmails={handleSelectAllEmails}
      handleClearAllSelectedEmails={handleClearAllSelectedEmails}
      onChecklistChange={onChecklistChange}
      hasActiveFilters={hasActiveFilters}
      selectedFilters={selectedFilters}
      setChecklist={setChecklist}
    />
  );
};
