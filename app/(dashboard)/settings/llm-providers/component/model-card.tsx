import { ConfirmationDialog } from "@/components/confirmation-modal";
import IconRenderComponent from "@/components/icon-manager/icon-render-component";
import {
  extractMeta,
  formatTokenCount,
  MetricCircle,
  ScoreBar,
} from "@/components/tool-selectors/llm-tool-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatLabel } from "@/helper/helper-function";
import { cn } from "@/lib/utils";
import { AiBrain01Icon, FlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatModelDate } from "../helper/helper";
import { ModelCardProps } from "./types";

export const ModelCard = ({
  model,
  onSetPrimary,
  onSetFast,
  provider,
  collapsible = true,
  resetCollapsibleKey,
}: ModelCardProps) => {
  const isPrimary = !!model.isDefault;
  const isFast = !!model.isFast;

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const meta = extractMeta(model);
  const hasTokens = meta.maxTokens > 0 || meta.maxOutputTokens > 0;
  const hasScores = meta.speed > 0 || meta.intelligence > 0;
  const hasCaps = meta.capabilities && meta.capabilities.length > 0;

  const hasDetail = !!(provider || model.integration_key);
  const [actionType, setActionType] = useState<"primary" | "fast" | null>(null);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      if (actionType === "primary") {
        await onSetPrimary();
      } else if (actionType === "fast") {
        await onSetFast();
      }
    } finally {
      setIsSaving(false);
      setActionType(null);
    }
  };

  const handleCancel = () => {
    setActionType(null);
  };

  useEffect(() => {
    setIsOpen(!collapsible);
  }, [collapsible]);

  useEffect(() => {
    setIsOpen(false);
  }, [resetCollapsibleKey]);
  return (
    <>
      <Collapsible
        open={isOpen}
        className="border rounded-md"
        onOpenChange={setIsOpen}
      >
        <CollapsibleTrigger asChild>
          <div className="p-2 cursor-pointer group transition-colors">
            <div
              className={cn(
                "group flex items-center justify-between ",
                isPrimary || isFast ? "border-primary/30 " : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-3 w-full min-w-0">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <IconRenderComponent
                      iconName={provider?.iconKey}
                      category="ai_icons"
                      size={18}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {model?.name && (
                        <p className="text-foreground text-sm leading-snug font-semibold">
                          {model?.name}
                        </p>
                      )}
                      {isPrimary && (
                        <Badge className="text-[10px] px-1.5 py-0">
                          Default
                        </Badge>
                      )}
                      {isFast && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-primary/30 bg-primary/10 text-primary"
                        >
                          Fast
                        </Badge>
                      )}
                    </div>
                    {model.created_at && (
                      <span className="ml-auto mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        Created at {formatModelDate(model.created_at)}
                      </span>
                    )}
                  </div>
                </div>
                {hasDetail && (
                  <div className="ml-auto flex w-32 shrink-0 items-center justify-end gap-2">
                    {meta.maxTokens > 0 && (
                      <span className="text-muted-foreground w-12 text-right text-[10px] font-medium tabular-nums">
                        {formatTokenCount(meta.maxTokens)}
                      </span>
                    )}
                    {meta.speed > 0 && (
                      <MetricCircle type="speed" value={meta.speed} />
                    )}
                    {meta.intelligence > 0 && (
                      <MetricCircle
                        type="intelligence"
                        value={meta.intelligence}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden relative px-4 pb-3 rounded-b-lg space-y-3 relative rounded-md group bg-background "
            >
              {model.description ? (
                <div className="flex flex-wrap gap-3 items-center">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {model.description}
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3 items-center">
                {hasTokens ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="space-y-1.5">
                      {meta.maxTokens > 0 ? (
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-muted-foreground text-xs font-medium">
                            Context
                          </p>
                          <p className="text-foreground text-xs font-semibold tabular-nums">
                            {formatTokenCount(meta.maxTokens)}
                            <span className="text-muted-foreground ml-1 font-medium">
                              tokens
                            </span>
                          </p>
                        </div>
                      ) : null}
                      {meta.maxOutputTokens > 0 ? (
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-muted-foreground text-xs font-medium">
                            Output
                          </p>
                          <p className="text-foreground text-xs font-semibold tabular-nums">
                            {formatTokenCount(meta.maxOutputTokens)}
                            <span className="text-muted-foreground ml-1 font-medium">
                              tokens
                            </span>
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {hasScores ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="space-y-2">
                      {meta.speed > 0 ? (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <HugeiconsIcon
                              icon={FlashIcon}
                              className="text-muted-foreground h-3.5 w-3.5 shrink-0"
                            />
                            <span className="text-muted-foreground text-xs">
                              Speed
                            </span>
                          </div>
                          <ScoreBar
                            value={meta.speed}
                            activeClass="bg-orange-400"
                          />
                        </div>
                      ) : null}
                      {meta.intelligence > 0 ? (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <HugeiconsIcon
                              icon={AiBrain01Icon}
                              className="text-muted-foreground h-3.5 w-3.5 shrink-0"
                            />
                            <span className="text-muted-foreground text-xs">
                              Intelligence
                            </span>
                          </div>
                          <ScoreBar
                            value={meta.intelligence}
                            activeClass="bg-blue-500"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {hasCaps ? (
                <div className="flex flex-wrap gap-1.5">
                  {meta.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="border-border bg-muted/40 text-muted-foreground rounded-full border px-2 py-0.5 text-[10px] font-medium"
                    >
                      {formatLabel(cap)}
                    </span>
                  ))}
                </div>
              ) : null}

              {provider?.isActive && model?.is_active && (
                <div className=" absolute bottom-3 right-4 w-full justify-end  flex items-center gap-1.5 lg:opacity-0 lg:transition-opacity duration-150 lg:group-hover:opacity-100  ">
                  {!isPrimary && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 text-[11px] px-2.5 cursor-pointer"
                      disabled={isSaving}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionType("primary");
                      }}
                    >
                      Make Default
                    </Button>
                  )}

                  {!isFast && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] px-2.5 cursor-pointer border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                      disabled={isSaving}
                      onClick={(event: any) => {
                        event.stopPropagation();
                        setActionType("fast");
                      }}
                    >
                      Make Fast
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Collapsible>
      <ConfirmationDialog
        open={actionType !== null}
        cancel={handleCancel}
        confirm={handleConfirm}
        isLoading={isSaving}
        title={
          actionType === "primary"
            ? `Are you sure you want to make "${model.name}" your Default model?`
            : `Are you sure you want to make "${model.name}" your fast model?`
        }
      />
    </>
  );
};
