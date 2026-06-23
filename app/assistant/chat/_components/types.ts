import { TokenUsagePayload } from "@/app/(dashboard)/inbox/components/tasks/task-token-usage-dialog";
import { MarkdownSize } from "@/components/ui/markdown";
import {
  AttachmentData,
  CollectionData,
} from "@/redux/assistant/chat/chat-slice";
import { ToolCall } from "@/types/types";
import * as Icon from "lucide-react";
import { FC } from "react";

export type DataStatus =
  | "pending"
  | "planning"
  | "executing"
  | "completed"
  | "generating";
export type TaskStatus = "pending" | "executing" | "completed";
export type TaskStage = "planning" | "searching" | "analyzing" | "completed";
export type TaskType =
  | "event"
  | "state"
  | "thinking"
  | "tool_call"
  | "tool_call_result"
  | "answer"
  | "final_state"
  | "error";
export type node = "answer_generator";
export interface FileData {
  name: string;
  url: string;
  type?: string;
  size?: number;
  lastModified?: number;
}
export interface SourceMetadata {
  file_name?: string;
  file_extension?: string;
  file_uuid?: string;
  source_file?: string;
  mime_type?: string;
  publication?: string;
  collection?: string;
  file_type?: string;
  author?: string;
  created_date?: string;
  relevance?: number;
  query?: string;
  page_number?: number;
  chapter?: string;
  published_date?: string;
  publisher?: string;
  // Web source fields (e.g. Exa search results)
  url?: string;
  exa_id?: string;
  score?: number;
  source?: string;
  title?: string;
}

// Source document types
export interface SourceDocument {
  id: string;
  title: string;
  content: string;
  source_type: string;
  url: string | null;
  metadata: SourceMetadata;
  relevance_score: number;
}

// Grouped source types — used for deduplication and citation clustering
export interface GroupedSourceItem {
  source: SourceDocument;
  citationNumber: number;
}

export interface GroupedSource {
  groupKey: string;
  title: string;
  url: string;
  domain: string;
  source_type: string;
  items: GroupedSourceItem[];
}

// Citation related types
export interface Citation {
  citation_number: number;
  source_id: string;
  citation_text: string;
  start_idx: number;
  end_idx: number;
}

export interface RagTask {
  id: string;
  title: string;
  objective: string;
  status?: TaskStatus;
  stage?: TaskStage;
  search_queries: string[];
  source_ids?: string[];
  sources: SourceDocument[];
  type: string;
  knowledge_collection: string;
  result?: string;
  start_time?: string;
  end_time?: string;
  completed?: boolean;
}

export interface Feedback {
  sentiment: string;
  comment: string;
  category?: string[]; // Optional category for feedback
}
export interface UserMessage {
  id: string | number;
  role: "user";
  files?: FileData[];
  question: string;
  collections?: CollectionData[] | null;
  attchments?: AttachmentData[] | null;
  mode?: string;
  webSearch?: boolean;
  chat_id?: string;
  content?: string;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
  message_id?: string; // Unique identifier for the message
  feedback?: Feedback;
}
export interface Context {
  title?: string;
  chat_id?: string;
  start_time?: string;
  end_time?: string;
  thread_id?: string;
  relevant_sources?: SourceDocument[];
  messages?: MessageBase[];
  suggested_queries?: string[];
  citations?: Citation[];
  status?: DataStatus;
  research_complete?: boolean;
}

export interface originalPayload {
  input: string;
  files?: FileData[];
  collections?: CollectionData[] | null;
  attchments?: AttachmentData[] | null;
  webSearch?: boolean;
  chat_id?: string;
}
export type StreamEvent =
  | { type: "thinking"; text: string }
  | {
      type: "tool_call";
      tool_call_id: string;
      tool: string;
      args: { queries: string[] };
    }
  | { type: "tool_result"; tool_call_id: string; output: string };

export interface AssistantMessage {
  id: string | number;
  role: "assistant";
  answer: string;
  status: DataStatus;
  isStreaming: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  relevant_sources?: SourceDocument[];
  citations?: Citation[];
  question?: string;
  thread_id?: string;
  type?: TaskType;
  node?: string;
  event?: string;
  chat_id?: string;
  content?: string;
  context?: Context;
  graph_state?: Context;
  suggested_queries?: string[];
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
  message_id?: string; // Unique identifier for the message
  feedback?: Feedback;
  originalPayload?: originalPayload;
  start_time?: string;
  end_time?: string;
  final_state_data?: string;
  timestamp?: string;
  // research_plan?: MessageBase[];
  research_complete?: boolean;
  stream_events: StreamEvent[];
  token_usage?: TokenUsagePayload | null;
  credits_used?: number | null;
}
export type ChatMessage = UserMessage | AssistantMessage;

