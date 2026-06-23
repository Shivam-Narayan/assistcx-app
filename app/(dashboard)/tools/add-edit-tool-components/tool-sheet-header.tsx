"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { handleToolsEvents } from "@/redux/agents/create-agents-data-slice";
import { useAppSelector } from "@/redux/store";
import { Pencil, Play, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { apiType } from "./tool-interfaces";

interface ToolSheetHeaderProps {
  toggleTestingModal: (value: boolean) => void;
  userEvents: string;
  inputSchemaData: any;
  isCreatUpdateAgentTool: boolean;
  canMutateTools?: boolean;
  supportsCustomFields?: boolean;
}

export function ToolSheetHeader({
  toggleTestingModal,
  userEvents,
  inputSchemaData,
  isCreatUpdateAgentTool,
  canMutateTools = true,
  supportsCustomFields = false,
}: ToolSheetHeaderProps) {
  const dispatch = useDispatch();
  const toolsData = useAppSelector(
    (state) => state?.toolsDataReducer?.toolsDataReducer?.value,
  );
  const showTestTool =
    !toolsData?.is_default == true && userEvents !== "addTool";
  const canEditTool =
    canMutateTools &&
    isCreatUpdateAgentTool &&
    userEvents === "viewTool" &&
    ((toolsData?.api_type && apiType.includes(toolsData.api_type)) ||
      supportsCustomFields);

  return (
    <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
      <div className="w-full flex justify-start items-center space-x-2 divide-x">
        <SheetTitle className="px-3 text-lg font-medium">
          {userEvents == "editTool"
            ? "Edit Tool"
            : userEvents == "addTool"
              ? "Add New Tool"
              : "Tool Details"}
        </SheetTitle>
      </div>
      {canMutateTools && showTestTool && (
        <ConditionalTooltip
          content="Test Tool"
          alwaysShow={true}
          align="center"
          showArrow={true}
        >
          <div
            onClick={() => toggleTestingModal(true)}
            className="p-2 rounded-md cursor-pointer hover:bg-secondary"
          >
            <Play className="h-5 w-5" />
          </div>
        </ConditionalTooltip>
      )}

      {canEditTool && (
        <ConditionalTooltip
          content="Edit"
          alwaysShow={true}
          align="center"
          showArrow={true}
        >
          <div
            onClick={() => dispatch(handleToolsEvents("editTool"))}
            className="p-2 rounded-md cursor-pointer hover:bg-secondary"
          >
            <Pencil className="h-5 w-5" />
          </div>
        </ConditionalTooltip>
      )}
      <SheetClose asChild>
        <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
          <X className="h-5 w-5" />
        </div>
      </SheetClose>
    </SheetHeader>
  );
}
