interface FileType {
  value: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const fileTypes: FileType[] = [
  {
    value: "pdf",
    label: "PDF",
    description: "Portable Document Format",
    icon: "FileText",
    color: "text-red-500",
  },
  {
    value: "docx",
    label: "DOCX",
    description: "Microsoft Word Document",
    icon: "FileText",
    color: "text-blue-500",
  },
  {
    value: "pptx",
    label: "PPTX",
    description: "Microsoft PowerPoint Presentation",
    icon: "FileText",
    color: "text-green-500",
  },
  {
    value: "txt",
    label: "TEXT",
    description: "Plain Text File",
    icon: "FileText",
    color: "text-gray-500",
  },
  {
    value: "md",
    label: "MARKDOWN",
    description: "Markdown File",
    icon: "FileCode2",
    color: "text-purple-500",
  },
  {
    value: "html",
    label: "HTML",
    description: "HyperText Markup Language File",
    icon: "FileCode2",
    color: "text-orange-500",
  },
  {
    value: "url",
    label: "URL",
    description: "Web Link or Hyperlink",
    icon: "Link",
    color: "text-cyan-500",
  },
];

/* */
export type ScheduleType =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "every_minute"
  | "once";

export interface ScheduleInfo {
  type: ScheduleType;
  time: string; // Format: "HH:mm"
  dayOfWeek?: string; // e.g., "Monday"
  dayOfMonth?: number; // 1-31
  date?: string; // Format: "YYYY-MM-DD"
}

export const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
