"use client";

import { BoxLayout } from "@/components/assistant/box-layout";
import { KnowledgeCollectionCard } from "./_components/knowledge-collection-card";
import { KnowledgeCollectionCardLoader } from "./_components/knowledge-collection-card-loader";
import { Input } from "@/components/ui/input";
import { useKnowledgeCollections } from "@/app/assistant/knowledge/hooks/useKnowledgeCollections";
import { BookMarked, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { EmptyState } from "@/components/empty-state/empty-state";

export default function Knowledge() {
  const {
    collections,
    isLoading,
    isFetchingMore,
    error,
    searchQuery,
    page,
    hasMore,
    loaderRef,
    setSearchQuery,
    handleSearchChange,
  } = useKnowledgeCollections({ pageSize: 10 });

  return (
    <div className="flex flex-col items-center w-full z-0 ">
      <BoxLayout className="w-full h-full flex flex-col min-w-full md:max-w-full">
        <div className="sticky top-0  backdrop-blur-md z-10 ">
          <div className="md:max-w-screen-md md:mx-auto pt-20 md:pt-12 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl md:text-3xl font-semibold">
                Knowledge Collections
              </h1>
            </div>
            <div className="relative w-full mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 bg-white border border-input shadow-xs transition-colors ring-offset-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full  overflow-auto md:max-w-screen-md md:mx-auto">
          <div className="space-y-3 w-full pb-6">
            {isLoading && page === 1 ? (
              <KnowledgeCollectionCardLoader />
            ) : error ? (
              <div className="text-center py-4 text-red-500">
                Error: {error}
              </div>
            ) : collections.length === 0 && !isLoading ? (
              <EmptyState
                title="No Collections Found!"
                icon={BookMarked}
                variant="fullpage"
              />
            ) : (
              <>
                {collections.map((collection) => {
                  return (
                    <KnowledgeCollectionCard
                      key={collection.id}
                      collection={collection}
                    />
                  );
                })}

                {hasMore && (
                  <div
                    ref={loaderRef}
                    className="w-full h-10 flex items-center justify-center"
                  >
                    {isFetchingMore && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Loading more collections...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </BoxLayout>
    </div>
  );
}
