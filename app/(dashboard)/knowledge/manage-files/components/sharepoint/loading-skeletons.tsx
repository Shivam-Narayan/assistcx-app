import React from "react";
import { Skeleton } from "@/components/skeleton";

export function FolderLoadingSkeletons() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden px-4 py-3 dark:bg-slate-800">
      {/* Search bar skeleton */}
      <div className="relative mb-4 bg-card-foreground/20 dark:bg-card-foreground/10">
        <Skeleton className="h-10 w-full rounded" />
      </div>

      {/* Breadcrumb skeleton */}
      <div className="flex space-x-2 mb-2 dark:bg-slate-800 ">
        {[1].map((i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>

      {/* Folder/File list skeleton */}
      <div className="flex-1 overflow-y-auto mt-1 pr-2  space-y-4 ">
         {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center px-4 py-3 border-b last:border-b-0 dark:bg-card-foreground/10"
              >
                <Skeleton className="h-5 w-5 mr-2 rounded-md" />{" "}
                {/* Icon placeholder */}
                <Skeleton className="h-4 w-3/4 flex-1 rounded-md" />{" "}
                {/* Name placeholder */}
              
              </div>
            ))}
      </div>
    </div>
  );
}
