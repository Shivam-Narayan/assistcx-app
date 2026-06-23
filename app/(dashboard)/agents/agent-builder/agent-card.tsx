import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface Tool {
  label: string;
}

interface AgentCardProps {
  agentBuilderformData: {
    agentName: string;
    business_usecase: string;
    tools: Tool[];
  };
}

export const AgentCard = ({ agentBuilderformData }: AgentCardProps) => {
  return (
    <Card className="p-0 gap-0 border shadow-xs rounded-xl bg-white dark:bg-slate-800 overflow-hidden">
      <CardHeader className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">
            Agent Information
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Name
          </h4>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {agentBuilderformData.agentName || "Untitled Agent"}
          </p>
        </div>

        {/* Business Use Case */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Business Use Case
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {agentBuilderformData.business_usecase ||
              "No business use case defined yet."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
