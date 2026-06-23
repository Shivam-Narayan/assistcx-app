import { Check, Pencil, X, type LucideIcon } from "lucide-react";

export type ReviewAction = "approve" | "edit" | "reject";

export interface ReviewActionConfig {
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
  badgeClassName: string;
  textClassName: string;
}

export const REVIEW_ACTION_CONFIG: Record<ReviewAction, ReviewActionConfig> = {
  approve: {
    label: "Approved",
    icon: Check,
    iconClassName: "h-3.5 w-3.5",
    badgeClassName:
      "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30",
    textClassName: "text-green-700 dark:text-green-400",
  },
  edit: {
    label: "Edited",
    icon: Pencil,
    iconClassName: "h-3 w-3",
    badgeClassName:
      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/30",
    textClassName: "text-amber-700 dark:text-amber-400",
  },
  reject: {
    label: "Rejected",
    icon: X,
    iconClassName: "h-3.5 w-3.5",
    badgeClassName:
      "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30",
    textClassName: "text-red-700 dark:text-red-400",
  },
};
