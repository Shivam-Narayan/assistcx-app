"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { AgentFormValues } from "../schemas/agent-schema";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
  isEditing: boolean;
}

const InstructionCard = ({ isEditing }: Props) => {
  const { control, getValues } = useFormContext<AgentFormValues>();
  const identity = getValues("identity");
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(true);

  return (
    <div className="pt-3">
      <Card className="overflow-hidden shadow-none p-0 gap-0">
        <CardHeader
          className={`bg-muted px-4 py-4! flex flex-row items-center justify-between space-y-0 ${
            !isEditing ? "cursor-pointer" : ""
          } ${isEditing || isInstructionsExpanded ? "border-b" : ""}`}
          onClick={() =>
            !isEditing && setIsInstructionsExpanded(!isInstructionsExpanded)
          }
        >
          <div>
            <h3 className="text-base font-semibold leading-none tracking-tight">
              Instructions
              {isEditing && <span className="text-red-500 ml-0.5">*</span>}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Provide a comprehensive yet concise task instruction for the AI
              agent
            </p>
          </div>
          {!isEditing && (
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isInstructionsExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </CardHeader>
        {(!isEditing ? isInstructionsExpanded : true) && (
          <CardContent className="p-4">
            {isEditing ? (
              <FormField
                control={control}
                name="identity.instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <AutoGrowingTextarea
                        placeholder="Enter agent instructions"
                        {...field}
                        maxLength={2000}
                        autoFocus={false}
                        maxHeight={280}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="wrap-break-words text-sm text-slate-600">
                {identity.instructions || "No Instructions Provided"}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default InstructionCard;
