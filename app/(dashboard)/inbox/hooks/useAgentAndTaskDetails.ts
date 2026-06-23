import { useState, useEffect, useRef } from "react";
import { IAgentDetails, ITaskExecutionDetails } from "@/types/types";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import * as url from "@/helper/url-helper";

export const useAgentAndTaskDetails = (selectedEmail: any) => {
  const { axiosAuth } = useAxiosAuth();
  const [isTaskListLoading, setTaskListLoading] = useState(false);
  const [agentDetails, setAgentDetails] = useState<IAgentDetails | null>(null);
  const [taskExecutionDetails, setTaskExecutionDetails] = useState<
    ITaskExecutionDetails[]
  >([]);

  const prevStateRef = useRef<{
    emailId: string | undefined;
    agentTaskCounts: any;
  }>({
    emailId: undefined,
    agentTaskCounts: undefined,
  });

  const getAgentDetails = async (agentIDs: string) => {
    let API_ENDPOINT_PATH = `${url.AGENTS_PREVIEW}?agent_identifier=${agentIDs}`;
    try {
      const result = await axiosAuth.get(API_ENDPOINT_PATH);
      if (result?.status === 200) {
        const agentDetails =
          result.data.agent_previews && result.data.agent_previews.length != 0
            ? result.data.agent_previews[0]
            : null;

        setAgentDetails(agentDetails);
      }
    } catch (error) {
      console.error("Error fetching output details:", error);
    }
  };

  const getTaskListDetails = async (uuid: string) => {
    const API_ENDPOINT_PATH = `${url.EMAIL_TASK_LIST}/${uuid}/agent-tasks`;

    try {
      setTaskListLoading(true);
      const result = await axiosAuth.get(API_ENDPOINT_PATH);

      if (result?.status !== 200) {
        setTaskExecutionDetails([]);
        return;
      }

      const taskDetails = result.data?.agent_tasks ?? [];

      const SUCCESSFUL = result.data?.agent_task_counts?.SUCCESSFUL || 0;
      const TOTAL = result.data?.agent_task_counts?.TOTAL || 0;

      const transformed = taskDetails.map((item: any) => {
        return {
          title: item.title,
          id: item.id,
          agent_id: item.agent_id,
          agent_name: item.agent_name,
          agent_icon: item.agent_icon,
          created_at: item.created_at,
          credits_used: item.credits_used,
          attachment_details: item.attachment_details,
          task_order: item?.task_order || "",
          description: item.description,
          email_data_id: item.email_data_id,
          completed_at: item.completed_at,
          status:
            item?.progress && item?.progress?.length !== 0
              ? item?.progress[item?.progress?.length - 1]["status"]
              : null,
          timestamp: item.progress?.[0]?.timestamp || null,
        };
      });

      setTaskExecutionDetails([
        {
          tasks: transformed,
          count: { SUCCESSFUL, TOTAL },
        },
      ]);
      setTaskListLoading(false);
    } catch (error) {
      setTaskListLoading(false);
      console.error("Error fetching task details:", error);
      setTaskExecutionDetails([]);
    }
  };

  useEffect(() => {
    if (!selectedEmail?.id) return;

    const emailIdChanged = prevStateRef.current.emailId !== selectedEmail.id;
    const taskCountsChanged =
      JSON.stringify(prevStateRef.current.agentTaskCounts) !==
      JSON.stringify(selectedEmail?.agent_task_counts);

    if (emailIdChanged || taskCountsChanged) {
      getTaskListDetails(selectedEmail.id);

      prevStateRef.current = {
        emailId: selectedEmail.id,
        agentTaskCounts: selectedEmail?.agent_task_counts,
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmail?.id, selectedEmail?.agent_task_counts]);

  useEffect(() => {
    if (selectedEmail?.agent_id) {
      getAgentDetails(selectedEmail.agent_id);
    } else {
      setAgentDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmail?.agent_id]);

  return {
    agentDetails,
    taskExecutionDetails,
    isTaskListLoading,
  };
};
