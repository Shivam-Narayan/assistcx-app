"use client";

import { AddEditToolsSheet } from "@/app/(dashboard)/tools/add-edit-tool-sheet";
import CustomAgentToolCard from "@/components/agent-tools";
import PaginationComponent from "@/components/pagination-componet";
import { Sheet } from "@/components/ui/sheet";
import { Bolt } from "lucide-react";
import { Tool } from "./hook/useToolsPage";
import { LoadingTools } from "./loading";
import { EmptyState } from "@/components/empty-state/empty-state";

interface toolsProps {
  isLoading: boolean;
  totalRecords: number;
  tools: Tool[];
  pager: any;
  closeAddToolSheetEventHandler: () => void;
  isCreatUpdateAgentTool: boolean;
  editTool: (tool: Tool) => void;
  viewTool: (tool: Tool) => void;
  openAddNewToolModal: boolean;
  handlePageChange: (page: number) => void;
}

const ToolContent = ({
  isLoading,
  totalRecords,
  tools,
  pager,
  closeAddToolSheetEventHandler,
  isCreatUpdateAgentTool,
  editTool,
  viewTool,
  openAddNewToolModal,
  handlePageChange,
}: toolsProps) => {
  if (isLoading) {
    return (
      <div className="h-full w-full max-w-4xl flex flex-col gap-4 mx-auto">
        <LoadingTools />
      </div>
    );
  }

  return (
    <>
      <Sheet>
        <div className="flex justify-center pb-14 xl:px-8">
          <div className="w-full max-w-full xl:max-w-4xl">
            {/* Tools List Section */}
            {tools.length > 0 ? (
              tools.map((item: any, i: any) => (
                <CustomAgentToolCard
                  key={item.id}
                  className="mb-5 cursor-pointer hover:shadow-md transition-all duration-300"
                  index={i}
                  tool={item}
                  pageType="3"
                  editTool={editTool}
                  viewTool={viewTool}
                  isCreatUpdateAgentTool={isCreatUpdateAgentTool}
                />
              ))
            ) : (
              <EmptyState variant="fullpage" title="No Tools Found" icon={Bolt} />
            )}

            {tools.length !== 0 && (
              <div className="pt-5 flex justify-center items-center">
                <PaginationComponent
                  pager={pager}
                  totalRecords={totalRecords}
                  setPagination={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        <AddEditToolsSheet
          closeAddToolSheetEvent={closeAddToolSheetEventHandler}
          addToolSheetOpenEvent={openAddNewToolModal}
          isCreatUpdateAgentTool={isCreatUpdateAgentTool}
        />
      </Sheet>
    </>
  );
};

export default ToolContent;
