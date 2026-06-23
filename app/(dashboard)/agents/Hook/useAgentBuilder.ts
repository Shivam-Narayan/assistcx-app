import {
  errorMessageHandler,
  normalizeSuccessCriteria,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { setAgentBuilderForm } from "@/redux/agents/agent-builder-Slice";
import {
  handleAgentBasicInfo,
  handleAgentDataTemplate,
  handleAgentOutputInfo,
  handleAgentPlanningReducer,
  handleAgentRules,
  handleKnowledgeSelection,
  handleToolsSelection,
} from "@/redux/agents/create-agents-data-slice";
import { AppDispatch } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as z from "zod";
const agentBuilderSchema = z.object({
  agentName: z
    .string()
    .nonempty("Agent name is required")
    .min(4, "Agent name must be at least 4 characters")
    .max(100, "Agent name must be less than 100 characters")
    .regex(/^[A-Za-z0-9 ]+$/, "Name can only contain letters and numbers"),
  business_usecase: z
    .string()
    .min(10, "Business condition must be at least 10 characters")
    .max(2000, "Business condition must be less than 2000 characters"),
  tools: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        description: z.string().optional(),
        integration_key: z.string().optional(),
        is_default: z.boolean().optional(),
        icon: z.string().optional(),
      }),
    )
    .min(1, "Agent tool is required"),
});

type AgentBuilderFormData = z.infer<typeof agentBuilderSchema>;

const useAgentBuilder = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AgentBuilderFormData>({
    resolver: zodResolver(agentBuilderSchema),
    defaultValues: {
      agentName: "",
      business_usecase: "",
      tools: [],
    },
    mode: "onChange",
  });
  const handleSubmit = async (data: AgentBuilderFormData) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsLoadingAgent(true);
    dispatch(setAgentBuilderForm(data));

    // if (onClose) onClose(false);
    router.push("/agents/agent-builder");

    try {
      const toolsPayload = selectedTools.map((tool: any) => ({
        name: tool.label,
        action: tool.value,
      }));

      const payload = {
        name: data.agentName.trim(),
        business_usecase: data.business_usecase.trim(),
        tools: toolsPayload,
      };

      const result = await axiosAuth.post(url.AGENT_BUILDER, payload);

      if (result.status === 200) {
        await handleAgentPrefill(result.data);
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      errorMessageHandler(error);
    } finally {
      setIsLoadingAgent(false);
    }
  };

  const handleAgentPrefill = async (agentData: any) => {
    dispatch(
      handleAgentBasicInfo({
        name: agentData["name"],
        goal: agentData["goal"],
        style: agentData["style"],
        description: agentData["description"],
        icon: agentData["icon"] || "shapes",
      }),
    );
    dispatch(
      handleAgentDataTemplate({
        data_template: agentData["data_templates"]?.toString() ?? "",
        folder_name: agentData["data_store"]?.storage_folder ?? "",
        mailbox: agentData["agent_mailbox"] ?? null,
        bucket_name:
          agentData["data_store"]?.storage_type === "remote"
            ? agentData["data_store"]?.storage_bucket
            : "",
        mount_path:
          agentData["data_store"]?.storage_type === "local"
            ? agentData["data_store"]?.storage_bucket
            : "",
        storage_type: agentData["data_store"]?.storage_type ?? "",
        assignment_type: agentData["agent_config"]?.external_task_api
          ? undefined
          : agentData["agent_mailbox"]
            ? "assign_by_mailbox"
            : undefined,
        external_task_api:
          agentData["agent_config"]?.external_task_api ?? false,
        split_task_by_records: agentData["agent_config"]?.split_task_by_records,
        split_task_by_attachments:
          agentData["agent_config"]?.split_task_by_attachments,
        vision_data_extraction:
          agentData["agent_config"]?.vision_data_extraction,
        automate_task_retry: agentData["agent_config"]?.automate_task_retry,
        agent_llm: agentData["agent_config"]?.agent_llm ?? "",
        allow_task_followup: agentData["agent_config"]?.allow_task_followup,
      }),
    );

    dispatch(handleAgentOutputInfo(agentData.response_schema || []));
    dispatch(handleAgentPlanningReducer(agentData.plan || []));

    if (agentData["rules"]?.length) {
      const initialRules = agentData["rules"].map(
        (rule: string, i: number) => ({
          id: i + 1,
          rule,
        }),
      );

      dispatch(
        handleAgentRules({
          instructions: agentData["instructions"],
          success_criteria: normalizeSuccessCriteria(
            agentData["success_criteria"],
            "response",
          ),
          rules: initialRules,
        }),
      );
    }

    const toolCalls =
      agentData["tools"]?.map((item: any) =>
        axiosAuth.get(`${url.AGENT_TOOLS_LIST}/${item["action"]}`),
      ) ?? [];

    const knowledgeCalls =
      agentData["knowledge_base"]?.map((item: any) =>
        axiosAuth.get(`${url.GET_COLLECTION_LIST}/${item["collection_id"]}`),
      ) ?? [];

    try {
      let toolsResponse: any[] = [];

      try {
        [toolsResponse] = await Promise.all([
          toolCalls.length > 0
            ? axios.all(toolCalls).catch((err) => {
                console.error("Tool fetch failed:", err);
                return [];
              })
            : Promise.resolve([]),
        ]);

        const knowledgeResults = await Promise.allSettled(
          knowledgeCalls.map((id: string) =>
            axiosAuth.get(`${url.GET_COLLECTION_LIST}/${id}`),
          ),
        );

        const validKnowledge = knowledgeResults
          .filter((res) => res.status === "fulfilled")
          .map((res: any) => res.value.data);

        if (validKnowledge.length) {
          dispatch(
            handleKnowledgeSelection(
              validKnowledge
                .map((item: any) => item?.data_collections?.[0])
                .filter(Boolean)
                .map((collection: any) => ({
                  action: collection.action ?? "",
                  function: collection.function ?? "",
                  api_type: collection.api_type ?? "",
                  index_name: collection.index_name,
                  description: collection.description ?? "",
                  collection_id: collection.id,
                  name: collection.name,
                  availability: collection.availability ?? "",
                  selection: true,
                  icon: collection.icon ?? "",
                })),
            ),
          );
        } else {
          dispatch(handleKnowledgeSelection([]));
        }
      } catch (error) {
        console.error("Unexpected error during tool/knowledge fetch:", error);
      }

      if (toolsResponse.length > 0) {
        const toolData = toolsResponse.map((item: any) => ({
          action: item.data.action,
          description: item.data.description,
          function: item.data.function,
          name: item.data.name,
          api_type: item.data.api_type,
          selection: true,
          icon: item.data.icon,
          id: item.data.id,
        }));
        dispatch(handleToolsSelection(toolData));
      } else {
        dispatch(handleToolsSelection([]));
      }

      // form.reset();
    } catch (error) {
      console.error("Error while loading tools/knowledge", error);
      // setIsBuilding(false);
      // setProgress(0);
      //if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };
  const selectedTools = form.watch("tools");

  return {
    form,
    isLoadingAgent,
    setIsLoadingAgent,
    handleSubmit,
    isPending,
    handleAgentPrefill,
  };
};

export default useAgentBuilder;
