import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/assistant-sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CollapsibleSourceCard } from "./collapsible-source-card";
import { SelectedSourcesSheetProps } from "./types";

export function SelectedSourcesSheet({
  groupedSources,
  totalSourceCount,
  open,
  onOpenChange,
}: SelectedSourcesSheetProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Collapse by default only when individual content blocks are long
  const isCollapsed = useMemo(() => {
    const allShort = groupedSources.every((g) =>
      g.items.every((item) => (item.source.content?.length ?? 0) <= 125),
    );
    return !allShort;
  }, [groupedSources]);

  // Reset open accordion when sheet closes
  useEffect(() => {
    if (!open) {
      setOpenIndex(null);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="md:max-w-[50vw] w-full gap-0">
        <SheetHeader className="border-b flex flex-row justify-between items-center bg-white z-1">
          <SheetTitle className="text-xl font-semibold flex items-center gap-2">
            Sources
            <span className="text-sm h-5 min-w-[1.5rem] px-1 py-0.5 inline-flex items-center justify-center border border-primary/20 bg-primary/10 text-primary rounded-md">
              {totalSourceCount}
            </span>
          </SheetTitle>
          <SheetClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer h-8 w-8"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col gap-4 px-4 mb-4">
            {groupedSources?.length !== 0 ? (
              groupedSources?.map((groupedSource, idx) => (
                <CollapsibleSourceCard
                  key={groupedSource?.groupKey}
                  groupedSource={groupedSource}
                  index={idx}
                  isCollapsed={isCollapsed}
                  isOpen={openIndex === idx}
                  onClose={() => setOpenIndex(null)}
                  onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                />
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center mt-10">
                No sources selected.
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
