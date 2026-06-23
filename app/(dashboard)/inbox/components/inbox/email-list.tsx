import {
  resetEmailState,
  setCurrentPage,
} from "@/redux/new-inbox/inbox-email-slice";
import type { IEmailData } from "@/types/types";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useEmailPolling } from "../../hooks/useEmailPolling";
import { EmailListItem } from "./email-list-ltem";
import { FloatingSelectionBar } from "./floating-selection-bar";
import { UpdateButton } from "./update-button";

interface EmailListProps {
  emails: IEmailData[];
  selectedEmailId: string | null;
  totalEmailCount: number;
  onEmailSelect: (id: string) => void;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: any;
  checkList: string[];
  handleSelectAllEmails: () => void;
  handleClearAllSelectedEmails: () => void;
  onChecklistChange: (emailId: string) => void;
  hasActiveFilters: any;
  selectedFilters: any;
  setChecklist: any;
}

export function EmailList({
  emails,
  selectedEmailId,
  totalEmailCount,
  onEmailSelect,
  isLoading,
  hasMore,
  onLoadMore,
  checkList,
  handleSelectAllEmails,
  handleClearAllSelectedEmails,
  onChecklistChange,
  hasActiveFilters,
  selectedFilters,
  setChecklist,
}: EmailListProps) {
  const dispatch = useDispatch();
  const observer = useRef<IntersectionObserver | null>(null);
  const { applyPendingUpdates, pendingUpdates } = useEmailPolling();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Refs for each email item
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to selected email when it changes
  useEffect(() => {
    if (selectedEmailId && itemRefs.current[selectedEmailId]) {
      itemRefs.current[selectedEmailId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedEmailId]);

  const handleScrollTop = () => {
    if (!scrollContainerRef.current) return;

    if (scrollContainerRef.current.scrollTop <= 0) {
      dispatch(setCurrentPage(1));
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    container.addEventListener("scroll", handleScrollTop);

    return () => container.removeEventListener("scroll", handleScrollTop);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, hasMore]
  );

  // Handler to update and scroll to top
  const handleUpdateAndScroll = () => {
    applyPendingUpdates();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto bg-white dark:bg-slate-800/50"
    >
      {hasActiveFilters && emails.length !== 0 && (
        <div className="sticky top-0 z-50 px-5">
          <FloatingSelectionBar
            selectedCount={checkList.length || 0}
            totalCount={emails?.length}
            totalEmailCount={totalEmailCount}
            selectedFilters={selectedFilters}
            onSelectAll={handleSelectAllEmails}
            onClearSelection={handleClearAllSelectedEmails}
            checkList={checkList}
            setChecklist={setChecklist}
            className="rounded-none border-t-0"
          />
        </div>
      )}

      <div className="px-5 py-4">
        {!hasActiveFilters && (
          <UpdateButton
            onUpdate={handleUpdateAndScroll}
            pendingCount={pendingUpdates.count}
          />
        )}

        <div className="flex flex-col gap-4">
          {emails.map((email, index) => {
            const isLastElement = index === emails.length - 1;

            return (
              <div
                key={email.id}
                ref={(el) => {
                  itemRefs.current[email.id] = el;
                  if (isLastElement) lastPostElementRef(el);
                }}
              >
                <EmailListItem
                  email={email}
                  isSelected={selectedEmailId === email.id}
                  onSelect={onEmailSelect}
                  checkList={checkList}
                  onChecklistChange={onChecklistChange}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            );
          })}

          {isLoading && (
            <div className="py-4 text-center text-gray-500 dark:text-slate-400">
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
