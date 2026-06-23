export const dataTypeList = [
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Date", value: "date" },
  { label: "List", value: "list" },
];

/** Processing Rules card settings */
export const PROCESSING_SETTINGS_CONFIG = [
  {
    name: "agent_llm" as const,
    label: "Agent LLM Model",
    description:
      "The language model powering this agent's reasoning. Use the default unless you need specific capabilities or cost controls.",
  },
  {
    name: "create_task_by_attachments" as const,
    label: "Create Task by Attachments",
    description:
      "Each attachment in an incoming email becomes its own task. Useful when attachments need to be processed independently.",
  },
  {
    name: "vision_data_extraction" as const,
    label: "Vision Data Extraction",
    description:
      "Enables the agent to use vision model to read and extract data from images, scanned documents, and other visual content.",
  },
  {
    name: "retry_incomplete_tasks" as const,
    label: "Retry Incomplete Tasks",
    description:
      "If a task fails or ends without a result, the agent will attempt it once more automatically before marking it as failed.",
  },
  {
    name: "allow_task_followup" as const,
    label: "Multi-turn Task Execution",
    description:
      "Allows users to send follow-up instructions to continue or refine a task after its initial execution.",
  },
];

export const STORAGE_TYPES = {
  NONE: "",
  LOCAL: "local",
  REMOTE: "remote",
};
