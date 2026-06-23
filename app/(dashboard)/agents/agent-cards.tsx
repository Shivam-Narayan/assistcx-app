"use client";

import ToolsFooter from "@/components/dynamic-tools-footer";

import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UTCToLocalTimezon } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { Bot } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";
import { LoadingCards } from "./loading";
import { EmptyState } from "@/components/empty-state/empty-state";

export type AgentCardsActionsRef = {
  refreshAgents: () => void;
};

export interface AgentToolbarProps {
  activeTab: string;
}

export const AgentCardsActions = forwardRef<
  AgentCardsActionsRef,
  AgentToolbarProps
>(function AgentCardsActions({ ...props }, ref) {
  const { axiosAuth, loading } = useAxiosAuth();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const tab = props?.activeTab?.toUpperCase(); // activeTab
  const defaultIcon = getIconSvg("shapes", "agent_icons");

  const searchText = useAppSelector<string>(
    (state) => state?.searchAgentReducer?.searchText,
  );

  const [searchAgents] = useDebounce(searchText, 300);

  const handleEditAgents = (id: string) => {
    router.push(`/agents/manage-agent?uuid=${id}`);
  };

  const filtersObj = useMemo(() => {
    const obj: Record<string, any> = {};
    if (tab) {
      obj.status = tab;
    }
    return obj;
  }, [tab]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({});
    if (Object.keys(filtersObj).length > 0) {
      params.append("filters", JSON.stringify(filtersObj));
    }
    return params;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAgentListData = async () => {
    if (!loading) {
      setPageLoading(true);
      const API_ENDPOINT_PATH =
        searchAgents !== ""
          ? `${
              url.SEARCH_AGENTS
            }?sort_by=created_at&sort_order=desc&keyword=${searchAgents.trim()}${
              queryParams.toString() ? `&${queryParams.toString()}` : ""
            }`
          : `${url.LIST_AGENTS}?${queryParams.toString()}`;

      try {
        const response = await axiosAuth.get(API_ENDPOINT_PATH);
        if (response?.status === 200) {
          let sortedData =
            response.data.agents?.slice().sort((a: any, b: any) => {
              let dateA = moment(a.created_at, "MMM D YYYY, h:mm a");
              let dateB = moment(b.created_at, "MMM D YYYY, h:mm a");
              return dateB.diff(dateA);
            }) || [];

          sortedData = sortedData.map((item: any) => ({
            ...item,
            createdAt: item.created_at
              ? UTCToLocalTimezon(item.created_at)
              : null,
          }));

          setAgentsList(sortedData);
        }
      } catch (error: any) {
        if (error.request?.status === 404) {
          setAgentsList([]);
        }
      } finally {
        setPageLoading(false);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    refreshAgents: getAgentListData,
  }));

  useEffect(() => {
    getAgentListData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchAgents, loading]);

  if (pageLoading) return <LoadingCards />;

  return (
    <div className="flex flex-col h-fit">
      {agentsList.length !== 0 ? (
        <div className="grid gap-5 2xl:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {agentsList.map((agentGroup, index) => (
            <Card
              className={`rounded-lg shadow-xs flex flex-col h-full w-full p-4 cursor-pointer hover:shadow-md transition-all duration-300 hover:bg-primary/5 hover:border-primary/20 gap-4`}
              key={agentGroup.id}
              onClick={() => handleEditAgents(agentGroup.id)}
            >
              <CardHeader className="shrink-0 p-0 gap-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-row items-center justify-end">
                    <div
                      className={`p-2.5 rounded-full w-fit h-fit bg-primary/10 text-primary `}
                    >
                      <div
                        className="w-full h-full flex items-stretch"
                        dangerouslySetInnerHTML={{
                          __html:
                            getIconSvg(agentGroup.icon, "agent_icons") ||
                            defaultIcon,
                        }}
                      />
                    </div>
                    <div className="flex flex-col ml-3 max-w-xs overflow-hidden">
                      <CardTitle className="text-base whitespace-pre-wrap break-words line-clamp-1">
                        {agentGroup.name}
                      </CardTitle>
                      <CardDescription className="whitespace-pre-wrap break-words line-clamp-1">
                        {agentGroup.goal}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0 space-y-3">
                <p className="text-wrap text-muted-foreground line-clamp-2">
                  {agentGroup.description}
                </p>
              </CardContent>
              <CardFooter className="shrink-0 p-0">
                <ToolsFooter tools={agentGroup.tools || []} />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState variant="fullpage" title="No Agents Found" icon={Bot} />
      )}
    </div>
  );
});
