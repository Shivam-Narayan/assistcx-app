"use client";

import { RecentActivities } from "@/components/recent-activities";
import StatsCards from "@/components/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskVolumeState, UsageChart } from "@/components/usage-chart";

import { UsageByIntent } from "@/components/usage-intent";
import {
  convertToUnixTimestamp,
  errorMessageHandler,
  getDateRange,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { handleRefreshDataEvents } from "@/redux/common/refresh-data-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

interface DashboardCardData {
  email_count: number;
  executing_count: number;
  failed_count: number;
  successful_count: number;
  task_count: number;
  success_rate?: number;
  time_saved?: number;
}

interface EmailMonthlyState {
  time_period?: string;
  count?: number;
}

interface IntentState {
  name: string;
  value: number;
  success_rate?: number;
  average_time?: number;
}

interface recentActivityData {
  mailbox_email: string;
  subject: string;
  intent_class: string;
  created_at: string;
  status: string;
  received_at: string;
  email_id: string;
}

export interface DashboardProps {}
export function DashboardActions({ ...props }: DashboardProps) {
  const { axiosAuth, loading } = useAxiosAuth(); // User Session
  const dispatch = useDispatch<AppDispatch>();
  const [cardDetails, setCardDetails] = useState<DashboardCardData | null>(
    null
  );
  const [taskVolumeStateDetails, setTaskVolumeStateDetails] = useState<
    TaskVolumeState[]
  >([]);
  const [intentStateDetails, setIntentStateDetails] = useState<IntentState[]>(
    []
  );
  const [isRecentActivityLoading, setIsRecentActivityLoading] =
    useState<boolean>(true);
  const [recentActivityDetails, setRecentActivityDetails] = useState<
    recentActivityData[]
  >([]);

  const [timezone, setTimezone] = useState("");

  const refreshPage = useAppSelector(
    (state) => state?.refreshDataReduce?.value?.isRefresh
  );

  const filters = useAppSelector(
    (state) => state?.dashboardFilterReducer?.filters
  );

  const filtersObj = useMemo(() => {
    const obj: Record<string, any> = {};
    if (filters.agent_id?.length) {
      obj.agent_id = filters.agent_id;
    }
    return obj;
  }, [filters]);

  // set every time queary params when filters change
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({});
    if (Object.keys(filtersObj).length > 0) {
      params.append("filters", JSON.stringify(filtersObj));
    }
    const range = filters.date_range ?? getDateRange("Last 30 days");
    if (range) {
      const fromDate = convertToUnixTimestamp(range.from, "start");
      const toDate = convertToUnixTimestamp(range.to, "end");
      params.append("from_date", fromDate.toString());
      params.append("to_date", toDate.toString());
    }
    if (timezone) {
      params.append("user_timezone", timezone);
    }
    return params;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, timezone]);

  //===============[Function::: Get Dashboard card details details]==================================//
  const getDashboardCardData = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";
      if (queryParams.toString()) {
        let updatedEndPoint = `${
          url.DASHBOARD_CARD_COUNTS
        }?${queryParams.toString()}`;
        API_ENDPOINT_PATH = updatedEndPoint;
      } else {
        API_ENDPOINT_PATH = url.DASHBOARD_CARD_COUNTS;
      }
      try {
        const response = await axiosAuth.get(API_ENDPOINT_PATH);
        if (response?.status === 200) {
          let cardData =
            response?.data && response["data"] != null ? response["data"] : {};
          setCardDetails(cardData);
        } else {
          errorMessageHandler("Error fetching data");
        }
      } catch (error) {
        errorMessageHandler(error);
      }
    }
  };

  //===============[Function::: Get Dashboard Emails Monthly State details]===========================//
  const getDashboardEmailMonthlyState = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";
      if (queryParams.toString()) {
        let updatedEndPoint = `${
          url.DASHBOARD_EMAIL_MONTHLY_STATES
        }?${queryParams.toString()}`;
        API_ENDPOINT_PATH = updatedEndPoint;
      } else {
        API_ENDPOINT_PATH = url.DASHBOARD_EMAIL_MONTHLY_STATES;
      }

      try {
        const response = await axiosAuth.get(API_ENDPOINT_PATH);
        if (response?.status === 200) {
          let resultData =
            response?.data && response["data"].length ? response["data"] : [];
          resultData = resultData.map((item: any) => ({
            ...item,
            name: item.month,
            total: item.count,
          }));
          setTaskVolumeStateDetails([]);
          setTaskVolumeStateDetails(resultData);
        } else {
          errorMessageHandler("Error fetching data");
        }
      } catch (error) {
        errorMessageHandler(error);
      }
    }
  };

  //===============[Function::: Get Dashboard Intent State details]===================================//
  const getDashboardAgentState = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";
      if (queryParams.toString()) {
        let updatedEndPoint = `${
          url.DASHBOARD_AGENT_STATES
        }?${queryParams.toString()}`;
        API_ENDPOINT_PATH = updatedEndPoint;
      } else {
        API_ENDPOINT_PATH = url.DASHBOARD_AGENT_STATES;
      }

      try {
        const response = await axiosAuth.get(API_ENDPOINT_PATH);
        if (response?.status === 200) {
          let resultData =
            response?.data && response["data"].length ? response["data"] : [];
          resultData = resultData.map((item: any) => ({
            ...item,
            name: item.agent_name,
            value: item.count,
          }));
          setIntentStateDetails([]);
          setIntentStateDetails(resultData);
        } else {
          errorMessageHandler("Error fetching data");
        }
      } catch (error) {
        errorMessageHandler(error);
      }
    }
  };

  //===============[Function::: Get Dashboard Intent State details]===================================//
  const getRecentActivity = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH;

      const paramsWithoutDate = new URLSearchParams(queryParams.toString());
      paramsWithoutDate.delete("from_date");
      paramsWithoutDate.delete("to_date");
      paramsWithoutDate.delete("user_timezone");

      if (filters && Object.keys(filters).length > 0) {
        let updatedEndPoint = `${
          url.DASHBOARD_RECENT_ACTIVITY
        }?${paramsWithoutDate.toString()}&page=1&page_size=5&sort_by=created_at&sort_order=desc`;
        API_ENDPOINT_PATH = updatedEndPoint;
      } else {
        API_ENDPOINT_PATH = `${url.DASHBOARD_RECENT_ACTIVITY}?page=1&page_size=5&sort_by=created_at&sort_order=desc`;
      }

      try {
        setRecentActivityDetails([]);
        const response = await axiosAuth.get(API_ENDPOINT_PATH);
        if (response?.status === 200) {
          let sortedData = response?.data?.emails?.map((item: any) => ({
            ...item,
            created_at: item.created_at
              ? UTCToLocalTimezon(item.created_at)
              : null,
            received_at: item.received_at
              ? UTCToLocalTimezon(item.received_at)
              : null,
          }));

          setRecentActivityDetails([]);
          setRecentActivityDetails(sortedData);
          dispatch(handleRefreshDataEvents(false));
        } else {
          errorMessageHandler("Error fetching data");
        }
      } catch (error) {
        errorMessageHandler(error);
        dispatch(handleRefreshDataEvents(false));
      } finally {
        setIsRecentActivityLoading(false);
        dispatch(handleRefreshDataEvents(false));
      }
    }
  };

  useEffect(() => {
    getDashboardCardData();
    getDashboardEmailMonthlyState();
    getDashboardAgentState();
    getRecentActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, filters]);

  useEffect(() => {
    if (refreshPage) {
      getDashboardCardData();
      getDashboardEmailMonthlyState();
      getDashboardAgentState();
      getRecentActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPage]);

  useEffect(() => {
    // Get user's timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
  }, []);

  return (
    <>
      <StatsCards cardDetails={cardDetails} />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="rounded-lg border bg-card text-card-foreground shadow-xs col-span-2 lg:col-span-4">
          <CardHeader className="text-xl font-semibold leading-none tracking-tight ">
            <CardTitle>Task Volume</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <UsageChart taskVolumeState={taskVolumeStateDetails} />
          </CardContent>
        </Card>
        <Card className="rounded-lg border bg-card text-card-foreground shadow-xs col-span-2 lg:col-span-3">
          <CardHeader className="text-xl font-semibold leading-none tracking-tight">
            <CardTitle>Tasks by Agent</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <UsageByIntent intentStateData={intentStateDetails} />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="rounded-lg border bg-card text-card-foreground shadow-xs p-0 gap-0">
          <RecentActivities
            recentActivityDetails={recentActivityDetails}
            isRecentActivityLoading={isRecentActivityLoading}
          />
        </Card>
      </div>
    </>
  );
}
