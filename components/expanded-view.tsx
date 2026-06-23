import { useCopyToClipboard } from "@/helper/helper-function";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ConditionalTooltip from "./conditional-tooltip-renderer";
import ContentViewerWithSearch from "./content-viewer-with-search";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { TooltipProvider } from "./ui/tooltip";

export interface ExpandedViewProps {
  content: string;
  language: "json" | "xml" | "text";
  isStructuredData: boolean;
  className?: string;
}

export const ExpandedView: React.FC<ExpandedViewProps> = ({
  content,
  language,
  isStructuredData,
  className = "top-0 right-8",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, copyToClipboard] = useCopyToClipboard();
  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleCopy = () => {
    copyToClipboard(content);
  };
  // Count matches
  const matchCount = useMemo(() => {
    if (!search) return 0;
    const regex = new RegExp(
      search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi",
    );
    return (content.match(regex) || []).length;
  }, [content, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentIndex(0);
  };

  const navigateMatch = (direction: "next" | "prev") => {
    if (matchCount === 0) return;

    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % matchCount
        : (currentIndex - 1 + matchCount) % matchCount;

    setCurrentIndex(newIndex);
  };
  useEffect(() => {
    if (search && matchCount > 0) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        const element = document.getElementById("current-match");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }
  }, [currentIndex, search, matchCount]);

  const clearSearch = () => {
    setSearch("");
    setCurrentIndex(0);
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          search && clearSearch();
        }}
        className={`absolute cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 rounded-md p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 shadow-xs ${className}`}
        aria-label="Maximize content"
      >
        <Maximize2 className="h-4 w-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-[80vw] w-[80vw] max-h-[90vh] h-auto flex flex-col p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="sticky top-0 z-10 flex flex-row justify-between items-center space-y-0 bg-background px-4 py-4 border-b rounded-t-lg">
            <div className="w-full flex gap-4">
              <DialogTitle className="flex items-center">
                Expanded View
              </DialogTitle>

              <div className="ml-auto flex items-center gap-2 w-full max-w-xs">
                <div className="relative flex-1">
                  <Input
                    autoFocus={false}
                    type="text"
                    placeholder="Search in content..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pr-8"
                  />
                  {search && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {matchCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {currentIndex + 1} / {matchCount}
                    </span>
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <ConditionalTooltip
                          content="Previous match"
                          alwaysShow={true}
                          align="center"
                          showArrow={true}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMatch("prev")}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </ConditionalTooltip>

                        <ConditionalTooltip
                          content="Next match"
                          alwaysShow={true}
                          align="center"
                          showArrow={true}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMatch("next")}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </ConditionalTooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ConditionalTooltip
                content={isCopied ? "Copied!" : "Copy to clipboard"}
                alwaysShow={true}
                align="center"
                showArrow={true}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  tabIndex={-1}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {isCopied ? (
                    <span className="text-green-500 text-xs font-semibold">
                      ✓ Copied
                    </span>
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </ConditionalTooltip>

              <ConditionalTooltip
                content="Minimize"
                alwaysShow={true}
                align="center"
                showArrow={true}
              >
                <DialogClose
                  tabIndex={-1}
                  className="cursor-pointer h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
                >
                  <Minimize2 className="h-4 w-4" />
                </DialogClose>
              </ConditionalTooltip>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto px-6 pb-4 h-auto">
            {isStructuredData ? (
              <ContentViewerWithSearch
                content={content}
                search={search}
                currentIndex={currentIndex}
                SyntaxHighlighterContent={true}
                language={language}
              />
            ) : (
              <div
                className={`bg-gray-50 dark:bg-slate-700/30 rounded-md border p-3 break-all`}
              >
                <ContentViewerWithSearch
                  content={content}
                  search={search}
                  currentIndex={currentIndex}
                  SyntaxHighlighterContent={false}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
