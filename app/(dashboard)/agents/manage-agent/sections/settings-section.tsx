"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormHeaderHeading } from "@/components/ui/form-header";
import HumanReviewCard from "../components/human-review-card";
import ProcessingRulesCard from "../components/processing-rules-card";
import TaskAssignmentCard from "../components/task-assignment-card";

const SettingsSection = ({ isEditing }: { isEditing: boolean }) => {
  return (
    <div className="w-full px-4 py-4 overflow-x-hidden">
      <FormHeaderHeading
        title="Settings"
        subtitle="Configure operational preferences for this agent"
        isRequired={false}
      />

      <div className="pt-5 space-y-8">
        {/* 1. Task Source */}
        <TaskAssignmentCard isEditing={isEditing} />

        {/* 2. Processing Rules */}
        <Card className="overflow-hidden shadow-none p-0 gap-0">
          <CardHeader className="border-b bg-muted px-4 !py-4">
            <h3 className="text-base font-semibold leading-none tracking-tight">
              Processing Rules
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure how the agent processes and handles tasks
            </p>
          </CardHeader>
          <CardContent className="py-6">
            <ProcessingRulesCard isEditing={isEditing} />
          </CardContent>
        </Card>

        {/* 3. Human Review */}
        <Card className="overflow-hidden shadow-none p-0 gap-0">
          <CardHeader className="border-b bg-muted px-4 !py-4">
            <h3 className="text-base font-semibold leading-none tracking-tight">
              Human Review
            </h3>
            <p className="text-xs text-muted-foreground">
              Enable human oversight for agent-processed tasks
            </p>
          </CardHeader>
          <CardContent className="py-6">
            <HumanReviewCard isEditing={isEditing} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsSection;
