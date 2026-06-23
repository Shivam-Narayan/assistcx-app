"use client";

import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { FormHeaderHeading } from "@/components/ui/form-header";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import AgentRulesSection from "../components/agent-rules-card";
import InstructionCard from "../components/instruction-card";
import SuccessCriteriaSection from "../components/success-criteria-card";
import { AgentFormValues } from "../schemas/agent-schema";
import IdentityForm from "../components/identity-form";
import IdentityCard from "../components/identity-card";
import GuidelinesList from "../components/guidelines-list";
import GuidelinesDialog from "../components/guidelines-dialog";

const IdentitySection = ({ isEditing }: { isEditing: boolean }) => {
  const searchParams = useSearchParams();
  const agentId = searchParams?.get("uuid") ?? null;
  const { control, trigger, getValues, setValue, watch } =
    useFormContext<AgentFormValues>();

  const guidelines = watch("identity.guidelines");
  const { fields, append, remove } = useFieldArray({
    control,
    name: "identity.guidelines",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);
  const [isNew, setIsNew] = useState(false);
  const [backup, setBackup] = useState<any>(null);

  const handleOpenDialog = () => {
    const newIndex = fields.length;

    append({
      name: "",
      instructions: "",
    });

    setEditingIndex(newIndex);
    setIsNew(true);
    setBackup(null);
    setIsFormOpen(true);
  };
  const handleEditGuidelines = (index: number) => {
    const originalList = structuredClone(
      getValues(`identity.guidelines.${index}`),
    );

    setBackup({ ...originalList });
    setEditingIndex(index);
    setIsNew(false);
    setIsFormOpen(true);
  };

  const handleDeleteGuidelines = (index: number) => {
    remove(index);
    setOpenIndexes((prev) => prev.filter((i) => i !== index));
  };

  const handleCancel = () => {
    if (editingIndex === null) return;

    if (isNew) {
      remove(editingIndex);
    } else if (backup) {
      setValue(`identity.guidelines.${editingIndex}`, backup, {
        shouldDirty: true,
      });
    }

    setEditingIndex(null);
    setBackup(null);
    setIsNew(false);
    setIsFormOpen(false);
  };

  const handleSave = async () => {
    if (editingIndex === null) return;

    const isValid = await trigger([
      `identity.guidelines.${editingIndex}.name`,
      `identity.guidelines.${editingIndex}.instructions`,
    ]);

    if (!isValid) return;

    setEditingIndex(null);
    setIsFormOpen(false);
  };

  useEffect(() => {
    if (guidelines?.length) {
      setOpenIndexes(guidelines.map((_, index) => index));
    }
  }, [guidelines]);
  return (
    <>
      <div className="w-full px-4 py-4 overflow-y-auto">
        <FormHeaderHeading
          title="Profile"
          subtitle="Define the agent's identity and purpose, including how it appears and what it is responsible for."
          isRequired={false}
        />

        <div className="pt-3">
          <div className="space-y-4 py-3">
            {isEditing ? (
              <IdentityForm isEditing={isEditing} />
            ) : (
              <IdentityCard agentId={agentId} />
            )}
          </div>
        </div>
      </div>
      <div className="px-4">
        <Separator className="my-4" />
      </div>
      <div className="w-full px-4 py-4 overflow-y-auto">
        <FormHeaderHeading
          title="Behaviour"
          subtitle="Configure how the agent processes tasks, including instructions, rules, success criteria, and guidelines."
          isRequired={false}
        />
        <div className="pt-6">
          {/* instruction card */}
          <InstructionCard isEditing={isEditing} />

          {/* rule card */}
          <AgentRulesSection isEditing={isEditing} />

          {/* Success Criteria card*/}
          <SuccessCriteriaSection isEditing={isEditing} />
        </div>
      </div>

      {/* show Guidelines list  */}
      <div className="pb-4 px-4">
        <GuidelinesList
          guidelinesList={guidelines || []}
          isEditing={isEditing}
          handleDeleteGuidelines={handleDeleteGuidelines}
          handleEditGuidelines={handleEditGuidelines}
          openIndexes={openIndexes}
          setOpenIndexes={setOpenIndexes}
        />
      </div>

      <GuidelinesDialog
        isFormOpen={isFormOpen}
        isNew={isNew}
        editingIndex={editingIndex}
        handleCancel={handleCancel}
        handleSave={handleSave}
      />

      {!isFormOpen && isEditing && (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pl-80 pointer-events-none">
          <div className="flex gap-2 backdrop-blur-sm rounded-lg p-2 shadow-lg border bg-primary/20 pointer-events-auto">
            <Button
              variant="outline"
              className="rounded-[6px] whitespace-nowrap cursor-pointer"
              onClick={handleOpenDialog}
            >
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Add New Guideline
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default IdentitySection;
