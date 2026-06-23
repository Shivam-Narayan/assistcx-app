import CustomAgentToolCard from "@/components/agent-tools";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getDistinctObjects } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { handleToolsSelection } from "@/redux/agents/create-agents-data-slice";
import { resetSearchState, setSearchText } from "@/redux/common/search-slice";
import { AppDispatch, RootState, useAppSelector } from "@/redux/store";
import { Cross2Icon } from "@radix-ui/react-icons";
import { PlusCircleIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";

interface listModal {
  name: string;
  action: string;
  function: string;
  description: string;
  selection: boolean;
  api_type: string;
}

interface agentToolListProps {
  sheetOpenEvent: boolean;
  closeSheetEvent: () => void;
  userSelectionTools: listModal[];
  setUserSelectionTools?: any;
}

export function AgentToolsListSheets({
  sheetOpenEvent,
  closeSheetEvent,
  userSelectionTools,
  setUserSelectionTools,
}: agentToolListProps) {
  const { axiosAuth, loading } = useAxiosAuth(); // User Session
  const dispatch = useDispatch<AppDispatch>();
  const [tools, setToolsList] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTools, setSelectedTools] = useState<any[]>([]);
  //search handle
  const searchText = useAppSelector(
    (state: RootState) => state?.searchReducer?.searchText,
  );
  const [searchedDebounce] = useDebounce<string>(searchText, 300);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const submitSheetEventHandler = () => {
    setUserSelectionTools(selectedTools);
    dispatch(handleToolsSelection(selectedTools));
    setToolsList([]);
    dispatch(resetSearchState());
    closeSheetEvent();
  };

  const focusOutSheetEventHandler = () => {
    setToolsList([]);
    dispatch(resetSearchState());
    closeSheetEvent();
  };
  const closeSheetEventHandler = () => {
    setToolsList([]);
    setSelectedTools(userSelectionTools);
    dispatch(resetSearchState());
    closeSheetEvent();
  };
  const onSelectionchangeHandler = (
    selection: boolean,
    tool: any,
    index: number,
  ) => {
    // update selectedTools state
    setSelectedTools((prev) => {
      if (selection) {
        return getDistinctObjects([...prev, tool], "action");
      } else {
        return prev.filter((item) => item.action !== tool.action);
      }
    });

    // update tools array so UI reflects the new checkbox state
    setToolsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selection };
      return updated;
    });
  };

  const getAgentToolsDetails = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";
      if (searchedDebounce != "") {
        // Search tools list api calling
        API_ENDPOINT_PATH =
          url.SEARCH_TOOLS + "?keyword=" + searchedDebounce.trim();
      } else {
        // tools list api calling
        API_ENDPOINT_PATH = url.AGENT_TOOLS_LIST;
      }

      try {
        setIsLoading(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH);
        if (result?.status === 200) {
          const raw = result?.data?.agent_tools ?? [];
          let parsed: any = raw.map((item: any) => {
            return {
              name: item["name"],
              action: item["action"],
              function: item["function"],
              description: item["description"],
              selection: selectedTools.some((t) => t.action === item.action),
              api_type: item["api_type"],
              icon: item["icon"],
            };
          });

          parsed.sort(
            (a: any, b: any) => Number(b.selection) - Number(a.selection),
          );

          setToolsList(parsed);
        }
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  useEffect(() => {
    getAgentToolsDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedDebounce]);

  useEffect(() => {
    setSheetOpen(sheetOpenEvent);
    if (sheetOpenEvent) {
      getAgentToolsDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOpenEvent, loading]);

  useEffect(() => {
    setSelectedTools(userSelectionTools);
  }, [userSelectionTools, sheetOpenEvent]);

  const selectedCount = selectedTools.length;

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent
        onCloseAutoFocus={focusOutSheetEventHandler}
        className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
      >
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="w-full flex justify-start items-center space-x-2 divide-x">
            <SheetTitle className="px-3 text-lg font-medium text-foreground/80">
              Select Tools
            </SheetTitle>
          </div>
          <SheetClose asChild>
            <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
              <X className="h-5 w-5" />
            </div>
          </SheetClose>
        </SheetHeader>

        <div className="flex items-center justify-between px-4">
          <div className="relative flex flex-1 items-center">
            <Search
              placeholder="Search by tool name ..."
              className="h-10 w-full pr-10"
              onChange={(e) => dispatch(setSearchText(e.target.value))}
              value={searchText}
            />
            {searchText && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(resetSearchState())}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <Cross2Icon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grow">
          <div className="grid gap-4 px-4">
            {tools && tools.length > 0 ? (
              tools.map((tool, index) => (
                <CustomAgentToolCard
                  key={index}
                  className="shadow-none"
                  index={index}
                  tool={tool}
                  pageType="1"
                  onSelectionchangeHandler={(checked) =>
                    onSelectionchangeHandler(checked, tool, index)
                  }
                />
              ))
            ) : searchText === "" && isLoading ? (
              <Loader className="pt-28" />
            ) : (
              <div className="text-center text-sm text-muted-foreground pt-10">
                No tools available
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="sticky z-10 bottom-0 p-3 border-t bg-background">
          <div className="flex w-full items-center justify-between">
            <div className="text-sm">
              {selectedCount ? (
                <Badge
                  variant="outline"
                  className="ml-2 py-1 px-3 text-base font-normal"
                >
                  {selectedCount > 0 ? `${selectedCount} tools selected` : ""}
                </Badge>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={submitSheetEventHandler}
                className="cursor-pointer"
              >
                <PlusCircleIcon className="h-4 w-4" /> Add Selected Tools
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
