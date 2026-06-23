import { EmptyState } from "@/components/empty-state/empty-state";
import { ModelCard } from "./model-card";
import { ModelsProps } from "./types";
import IconRenderComponent from "@/components/icon-manager/icon-render-component";

export const Models = ({
  provider,
  onSetPrimary,
  onSetFast,
  filteredModels,
  collapsible = true,
  resetCollapsibleKey,
}: ModelsProps) => {
  return (
    <div className="space-y-3 overflow-y-auto max-h-full">
      <div className="space-y-2 ">
        {filteredModels?.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            provider={provider}
            onSetPrimary={() => onSetPrimary(model.llm_key)}
            onSetFast={() => onSetFast(model.llm_key)}
            collapsible={collapsible}
            resetCollapsibleKey={resetCollapsibleKey}
          />
        ))}

        {filteredModels?.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <EmptyState
              title="No models found."
              icon={
                <IconRenderComponent
                  iconName={provider?.iconKey}
                  category="ai_icons"
                  size={18}
                />
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
