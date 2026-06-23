import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useMemo, useState } from "react";
import { groupSelectedSources } from "./group-sources";
import { SelectedSourcesSheet } from "./selected-sources-sheet";
import { SourceCard } from "./source-card";
import { SelectedSourcesProps } from "./types";

const MAX_DISPLAY = 5;

export const SelectedSources = ({ sources }: SelectedSourcesProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const groupedSources = useMemo(
    () => groupSelectedSources(sources),
    [sources],
  );

  const displaySources = groupedSources.slice(0, MAX_DISPLAY);
  const hasMore = groupedSources.length > MAX_DISPLAY;
  const remainingGroups = groupedSources.slice(MAX_DISPLAY);

  if (sources.length === 0) return null;
  return (
    <div className="relative mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icons.FileText size={22} strokeWidth={1.5} />
          <h2 className="text-lg font-semibold">Selected Sources</h2>
          <Icons.Dot strokeWidth={5} className="h-4 w-4" />
          <span className="text-lg font-semibold">{sources.length}</span>
          {groupedSources.length < sources.length && (
            <span className="text-xs text-gray-400 font-normal">
              ({groupedSources.length} unique)
            </span>
          )}
        </div>
        <div
          onClick={() => setIsSheetOpen(true)}
          className="cursor-pointer text-xs text-foreground/80 bg-muted px-2 py-1 rounded-md border font-medium hover:text-primary"
        >
          View All
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displaySources.map((groupedSource, idx) => (
          <SourceCard
            key={groupedSource.groupKey}
            groupedSource={groupedSource}
            index={idx}
          />
        ))}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { delay: 0.3 + MAX_DISPLAY * 0.05 },
            }}
            onClick={() => setIsSheetOpen(true)}
            className="w-full min-h-[80px] h-full p-3 rounded-lg border border-gray-200 flex flex-col justify-between cursor-pointer hover:border-primary/20 transition-colors group"
          >
            <div className="flex items-center flex-row gap-2">
              {remainingGroups.slice(0, 3).map((grouped) => (
                <div
                  key={grouped.groupKey}
                  className="mt-0.5 text-gray-500 shrink-0"
                >
                  {grouped.source_type === "web_page" ? (
                    <Icons.Globe className="h-5 w-5" />
                  ) : (
                    <Icons.File className="h-5 w-5" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-foreground/80 font-medium group-hover:underline group-hover:text-primary">
              View All Sources
            </div>
          </motion.div>
        )}
      </div>

      <SelectedSourcesSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        groupedSources={groupedSources}
        totalSourceCount={sources.length}
      />
    </div>
  );
};

export default SelectedSources;
