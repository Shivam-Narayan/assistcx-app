"use client";

import { Skeleton } from "@/components/skeleton";



export const LoadingCards = () => {
  return (
     <div className="grid gap-5 2xl:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col w-full border rounded-md p-4 hover:shadow-md transition-all duration-300"
        >
          {/* Header - Logo and Title */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-full bg-muted" />
              <div className="ml-3 flex flex-col">
                <Skeleton className="w-32 h-5 rounded-md" />
              </div>
            </div>
          </div>

          {/* Content - Description */}
          <div className="flex flex-col gap-2 mt-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Footer - Button and Status */}
          <div className="flex justify-between items-center border-t mt-4 pt-4">
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};