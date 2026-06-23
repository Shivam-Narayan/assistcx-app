"use client";

import { ICONS_LIST } from "@/components/icon-manager/icons-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderCardProps } from "./types";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import StatusCheckBadge from "@/app/(dashboard)/integrations/components/statusCheckBadge";
import React from "react";

export const ProviderCard = ({
  provider,
  onClick,
  onActivate,
  onManage,
  isRoot,
  onMakeDeactivate,
}: ProviderCardProps) => {
  return (
    <div
      onClick={() => {
        onClick(provider);
      }}
      className={`mx-auto flex w-full max-w-200 flex-col gap-2 rounded-lg border
         border-border cursor-pointer transition-colors hover:bg-muted/50 group`}
    >
      <div className=" p-4  flex-col flex gap-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0"
            dangerouslySetInnerHTML={{
              __html:
                ICONS_LIST.ai_icons[
                  provider.iconKey as keyof typeof ICONS_LIST.ai_icons
                ] || "",
            }}
          />
          <div className="flex items-center gap-2 min-w-0 w-full">
            <span className="text-sm font-medium text-foreground">
              {provider.name}
            </span>
            {provider?.models && provider?.models?.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {provider.models?.length} model
                {provider.models?.length !== 1 && "s"}
              </Badge>
            )}

            <div className="flex justify-between items-center ml-auto gap-3  ">
              {provider?.isActive && (
                <>
                  {isRoot && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex justify-between items-center gap-3"
                    >
                      <Button
                        className={` text-xs font-medium cursor-pointer hover:border-primary/30 hover:bg-primary/5 `}
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onManage?.(provider);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                        Manage
                      </Button>
                      <Button
                        className="cursor-pointer text-xs font-medium"
                        size="xs"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMakeDeactivate?.(provider);
                        }}
                      >
                        Deactivate
                      </Button>
                    </div>
                  )}
                  {provider.isActive && (
                    <Badge
                      variant="default"
                      className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15 h-6"
                    >
                      Active
                    </Badge>
                  )}
                </>
              )}
              {!provider?.isActive && isRoot && (
                <Button
                  className="ml-auto cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex justify-between items-center gap-3 "
                  size="xs"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivate?.(provider);
                  }}
                >
                  Activate
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {provider.description}
        </p>
      </div>
    </div>
  );
};