export interface ChatBasicProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  isStreaming?: boolean;
  setIsStreaming?: (value: boolean) => void;
  status?: DataStatus;
  streamingDisabled?: boolean;
  onDisabledChange?: (disabled: boolean) => void;
  onSuggestionClick?: (suggestion: string) => void;
  handleRetryMessage?: (messageId: string) => void;
  handleRegenerateMessage?: (messageId: string) => void;
  onScrollTop?: () => void;
  isFetchingMore?: boolean;
  isNewChat?: boolean;
  scrollConversion?: boolean;
  onScrolled?: () => void;
  boxHeight?: number;
}

export interface RAGStreamState {
  answer: string;
  retrieved_sources: SourceDocument[];
  tasks: RagTask[];
  citations: Citation[];
  query: string;
  status: DataStatus;
  plan?: ExecutionPlan;
  isStreaming: boolean;
  chat_id?: string;
  selected_source_ids?: string[];
  suggested_queries?: string[];
  message_id?: string;
}

export interface ExecutionPlan {
  id?: string;
  title: string;
  reasoning: string[];
  tasks?: RagTask[];
  research_complete?: boolean;
}

export interface MessageBase {
  content: String;
  type: String;
  name: String | null;
  role?: "user" | "assistant" | "tool";
  id: String;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export type ChatInputProps = {
  prompt?: boolean;
  className?: string;
  isStreaming?: boolean;
  isDisabled?: boolean;
  isMain?: boolean;
  setChatInputHeight?: (height: number) => void;
  onSubmit?: (
    input: string,
    selectedCollection: CollectionData[] | null,
    selectedAttachment: AttachmentData[] | null,
    webSearchEnabled: boolean,
    chat_id: string,
    reset: () => void,
  ) => void;
  onAbort?: () => void;
};

export interface ChatMessageProps {
  message: ChatMessage;
  isStreaming: boolean;
  setIsStreaming: (value: boolean) => void;
  className?: string;
  streamingDisabled?: boolean;
  lastMessageId?: string | number | null;
  sources: SourceDocument[];
  status?: string;
  handleRegenerateMessage?: (messageId: string) => void;
}

export interface MarkdownStreamingProps {
  message: {
    id: number | string;
    role: "user" | "assistant";
    answer?: string;
  };
  setIsStreaming?: (state: boolean) => void;
  sources?: SourceDocument[];
  isStreaming?: boolean;
  streamingDisabled?: boolean;
  size?: MarkdownSize;
}

export interface FeedbackOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    category: string[];
    comment: string;
    sentiment: string;
  }) => void;
  feedback: Feedback;
}

export interface JsonViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: string | undefined;
}

export interface MessageDotsProps {
  messages: ChatMessage[];
  activeMessageId: string | null;
  setActiveMessageId: (id: string) => void;
  messageRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  scrollToMessageById: (id: string) => void;
}

export type DotItem =
  | { type: "msg"; msg: ChatMessage }
  | { type: "ellipsis"; key: string };

export interface PlanHeaderProps {
  isPlanExpanded: boolean;
  isCompleted: boolean;
  stepsLength: number;
  togglePlan: () => void;
}

export type SelectedAttachmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAttachment: AttachmentData[];
  onRemove: (collection: AttachmentData) => void;
};

export type SelectedCollectionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCollections: CollectionData[];
  onRemove: (collection: CollectionData) => void;
};

export interface SelectedSourcesSheetProps {
  groupedSources: GroupedSource[];
  totalSourceCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface SelectedSourcesProps {
  sources: SourceDocument[];
}
export interface SourceCardProps {
  groupedSource: GroupedSource;
  index?: number;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  isCollapsed?: boolean;
}
export type SearchOption = {
  value: string;
  label: string;
  description: string;
  icon: keyof typeof Icon;
};

export type footerProps = {
  source: SourceDocument;
  handleDownload: () => void;
  className?: string;
};

export interface IconData {
  color?: string;
}

export interface SourceCardPopupProps {
  groupedSource: GroupedSource;
  setOpen: (isOpen: boolean) => void;
}

export interface SourceCardDetailProps {
  groupedSource: GroupedSource;
  index?: number;
  cardClassName?: string;
}

export interface SuggestedQueriesProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export type CollectionConfig = {
  data_store?: {
    storage_type?: string;
    storage_bucket?: string;
    storage_folder?: string;
    storage_region?: string;
    embedding_model?: string;
  };
};
export type KnowledgeItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_root: boolean;
  parent_id: string;
  status: string;
  collection_config?: CollectionConfig;
  index_name: string;
  file_count: number;
  total_size: number;
  created_at: string;
  updated_at: string;
  owner_id?: string;
  availability?: string;
};
export type FileMetadata = {
  ewetyu?: string | null;
  doc_type?: string;
  doc_title?: string;
  doc_entities?: string[];
  doc_filename?: string;
  doc_keywords?: string[];
  doc_overview?: string;
  smart_field_1?: string | null;
  smart_field_2?: string | null;
};
export type DataFile = {
  name: string;
  size: number;
  mime_type?: string;
  md5_hash?: string;
  source_type?: string;
  source_metadata?: object;
  file_metadata?: FileMetadata;
  acl_metadata?: {
    additionalProp1: object;
  };
  status?: [
    {
      status?: string;
      timestamp?: string;
    },
  ];
  last_synced?: string;
  id?: string;
  collection_id?: string;
  created_at?: string;
  updated_at?: string;
};

