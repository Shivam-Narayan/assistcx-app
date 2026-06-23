"use client";

import { LLMToolSelector } from "@/components/tool-selectors/llm-tool-selector";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PROCESSING_SETTINGS_CONFIG } from "../constants/constants";
import { useAgentConfigData } from "../hook/useAgentConfigData";
import { AgentFormValues } from "../schemas/agent-schema";

type SettingName = (typeof PROCESSING_SETTINGS_CONFIG)[number]["name"];

const SettingItem = ({
  control,
  name,
  label,
  description,
  isEditable,
}: {
  control: ReturnType<typeof useFormContext<AgentFormValues>>["control"];
  name: `settings.${SettingName}`;
  label: string;
  description: string;
  isEditable: boolean;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{label}</ItemTitle>
            {description && <ItemDescription>{description}</ItemDescription>}
          </ItemContent>
          <ItemActions>
            <FormControl>
              <Switch
                checked={!!field.value}
                onCheckedChange={field.onChange}
                disabled={!isEditable}
                className="mb-0 cursor-pointer"
              />
            </FormControl>
          </ItemActions>
        </Item>
      </FormItem>
    )}
  />
);

const AgentLLMItem = ({
  control,
  isEditable,
  llmItems,
  llmSearch,
  setLlmSearch,
}: {
  control: ReturnType<typeof useFormContext<AgentFormValues>>["control"];
  isEditable: boolean;
  llmItems: {
    value: string;
    label: string;
    description?: string;
    [key: string]: unknown;
  }[];
  llmSearch: string;
  setLlmSearch: (value: string) => void;
}) => (
  <FormField
    control={control}
    name="settings.agent_llm"
    render={({ field }) => (
      <FormItem>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Agent LLM Model</ItemTitle>
            <ItemDescription>
              The language model powering this agent&apos;s reasoning. Use the
              default unless you need specific capabilities or cost controls.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <FormControl>
              <LLMToolSelector
                items={llmItems}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select Default LLM Model"
                buttonClassName="w-fit hover:bg-background h-8"
                searchPlaceholder="Search Default LLM..."
                popoverContentClassName="w-[--radix-popover-trigger-width] max-w-lg !right-0"
                align="end"
                localSearch={llmSearch}
                setLocalSearch={setLlmSearch}
                disabled={!isEditable}
              />
            </FormControl>
          </ItemActions>
        </Item>
        <FormMessage />
      </FormItem>
    )}
  />
);

const ProcessingRulesCard = ({ isEditing }: { isEditing: boolean }) => {
  const hasFetched = useRef(false);
  const { control } = useFormContext<AgentFormValues>();
  const { getAgentLLMDetails, agentllmsList, llmSearch, setLlmSearch } =
    useAgentConfigData();

  useEffect(() => {
    if (hasFetched.current) return;
    getAgentLLMDetails();
    hasFetched.current = true;
  }, []);

  const llmItems = [
    {
      value: "",
      label: "Default Agent LLM",
      description: "Uses the system's default model configuration.",
    },
    ...agentllmsList.map(
      (llm: {
        llm_key: string;
        name: string;
        description?: string;
        [key: string]: unknown;
      }) => ({
        value: llm.llm_key,
        label: llm.name,
        description: llm.description,
        ...llm,
      }),
    ),
  ];

  const filteredLlmItems = llmItems.filter((item) => {
    const text = `${item.label} ${item.value}`.toLowerCase();
    return text.includes(llmSearch.toLowerCase());
  });

  return (
    <div className="w-full">
      <ItemGroup className="gap-3">
        {PROCESSING_SETTINGS_CONFIG.map((setting) =>
          setting.name === "agent_llm" ? (
            <AgentLLMItem
              key={setting.name}
              control={control}
              isEditable={isEditing}
              llmItems={filteredLlmItems}
              llmSearch={llmSearch}
              setLlmSearch={setLlmSearch}
            />
          ) : (
            <SettingItem
              key={setting.name}
              control={control}
              name={`settings.${setting.name}`}
              label={setting.label}
              description={setting.description}
              isEditable={isEditing}
            />
          ),
        )}
      </ItemGroup>
    </div>
  );
};

export default ProcessingRulesCard;
