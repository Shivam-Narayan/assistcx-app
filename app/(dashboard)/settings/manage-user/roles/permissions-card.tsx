"use client";

import HeaderHoverCard from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PermissionDefinition = {
  key: string;
  name: string;
  description: string;
  access_levels: string[];
  web_routes?: string[];
  data_filters?: string[];
};

export type RolePermissionRow = {
  key: string;
  access_level: string;
};

const ACCESS_LEVEL_RANK: Record<string, number> = {
  none: 0,
  view: 1,
  edit: 2,
  full: 3,
};

const ACCESS_LEVEL_LABEL: Record<string, string> = {
  none: "No Access",
  view: "View",
  edit: "Edit",
  full: "Full",
};

function formatAccessLevelLabel(level: string): string {
  return ACCESS_LEVEL_LABEL[level] ?? level.charAt(0).toUpperCase() + level.slice(1);
}

function getDropdownOptions(accessLevels: string[]): string[] {
  const sorted = [...new Set(accessLevels.map((l) => l.toLowerCase()))].sort(
    (a, b) => (ACCESS_LEVEL_RANK[a] ?? 0) - (ACCESS_LEVEL_RANK[b] ?? 0),
  );
  return ["none", ...sorted];
}

function getHighestAccessLevel(accessLevels: string[]): string {
  let highest = "none";
  for (const level of accessLevels) {
    const normalized = level.toLowerCase();
    if ((ACCESS_LEVEL_RANK[normalized] ?? 0) > (ACCESS_LEVEL_RANK[highest] ?? 0)) {
      highest = normalized;
    }
  }
  return highest;
}

function resolveAccessLevel(
  stored: string | undefined,
  accessLevels: string[],
  useCatalogHighestWhenMissing: boolean,
): string {
  if (stored === undefined) {
    return useCatalogHighestWhenMissing
      ? getHighestAccessLevel(accessLevels)
      : "none";
  }
  const options = getDropdownOptions(accessLevels);
  const normalized = stored.toLowerCase();
  if (options.includes(normalized)) return normalized;
  const storedRank = ACCESS_LEVEL_RANK[normalized] ?? 0;
  let best = "none";
  for (const option of options) {
    const rank = ACCESS_LEVEL_RANK[option] ?? 0;
    if (rank <= storedRank && rank > (ACCESS_LEVEL_RANK[best] ?? 0)) {
      best = option;
    }
  }
  return best;
}

export function extractPermissionDefinitions(responseData: unknown): PermissionDefinition[] {
  if (responseData == null) return [];
  if (Array.isArray(responseData)) return responseData.filter(isPermissionDefinition);
  const record = responseData as Record<string, unknown>;
  const list = record.permissions ?? record.modules;
  if (!Array.isArray(list)) return [];
  return list.filter(isPermissionDefinition);
}

function isPermissionDefinition(item: unknown): item is PermissionDefinition {
  const candidate = item as PermissionDefinition;
  return typeof candidate?.key === "string" && Array.isArray(candidate?.access_levels);
}

export function buildRolePermissionRows(
  definitions: PermissionDefinition[],
  existingPermissions: RolePermissionRow[],
  useCatalogHighestWhenMissing = false,
): RolePermissionRow[] {
  const existingByKey = new Map(
    existingPermissions.map((entry) => [entry.key, entry.access_level.toLowerCase()]),
  );
  return definitions.map((definition) => ({
    key: definition.key,
    access_level: resolveAccessLevel(
      existingByKey.get(definition.key),
      definition.access_levels,
      useCatalogHighestWhenMissing,
    ),
  }));
}

type PermissionsCardProps = {
  permissionDefinitions: PermissionDefinition[];
  rolePermissionRows: RolePermissionRow[];
  onAccessLevelChange?: (permissionKey: string, accessLevel: string) => void;
  readOnly?: boolean;
};

function PermissionsCard({
  permissionDefinitions,
  rolePermissionRows,
  onAccessLevelChange,
  readOnly = false,
}: PermissionsCardProps) {
  const rowsByKey = new Map(
    rolePermissionRows.map((row) => [row.key, row.access_level]),
  );

  return (
    <Card className="shadow-none gap-0 py-0">
      <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
        <HeaderHoverCard
          title="Permissions"
          message="Access levels assigned to this role for each area of the product"
          type="card"
        />
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-3">
        <ItemGroup className="gap-3">
          {permissionDefinitions.map((definition) => {
            const selectedLevel = rowsByKey.get(definition.key) ?? "none";
            const options = getDropdownOptions(definition.access_levels);

            return (
              <Item key={definition.key} variant="outline" className="flex-wrap">
                <ItemContent className="min-w-0 flex-1">
                  <ItemTitle>{definition.name}</ItemTitle>
                  {definition.description && (
                    <ItemDescription>{definition.description}</ItemDescription>
                  )}
                </ItemContent>
                <ItemActions className="shrink-0">
                  {readOnly ? (
                    <Badge variant="secondary" className="text-sm">
                      {formatAccessLevelLabel(
                        options.includes(selectedLevel) ? selectedLevel : "none",
                      )}
                    </Badge>
                  ) : (
                    <Select
                      value={options.includes(selectedLevel) ? selectedLevel : "none"}
                      onValueChange={(value) =>
                        onAccessLevelChange?.(definition.key, value)
                      }
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-[min(100%,10rem)] hover:bg-background"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {formatAccessLevelLabel(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

export default PermissionsCard;
