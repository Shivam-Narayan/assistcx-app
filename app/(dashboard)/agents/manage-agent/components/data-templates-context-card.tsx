"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { FileText } from "lucide-react";

import { ConfirmationDialog } from "@/components/confirmation-modal";
import { Card, CardContent } from "@/components/ui/card";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { getTimeAgo } from "@/helper/helper-function";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleDataTemplateEvents } from "@/redux/settings/data-template/data-template-events-slice";
import { handleDataTemplate } from "@/redux/settings/data-template/data-template-slice";
import { handleClassGroupEvents } from "@/redux/settings/class-group/classgroup-events-slice";
import { AppDispatch } from "@/redux/store";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";

import { useAgentConfigData } from "../hook/useAgentConfigData";
import { AgentFormValues } from "../schemas/agent-schema";
import ContextItemSelectModal from "./context-item-select-modal";
import ContextSectionCard, {
  ContextRemoveItemButton,
} from "./context-section-card";

const DataTemplatesContextCard = ({ isEditing }: { isEditing: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { control, getValues, setValue } = useFormContext<AgentFormValues>();
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const { loading } = useAxiosAuth();

  const { dataTemplates, isDataTemplateLoading, getDataTemplates } =
    useAgentConfigData();

  const dataTemplateValues = useWatch({
    control,
    name: "settings.data_template",
    defaultValue: [],
  });

  useEffect(() => {
    if (!loading && !hasFetched.current) {
      getDataTemplates();
      hasFetched.current = true;
    }
  }, [loading]);

  const selectedTemplates = dataTemplates.filter((t: any) =>
    dataTemplateValues.some((v: any) => v?.id === t.id),
  );

  const handleRemoveTemplate = (templateId: string) => {
    setPendingRemoveId(templateId);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!pendingRemoveId) return;
    const current = getValues("settings.data_template") || [];
    const updated = current.filter((v: any) => v?.id !== pendingRemoveId);
    setValue("settings.data_template", updated, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setPendingRemoveId(null);
    setConfirmOpen(false);
  };

  const handleViewTemplate = (template: any) => {
    dispatch(handleClassGroupEvents(""));
    dispatch(handleSheetEvents(true));
    dispatch(handleDataTemplateEvents("viewDataTemplate"));
    dispatch(
      handleDataTemplate({
        id: template.id,
        name: template.name,
        template_class: template.template_class,
        description: template.description,
        document_instructions: template.document_instructions || [],
        data_schema: template.data_schema || [],
      }),
    );
  };

  return (
    <>
      <ContextSectionCard
        icon={<FileText className="h-5 w-5" />}
        title="Data Templates"
        count={selectedTemplates.length}
        selectLabel="Add Data Templates"
        onSelect={() => setIsTemplateSelectorOpen(true)}
        isEditing={isEditing}
        isEmpty={!selectedTemplates.length}
        isLoading={isDataTemplateLoading}
        emptyIcon={<FileText />}
        emptyTitle="No data templates added"
        emptyDescription="Data templates define the structured data the agent extracts from tasks"
      >
        <div className="space-y-3">
          {selectedTemplates.map((template: any) => (
            <Card
              key={template.id}
              className="relative cursor-pointer p-0 gap-0 group shadow-none break-words overflow-hidden hover:bg-primary/5 hover:border-primary/20"
              onClick={() => handleViewTemplate(template)}
            >
              <CardContent className="flex flex-col gap-1.5 px-4 !py-4 relative">
                <div className="flex items-center gap-2 min-w-0 pr-8">
                  <div className="flex flex-row justify-between items-start gap-2 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1 pr-8">
                      <div className="flex flex-row w-full gap-x-2 items-center">
                        <ConditionalTooltip content={template.name}>
                          <p className="text-lg  font-medium text-foreground/90 line-clamp-1">
                            {template.name}
                          </p>
                        </ConditionalTooltip>
                      </div>
                      {/* {template.updated_at ? (
                        <p className="text-xs text-muted-foreground">
                          Updated {getTimeAgo(template.updated_at)}
                        </p>
                      ) : null} */}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description || "No description"}
                </p>
                {isEditing && (
                  <div className="absolute top-3 right-3">
                    <ConditionalTooltip
                      content="Remove Data Template"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                    >
                      <ContextRemoveItemButton
                        onRemove={(e) => {
                          e.stopPropagation();
                          handleRemoveTemplate(template.id);
                        }}
                      />
                    </ConditionalTooltip>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ContextSectionCard>

      <ContextItemSelectModal
        open={isTemplateSelectorOpen}
        setOpen={setIsTemplateSelectorOpen}
        data={dataTemplates}
        selectedItems={selectedTemplates}
        onAdd={(items) => {
          const updated = items.map((item: any) => ({
            id: item.id || "",
            name: item.name || "",
          }));
          setValue("settings.data_template", updated, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
        dialogTitle="Data Templates"
        searchPlaceholder="Search data templates..."
        emptyTitle="No data templates found"
        emptyDescription="No data templates match your search."
      />

      <ConfirmationDialog
        open={confirmOpen}
        confirm={handleConfirmRemove}
        cancel={() => {
          setConfirmOpen(false);
          setPendingRemoveId(null);
        }}
        title="Remove this data template?"
        description="This data template will be removed from the agent."
      />
    </>
  );
};

export default DataTemplatesContextCard;
