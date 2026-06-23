"use client";

import {
  UserCircle,
  Layers,
  Settings,
  Bolt,
  FolderOutput,
  Lightbulb,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  {
    id: "identity",
    label: "Identity",
    description: "Profile, behaviour, and guidelines for this agent",
    icon: UserCircle,
  },
  {
    id: "tools",
    label: "Tools",
    description: "Actions and integrations available to the agent",
    icon: Bolt,
  },
  {
    id: "context",
    label: "Context",
    description: "Knowledge, data tables, templates, and class groups",
    icon: Layers,
  },
  {
    id: "planning",
    label: "Planning",
    description: "Step-by-step execution flow for agent tasks",
    icon: Lightbulb,
  },
  {
    id: "output",
    label: "Output",
    description: "Define fields to capture in task output",
    icon: FolderOutput,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Operational preferences for this agent",
    icon: Settings,
  },
];

export const AgentSidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-white text-foreground/90 border-r px-4 py-6 space-y-2 min-w-[200px] w-full max-w-[256px] overflow-hidden">
      <div className="flex-1 space-y-2 min-h-0 overflow-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <div
              key={tab.id}
              className={`flex items-start gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="pt-0.5">
                <Icon className="h-5 w-5" />
              </div>

              <div className="text-sm leading-tight">
                <div
                  className={`font-semibold ${isActive ? "text-primary" : ""}`}
                >
                  {tab.label}
                </div>

                <div
                  className={`text-xs ${
                    isActive ? "text-primary/70" : "text-muted-foreground"
                  }`}
                >
                  {tab.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
