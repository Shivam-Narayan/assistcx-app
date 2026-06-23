"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function TagInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string[];
  onChange: (newValues: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 px-2 py-1 border border-input rounded-md bg-transparent min-h-[42px] w-full",
        "focus-within:ring-1 focus-within:ring-ring shadow-xs transition-all",
        disabled && "opacity-60 pointer-events-none bg-muted",
      )}
    >
      {value?.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1 max-w-full overflow-hidden"
        >
          <ConditionalTooltip
            content={tag}
            fullWidth
            alwaysShow
            align="center"
            showArrow
          >
            <span className="truncate max-w-[180px] text-xs">{tag}</span>
          </ConditionalTooltip>
        </Badge>
      ))}
      <Input
        type="text"
        placeholder={placeholder || "Type and press Enter..."}
        value={inputValue}
        disabled={disabled}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex-1 border-0 shadow-none h-auto px-1 py-0 bg-transparent outline-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[100px]",
        )}
      />
    </div>
  );
}
