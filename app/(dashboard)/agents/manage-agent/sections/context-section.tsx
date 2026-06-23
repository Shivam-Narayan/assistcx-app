"use client";

import { FormHeaderHeading } from "@/components/ui/form-header";

import { AddEditDataTemplate } from "@/app/(dashboard)/settings/data-template/add-edit-data-template";
import { AddEditClassGroup } from "@/app/(dashboard)/settings/class-group/class-group-sheet";

import KnowledgeContextCard from "../components/knowledge-context-card";
import DataTablesContextCard from "../components/data-tables-context-card";
import DataTemplatesContextCard from "../components/data-templates-context-card";
import ClassGroupsContextCard from "../components/class-groups-context-card";

const ContextSection = ({ isEditing }: { isEditing: boolean }) => {
  return (
    <div className="relative">
      <div className="w-full px-4 py-4 overflow-x-hidden">
        <FormHeaderHeading
          title="Context"
          subtitle="Configure the data sources and context available to this agent during task execution."
          isRequired={false}
        />

        <div className="pt-5 space-y-8">
          <KnowledgeContextCard isEditing={isEditing} />
          <DataTablesContextCard isEditing={isEditing} />
          <DataTemplatesContextCard isEditing={isEditing} />
          <ClassGroupsContextCard isEditing={isEditing} />
        </div>
      </div>

      <AddEditDataTemplate
        loadTableData={() => {}}
        isCreateUpdateDataTemplate={false}
      />

      <AddEditClassGroup loadTableData={() => {}} isCreateClass={false} />
    </div>
  );
};

export default ContextSection;
