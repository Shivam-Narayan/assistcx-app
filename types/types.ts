import { TokenUsagePayload } from "@/app/(dashboard)/inbox/components/tasks/task-token-usage-dialog";
import {
  ControllerRenderProps,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

export type IconsData = {
  [x: string]: any;
  collection_icons: Record<string, string>;
  agent_icons: Record<string, string>;
  tool_icons: Record<string, string>;
  ai_icons: Record<string, string>;
  data_table_icons: Record<string, string>;
};

// knowledge module items
export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  file_count: number;
  total_size: number;
  updated_at: any;
  availability: string;
}

// Define StatusItem type
export interface StatusItem {
  status: string;
  timestamp: string;
  [key: string]: any; // Add additional fields as needed
}

export interface FileDataItem {
  id: string;
  name: string;
  updated_at: string;
  created_at: string;
  mime_type: string;
  size: number;
  collection_id: string;
  collection_name?: string;
  status: StatusItem[]; // StatusItem type defined below
  file_metadata?: { [key: string]: any }; // Dynamic metadata fields from AI extraction
  source_metadata?: { [key: string]: any }; // Source metadata like file_path
  acl_metadata?: { [key: string]: any }; // Access control metadata
  md5_hash?: string;
  source_type?: string;
  last_synced?: string;
  extracted_content: string;
  chunks: any[];
}

export interface AuthSchemaFieldDetails {
  name: string;
  label: string;
  description: string;
  type: string;
  required: boolean;
  example: string;
}

export interface AuthSchemaFields {
  preset?: {
    token_url: string;
    scope: string;
  };
  user?: Record<string, AuthSchemaFieldDetails>;
}

export interface IntegrationsItem {
  name: string;
  key: string;
  logo_url: string;
  tags: string[];
  description: string;
  auth_type: string;
  auth_schema: string;
  auth_schema_fields: AuthSchemaFields;
  integration_config: object;
  id: string;
  is_active: boolean;
}

export interface SharepointFolderNode {
  id: string;
  name?: string;
  displayName?: string;
  webUrl?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  siteId?: string;
  isFile?: boolean;
  isExpanded?: boolean;
  children?: SharepointFolderNode[];
  parent?: SharepointFolderNode;
  folder?: {
    childCount: number;
    decorator?: {
      iconColor?: string;
    };
  };
  parentReference?: {
    driveType?: string;
    driveId?: string;
    id?: string;
    name?: string;
    path?: string;
    siteId?: string;
  };
  siteCollection?: {
    hostname: string;
  };
  root?: {};
  description?: string;
  fileSystemInfo?: {
    createdDateTime: string;
    lastModifiedDateTime: string;
  };
  createdBy?: {
    application?: {
      id: string;
      displayName: string;
    };
    user?: {
      email: string;
      id: string;
      displayName: string;
    };
  };
  lastModifiedBy?: {
    application?: {
      id: string;
      displayName: string;
    };
    user?: {
      email: string;
      id: string;
      displayName: string;
    };
  };
  eTag?: string;
  cTag?: string;
  shared?: {
    scope: string;
  };
  size?: number;
}

export type Site = {
  id: string;
  displayName: string;
  name: string;
};

export type FileOrFolder = {
  id: string;
  name: string;
  folder?: {
    childCount: number;
    decorator?: { iconColor?: string };
  };
  size?: number;
  webUrl?: string;
  parentReference?: {
    siteId: string;
    id: string;
  };
  file?: {
    mimeType: string;
  };
  ["@microsoft.graph.downloadUrl"]?: string;
  // ...other fields as needed
};

// Type for breadcrumb navigation items
export interface BreadcrumbItem {
  id: string;
  name: string;
  isSite?: boolean;
}
// Review history for task execution
export interface ReviewHistoryItem {
  tool_name: string;
  tool_call_id: string;
  action_taken: "approve" | "edit" | "reject";
  question: string;
  feedback: string;
  original_params: Record<string, unknown> | null;
  edited_params: Record<string, unknown>;
  user_id: string;
  timestamp: string;
}

// Types for Task Execution Details
export interface ToolCallFunction {
  name: string;
  arguments: string; // Stringified JSON of arguments
}

