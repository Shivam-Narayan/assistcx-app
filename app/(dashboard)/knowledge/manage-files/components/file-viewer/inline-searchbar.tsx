import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
interface InlineSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  matchCount: number;
  currentIndex: number;
  onNavigate: (direction: "prev" | "next") => void;
  onClear: () => void;
  placeholder?: string;
}

export const InlineSearchBar = ({
  search,
  onSearchChange,
  matchCount,
  currentIndex,
  onNavigate,
  onClear,
  placeholder = "Search...",
}: InlineSearchBarProps) => (
  <div className="flex items-center gap-2">
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-44 pr-7"
      />
      {search && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>

    {search && (
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {matchCount > 0 ? `${currentIndex + 1} / ${matchCount}` : "0 results"}
        </span>

        <ConditionalTooltip
          content="Previous match"
          alwaysShow={true}
          align="center"
          showArrow={true}
        >
          <Button
            variant="outline"
            size="icon"
            className="flex items-center gap-2 cursor-pointer"
            disabled={matchCount === 0}
            onClick={() => onNavigate("prev")}
          >
            <ArrowUp className="h-3.5 w-3.5" />
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
            size="icon"
            className="flex items-center gap-2 cursor-pointer"
            disabled={matchCount === 0}
            onClick={() => onNavigate("next")}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
        </ConditionalTooltip>
      </div>
    )}
  </div>
);
