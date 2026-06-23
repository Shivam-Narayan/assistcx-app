"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Info } from "lucide-react";
import AutoGrowingTextarea from "@/components/auto-grow-textarea";

interface OptimizationCardProps {
  currentOptimization: string;
  setCurrentOptimization: (value: string) => void;
  optimizationHistory: Array<{
    id: number | string;
    prompt: string;
    timestamp?: string;
  }>;
  onAddOptimization: () => void;
  isLoading: boolean;
}

export const OptimizationCard = ({
  currentOptimization,
  setCurrentOptimization,
  optimizationHistory,
  onAddOptimization,
  isLoading,
}: OptimizationCardProps) => {
  return (
    <Card className="bg-white py-0 gap-0 rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="bg-slate-100 px-4 py-4 border-b border-slate-200">
        <h2 className="text-base xl:text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-slate-700" />
          Optimize Agent
        </h2>
        <p className="text-xs xl:text-sm text-slate-600 mt-1">
          Fine-tune your agent&apos;s behavior and improve its performance.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Optimization History */}
        {optimizationHistory.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Previous Optimizations ({optimizationHistory.length})
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {optimizationHistory.map((opt) => (
                <div
                  key={opt.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <p className="text-sm text-slate-700">{opt.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Optimization Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Add New Optimization
          </label>
          <AutoGrowingTextarea
            value={currentOptimization}
            onChange={(e) => setCurrentOptimization(e.target.value)}
            maxHeight={280}
            maxLength={2000}
            disabled={isLoading}
            className="w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
            placeholder="e.g., Make responses more concise and technical, prioritize accuracy over speed, add more detailed explanations..."
          />
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="pt-0.5">
              Each optimization builds on previous ones. Be specific about
              behavior changes you want.
            </span>
          </div>
        </div>

        <Button
          onClick={onAddOptimization}
          disabled={!currentOptimization.trim() || isLoading}
          className="w-full cursor-pointer bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 className="h-4 w-4" />
          Optimize Agent
        </Button>
      </div>
    </Card>
  );
};
