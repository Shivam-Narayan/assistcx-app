"use client";

import { KnowledgeCollectionLoader } from "@/app/assistant/chat/_components/knowledge-collection-loader";
import {
  ApiResponse,
  KnowledgeItem,
} from "@/app/assistant/chat/_components/types";
import {
  getIconsData,
  getIconSvg,
} from "@/components/icon-manager/icon-render-component";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { LIST_COLLECTIONS, SEARCH_COLLECTIONS } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useDebounce } from "@/lib/hook/useDebounce";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { KnowledgeCollectionMenuProps } from "./types";

const PAGE_SIZE = 10;

export function KnowledgeCollectionMenu({
  selected,
  onSelectionChange,
  onClearAll,
  webSearchSlot,
  maxSelection = 1,
  triggerLabel = "Knowledge",
  trigger,
}: KnowledgeCollectionMenuProps) {
  const router = useRouter();
  const { axiosAuth, loading } = useAxiosAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const iconsData = getIconsData("collection_icons");
  const defaultIcon = getIconSvg("folder02", "collection_icons");
  const [collections, setCollections] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const observerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSearchingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchCollections = useCallback(
    async (pageNum: number, keyword: string, isNewSearch: boolean = false) => {
      try {
        if (isNewSearch) {
          setIsLoading(true);
        } else if (pageNum > 1) {
          setIsFetchingMore(true);
        }

        const endpoint = keyword ? SEARCH_COLLECTIONS : LIST_COLLECTIONS;
        const params = keyword
          ? {
              keyword,
              page: pageNum,
              page_size: PAGE_SIZE,
              filters: {
                availability: "PUBLISHED",
              },
            }
          : {
              page: pageNum,
              page_size: PAGE_SIZE,
              filters: {
                availability: "PUBLISHED",
              },
            };

        const response = await axiosAuth.get<ApiResponse>(endpoint, {
          params,
          paramsSerializer: (params) => {
            const { filters, ...rest } = params;
            const base = new URLSearchParams(rest).toString();
            const filterStr = filters
              ? `&filters=${encodeURIComponent(JSON.stringify(filters))}`
              : "";
            return `${base}${filterStr}`;
          },
        });
        const newItems = response.data.data_collections || [];

        if (isNewSearch || pageNum === 1) {
          setCollections(newItems);
        } else {
          setCollections((prev) => [...prev, ...newItems]);
        }

        setHasMore(newItems.length === PAGE_SIZE);
      } catch (err) {
        setError("Failed to load collections");
        console.error("Fetch error:", err);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [axiosAuth],
  );

  useEffect(() => {
    if (scrollContainerRef.current && debouncedSearch) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (scrollContainerRef.current && searchTerm === "") {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (open && scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo(0, 0);
        }
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (!loading && open) {
      isSearchingRef.current = true;
      setPage(1);
      setHasMore(true);
      fetchCollections(1, debouncedSearch, true).finally(() => {
        setTimeout(() => {
          isSearchingRef.current = false;
        }, 500);
      });
    }
  }, [debouncedSearch, fetchCollections, loading, open]);

  useEffect(() => {
    if (page > 1 && !isFetchingMore && !isSearchingRef.current) {
      fetchCollections(page, debouncedSearch);
    }
    // eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoading &&
          !isFetchingMore &&
          !isSearchingRef.current
        ) {
          if (observerTimeoutRef.current) {
            clearTimeout(observerTimeoutRef.current);
          }

          observerTimeoutRef.current = setTimeout(() => {
            setPage((prev) => prev + 1);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
      if (observerTimeoutRef.current) {
        clearTimeout(observerTimeoutRef.current);
      }
    };
  }, [hasMore, isLoading, isFetchingMore]);

  const toggleItem = (item: KnowledgeItem) => {
    const current = selected ?? [];
    const isSelected = current.some((i) => i.id === item.id);
    if (isSelected) {
      onSelectionChange(null);
      return;
    }
    setOpen(false);
    setSearchTerm("");
    onSelectionChange([item]);
  };
  return (
    <div className="relative">
      <DropdownMenu
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setSearchTerm("");
        }}
      >
        <DropdownMenuTrigger asChild>
          {trigger ? (
            trigger
          ) : (
            <Button
              variant="outline"
              className="cursor-pointer rounded-full gap-2 text-sm font-medium px-4 py-2 shadow-none border w-auto bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary focus-visible:ring-0 focus-visible:border-transparent"
              aria-label="Knowledge Collections"
            >
              <span>{triggerLabel}</span>

              {selected !== null && selected?.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-medium absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[88vw] sm:max-w-xl p-0 overflow-hidden rounded-xl"
          align="start"
          sideOffset={8}
        >
          <div className="flex flex-col h-full">
            <div className=" flex items-center justify-between px-4 py-2.5 border-b bg-muted/50 z-10">
              <span
                className="sm:text-lg font-semibold cursor-pointer"
                onClick={() => router.push("/knowledge")}
              >
                Knowledge
              </span>
              <div className="flex items-center gap-2">
                {webSearchSlot != null && (
                  <span className="flex self-center">{webSearchSlot}</span>
                )}
              </div>
            </div>
            <div
              className="flex flex-col h-full overflow-y-auto min-h-[40vh] max-h-[40vh]"
              ref={scrollContainerRef}
            >
              <div className="p-4 sticky top-0 bg-white z-10">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search collections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 bg-white border border-input shadow-xs transition-colors ring-offset-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                  {searchTerm.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer"
                    >
                      <Cross2Icon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="px-4 pb-4">
                <AnimatePresence>
                  {collections.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {collections.map((item, index) => {
                        const isChecked = selected
                          ? selected.some((i) => i.id === item.id)
                          : false;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card
                              key={item.id}
                              className={cn(
                                "p-3 shadow-xs cursor-pointer transition-colors hover:bg-accent",
                                isChecked &&
                                  "border-primary/30 bg-primary/10 hover:bg-primary/10",
                              )}
                              onClick={() => {
                                toggleItem(item);
                              }}
                            >
                              <div className="flex items-start gap-3 w-full">
                                <div
                                  className="flex items-center justify-center text-primary bg-primary/10 rounded-md w-8 h-8 p-1 [&>svg]:size-5"
                                  dangerouslySetInnerHTML={{
                                    __html: iconsData[item.icon] || defaultIcon,
                                  }}
                                />
                                <div className="flex flex-col flex-1">
                                  <h4 className="text-sm font-medium leading-none mb-1 break-all">
                                    {item.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground  break-all line-clamp-2">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : isLoading ? (
                    <div className="text-sm text-muted-foreground">
                      <KnowledgeCollectionLoader length={2} />
                    </div>
                  ) : (
                    <div className="text-center text-lg py-4 text-muted-foreground">
                      No results found
                    </div>
                  )}
                </AnimatePresence>

                {hasMore && (
                  <div
                    ref={loaderRef}
                    className="w-full h-10 flex items-center justify-center"
                  >
                    {isFetchingMore && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span>Loading more collections...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
