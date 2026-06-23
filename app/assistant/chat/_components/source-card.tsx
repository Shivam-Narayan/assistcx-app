import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getIconForFileType,
  getSourceTypeDisplay,
} from "@/helper/assistant-helper/helper";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Globe } from "lucide-react";
import { useState } from "react";
import { SourceCardPopup } from "./source-card-popup";
import { SourceCardDetailProps } from "./types";

export function SourceCard({
  groupedSource,
  index = 0,
  cardClassName,
}: SourceCardDetailProps) {
  const [open, setOpen] = useState(false);

  const firstSource = groupedSource.items[0].source;

  const iconData = getIconForFileType({
    name: firstSource?.metadata?.file_name || "",
    mime: firstSource?.metadata?.file_extension || "",
  });
  const IconComponent = (
    iconData && Icons[iconData.icon as keyof typeof Icons]
      ? Icons[iconData.icon as keyof typeof Icons]
      : Icons.File
  ) as React.ElementType;

  const citationNumbers = groupedSource.items.map(
    (item) => item.citationNumber,
  );
  const isMultiple = groupedSource.items.length > 1;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <motion.div
          key={groupedSource.groupKey}
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: { delay: 0.3 + index * 0.05 },
          }}
          className={`cursor-pointer min-h-[80px] block w-full p-2.5 rounded-lg border border-gray-200 hover:border-primary/40 transition-colors group ${cardClassName}`}
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5 text-gray-500 shrink-0">
              {groupedSource.source_type === "doc_chunk" ? (
                <IconComponent
                  className={`${iconData?.color || "text-gray-500"} h-5 w-5`}
                />
              ) : groupedSource.source_type === "web_page" ? (
                <Globe className="h-5 w-5" />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-gray-800 truncate flex-1">
                  {groupedSource.title}
                </p>
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs whitespace-nowrap shrink-0">
                  {getSourceTypeDisplay(firstSource)}
                </span>
              </div>

              {firstSource.content && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {firstSource.content}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-xl p-0 overflow-hidden [&_[data-dialog-close]]:hidden">
        <div className="hidden">
          <DialogTitle>{groupedSource.title}</DialogTitle>
        </div>
        <div className="w-full max-w-full overflow-hidden px-0 py-0 bg-white z-10">
          <SourceCardPopup groupedSource={groupedSource} setOpen={setOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
