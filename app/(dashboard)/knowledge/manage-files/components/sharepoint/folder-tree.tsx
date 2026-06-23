import { EmptyState } from "@/components/empty-state/empty-state";
import Loader from "@/components/loader";
import { Skeleton } from "@/components/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { FileOrFolder } from "@/types/types";
import { BookText, ChevronRight, FileIcon, Folder, Globe } from "lucide-react";

type Props = {
  items: FileOrFolder[];
  onFolderClick: (item: FileOrFolder) => void;
  onFileClick: (item: FileOrFolder) => void;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  loadingFolders: Record<string, boolean>;
  loading?: boolean;
};

export default function FolderTree({
  items,
  onFolderClick,
  onFileClick,
  selectedIds,
  toggleSelect,
  loadingFolders,
  loading = false,
}: Props) {
  const isAnyFolderLoading = Object.values(loadingFolders).some(Boolean);

  const getItemIcon = (item: FileOrFolder) => {
    if (loadingFolders[item.id]) {
      return <Loader className="w-5 h-5 animate-spin text-primary" />;
    }

    // Check if id contains .com
    if (item.id && item.id.includes(".com")) {
      return <Globe className="w-5 h-5 text-blue-500" />;
    }

    // Folder with childCount === 0 (empty folder)
    if (
      item.folder &&
      typeof item.folder === "object" &&
      "childCount" in item.folder &&
      ((item.folder as { childCount?: number }).childCount === 0 ||
        (item.folder as { childCount?: number }).childCount === undefined)
    ) {
      return <Folder className="w-5 h-5" color="gray" />;
    }

    // Any folder (with children or not)
    if (item.folder) {
      // Use a valid color or fallback to gray
      const color =
        item.folder.decorator?.iconColor &&
        /^#[0-9A-F]{6}$/i.test(item.folder.decorator.iconColor)
          ? item.folder.decorator.iconColor
          : "gray";
      return <Folder className="w-5 h-5" color={color} />;
    }

    // Default for files
    return <FileIcon className="w-5 h-5 text-slate-500" />;
  };

  return (
    <>
      {loading || isAnyFolderLoading ? (
        <div className="min-h-[420px] divide-y">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-5 w-5 mr-2 rounded-md bg-primary/10" />{" "}
              {/* Icon placeholder */}
              <Skeleton className="h-4 w-3/4 flex-1 rounded-md bg-primary/10" />{" "}
              {/* Name placeholder */}
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          variant="card"
          title="No files or folders"
          icon={BookText}
        />
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center px-4 py-3 border-b last:border-b-0 hover:bg-accent",
              selectedIds.has(item.id) && "bg-accent",
            )}
          >
            {/* Checkbox (select only) */}

            <Checkbox
              id={item.id}
              className="mr-2"
              checked={selectedIds.has(item.id)}
              onCheckedChange={() => toggleSelect(item.id)}
              // onPointerDown={(e) => e.stopPropagation()}
              // onClick={(e) => e.stopPropagation()}
            />

            {/* Icon + name (open folder/file) */}
            <div
              className="flex-1 flex items-center cursor-pointer"
              onClick={() => {
                item.folder ? onFolderClick(item) : onFileClick(item);
              }}
            >
              <div className="mr-2">{getItemIcon(item)}</div>
              <div>{item.name}</div>
            </div>

            {/* Chevron (open folder only) */}

            {item.folder && (
              <div
                className="ml-2 flex items-center cursor-pointer"
                onClick={() => onFolderClick(item)}
              >
                <ChevronRight className="w-5 h-5" />
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
}