export interface ToolCall {
  type: string;
  id: string;
  function: ToolCallFunction;
}

export interface ExecutionMessage {
  role: "user" | "assistant" | "tool";
  content: string | null; // Content can be null for assistant messages with tool_calls
  tool_calls?: ToolCall[];
  name?: string; // For tool role: the name of the tool that was called
  tool_call_id?: string; // For tool role: the ID of the tool call this is a response to
  credits?: number; // For tool role: credits consumed by the tool call
}

export interface IEmailData {
  email_id: string;
  mailbox_email: string;
  mailbox_folder: string;
  subject: string;
  received_at: string;
  created_at: string;
  sent_at: string;
  sender_name: string;
  email_body: string;
  intent_class: string;
  data_template: any;
  records: any;
  credits_used: number;
  status: string;
  id: string;
  agent_id: string;
  agent_task_counts: {
    QUEUED: number;
    EXECUTING: number;
    SUCCESSFUL: number;
    INCOMPLETE: number;
    FAILED: number;
    ARCHIVED: number;
    TOTAL: number;
  };
  attachment_details: { total: number; attachments: IAttachmentDetails[] };
  updated_at?: string;
  email_tags?: any;
}

interface Tool {
  name: string;
  action: string;
}

export interface IAgentDetails {
  id: string;
  name: string;
  description: string;
  goal: string;
  instructions: string | string[];
  tools: Tool[];
  icon: string;
  rules: string[];
  plan: any;
  agent_config?: {
    allow_task_followup?: boolean;
    automate_task_retry?: boolean;
    split_task_by_attachments?: boolean;
    split_task_by_records?: boolean;
    vision_data_extraction?: boolean;
    external_task_api?: boolean;
  };
}

export interface IAttachmentDetails {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface ProgressStatus {
  status: string;
  timestamp: string;
}

interface TaskData {
  task_order: string;
  attachment_id: string[];
}

export interface ITaskExecution {
  title: string;
  description: string;
  data: TaskData;
  progress: ProgressStatus[];
  credits_used: number;
  completed_at: string | null;
  id: string;
  email_data_id: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
  task_order: string;
  status: string;
  timestamp: string;
  attachment_id: string;
  attachment_details: { total: number; attachments: IAttachmentDetails[] };
  agent_icon: string;
  agent_name: string;
}

export interface ITaskExecutionDetails {
  tasks: ITaskExecution[];
  count: {
    SUCCESSFUL: number;
    TOTAL: number;
  };
}

// Define the interface for the extracted invoice data
export interface InvoiceData {
  document_type: string;
  invoice_number: string;
  invoice_date: string;
  purchase_order: string;
  vendor_name: string;
  subtotal_amount: string;
  total_amount: string;
  payment_terms: string;
  currency: string;
  line_items: Array<{
    item_description: string;
    quantity: string;
    unit_price: string;
    amount: string;
    currency: string;
  }>;
  file_url: string;
  email_id: string;
  mailbox_email: string;
  email_subject: string;
  received_date: string;
  received_time: string;
}

// Define the interface for the agent output
export interface AgentOutput {
  output: string;
  agent_actions: string;
  task_summary: null;
  credits_used: number;
  id: string;
  email_data_id: string;
  agent_task_id: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

// Define the interface for the attempts
export interface Attempt {
  id: string;
  agent_task_id: string;
  created_at: string;
}

// Define the main interface for the entire data structure
export interface AgentOutputMainData {
  agent_outputs: AgentOutput[];
  attempts: Attempt[];
  total: number;
}

export interface InboxFilters {
  status?: string[];
  mailbox?: string[];
  agent?: string[];
  tags?: string[];
  date_range?: {
    from: string;
    to: string;
  };
}
export interface DashboardFilters {
  agent_id?: string[];
  date_range?: {
    from: string;
    to: string;
  };
}

export interface ITaskActivity {
  user_id: string;
  user_name: string;
  entity_type: string;
  entity_id: string;
  activity_type: string;
  previous_state: {
    status: string;
  };
  new_state: {
    status: string;
  };
  note: string;
  activity_metadata: {
    reason: string;
    execution_node: string;
  };
  id: string;
  created_at: string;
}

export interface UserDataForProfile {
  first_name: string;
  last_name: string;
  email: string;
  role_key: string;
  avatarUrl?: string;
}

export interface ProfileSummaryCardProps {
  userData: UserDataForProfile;
  initials: string | null;
  userFullName: string | null;
}

export interface PersonalInformationCardProps {
  user: UserDataForProfile;
  form: UseFormReturn<any>;
  isEditing: boolean;
  updateUserLoading: boolean;
  onEdit: () => void;
  handleCancelEdit: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export interface nestedFieldData {
  name: string;
  description: string;
  data_type: string;
}

export interface agentOutput {
  id?: number;
  name: string;
  description: string;
  data_type: string;
  field_schema?: nestedFieldData[];
}

export interface SecurityCardProps {
  loadingPassword: boolean;
  isEditPassword: boolean;
  passwordForm: UseFormReturn<any>;
  passwordToggleState: any;
  handlePasswordShowHideToggle: (fieldName: string) => void;
  submitPasswordUpdate: (values: any) => Promise<void>;
  handleupdatePassword: () => void;
  handlePasswordCancel: () => void;
}

interface ComboBoxItem {
  label: string;
  value: string;
  description?: string;
  llm_key?: string;
  icon?: string;

