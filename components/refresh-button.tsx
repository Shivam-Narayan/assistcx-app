"use client";

import { handleRefreshDataEvents } from "@/redux/common/refresh-data-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { SymbolIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ConditionalTooltip from "./conditional-tooltip-renderer";
import { Button } from "./ui/button";

export function RefreshButton() {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshPage = useAppSelector(
    (state) => state?.refreshDataReduce?.value?.isRefresh,
  );

  const handleRefreshClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      dispatch(handleRefreshDataEvents(true));
    }, 1000);
  };

  useEffect(() => {
    setIsLoading(refreshPage);
  }, [refreshPage]);

  return (
    <ConditionalTooltip
      content="Refresh"
      alwaysShow={true}
      align="center"
      showArrow={true}
    >
      <Button
        onClick={() => handleRefreshClick()}
        variant="outline"
        className="gap-2 py-1.5 border border-muted-foreground/40 cursor-pointer"
      >
        <SymbolIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      </Button>
    </ConditionalTooltip>
  );
}
