"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state/empty-state";
import {
  formatNumberUS,
  getStatusColor,
  getTimeAgo,
} from "@/helper/helper-function";
import { Columns3, Loader2, Rows3, Settings2, Table2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { DynamicTable } from "../types/table-types";

interface TableCardsProps {
  tables: DynamicTable[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  searchQuery: string;
  onSelect: (tableId: string) => void;
  onConfigure: (table: DynamicTable) => void;
  onLoadMore?: () => void;
  canConfigure?: boolean;
}

export default function TableCards({
  tables,
  isLoading = false,
  isFetchingMore = false,
  hasMore = false,
  searchQuery,
  onSelect,
  onConfigure,
  onLoadMore,
  canConfigure = true,
}: TableCardsProps) {
  const defaultIcon = getIconSvg("grid-table", "data_table_icons");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!onLoadMore || isLoading || !hasMore || isFetchingMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onLoadMore();
      }
    });

    const sentinel = loadMoreRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onLoadMore, isLoading, hasMore, isFetchingMore, tables.length]);

  if (isLoading && tables.length === 0) {
    return <TableCardsSkeleton />;
  }

  if (tables.length === 0) {
    return (
      <EmptyState
        variant="fullpage"
        title={searchQuery ? "No Data Tables Found" : "No Data Tables Yet"}
        description={
          searchQuery
            ? "Try adjusting your search query."
            : "Create your first data table to get started."
        }
        icon={<Table2 />}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col h-fit">
        <div className="grid gap-5 2xl:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => (
            <Card
              key={table.id}
              className="relative flex min-h-42 w-full cursor-pointer flex-col gap-4 rounded-lg px-4 py-4 shadow-xs transition-all duration-300 group hover:border-primary/20 hover:bg-primary/5 hover:shadow-md"
              onClick={() => onSelect(table.id)}
            >
              <CardHeader className="shrink-0 gap-0 p-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-row items-center">
                    <div className="shrink-0 rounded-full bg-primary/10 p-2.5 text-primary">
                      <div
                        className="h-5 w-5"
                        dangerouslySetInnerHTML={{
                          __html:
                            getIconSvg(table.icon, "data_table_icons") ||
                            defaultIcon,
                        }}
                      />
                    </div>
                    <div className="ml-3 flex min-w-0 max-w-xs flex-col">
                      <ConditionalTooltip content={table.name} fullWidth>
                        <CardTitle className="line-clamp-1 max-w-[600px] truncate text-base tracking-tight text-foreground/80">
                          {table.name}
                        </CardTitle>
                      </ConditionalTooltip>
                      <p className="text-xs text-muted-foreground">
                        Updated {getTimeAgo(table.updatedAt)}
                      </p>
                    </div>
                  </div>
                  {table.availability ? (
                    <Badge
                      variant="outline"
                      className={getStatusColor(table.availability)}
                    >
                      {table.availability}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between space-y-3 p-0">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {table.description || "No description"}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Columns3 className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatNumberUS(table.columns.length)}{" "}
                      {table.columns.length === 1 ? "column" : "columns"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Rows3 className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatNumberUS(table.rowCount ?? table.rows.length)}{" "}
                      {(table.rowCount ?? table.rows.length) === 1
                        ? "row"
                        : "rows"}
                    </span>
                  </div>

                  {canConfigure ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onConfigure(table);
                      }}
                      className="ml-auto h-8 cursor-pointer gap-1.5 rounded-md border bg-background px-3 text-sm hover:bg-muted/40 xl:pointer-events-none xl:absolute xl:bottom-4 xl:right-4 xl:z-10 xl:ml-0 xl:translate-x-2 xl:opacity-0 xl:group-hover:pointer-events-auto xl:group-hover:translate-x-0 xl:group-hover:opacity-100 transition-all duration-300 ease-out"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      Configure
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {hasMore && !isFetchingMore ? (
          <div ref={loadMoreRef} className="h-8 w-full" aria-hidden />
        ) : null}

        {isFetchingMore ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TableCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 2xl:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <Card
          key={index}
          className="flex min-h-42 w-full flex-col gap-4 rounded-lg px-4 py-4 shadow-xs"
        >
          <CardHeader className="shrink-0 gap-0 p-0">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 flex-1 items-center">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="ml-3 flex flex-col gap-2">
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-muted" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-3 p-0">
            <div className="space-y-2">
              <div className="h-2.5 w-full animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-2/3 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex gap-6">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
