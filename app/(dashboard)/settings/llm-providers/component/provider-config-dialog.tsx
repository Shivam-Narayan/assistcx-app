"use client";

import { ICONS_LIST } from "@/components/icon-manager/icons-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Models } from "./models";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useDebounce } from "@/lib/hook/useDebounce";
import { ProviderCatalog } from "./types";

export const ProviderConfigDialog = ({
  provider,
  open,
  onOpenChange,
  onSetPrimary,
  onSetFast,
}: {
  provider: ProviderCatalog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetPrimary: (llmKey: string) => Promise<void>;
  onSetFast: (llmKey: string) => Promise<void>;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const filteredModels = provider?.models?.filter((model) =>
    model?.name?.toLowerCase()?.includes(debouncedSearchQuery.toLowerCase()),
  );
  useEffect(() => {
    if (open) {
      setSearchQuery("");
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          " flex max-h-[min(90vh,880px)] w-full flex-col gap-0 overflow-visible p-0",
          "min-w-[min(100%,18rem)] max-w-xl sm:max-w-2xl",
        )}
        onOpenAutoFocus={(event: any) => event?.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="sticky border-b rounded-t-lg top-0 z-10 flex px-4 py-3 flex-row justify-between items-center bg-background">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md bg-muted shrink-0"
              dangerouslySetInnerHTML={{
                __html:
                  ICONS_LIST.ai_icons[
                    provider.iconKey as keyof typeof ICONS_LIST.ai_icons
                  ] || "",
              }}
            />
            <DialogTitle className="text-sm font-medium">
              {provider.name}
            </DialogTitle>
            {provider.isActive && (
              <Badge
                variant="default"
                className="text-[10px] bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15"
              >
                Active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-background pl-8 pr-8 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
            <DialogClose asChild>
              <div className="p-1 rounded-md cursor-pointer hover:bg-secondary">
                <X className="h-5 w-5" />
              </div>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-[400px] max-h-[70vh] overflow-y-auto flex flex-col">
          <div className="flex flex-col h-full max-h-full">
            <div className="flex-1 overflow-y-auto px-4 py-4 max-h-full">
              <Models
                provider={provider}
                onSetPrimary={onSetPrimary}
                onSetFast={onSetFast}
                filteredModels={filteredModels ?? []}
                collapsible={true}
                resetCollapsibleKey={debouncedSearchQuery}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
