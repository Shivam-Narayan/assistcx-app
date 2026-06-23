import {
  getIconsData,
  getIconSvg,
} from "@/components/icon-manager/icon-render-component";
import { Card } from "@/components/ui/card";
import { getTimeAgo } from "@/helper/helper-function";
import { cn, formatFileSize } from "@/lib/utils";
import { Clock, Files, HardDrive } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { KnowledgeDetailList } from "./knowledge-detail-list";
import { FileCardProps } from "./types";

export const KnowledgeCollectionCard = (collection: FileCardProps) => {
  const { id, name, description, icon, file_count, total_size, updated_at } =
    collection?.collection;
  const iconsData = getIconsData("collection_icons");
  const defaultIcon = getIconSvg("folder02", "collection_icons");

  const [open, setOpen] = useState(false);

  if (!collection) {
    return null;
  }
  const handleDetail = () => {
    if (file_count > 0) {
      setOpen(true);
    } else {
      toast.error(`${name} has no files`);
    }
  };

  return (
    <>
      <Card
        key={`${id}-${updated_at}`}
        className={cn(
          "relative flex flex-row items-start justify-between shadow-xs p-4 cursor-pointer group transition-colors hover:bg-muted/50",
        )}
        onClick={handleDetail}
      >
        <div className="flex items-start gap-3 w-full">
          <div
            className="w-10 h-10 flex items-center justify-center shrink-0 rounded-lg p-2 text-primary bg-primary/10 [&>svg]:w-5 [&>svg]:h-5"
            dangerouslySetInnerHTML={{
              __html: iconsData[icon] || defaultIcon,
            }}
          />
          <div className="flex flex-col flex-1">
            <h4 className="text-base font-semibold line-clamp-2 break-all">
              {name ?? "NA"}
            </h4>
            {description && (
              <p className="text-sm text-muted-foreground break-all line-clamp-2 mt-0.5">
                {description}
              </p>
            )}
            <div className="w-full border-t border-dashed border-border mt-3" />
            <div className="flex sm:items-center justify-between sm:gap-6 gap-2 flex-col sm:flex-row text-xs text-muted-foreground mt-2.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Files className="h-3.5 w-3.5" />
                  <span>{file_count} files</span>
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5" />
                  <span>{formatFileSize(total_size)}</span>
                </div>
              </div>
              {updated_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Updated {getTimeAgo(updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      <KnowledgeDetailList
        open={open}
        onOpenChange={setOpen}
        id={id}
        name={name}
      />
    </>
  );
};
