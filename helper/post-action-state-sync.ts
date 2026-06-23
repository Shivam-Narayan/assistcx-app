/**
 * Post-action list state sync
 *
 * Eliminates redundant GET API calls after successful CRUD mutations.
 * Instead of refetching the entire list from the server, this helper
 * applies the mutation result directly to the local list state.
 *
 * Used pattern:
 *   1. User performs an action (create/edit/delete)
 *   2. API call succeeds and returns the mutated entity
 *   3. This helper patches the local list state to reflect the change
 *
 * Constraints:
 *   - Every item in the list MUST have a unique `id` field
 *   - The `item` passed in must come from the API response (or have a valid `id`)
 *   - Updated/added items are placed at the top of the list (most-recently-modified first)
 */

export type PostActionStateSyncAction = "add" | "update" | "delete";

type IdentifiableRecord = { id: string | number; [key: string]: any };

/**
 * Syncs local list state after a successful post-action API call.
 *
 * @param list      - Current list state (previous snapshot)
 * @param item      - The entity returned from the API (must contain `id`)
 * @param action    - Which mutation to apply: "add" | "update" | "delete"
 * @param overrides - Optional field overrides merged on top during "update"
 *                    (useful when the API doesn't return the full updated entity,
 *                     e.g., toggling a status field locally)
 */
export const postActionStateSync = <T extends IdentifiableRecord>(
  list: T[],
  item: T | null | undefined,
  action: PostActionStateSyncAction,
  overrides?: Partial<T>,
): T[] => {
  if (!item || item.id == null) return list;

  switch (action) {
    case "add":
      return [item, ...list];

    case "update": {
      const existing = list.find((entry) => entry.id === item.id);

      const merged = {
        ...(existing ?? {}),
        ...item,
        ...overrides,
      } as T;

      return replaceAndMoveToTop(list, merged);
    }

    case "delete":
      return list.filter((entry) => entry.id !== item.id);

    default:
      return list;
  }
};

/**
 * Removes the old entry (by id) and prepends the new version at the top.
 * This keeps the most-recently-modified item visible at position 0,
 * consistent with the default sort_by=updated_at desc used across settings tables.
 */
const replaceAndMoveToTop = <T extends IdentifiableRecord>(
  list: T[],
  item: T,
): T[] => {
  const filtered = list.filter((entry) => entry.id !== item.id);
  return [item, ...filtered];
};
