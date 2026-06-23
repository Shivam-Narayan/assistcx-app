import { ExecutionMessage } from "@/types/types";

export function mergeExecutionLog(
  existing: ExecutionMessage[],
  incoming: ExecutionMessage[],
): ExecutionMessage[] {
  if (existing.length === 0) return incoming;

  const makeKey = (item: ExecutionMessage) =>
    JSON.stringify({
      role: item.role,
      content: item.content,
      name: item.name,
      tool_call_id: item.tool_call_id,
      tool_calls: item.tool_calls,
    });

  const existingKeys = new Set(existing.map(makeKey));
  const newItems = incoming.filter((item) => !existingKeys.has(makeKey(item)));

  if (newItems.length === 0) {
    return incoming.length !== existing.length ? incoming : existing;
  }

  return [...existing, ...newItems];
}