  // LLM object data for popover
  provider?: string;
  model_name?: string;
  name?: string;
  integration_key?: string;
  [key: string]: any; // additional LLM properties
}

export interface ComboBoxWithDescriptionProps {
  items: readonly ComboBoxItem[];
  placeholder?: string;
  value: any;
  onChange: (value: string) => void;
  buttonClassName?: string;
  disabled?: boolean;
  displayAsBadge?: boolean;
  popoverSideOffset?: number;
  commandGroupClassName?: string;
  popoverContentClassName?: string;
  searchPlaceholder?: string;
  localSearch?: string;
  setLocalSearch?: (val: string) => void;
  align?: "start" | "center" | "end";
}
export interface MultiSelectComboBoxProps {
  items: ComboBoxItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  value: any;
  onChange: (value: string[]) => void;
  buttonClassName?: string;
  showClearButton?: boolean;
  displayMode?: "pills" | "text" | "pillsWithCount";
  localSearch?: string;
  setLocalSearch?: (val: string) => void;
}
interface ToolConfig {
  name?: string;
}

interface ToolsItem {
  id: string;
  label: string;
  value: string;
  description?: string;
  action?: string;
  icon?: string;
  name?: string;
  tool_config?: ToolConfig;
  is_default?: boolean;
  integration_key?: string;
}

type SelectionMode = "single" | "multiple";

export interface ToolsMultiSelectComboBoxProps {
  maxRows?: number;
  items: ToolsItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  value: any;
  onChange: (value: string[]) => void;
  buttonClassName?: string;
  showClearButton?: boolean;
  displayMode?: "pills" | "text" | "pillsWithCount";
  localSearch?: string;
  setLocalSearch?: (val: string) => void;
  disabled?: boolean;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  isLoading?: boolean;
  loadMoreTools?: () => void;
  filterOptions?: any;
  selectedFilter?: string;
  setSelectedFilter?: (val: string) => void;
  selectionMode?: SelectionMode;
  dialogHeaderText?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  icons?: any;
  defaultIcon?: any;
}

export interface LLMToolSelectorProps {
  items: ComboBoxItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  value: any;
  onChange: (value: string) => void;
  buttonClassName?: string;
  disabled?: boolean;
  displayAsBadge?: boolean;
  popoverSideOffset?: number;
  commandGroupClassName?: string;
  popoverContentClassName?: string;
  localSearch?: string;
  setLocalSearch?: (val: string) => void;
  align?: "start" | "center" | "end";
}

export interface IconPickerProps {
  label: string;
  icons: Record<string, string>;
  field: ControllerRenderProps<FieldValues, string>;
  disabled?: boolean;
  defaultIcon?: string;
}

export interface TokenUsageProps {
  credits_used?: number | null;
  token_usage?: TokenUsagePayload | null;
}