export interface ApiResponse {
  data_collections: KnowledgeItem[];
  total: number;
  page: number;
  page_size: number;
}

export type KnowledgeCollectionListItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  index_name: string;
  availability?: string;
};

export type KnowledgeCollectionSelectedItem = {
  id: string;
  name: string;
  description: string;
  index_name: string;
  availability?: string;
  icon?: string;
};

export type FetchCollectionsResult = {
  items: KnowledgeCollectionListItem[];
  hasMore: boolean;
};

export type FetchCollectionsFn = (
  page: number,
  keyword: string,
  isNewSearch: boolean,
) => Promise<FetchCollectionsResult>;

export interface UseCollectionListOptions {
  open: boolean;
  selected: KnowledgeCollectionSelectedItem[] | null;
  fetchCollections: FetchCollectionsFn;
  authLoading?: boolean;
  maxSelections?: number;
  onOpenWithNoSelection?: () => void;
  searchDebounceMs?: number;
}

export interface UseCollectionListReturn {
  collections: KnowledgeCollectionListItem[];
  isLoading: boolean;
  isFetchingMore: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  debouncedSearch: string;
  hasMore: boolean;
  tempSelected: KnowledgeCollectionSelectedItem[] | null;
  setTempSelected: (value: KnowledgeCollectionSelectedItem[] | null) => void;
  loaderRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  toggleItem: (item: KnowledgeCollectionListItem) => void;
  clearTempSelected: (onClearAll?: () => void) => void;
  resetToInitial: () => void;
}
export interface CollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: KnowledgeCollectionSelectedItem[] | null;
  onApply: (selected: KnowledgeCollectionSelectedItem[] | null) => void;
  onClearAll?: () => void;
  fetchCollections: FetchCollectionsFn;
  authLoading?: boolean;
  variant?: "assistant" | string;
  showWebSearch?: boolean;
  webSearchComponent?: React.ReactNode;
  trigger?: React.ReactNode;
  title?: string;
  titleHref?: string;
  onTitleClick?: () => void;
  applyButtonText?: string;
  maxSelections?: number;
  searchPlaceholder?: string;
  disabled?: boolean;
  pageSize?: number;
  onOpenWithNoSelection?: () => void;
  onClose?: () => void;
  contentClassName?: string;
  scrollMinHeight?: string;
  scrollMaxHeight?: string;
}

export type AttachmentCollectionsProps = {
  disabled?: boolean;
};

export type SendMessageParams = {
  input: string;
  collections?: CollectionData[] | null;
  attchments?: AttachmentData[] | null;
  webSearch?: boolean;
  chat_id?: string;
  baseMessages?: ChatMessage[];
};

export interface ChatThreadState {
  threadMessages: ChatMessage[];
  isStreaming: boolean;
  status: DataStatus;
  currentChatId: string | null;
  isNewChat: boolean;
  isFetchingMore: boolean;
  hasMoreMessages: boolean;
  historyPage: number;
  historyFetchFailed: boolean;
}
export type ChatThreadAction =
  | { type: "SET_THREAD_MESSAGES"; payload: ChatMessage[] }
  | { type: "APPEND_THREAD_MESSAGES"; payload: ChatMessage[] }
  | { type: "PREPEND_THREAD_MESSAGES"; payload: ChatMessage[] }
  | { type: "SET_STREAMING"; payload: boolean }
  | { type: "SET_STATUS"; payload: DataStatus }
  | { type: "SET_CURRENT_CHAT_ID"; payload: string | null }
  | { type: "SET_IS_NEW_CHAT"; payload: boolean }
  | {
      type: "SET_HISTORY_STATE";
      payload: {
        isFetchingMore?: boolean;
        hasMoreMessages?: boolean;
        historyPage?: number;
        historyFetchFailed?: boolean;
      };
    }
  | { type: "RESET_THREAD" };

export interface FeedbackPayload {
  sentiment: string;
  comment: string;
  category?: string[];
}

export interface UseMessageActionsReturn {
  isCopied: boolean;
  handleCopy: () => void;
  sentiment: string | undefined;
  categories: string[];
  comment: string;
  handleLike: () => void;
  handleDislike: () => void;
  handleFeedbackSubmit: (data: {
    category: string[];
    comment: string;
    sentiment: string;
  }) => void;
  showFeedback: boolean;
  setShowFeedback: (value: boolean) => void;
  showJson: boolean;
  setShowJson: (value: boolean) => void;
  isRootUser: boolean;
  showTokenUsageSheet: boolean;
  setShowTokenUsageSheet: (value: boolean) => void;
}
