import {
  KnowledgeCollectionSelectedItem,
  SourceDocument,
} from "@/app/assistant/chat/_components/types";

export interface NavProps {
  isSidebarCollapse: boolean;
  setSidebarCollapse: (is: boolean) => void;
  isMobile?: boolean;
  isSidebarOpen?: boolean;
  onToggle?: () => void;
}

export interface AutoResizingTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
}
export interface CitationBlockProps {
  citation: {
    title?: string;
    content?: string;
    source_type?: string;
  };
  onClick?: () => void;
  IconComponent?: React.ElementType;
  iconColor?: string;
}

export type CitationTooltipProps = {
  citations: SourceDocument[] | Record<string, SourceDocument[]>;
  number: string;
  extraNumbers?: string[]; // <-- for “+X more” mode
};

export interface DatePickerFormFieldProps {
  label?: string;
  field: {
    value?: string;
    onChange: (value: string | undefined) => void;
    name: string;
    ref: (instance: HTMLButtonElement | null) => void;
    onBlur: () => void;
  };
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  disabledPastDate?: boolean;
  toYear?: number;
}
export interface KnowledgeCollectionMenuProps {
  selected: KnowledgeCollectionSelectedItem[] | null;
  onSelectionChange: (items: KnowledgeCollectionSelectedItem[] | null) => void;
  onClearAll: () => void;
  webSearchSlot?: React.ReactNode;
  maxSelection?: number;
  triggerLabel?: string;
  trigger?: React.ReactNode;
}

export interface MarkdownToPdfProps {
  content: string;
  question: string;
  timeStamp?: string | undefined;
  sources?: SourceDocument[];
}
