"use client";

import { Card } from "@/components/ui/card";

interface AgentInformationCardProps {
  agentName: string;
  businessUsecase: string;
  style?: string;
}

export const AgentInformationCard = ({
  agentName,
  businessUsecase,
  style,
}: AgentInformationCardProps) => {
  return (
    <Card className="bg-white py-0 gap-0 rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="bg-slate-100 px-4 py-4 border-b border-slate-200">
        <h2 className="text-base xl:text-lg font-semibold text-slate-900">
          Agent Information
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Name
          </div>
          <div className="text-base xl:text-lg font-semibold text-slate-900">
            {agentName || "Untitled Agent"}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Business Use Case
          </div>
          <div className="text-sm text-slate-700 leading-relaxed">
            {businessUsecase || "No business use case defined yet."}
          </div>
        </div>

        {style && (
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Style
            </div>
            <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-300">
              {style}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
