import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agentSchema, AgentFormValues } from "../schemas/agent-schema";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";

export const useAgentForm = (defaultValues?: AgentFormValues) => {
  const defaultIcon = getIconSvg("chat-bot", "agent_icons");
  return useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema) as any,
    defaultValues: defaultValues ?? {
      identity: {
        icon: defaultIcon,
        name: "",
        goal: "",
        style: "",
        description: "",
        instructions: "",
        rules: [
          {
            rule: "Use given inputs and data to find the right action and action_input, and perform all actions to complete the task.",
          },
        ],
        success_criteria: [],
        guidelines: [],
      },
      tools: [],
      knowledge: [],
      data_tables: [],
      planning: [],
      response_schema: [],
      settings: {
        data_template: [],
        class_groups: [],
        storage_type: "",
        mount_path: "",
        bucket_name: "",
        folder_name: "",
        assignment_type: null,
        mailbox_name: "",
        agent_llm: "",
        create_task_by_attachments: false,
        vision_data_extraction: false,
        retry_incomplete_tasks: false,
        allow_task_followup: false,
        enable_human_review: false,
        human_review_users: [],
        schedule_config: {
          type: "daily",
          time: "",
          dayOfWeek: "",
          dayOfMonth: undefined,
          date: "",
        },
      },
      status: "ACTIVE",
    },
    mode: "onChange",
  });
};
