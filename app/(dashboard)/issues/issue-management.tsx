"use client";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";
import { Header } from "./components/header";
import IssuesDataTable from "./components/data-table";
import { useIssueOperation } from "./hook/useIssueOpration";

const IssueManagementPage = () => {
  const isHeaderStuck = useHeaderStuck();
  const {
    activeTab,
    setActiveTab,
    issuesList,
    isLoading,
    allTagsList,
    hasMore,
    isFetchingMore,
    loadMoreIssues,
    updateIssueInList,
    refreshIssuesList,
    searchText,
    setSearchText,
  } = useIssueOperation();

  return (
    <div className="py-6 flex flex-col gap-6">
      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isHeaderStuck ? "border-b bg-background py-4" : ""
        }`}
      >
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </div>

      <div className="px-6">
        <IssuesDataTable
          issuesList={issuesList}
          allTagsList={allTagsList}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
          loadMoreIssues={loadMoreIssues}
          isLoading={isLoading}
          updateIssueInList={updateIssueInList}
          refreshIssuesList={refreshIssuesList}
        />
      </div>
    </div>
  );
};

export default IssueManagementPage;
