"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SmartContentViewer } from "@/components/smart-content";

interface ChunksScrollViewerProps {
  chunks: { text?: string }[];
  pageSize?: number;
  scrollRoot?: HTMLElement | null;
  search?: string;
  currentSearchIndex?: number;
}

export const ChunksScrollViewer = ({
  chunks,
  pageSize = 10,
  scrollRoot = null,
  search = "",
  currentSearchIndex = 0,
}: ChunksScrollViewerProps) => {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [chunks, pageSize]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (visibleCount >= chunks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((prev) => Math.min(prev + pageSize, chunks.length));
      },
      { root: scrollRoot, rootMargin: "200px 0px 200px 0px", threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [chunks.length, pageSize, scrollRoot, visibleCount]);

  const effectiveChunks = useMemo(
    () => (search ? chunks : chunks.slice(0, visibleCount)),
    [chunks, search, visibleCount],
  );

  const perChunkMatchCounts = useMemo(() => {
    if (!search) return [];
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escape(search), "gi");
    return chunks.map((chunk) => (chunk.text || "").match(regex)?.length ?? 0);
  }, [chunks, search]);

  const cumulativeOffsets = useMemo(() => {
    const offsets: number[] = [];
    let sum = 0;
    for (const count of perChunkMatchCounts) {
      offsets.push(sum);
      sum += count;
    }
    return offsets;
  }, [perChunkMatchCounts]);

  const getLocalSearchIndex = (chunkIdx: number): number => {
    if (!search) return -1;
    const offset = cumulativeOffsets[chunkIdx] ?? 0;
    const count = perChunkMatchCounts[chunkIdx] ?? 0;
    const localIdx = currentSearchIndex - offset;
    return localIdx >= 0 && localIdx < count ? localIdx : -1;
  };

  return (
    <div className="space-y-3">
      {effectiveChunks.map((chunk, index) => (
        <div
          key={index}
          className="divide-y divide bg-gray-50 dark:bg-slate-700/30 rounded-md border p-3"
        >
          <h3 className="text-lg pb-2 mb-2 font-semibold flex items-center gap-2">
            Chunk
            <Badge
              variant="outline"
              className="bg-primary text-primary-foreground text-sm"
            >
              {index + 1} / {chunks.length}
            </Badge>
          </h3>
          <SmartContentViewer
            content={chunk.text || ""}
            className="bg-gray-50 dark:bg-slate-700/30 "
            expandView={true}
            search={search}
            currentSearchIndex={getLocalSearchIndex(index)}
          />
        </div>
      ))}
      {!search && chunks.length > visibleCount && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-2"
        >
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-primary">Loading more chunks...</span>
          </div>
        </div>
      )}
    </div>
  );
};
