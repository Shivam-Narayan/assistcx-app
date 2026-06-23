import { SmartContentViewer } from "@/components/smart-content";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { successCriteriaToStringArray } from "@/helper/helper-function";
import { X } from "lucide-react";

interface AgentConfigJsonViewProps {
  openConfigView: boolean;
  onOpenConfigView: (value: boolean) => void;
  agentData: any;
}

const AgentConfigView = ({
  openConfigView,
  onOpenConfigView,
  agentData,
}: AgentConfigJsonViewProps) => {
  const successCriteriaLines = agentData?.identity
    ? successCriteriaToStringArray(agentData.identity.success_criteria)
    : [];

  const formattedConfig = agentData
    ? {
        icon: agentData.identity?.icon,
        name: agentData.identity?.name,
        description: agentData.identity?.description,

        behaviour: {
          goal: agentData.identity?.goal,
          style: agentData.identity?.style,
          instructions: agentData.identity?.instructions,
          rules: agentData.identity?.rules?.map((r: any) => r.rule) || [],
          success_criteria:
            successCriteriaLines.length > 0
              ? successCriteriaLines.join("\n")
              : null,
          guidelines: agentData.identity?.guidelines?.length
            ? agentData.identity.guidelines
            : null,
        },

        tools:
          agentData.tools?.map((t: any) => ({
            name: t.name,
            action: t.action,
            description: t.description || null,
          })) || [],

        playbooks: agentData.planning?.length ? agentData.planning : null,

        response_schema: agentData.response_schema?.length
          ? agentData.response_schema
          : null,

        context: {
          knowledge_base: agentData.knowledge?.length
            ? agentData.knowledge
            : null,
          data_tables: agentData.data_tables?.length
            ? agentData.data_tables
            : null,
          data_templates: agentData.settings?.data_template?.length
            ? agentData.settings.data_template
            : null,
          class_groups: agentData.settings?.class_groups?.length
            ? agentData.settings.class_groups
            : null,
        },

        assignment_type: agentData.settings?.assignment_type || null,

        agent_settings: {
          agent_llm: agentData.settings?.agent_llm || null,
          create_task_by_attachments:
            agentData.settings?.create_task_by_attachments || false,
          retry_incomplete_tasks:
            agentData.settings?.retry_incomplete_tasks || false,
          allow_task_followup: agentData.settings?.allow_task_followup || false,
          vision_data_extraction:
            agentData.settings?.vision_data_extraction || false,
          human_review_users: agentData.settings?.human_review_users || [],
        },

        status: agentData.status as "ACTIVE" | "ARCHIVED",
      }
    : {};
  return (
    <Sheet open={openConfigView} onOpenChange={onOpenConfigView}>
      <SheetContent
        onCloseAutoFocus={() => onOpenConfigView(false)}
        className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
      >
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="w-full flex justify-start items-center space-x-2 divide-x">
            <SheetTitle className="px-3 text-lg font-medium text-foreground/80">
              View Configuration
            </SheetTitle>
          </div>

          <SheetClose asChild>
            <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
              <X className="h-5 w-5" />
            </div>
          </SheetClose>
        </SheetHeader>

        <div className="grow">
          <div className="grid gap-5 px-4 pb-4">
            <Card className="shadow-none p-0 gap-0">
              <CardContent className="p-0 flex flex-col divide-y divide-dashed ">
                {/* {isJsonExportInProgress ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                    <div className="relative">
                      <Loader className="mb-4 h-8 w-8 animate-spin" />
                    </div>
                    <span className="text-gray-600 font-medium animate-pulse">
                      Fetching Config...
                    </span>
                  </div>
                ) : ( */}
                <SmartContentViewer
                  content={formattedConfig}
                  maxHeight="fullHeight"
                  className="border-none"
                />
                {/* )} */}
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AgentConfigView;
