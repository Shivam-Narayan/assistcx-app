import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultFolderIcon } from "@/lib/constants";
import { Plus, Wrench, X } from "lucide-react";
import { useState } from "react";
import { AgentToolsListSheets } from "../manage-agent/components/agent-tools-list-sheets";

interface ToolsCardProps {
  selectedTools: any[];
  setSelectedTools: (val: any) => void;
  isLoading: boolean;
}

const ToolsCardComponent = ({
  selectedTools,
  setSelectedTools,
  isLoading,
}: ToolsCardProps) => {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const toggleToolSheet = (toggleValue: boolean) => {
    setIsAddSheetOpen(toggleValue || false);
  };

  const removeTool = (id: any) => {
    setSelectedTools(selectedTools.filter((tool) => tool.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="p-0 gap-0 border shadow-xs rounded-xl bg-white dark:bg-slate-800 overflow-hidden">
        <CardHeader className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Tools
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {selectedTools.length}{" "}
                  {selectedTools.length === 1 ? "tool" : "tools"} selected
                </p>
              </div>
            </div>
            <Button
              onClick={() => toggleToolSheet(true)}
              disabled={isLoading}
              className="flex items-center gap-2 h-10 px-4 font-medium transition-all hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Tools
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Tools List */}
          <div className="space-y-3">
            {selectedTools.length > 0 ? (
              <div className="space-y-3">
                {selectedTools.map((tool) => {
                  return (
                    <Card
                      key={tool.id}
                      className="p-0 border shadow-xs rounded-lg bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-muted rounded-full w-fit h-fit text-secondary-foreground">
                            <div
                              className="flex items-stretch"
                              dangerouslySetInnerHTML={{
                                __html:
                                  tool.icon
                                    ? getIconSvg(tool.icon, "tool_icons") || defaultFolderIcon
                                    : defaultFolderIcon,
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                              {tool.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                              {tool.description}
                            </p>
                          </div>
                          <Button
                            onClick={() => removeTool(tool.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Remove tool"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No tools selected
                </p>
              </div>
            )}
          </div>

          {selectedTools.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                No tools selected
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AgentToolsListSheets
        sheetOpenEvent={isAddSheetOpen}
        closeSheetEvent={() => toggleToolSheet(false)}
        userSelectionTools={selectedTools || []}
        setUserSelectionTools={(val: any) => setSelectedTools(val)}
      />
    </div>
  );
};

export default ToolsCardComponent;
