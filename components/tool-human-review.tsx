"use client";

import {
  Check,
  ChevronDown,
  Info,
  Pencil,
  Plus,
  ShieldUser,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import ConditionalTooltip from "./conditional-tooltip-renderer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

export interface HumanReviewCriteria {
  id: string;
  criteria: string;
}

interface ToolHumanReviewProps {
  isDisabled?: boolean;
  humanReviewEnabled: boolean;
  onToggleChange: (checked: boolean) => void;
  criteria: HumanReviewCriteria[];
  onCriteriaChange: (criteria: HumanReviewCriteria[]) => void;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const ToolHumanReview = ({
  isDisabled,
  humanReviewEnabled,
  onToggleChange,
  criteria,
  onCriteriaChange,
  isExpanded: controlledExpanded,
  onExpandedChange,
}: ToolHumanReviewProps) => {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : uncontrolledExpanded;

  const setIsExpanded = (expanded: boolean) => {
    if (isControlled && onExpandedChange) {
      onExpandedChange(expanded);
    } else {
      setUncontrolledExpanded(expanded);
    }
  };

  // Unified editing state: null = idle, "new" = adding, item id = editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const isAddingNew = editingId === "new";

  const handleAddCriteria = () => {
    setEditingId("new");
    setEditValue("");
    setIsExpanded(true);
  };

  const handleStartEdit = (item: HumanReviewCriteria) => {
    setEditingId(item.id);
    setEditValue(item.criteria);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      if (editingId === "new") {
        const newCriteria: HumanReviewCriteria = {
          id: `criteria-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          criteria: editValue.trim(),
        };
        onCriteriaChange([...criteria, newCriteria]);
      } else {
        onCriteriaChange(
          criteria.map((item) =>
            item.id === editingId
              ? { ...item, criteria: editValue.trim() }
              : item,
          ),
        );
      }
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleDelete = (id: string) => {
    onCriteriaChange(criteria.filter((item) => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  const showAccordionTrigger = humanReviewEnabled;

  const criteriaInput = (
    <>
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 h-8 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        placeholder="Enter auto-approve rule..."
        autoFocus
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 bg-muted text-green-600 hover:bg-green-100 hover:text-green-700"
        onClick={handleSave}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={handleCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </>
  );

  return (
    <div className="border-t border-border/50 bg-muted/50">
      {/* Footer Header Row */}
      <div
        className={`flex items-center justify-between px-4 py-3${showAccordionTrigger ? " cursor-pointer hover:bg-muted/80 transition-colors" : ""}`}
        onClick={() => showAccordionTrigger && toggleAccordion()}
      >
        {/* Left: Toggle with Accordion Trigger */}
        <div className="flex items-center gap-2">
          <ShieldUser className="h-5 w-5" />

          <ConditionalTooltip
            content="Enable human review to edit or approve this tool call. You can
                add optional criteria(s) to automatically approve or send tool
                calls for human review."
            alwaysShow={true}
            align="center"
            showArrow={true}
          >
            <span className="text-base text-opacity-80 cursor-help">
              Human Review
            </span>
          </ConditionalTooltip>
          <Switch
            checked={humanReviewEnabled}
            className="cursor-pointer"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              onToggleChange(checked);
              if (checked) {
                setIsExpanded(true);
              }
            }}
            disabled={isDisabled}
          />

          {/* Criteria Count Badge */}
          {humanReviewEnabled && criteria.length > 0 && (
            <span className="ml-1 text-xs text-muted-foreground bg-primary/10 px-1.5 py-0.5 rounded-full">
              {criteria.length}
            </span>
          )}
        </div>

        {/* Right: Add Criteria Button & Accordion Chevron */}
        {humanReviewEnabled && (
          <div className="flex items-center gap-1">
            {!isDisabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-1.5 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddCriteria();
                }}
              >
                <Plus className="h-4 w-4" />
                Add Rule
              </Button>
            )}
            {showAccordionTrigger && (
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
        )}
      </div>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          humanReviewEnabled && isExpanded
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-3 space-y-2">
          {/* Info Banner */}
          <div className="flex items-start gap-2 rounded-md px-3 py-2 bg-primary/5 text-sm text-foreground/70">
            <Info className="h-4 w-4 text-primary/60 mt-0.5 shrink-0" />
            <p>
              {criteria.length > 0
                ? "Tool calls will be checked against these rules to determine if human review is needed"
                : "Every tool call will require human review and approval before executing."}
            </p>
          </div>

          {/* Criteria List */}
          {criteria.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-2.5 rounded-md px-3 py-2 border-l-2 relative ${
                editingId === item.id
                  ? "bg-primary/5 border-primary/60 border border-l-2"
                  : "group bg-background border-l-primary/30"
              }`}
            >
              {editingId === item.id ? (
                criteriaInput
              ) : (
                <>
                  <span className="text-xs font-medium text-primary/60 mt-0.5 select-none">
                    {index + 1}.
                  </span>
                  <span className="flex-1 text-sm text-foreground/80 wrap-break-word">
                    {item.criteria}
                  </span>
                  {!isDisabled && (
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 bg-background rounded-md px-1 py-0.5 shadow-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleStartEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* New Criteria Input */}
          {isAddingNew && (
            <div className="flex items-center gap-2 bg-primary/5 rounded-md px-3 py-2 border border-primary/20">
              {criteriaInput}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolHumanReview;
