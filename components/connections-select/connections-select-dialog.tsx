"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { Plug, Search, X } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "../ui/badge";
import ConnectionDialog from "@/app/(dashboard)/connections/components/connection-dialog";
import { ConnectionsDetailDialog } from "./connections-detail-dialog";

export type IntegrationCatalogItem = {
  id?: string;
  key: string;
  name: string;
  description: string;
  tags: any[];
  supported_auth_schemas: any[];
  integration_config: any;
  service_types: any[];
  catalogId?: string;
  /** Lucide icon name (PascalCase), resolved in UI */
  logo_url: string;
  /** Short overview copy (Overview tab) */
  about: string;
  /** Optional bullet points for the Overview tab */
  overviewBullets?: string[];
  /** Extra copy revealed with “View more” (dummy) */
  overviewExtended?: string;
  credentialFields: {
    id: string;
    label: string;
    placeholder: string;
    type?: "text" | "password";
  }[];
};

export type IntegrationSelectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: "select" | "connection" | "detail";
  catalogListLoading: boolean;
  catalogList: any[];
  search: string;
  onSearchChange: (val: string) => void;
  handleConnectionModal: (item: IntegrationCatalogItem) => void;
  handleAllSheetclose: () => void;
  authList: any;
  handleConnectionBack: () => void;
  handlePickFromCatalog: (item: any) => void;
  onBack: () => void;
  authSchemaFields?: any[];
  credentialLoading?: boolean;
  onSubmitData?: (data: any) => void;
  connectionLoading?: boolean;
  detailIntegration?: any;
};

export function ConnectionsSelectDialog({
  open,
  onOpenChange,
  step,
  catalogListLoading,
  catalogList,
  search,
  onSearchChange,
  handleConnectionModal,
  handleAllSheetclose,
  authList,
  handleConnectionBack,
  handlePickFromCatalog,
  onBack,
  authSchemaFields,
  credentialLoading,
  onSubmitData,
  connectionLoading,
  detailIntegration,
}: IntegrationSelectDialogProps) {
  useEffect(() => {
    if (!open) return;

    onSearchChange("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {step === "select" && (
        <DialogContent
          className="flex h-[520px] max-h-[90vh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl lg:max-w-5xl"
          showCloseButton={false}
        >
          <DialogHeader className="shrink-0 border-b px-4 py-4">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary",
                  )}
                >
                  <Plug className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <DialogTitle className="text-lg font-medium leading-none text-foreground/90">
                    Add connection
                  </DialogTitle>
                  <p className="truncate text-sm text-muted-foreground">
                    Choose a category, then select an connection to configure.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="relative h-9 w-56 md:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search..."
                    className="h-full w-full rounded-md border bg-muted/40 pl-9 pr-9 text-sm transition-colors focus:bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                  {search ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onSearchChange("")}
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onOpenChange(false);
                    handleAllSheetclose();
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="flex min-w-0 flex-1 flex-col">
              <Command shouldFilter={false} className="flex flex-1 flex-col">
                <CommandList className="max-h-none flex-1 overflow-y-auto px-4 py-3">
                  {catalogListLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <LucideIcons.Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : catalogList.length === 0 ? (
                    <CommandEmpty>
                      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                        <Search className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-foreground">
                          No integrations found
                        </p>
                        <p className="max-w-xs text-xs text-muted-foreground">
                          Try another category or adjust your search.
                        </p>
                      </div>
                    </CommandEmpty>
                  ) : (
                    <CommandGroup className="p-0">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {catalogList.map((item) => {
                          return (
                            <CommandItem
                              key={item.key}
                              value={`${item.key} ${item.name}`}
                              onSelect={() => handleConnectionModal(item)}
                              className="flex h-auto cursor-pointer flex-col items-start rounded-lg border border-border bg-transparent p-3 transition-all aria-selected:bg-transparent hover:bg-muted/50"
                            >
                              <div className="flex w-full gap-3">
                                <div className="h-fit w-fit shrink-0 rounded-full bg-muted p-2 border">
                                  <img
                                    src={item.logo_url}
                                    alt={item.name}
                                    className="h-5 w-5 object-contain"
                                  />
                                </div>
                                <div className="flex min-w-0 flex-col gap-1">
                                  <span className="text-sm font-medium leading-tight">
                                    {item.name}
                                  </span>
                                  <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                    {item.description}
                                  </span>
                                  {item.tags && (
                                    <div className="flex flex-wrap gap-1">
                                      {item.tags.map((tag: string) => (
                                        <Badge
                                          key={tag}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </div>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>
          </div>
        </DialogContent>
      )}

      {step === "connection" && (
        <ConnectionDialog
          isOpen={open}
          onOpenChange={onOpenChange}
          authList={authList}
          handlePickFromCatalog={handlePickFromCatalog}
          handleConnectionBack={handleConnectionBack}
        />
      )}

      {step === "detail" && (
        <ConnectionsDetailDialog
          onBack={onBack}
          authSchemaFields={authSchemaFields}
          credentialLoading={credentialLoading}
          onSubmitData={onSubmitData}
          connectionLoading={connectionLoading}
          detailIntegration={detailIntegration}
          step={step}
        />
      )}
    </Dialog>
  );
}
