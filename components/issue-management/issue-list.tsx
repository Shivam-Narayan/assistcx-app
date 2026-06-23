import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { IssueRowSkeleton } from "./loading";

interface Issue {
  id: string;
  title: string;
  description: string;
}

interface SearchAndAssignIssueProps {
  searchText: string;
  setSearchText: (value: string) => void;
  issues: Issue[];
  selectedIssue: any;
  setSelectedIssue: any;
  onAssign: () => void;
  loadingAssingIssue: boolean;
  loadMore: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
  isIssueLoading: boolean;
}

export const SearchAndAssignIssue = ({
  searchText,
  setSearchText,
  issues,
  selectedIssue,
  setSelectedIssue,
  onAssign,
  loadingAssingIssue,
  loadMore,
  hasMore,
  isFetchingMore,
  isIssueLoading,
}: SearchAndAssignIssueProps) => {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 20) {
      if (hasMore && !isFetchingMore) {
        loadMore();
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search  */}
      <div className="pb-4">
        <div className="relative w-full">
          <Search
            placeholder="Search..."
            className="h-10 w-full pr-10 border border-gray-300 bg-white
                 focus:ring-0 focus:outline-none focus-visible:ring-0
                 focus-within:ring-0 focus-within:ring-transparent"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {searchText && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchText("")}
              className="
          absolute right-2 top-1/2 -translate-y-1/2
          h-6 w-6 p-0
          flex items-center justify-center
          text-gray-400 hover:text-gray-600
        "
            >
              <Cross2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* issue list */}
      <div
        className="flex-1 overflow-y-auto max-h-[300px] pb-6"
        onScroll={handleScroll}
      >
        {isIssueLoading ? (
          <IssueRowSkeleton count={3} />
        ) : issues.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground ">
            No issue found
          </div>
        ) : (
          <>
            <RadioGroup
              value={selectedIssue?.id ?? ""}
              className="pr-4 space-y-1"
            >
              {issues.map((issue) => {
                const isSelected = selectedIssue?.id === issue.id;

                return (
                  <Card
                    key={issue.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedIssue(null);
                      } else {
                        setSelectedIssue(issue);
                      }
                    }}
                    className={`cursor-pointer transition p-0 hover:border-primary ${
                      isSelected ? "border-primary bg-secondary" : ""
                    }`}
                  >
                    <CardContent className="flex items-start gap-3 p-3">
                      <RadioGroupItem
                        value={issue.id}
                        className="mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            setSelectedIssue(null);
                          } else {
                            setSelectedIssue(issue);
                          }
                        }}
                      />

                      <div className="flex flex-col gap-1 overflow-hidden">
                        <p className="font-medium text-sm break-words">
                          {issue.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[450px]">
                          {issue.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </RadioGroup>
            {isFetchingMore && <IssueRowSkeleton count={2} />}
          </>
        )}
      </div>

      {issues.length > 0 && (
        <div className="p-3 flex justify-end bg-background sticky bottom-0">
          <Button
            type="button"
            disabled={!selectedIssue || loadingAssingIssue}
            onClick={() => onAssign()}
            className="cursor-pointer"
          >
            {loadingAssingIssue && <Loader2 className="h-4 w-4 animate-spin" />}
            Assign issue
          </Button>
        </div>
      )}
    </div>
  );
};
