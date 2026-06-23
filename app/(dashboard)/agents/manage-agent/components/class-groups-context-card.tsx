"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Tags } from "lucide-react";

import { ConfirmationDialog } from "@/components/confirmation-modal";
import { Card, CardContent } from "@/components/ui/card";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { getTimeAgo } from "@/helper/helper-function";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleDataTemplateEvents } from "@/redux/settings/data-template/data-template-events-slice";
import { handleClassGroupEvents } from "@/redux/settings/class-group/classgroup-events-slice";
import { handleClassGroupData } from "@/redux/settings/class-group/classgroup-data-slice";
import { AppDispatch } from "@/redux/store";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";

import { useAgentConfigData } from "../hook/useAgentConfigData";
import { AgentFormValues } from "../schemas/agent-schema";
import ContextItemSelectModal from "./context-item-select-modal";
import ContextSectionCard, {
  ContextRemoveItemButton,
} from "./context-section-card";

const ClassGroupsContextCard = ({ isEditing }: { isEditing: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { control, getValues, setValue } = useFormContext<AgentFormValues>();
  const [isClassGroupSelectorOpen, setIsClassGroupSelectorOpen] =
    useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const { loading } = useAxiosAuth();

  const { classGroupList, isClassGroupLoading, fetchClassGroup } =
    useAgentConfigData();

  const classGroupValues = useWatch({
    control,
    name: "settings.class_groups",
    defaultValue: [],
  });

  useEffect(() => {
    if (!loading && !hasFetched.current) {
      fetchClassGroup();
      hasFetched.current = true;
    }
  }, [loading]);

  const selectedClassGroups = classGroupList.filter((g: any) =>
    classGroupValues.some((v: any) => v?.id === g.id),
  );

  const handleRemoveClassGroup = (groupId: string) => {
    setPendingRemoveId(groupId);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!pendingRemoveId) return;
    const current = getValues("settings.class_groups") || [];
    const updated = current.filter((v: any) => v?.id !== pendingRemoveId);
    setValue("settings.class_groups", updated, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setPendingRemoveId(null);
    setConfirmOpen(false);
  };

  const handleViewClassGroup = (group: any) => {
    dispatch(handleDataTemplateEvents(""));
    dispatch(handleSheetEvents(true));
    dispatch(handleClassGroupEvents("viewClassGroup"));
    dispatch(
      handleClassGroupData({
        id: group.id,
        name: group.name,
        description: group.description,
        class_schema: group.class_schema ?? [],
        created_at: group.created_at,
        intent_uuid: group.intent_uuid,
      }),
    );
  };

  return (
    <>
      <ContextSectionCard
        icon={<Tags className="h-5 w-5" />}
        title="Class Groups"
        count={selectedClassGroups.length}
        selectLabel="Add Class Groups"
        onSelect={() => setIsClassGroupSelectorOpen(true)}
        isEditing={isEditing}
        isEmpty={!selectedClassGroups.length}
        isLoading={isClassGroupLoading}
        emptyIcon={<Tags />}
        emptyTitle="No class groups added"
        emptyDescription="Class groups are used to categorize content during task execution"
      >
        <div className="space-y-3">
          {selectedClassGroups.map((group: any) => (
            <Card
              key={group.id}
              className="relative cursor-pointer p-0 gap-0 group shadow-none break-words overflow-hidden hover:bg-primary/5 hover:border-primary/20"
              onClick={() => handleViewClassGroup(group)}
            >
              <CardContent className="flex flex-col gap-1.5 px-4 !py-4 relative">
                <div className="flex items-center gap-2 min-w-0 pr-8">
                  <div className="flex flex-row justify-between items-start gap-2 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1 pr-8">
                      <div className="flex flex-row w-full gap-x-2 items-center">
                        <ConditionalTooltip content={group.name}>
                          <p className="text-lg  font-medium text-foreground/90 line-clamp-1">
                            {group.name}
                          </p>
                        </ConditionalTooltip>
                      </div>
                      {/* {group.updated_at ? (
                        <p className="text-xs text-muted-foreground">
                          Updated {getTimeAgo(group.updated_at)}
                        </p>
                      ) : null} */}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description || "No description"}
                </p>
                {isEditing && (
                  <div className="absolute top-3 right-3">
                    <ConditionalTooltip
                      content="Remove Class Group"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                    >
                      <ContextRemoveItemButton
                        onRemove={(e) => {
                          e.stopPropagation();
                          handleRemoveClassGroup(group.id);
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
        open={isClassGroupSelectorOpen}
        setOpen={setIsClassGroupSelectorOpen}
        data={classGroupList}
        selectedItems={selectedClassGroups}
        onAdd={(items) => {
          const updated = items.map((item: any) => ({
            id: item.id || "",
            name: item.name || "",
          }));
          setValue("settings.class_groups", updated, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
        dialogTitle="Class Groups"
        searchPlaceholder="Search class groups..."
        emptyTitle="No class groups found"
        emptyDescription="No class groups match your search."
      />

      <ConfirmationDialog
        open={confirmOpen}
        confirm={handleConfirmRemove}
        cancel={() => {
          setConfirmOpen(false);
          setPendingRemoveId(null);
        }}
        title="Remove this class group?"
        description="This class group will be removed from the agent."
      />
    </>
  );
};

export default ClassGroupsContextCard;
