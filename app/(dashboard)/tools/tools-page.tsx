"use client";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";
import HeaderSidebar from "./header-sidebar";
import { useToolsPage } from "./hook/useToolsPage";
import ToolContent from "./tool-content";

const ToolsMainPage = () => {
  const isHeaderStuck = useHeaderStuck();
  const hookData = useToolsPage();

  return (
    <div className="flex flex-col py-6 gap-6">
      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isHeaderStuck ? "border-b bg-background py-4" : ""
        }`}
      >
        <HeaderSidebar
          searchText={hookData.searchText}
          handleSetSearch={hookData.handleSetSearch}
          filterOptions={hookData.filterOptions}
          selectedFilters={hookData.selectedFilters}
          handleSetFilters={hookData.handleSetFilters}
          isCreateAgentsTools={hookData.isCreatUpdateAgentTool}
        />
      </div>
      <div className="px-6">
        <ToolContent {...hookData} />
      </div>
    </div>
  );
};

export default ToolsMainPage;
