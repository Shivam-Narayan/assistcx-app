import { ChatMessage } from "@/app/assistant/history/_components/types";
import { formSchema } from "@/lib/schemas/assistant/task/task-schemas";
import { CollectionData } from "@/redux/assistant/chat/chat-slice";
import { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
export type TaskItem = {
  id: string;
  user_id: string;
  title: string;
  task_prompt: string;
  collections: CollectionData[];
  schedule: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  status?: string;
};

export type TaskMeta = {
  type: string;
  time: string;
  date?: string | null;
  dayOfWeek?: string;
  dayOfMonth?: string;
};

export type UseTaskListResult = {
  tasks: TaskItem[];
  setTasks: Dispatch<SetStateAction<TaskItem[]>>;
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  tab: string;
  time: string;
  day: string;
  hasMore: boolean;
  debouncedSearch: string;
  loaderRef: RefObject<HTMLDivElement | null>;
  isTaskDetail: boolean;
  setIsTaskDetail: Dispatch<SetStateAction<boolean>>;
  fetchTasks: (
    pageNum: number,
    keyword: string,
    isNewSearch?: boolean,
  ) => Promise<void>;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  suggestionData: { name?: string; prompt?: string } | null;
  handleTaskDetail: (
    newTab?: string,
    newTime?: string,
    newDay?: string,
    suggestion?: { name?: string; prompt?: string } | null,
  ) => void;
  getTaskMeta: (task: TaskItem) => TaskMeta | null;
};
export interface TaskCardProps {
  task: TaskItem;
  cron: {
    type: string;
    time: string;
    dayOfWeek?: string;
    dayOfMonth?: string;
    date?: string | null;
  };
  className?: string;
}

export interface SelectedSourcesProps {
  children: React.ReactNode;
  taskId: string;
  fetchTaskList?: () => void;
  onStatusChange?: (id: string, status: string) => void;
}
export interface TaskDetails {
  id: string;
  user_id: string;
  title: string;
  task_prompt: string;
  collections: CollectionData[];
  schedule: string;
  status: string;
  is_archived: boolean;
  chat_messages: ChatMessage[];
  created_at: string | Date;
  updated_at: string | Date;
  notification_recipients?: string[];
  web_search_enabled?: boolean;
}
export interface TaskResponseDetailProps {
  taskId: string;
}

export interface TaskFormSourceProps {
  isWebSearchMode: boolean;
  isKnowledgeMode: boolean;
  selectedCollections: CollectionData[] | [];
  onWebSearchToggle: () => void;
  onSelectionChange: (collections: any) => void;
  onClearAll: () => void;
}

export interface TaskFormScheduleProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  activeTab: string;
}

export interface TaskFormRecipientsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  input: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveEmail: (email: string) => void;
}

export interface TaskFormHeaderProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  onClose: () => void;
}

export type ScheduleType = "once" | "daily" | "weekly" | "monthly" | "yearly";

export interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab?: ScheduleType;
  mode?: "add" | "edit";
  initialData?: Partial<z.infer<typeof formSchema>>;
  time?: string;
  fetchTaskList?: () => void;
  id?: string;
  fetchTaskDetails?: () => void;
  day?: string;
}

export interface UseTaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab?: ScheduleType;
  mode?: "add" | "edit";
  initialData?: Partial<z.infer<typeof formSchema>>;
  time?: string;
  fetchTaskList?: () => void;
  id?: string;
  fetchTaskDetails?: () => void;
  day?: string;
}
