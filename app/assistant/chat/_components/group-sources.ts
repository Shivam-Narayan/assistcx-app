import { GroupedSource, GroupedSourceItem, SourceDocument } from "./types";

function getDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

function getGroupKey(source: SourceDocument): string {
  const fileUuid = source.metadata?.file_uuid;
  if (fileUuid) return `file:${fileUuid}`;
  if (source.url) return `url:${source.url}`;
  return `title:${normalizeTitle(source.title)}`;
}

export function groupSelectedSources(
  sources: SourceDocument[],
): GroupedSource[] {
  const map = new Map<string, GroupedSource>();

  sources.forEach((source, index) => {
    const groupKey = getGroupKey(source);
    const citationNumber = index + 1;
    const item: GroupedSourceItem = { source, citationNumber };

    const existing = map.get(groupKey);
    if (existing) {
      existing.items.push(item);
    } else {
      const url = source.url ?? source.metadata?.url ?? "";
      map.set(groupKey, {
        groupKey,
        title: source.title,
        url,
        domain: getDomain(url),
        source_type: source.source_type,
        items: [item],
      });
    }
  });

  return Array.from(map.values());
}
