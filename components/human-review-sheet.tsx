"use client";

import HeaderHoverCard from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X, PlusCircle, ClipboardCheck } from "lucide-react";
import { useState, useEffect } from "react";
import AutoGrowingTextarea from "@/components/auto-grow-textarea";

export interface HumanReviewCriteria {
  id: string;
  criteria: string;
}

interface HumanReviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolName?: string;
  isEnabled?: boolean;
  criteria?: HumanReviewCriteria[];
  onSave?: (data: {
    isEnabled: boolean;
    criteria: HumanReviewCriteria[];
  }) => void;
}

const HumanReviewSheet = ({
  open,
  onOpenChange,
  toolName,
  isEnabled = false,
  criteria = [],
  onSave,
}: HumanReviewSheetProps) => {
  const [localCriteria, setLocalCriteria] = useState<HumanReviewCriteria[]>([]);

  // Sync local state only when sheet opens
  useEffect(() => {
    if (open) {
      setLocalCriteria(criteria);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    // Reset local state on close without saving
    setLocalCriteria(criteria);
    onOpenChange(false);
  };

  const handleAddCriteria = () => {
    const newCriteria: HumanReviewCriteria = {
      id: `criteria-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      criteria: "",
    };
    setLocalCriteria([...localCriteria, newCriteria]);
  };

  const handleCriteriaChange = (id: string, value: string) => {
    setLocalCriteria(
      localCriteria.map((item) =>
        item.id === id ? { ...item, criteria: value } : item
      )
    );
  };

  const handleRemoveCriteria = (id: string) => {
    setLocalCriteria(localCriteria.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    // Filter out empty criteria before saving
    const validCriteria = localCriteria.filter(
      (item) => item.criteria.trim() !== ""
    );

    if (onSave) {
      // Enable the toggle only when saving with valid criteria
      onSave({
        isEnabled: validCriteria.length > 0,
        criteria: validCriteria,
      });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-y-auto bg-background">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="flex items-center gap-3">
            <SheetTitle className="sr-only">Human Review Settings</SheetTitle>
            <HeaderHoverCard
              title="Human Review Settings"
              message="Configure human review settings for this tool. When enabled, actions will require human approval before execution."
              type="sheet"
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={isEnabled ? "default" : "secondary"}
              className={
                isEnabled
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            >
              {isEnabled ? "Active" : "Inactive"}
            </Badge>
            <SheetClose asChild>
              <div
                className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </div>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 p-6 pt-2 overflow-y-auto">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Configure human review criteria for{" "}
              <span className="font-medium text-foreground">{toolName}</span>.
              Add criteria to define when human review is required.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">
                Review Criteria{" "}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </h3>
              {localCriteria.length > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 px-1.5 text-xs font-medium"
                >
                  {localCriteria.length}
                </Badge>
              )}
            </div>

            {localCriteria.length === 0 ? (
              /* Empty State Card */
              <div className="text-center py-10 rounded-2xl border border-primary/40 border-dashed bg-primary/10">
                <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-medium mb-1">No Criteria Added</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add criteria to define when review is required for this tool
                </p>
                <Button
                  variant="outline"
                  className="rounded-md cursor-pointer"
                  onClick={handleAddCriteria}
                >
                  <PlusCircle className="h-4 w-4" /> Add Criteria
                </Button>
              </div>
            ) : (
              /* Criteria List */
              <div className="space-y-3">
                {localCriteria.map((item, index) => (
                  <div key={item.id} className="relative group">
                    <AutoGrowingTextarea
                      id={`criteria-${item.id}`}
                      name={`criteria-${item.id}`}
                      value={item.criteria}
                      onChange={(e) =>
                        handleCriteriaChange(item.id, e.target.value)
                      }
                      placeholder={`Enter criteria...`}
                      maxLength={2000}
                      maxHeight={200}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCriteria(item.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add Criteria Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCriteria}
                  className="w-full p-4 hover:underline cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Criteria
                </Button>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="sticky bottom-0 z-10 px-4 py-3 border-t bg-background">
          <Button
            variant="outline"
            onClick={handleClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground cursor-pointer"
          >
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default HumanReviewSheet;
