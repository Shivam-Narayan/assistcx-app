export type PermissionLevel = "view" | "edit" | "full" | "none";

export interface UserPermissions {
  isRoot: boolean;
  modules: Record<string, PermissionLevel>;
}

export const DEFAULT_PERMISSIONS: UserPermissions = {
  isRoot: false,
  modules: {},
};

/**
 * Parses the decoded JWT token's `permissions` field into UserPermissions.
 *
 * Token formats:
 *   Root user   → permissions: {}  (empty object)
 *   Non-root    → permissions: { modules: { agents: { level: "edit" }, … } }
 */
export function parsePermissions(permissions: unknown): UserPermissions {
  if (!permissions || typeof permissions !== "object") {
    return { isRoot: true, modules: {} };
  }

  const obj = permissions as Record<string, unknown>;

  if (Object.keys(obj).length === 0) {
    return { isRoot: true, modules: {} };
  }

  const modules = obj.modules;
  if (!modules || typeof modules !== "object") {
    return { isRoot: true, modules: {} };
  }

  const parsed: Record<string, PermissionLevel> = {};
  for (const [key, value] of Object.entries(
    modules as Record<string, { level?: string }>,
  )) {
    const level = value?.level;
    if (
      level === "view" ||
      level === "edit" ||
      level === "full" ||
      level === "none"
    ) {
      parsed[key] = level;
    }
  }

  return { isRoot: false, modules: parsed };
}

/** view, edit, or full */
export function canView(perms: UserPermissions, module: string): boolean {
  if (perms.isRoot) return true;
  const level = perms.modules[module];
  return level === "view" || level === "edit" || level === "full";
}

/** edit or full */
export function canEdit(perms: UserPermissions, module: string): boolean {
  if (perms.isRoot) return true;
  const level = perms.modules[module];
  return level === "edit" || level === "full";
}

/** full only */
export function canDelete(perms: UserPermissions, module: string): boolean {
  if (perms.isRoot) return true;
  return perms.modules[module] === "full";
}

/** When the JWT payload represents a root user */
export function isRootUserFromDecodedToken(
  decodedToken: Record<string, unknown> | null | undefined,
): boolean {
  if (!decodedToken) return false;
  return parsePermissions(decodedToken["permissions"]).isRoot;
}

/**
 * When the user has only the assistant module with a viewable level (non-root).
 */
export function isAssistantOnlyUser(
  decodedToken: Record<string, unknown> | null | undefined,
): boolean {
  if (!decodedToken) return false;
  const perms = parsePermissions(decodedToken["permissions"]);
  if (perms.isRoot) return false;
  const keys = Object.keys(perms.modules);
  if (keys.length !== 1 || keys[0] !== "assistant") return false;
  return canView(perms, "assistant");
}
