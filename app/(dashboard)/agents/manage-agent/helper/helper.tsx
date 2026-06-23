import { cronToJson, scheduleToCron } from "@/helper/assistant-helper/helper";
import {
  getProviderByKey,
  normalizeSuccessCriteria,
  successCriteriaToStringArray,
} from "@/helper/helper-function";
import { v4 as uuidv4 } from "uuid";

function generateStepId(step: any, _index: number): string {
  try {
    return step?.id != null && String(step.id).trim() !== ""
      ? String(step.id)
      : uuidv4();
  } catch {
    return `step-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

function coerceToStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((val) => (val == null ? "" : String(val).trim()))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const val = value.trim();
    if (!val) return [];
    return val
      .split(",")
      .map((val) => val.trim())
      .filter(Boolean);
  }
  return [String(value).trim()].filter(Boolean);
}

// get data & set inside form
export const mapAgentToForm = (
  agent: any,
  statusOverride?: "ACTIVE" | "ARCHIVED",
) => {
  const behaviour = agent.behaviour ?? {};
  const context = agent.context ?? {};
  const agentSettings = agent.agent_settings ?? {};

  return {
    identity: {
      icon: agent.icon || "",
      name: agent.name || "",
      goal: behaviour.goal || "",
      style: behaviour.style || "",
      description: agent.description || "",
      instructions: behaviour.instructions || "",

      rules:
        behaviour.rules?.map((rule: string) => ({
          rule,
        })) || [],

      success_criteria: successCriteriaToStringArray(
        behaviour.success_criteria,
      ).map((criterion) => ({ criterion })),

      guidelines:
        behaviour.guidelines?.map((g: any) => ({
          name: g.name || "",
          instructions: g.instructions || "",
        })) || [],
    },

    tools:
      agent.tools?.map((tool: any) => ({
        icon: tool.icon || "",
        name: tool.name,
        description: tool.description || "",
        action: tool.action,
        integration_key: tool.integration_key ?? null,
        is_default: tool.is_default || false,
        human_review: tool.human_review ?? false,
        review_rules: tool.review_rules || [],
        connection_id: tool.connection_id,
      })) || [],

    knowledge:
      context.knowledge_base?.map((item: any) => ({
        id: item.collection_id ?? item.id,
        icon: item.icon || "",
        name: item.name,
        index_name: item.index_name,
        description: item.description,
        availability: item.availability,
      })) || [],

    data_tables:
      context.data_tables?.map((item: any) => ({
        id: item.table_id ?? item.id,
        icon: item.icon || "",
        name: item.name || "",
        description: item.description || "",
        availability: item.availability || "",
      })) || [],

    planning: (agent.playbooks || []).map((step: any, i: number) => ({
      ...step,
      id: generateStepId(step, i),
      tool: Array.isArray(step.tool)
        ? step.tool.map((tool: any) => {
            if (typeof tool === "string") {
              return {
                action: tool,
                name: tool,
              };
            }

            return {
              action: tool?.action ?? tool?.value ?? "",
              name:
                tool?.name ?? tool?.label ?? tool?.action ?? tool?.value ?? "",
            };
          })
        : [],
      condition: step.condition ?? "",
      instructions: coerceToStringArray(step.instructions),
    })),

    response_schema: agent.response_schema || [],

    settings: {
      data_template:
        context.data_templates?.map((t: any) => ({
          id: t.id || "",
          name: t.name || "",
        })) || [],

      class_groups:
        context.class_groups?.map((g: any) => ({
          id: g.id || "",
          name: g.name || "",
        })) || [],

      storage_type: agent.data_store?.storage_type || "",

      bucket_name:
        agent.data_store?.storage_type === "remote"
          ? agent.data_store?.storage_bucket
          : "",

      mount_path:
        agent.data_store?.storage_type === "local"
          ? agent.data_store?.storage_bucket
          : "",

      folder_name: agent.data_store?.storage_folder || "",

      assignment_type: agent.assignment_type ?? null,

      mailbox_name:
        agent.assignment_type === "mailbox"
          ? (agent.assignment_config?.mailbox ?? "")
          : "",

      schedule_config: (() => {
        const raw = agent.assignment_config?.schedule;
        if (!raw) return undefined;
        try {
          const parsed = cronToJson(raw);
          return {
            type: parsed.type as "daily" | "weekly" | "monthly" | "yearly",
            time: parsed.time,
            dayOfWeek: (parsed as any).dayOfWeek,
            dayOfMonth:
              (parsed as any).dayOfMonth != null
                ? Number((parsed as any).dayOfMonth)
                : undefined,
            date: (parsed as any).date,
          };
        } catch {
          return undefined;
        }
      })(),

      agent_llm: agentSettings.agent_llm || "",

      create_task_by_attachments:
        agentSettings.create_task_by_attachments || false,

      vision_data_extraction: agentSettings.vision_data_extraction || false,

      retry_incomplete_tasks: agentSettings.retry_incomplete_tasks || false,

      allow_task_followup: agentSettings.allow_task_followup || false,

      enable_human_review: (agentSettings.human_review_users?.length ?? 0) > 0,

      human_review_users:
        agentSettings.human_review_users?.map(normalizeUser) || [],
    },

    status: statusOverride ?? agent.status,
  };
};

// format for sending payload
export const transformAgentPayload = (data: any, providerList: any[] = []) => {
  const assignmentType = data.settings?.assignment_type;

  let assignmentConfig: Record<string, any> | null = null;

  switch (assignmentType) {
    case "mailbox":
      assignmentConfig = {
        mailbox: data.settings?.mailbox_name,
      };
      break;

    case "schedule": {
      const schedule = data.settings?.schedule_config;
      let cronExpression = "";

      if (schedule) {
        cronExpression = scheduleToCron({
          type: schedule.type,
          time: schedule.time,
          ...(schedule.type === "weekly" && {
            dayOfWeek: schedule.dayOfWeek,
          }),
          ...(schedule.type === "monthly" && {
            dayOfMonth: schedule.dayOfMonth?.toString(),
          }),
          ...(schedule.type === "yearly" && {
            date: schedule.date,
          }),
        });
      }
      assignmentConfig = {
        schedule: cronExpression,
      };
      break;
    }

    case "assistant":
    case "task_api":
    case "ai":
    default:
      assignmentConfig = null;
  }

  return {
    icon: data.identity.icon,
    name: data.identity.name,
    description: data.identity.description,

    behaviour: {
      goal: data.identity.goal,
      instructions: data.identity.instructions,
      rules: data.identity.rules?.map((val: any) => val.rule) || [],
      success_criteria: normalizeSuccessCriteria(
        data.identity.success_criteria,
        "payload",
      ) as string,
      style: data.identity.style,
      guidelines: data.identity.guidelines?.length
        ? data.identity.guidelines.map((g: any) => ({
            name: g.name,
            instructions: g.instructions,
          }))
        : [],
    },

    tools: data.tools?.map((tool: any) => {
      const isProviderTool = !!getProviderByKey(
        providerList,
        tool.integration_key,
      );
      const connectionId = tool.connection_id;
      const hasSelectedConnection =
        isProviderTool &&
        connectionId != null &&
        connectionId !== "default" &&
        String(connectionId).trim() !== "";

      return {
        name: tool.name,
        action: tool.action,
        description: tool.description,
        integration_key: tool.integration_key,
        human_review: tool.human_review ?? false,
        review_rules: tool.review_rules || [],
        ...(hasSelectedConnection && { connection_id: connectionId }),
      };
    }),

    playbooks: data.planning?.map((step: any, index: number) => ({
      id: index,
      step_name: step.step_name,
      tool:
        step.tool?.map((tool: any) => tool.action || tool.value || tool) || [],
      condition: step.condition || "",
      instructions: step.instructions || [],
    })),

    response_schema: data.response_schema?.map((val: any) => ({
      name: val.name,
      data_type: val.data_type,
      description: val.description,
    })),

    context: {
      knowledge_base: data.knowledge?.length
        ? data.knowledge.map((val: any) => ({
            collection_id: val.collection_id ?? val.id,
            name: val.name,
            index_name: val.index_name,
          }))
        : [],

      data_tables: data.data_tables?.length
        ? data.data_tables.map((val: any) => ({
            table_id: val.table_id ?? val.id,
            name: val.name,
          }))
        : [],

      data_templates:
        data.settings?.data_template?.map((val: any) => ({
          id: val.id || "",
          name: val.name || "",
        })) || [],

      class_groups:
        data.settings?.class_groups?.map((val: any) => ({
          id: val.id || "",
          name: val.name || "",
        })) || [],
    },

    assignment_type: assignmentType,
    assignment_config: assignmentConfig,

    agent_settings: {
      agent_llm: data.settings?.agent_llm || "",
      create_task_by_attachments:
        data.settings?.create_task_by_attachments || false,
      retry_incomplete_tasks: data.settings?.retry_incomplete_tasks || false,
      allow_task_followup: data.settings?.allow_task_followup || false,
      vision_data_extraction: data.settings?.vision_data_extraction || false,
      human_review_users:
        data.settings?.human_review_users?.map((ele: any) => ele.id) || [],
    },

    data_store: {
      storage_type: data.settings?.storage_type || "",
      storage_bucket:
        data.settings?.storage_type === "local"
          ? (data.settings?.mount_path ?? "")
          : (data.settings?.bucket_name ?? ""),
      storage_folder: data.settings?.folder_name || "files",
      storage_region: "",
    },

    status: data.status,
  };
};

// normalize user data for human review users
export const normalizeUser = (user: any) => ({
  id: user.id ?? user.user_id,
  name: user.name ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
  email: user.email ?? user.email_id ?? "",
});
