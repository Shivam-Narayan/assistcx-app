import {
  ArchiveIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  QuestionMarkIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

// Style options
export const agentStyles = [
  {
    label: "Formal",
    value: "formal",
    description:
      "Uses professional language, proper grammar, and structured communication suitable for business settings",
  },
  {
    label: "Informal",
    value: "informal",
    description:
      "Adopts a casual, relaxed tone with everyday language and conversational flow",
  },
  {
    label: "Friendly",
    value: "friendly",
    description:
      "Maintains a warm, approachable demeanor that makes others feel comfortable and valued",
  },
  {
    label: "Neutral",
    value: "neutral",
    description:
      "Presents information objectively without emotional bias or personal opinions",
  },
  {
    label: "Empathetic",
    value: "empathetic",
    description:
      "Shows deep understanding and compassion, acknowledging emotions and perspectives",
  },
  {
    label: "Creative",
    value: "creative",
    description:
      "Employs imaginative language, unique perspectives, and innovative approaches to communication",
  },
  {
    label: "Analytical",
    value: "analytical",
    description:
      "Focuses on data, logic, and systematic reasoning to present clear, evidence-based information",
  },
] as const;

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
  {
    value: "other",
    label: "Other",
  },
];

export const statuses = [
  // {
  //   value: "PENDING",
  //   label: "PENDING",
  //   icon: QuestionMarkCircledIcon,
  //   key: "pending_count",
  // },
  {
    value: "QUEUED",
    label: "QUEUED",
    icon: QuestionMarkIcon,
    key: "queued_count",
  },
  {
    value: "EXECUTING",
    label: "EXECUTING",
    icon: StopwatchIcon,
    key: "executing_count",
  },
  {
    value: "SUCCESSFUL",
    label: "SUCCESSFUL",
    icon: CheckCircledIcon,
    key: "successful_count",
  },
  {
    value: "INCOMPLETE",
    label: "INCOMPLETE",
    icon: ExclamationTriangleIcon,
    key: "incomplte_count",
  },
  {
    value: "FAILED",
    label: "FAILED",
    icon: CrossCircledIcon,
    key: "failed_count",
  },
  {
    value: "ARCHIVED",
    label: "ARCHIVED",
    icon: ArchiveIcon,
    key: "archived_count",
  },
  // {
  //   value: "ONGOING",
  //   label: "ONGOING",
  //   icon: UpdateIcon,
  //   key: "ongoing_count",
  // },
];

// export const statuses = [
//   {
//     value: 'backlog',
//     label: 'Backlog',
//     icon: QuestionMarkCircledIcon,
//   },
//   {
//     value: 'todo',
//     label: 'Todo',
//     icon: CircleIcon,
//   },
//   {
//     value: 'in progress',
//     label: 'In Progress',
//     icon: StopwatchIcon,
//   },
//   {
//     value: 'done',
//     label: 'Done',
//     icon: CheckCircledIcon,
//   },
//   {
//     value: 'canceled',
//     label: 'Canceled',
//     icon: CrossCircledIcon,
//   },
// ];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
];

export const mailboxes = [
  {
    value: "assist@aexonic.com",
    label: "assist@aexonic.com",
  },
  {
    value: "contract@aexonic.com",
    label: "contract@aexonic.com",
  },
  {
    value: "order@aexonic.com",
    label: "order@aexonic.com",
  },
];

export const intents = [
  {
    value: "place order",
    label: "Place Order",
  },
  {
    value: "post invoice",
    label: "Post Invoice",
  },
  {
    value: "order query",
    label: "Order Query",
  },
  {
    value: "invoice query",
    label: "Invoice Query",
  },
  {
    value: "post bill of lading",
    label: "Post Bill of Lading",
  },
];

//// Messages Constant
export const agent_added_successfully = "Agent added successfully";
export const agent_updated_successfully = "Agent updated successfully";
export const data_template_added_successfully =
  "Data template added successfully";
export const data_template_exported_successfully =
  "Data template exported successfully";
export const data_template_updated_successfully =
  "Data template updated successfully";
export const data_template_schema_generated_successfully =
  "Data Schema generated successfully";
export const api_key_added_successfully = "API key added successfully";
export const api_key_updated_successfully = "API key updated successfully";

export const class_group_exported_successfully =
  "Class group exported successfully";
export const class_group_updated_successfully =
  "Class group updated successfully";
export const team_member_added_successfully = "User added successfully";
export const team_member_updated_successfully = "User updated successfully";
export const tool_added_successfully = "Tool added successfully";
export const tool_updated_successfully = "Tool updated successfully";
export const stop_polling_successfully = "Stop polling successfully";
export const start_polling_successfully = "Start polling successfully";
export const mailbox_polling_added_successfully =
  "Mailbox polling added successfully";
export const mailbox_polling_updated_successfully =
  "Mailbox polling updated successfully";
export const mailbox_attachment_downloaded_successfully =
  "Mailbox attachment downloaded successfully";
export const user_role_added_successfully = "User role added successfully";
export const user_role_updated_successfully = "User role updated successfully";
export const emails_export_successfully = "Emails export successfully";
export const agent_export_successfully = "Agent export successfully";
export const agent_archive_successfully = "Agent archived successfully";
export const collection_added_successfully = "Collection added successfully";
export const collection_update_successfully = "Collection update successfully";
export const files_upload_successfully = "Files upload successfully";
export const file_rename_successfully = "File rename successfully";
export const file_name_validation = "File name has at least 4 characters";
export const something_went_wrong = "Something went wrong";
export const download_completed_successfully =
  "Download completed successfully";
export const integration_activated = "Integration activated successfully";
export const integration_deactivated = "Integration deactivated successfully";
export const integration_updated = "Integration updated successfully";
export const file_validation_error = "Upload up to 10 files only";
export const logout_successfully = "Logout successfully";

// Constants for Storage Type
export const STORAGE_TYPES = {
  LOCAL: "local",
  REMOTE: "remote",
} as const;

export type StorageType = (typeof STORAGE_TYPES)[keyof typeof STORAGE_TYPES];

/** Public folder paths for integration tool icons (Outlook, AWS S3) */
export const INTEGRATION_ICON_SRC: Record<string, string> = {
  outlook: "/integration-icons/outlook.svg",
  aws_s3: "/integration-icons/aws.svg",
  freshservice: "/integration-icons/freshservice.svg",
  sharepoint: "/integration-icons/sharepoint.svg",
  exa: "/integration-icons/exa.svg",
  openai: "/integration-icons/openai.svg",
};

// Default folder SVG for collection
export const defaultFolderIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';

// From tailwind color pallette
export const tagColors = [
  "#FECACA", // red-200

  "#FFBB77", // orange-200

  "#FBBF24", // amber-200

  "#FDE68A", // yellow-200

  "#D9F99D", // lime-200

  "#BBF7D0", // green-200

  "#6EE7B7", // emerald-200

  "#99F6E4", // teal-200

  "#A5F3FC", // cyan-200

  "#BFDBFE", // sky-200

  "#A5B4FC", // indigo-200

  "#FBCFE8", // pink-200

  "#FEC9D7", // rose-200

  "#E2E8F0", // slate-200
];
