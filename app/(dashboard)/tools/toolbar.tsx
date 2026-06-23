"use client";

import { Button } from "@/components/ui/button";
import { handleToolsEvents } from "@/redux/agents/create-agents-data-slice";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { AppDispatch } from "@/redux/store";
import { PlusCircleIcon } from "lucide-react";
import { useDispatch } from "react-redux";

const Toolbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const handleAddTool = () => {
    dispatch(handleToolsEvents("addTool"));
    dispatch(handleSheetEvents(true));
  };
  return (
    <>
      <Button
        className="cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          handleAddTool();
        }}
      >
        <PlusCircleIcon className="h-4 w-4" /> Create Tool
      </Button>
    </>
  );
};

export default Toolbar;
