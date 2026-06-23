// components/sharepoint/SharePointSheet.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/toaster";
import useSharePoint from "@/app/(dashboard)/knowledge/hook/useSharePoint";
import { FileOrFolder } from "@/types/types";
import { Import, Loader2, X } from "lucide-react";
import Breadcrumb from "./breadcrumb";
import FolderTree from "./folder-tree";
import { FolderLoadingSkeletons } from "./loading-skeletons";

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (selected: FileOrFolder[]) => void;
  collectionId: string;
  getManageFileData: (value: number) => void;
  isImportSharePoint?: boolean;
};

export default function ImportSheet({
  open,
  onClose,
  onImport,
  collectionId,
  getManageFileData,
  isImportSharePoint,
}: Props) {
  const {
    isLoading,
    isImportLoading,
    searchText,
    setSearchText,
    path,
    selectedItems,
    selectedIds,
    items,
    loadingFolders,
    handleFolderClick,
    handleFileClick,
    handleCrumbClick,
    toggleSelect,
    importSelectedFiles,
  } = useSharePoint(open, collectionId, onClose, getManageFileData);
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <Toaster />
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 bg-white outline-hidden">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="w-full flex justify-start items-center space-x-2 divide-x">
            <SheetTitle className="px-3 text-lg font-medium">
              SharePoint Import
            </SheetTitle>
          </div>
          <SheetClose asChild>
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground cursor-pointer hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-200">
              <X className="w-4 h-4" />
            </div>
          </SheetClose>
        </SheetHeader>

        {isLoading ? (
          <FolderLoadingSkeletons />
        ) : (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden px-4">
            {/* Search bar */}
            <div className="relative py-0.5">
              <Search
                placeholder="Search..."
                className="w-full pr-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                  onClick={() => setSearchText("")}
                  tabIndex={-1}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Breadcrumb (non-scrollable) */}
            <div className="sticky">
              <Breadcrumb path={path} onCrumbClick={handleCrumbClick} />
            </div>

            {/* FolderTree (scrollable only) */}
            <div className="flex-1 overflow-y-scroll rounded-md border bg-slate-100">
              <FolderTree
                items={items}
                onFolderClick={handleFolderClick}
                onFileClick={handleFileClick}
                selectedIds={selectedIds}
                toggleSelect={toggleSelect}
                loadingFolders={loadingFolders}
                loading={isLoading}
              />
            </div>
          </div>
        )}
        {!isLoading && (
          <SheetFooter className="sticky z-10 bottom-0 p-3 border-t bg-background">
            <div className="flex w-full items-center justify-between">
              <div className="text-sm">
                {selectedItems?.length > 0 ? (
                  <Badge variant="outline" className="ml-2">
                    {selectedItems.length} file selected
                  </Badge>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {isImportSharePoint && (
                  <Button
                    className="flex items-center justify-center gap-2"
                    disabled={isImportLoading || selectedItems?.length === 0}
                    onClick={importSelectedFiles}
                  >
                    {isImportLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <Import className="w-4 h-4" />
                    <span>Import</span>
                  </Button>
                )}
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
