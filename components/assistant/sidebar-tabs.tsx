import { ReactNode } from "react";

import {
  DASHBOARD,
  HISTORY,
  KNOWLEDGE,
  MY_FILES,
  TASK,
} from "@/lib/assistant-urls";

import {
  BookBookmark02Icon,
  ChatEditIcon,
  Clock03Icon,
  Files01Icon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

interface SidebarTabsProps {
  iconSize: number;
  segments: string[];
}

export interface SidebarTab {
  name: string;
  href: string;
  isActive: boolean;
  icon: ReactNode;
}

export const getSidebarTabs = ({
  iconSize,
  segments,
}: SidebarTabsProps): SidebarTab[] => {
  return [
    {
      name: "New Chat",
      href: DASHBOARD,
      isActive: segments.length === 0,
      icon: (
        <HugeiconsIcon icon={ChatEditIcon} size={iconSize} strokeWidth={1.75} />
      ),
    },
    {
      name: "History",
      href: HISTORY,
      isActive: segments[0] === "history",
      icon: (
        <HugeiconsIcon icon={Clock03Icon} size={iconSize} strokeWidth={1.75} />
      ),
    },
    {
      name: "My Files",
      href: MY_FILES,
      isActive: segments[0] === "files",
      icon: (
        <HugeiconsIcon icon={Files01Icon} size={iconSize} strokeWidth={1.75} />
      ),
    },
    {
      name: "Knowledge",
      href: KNOWLEDGE,
      isActive: segments[0] === "knowledge",
      icon: (
        <HugeiconsIcon
          icon={BookBookmark02Icon}
          size={iconSize}
          strokeWidth={1.75}
        />
      ),
    },
    {
      name: "Tasks",
      href: TASK,
      isActive: segments[0] === "task",
      icon: (
        <HugeiconsIcon
          icon={TaskDone01Icon}
          size={iconSize}
          strokeWidth={1.75}
        />
      ),
    },
  ];
};
