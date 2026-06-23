"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { hslStringToHex } from "@/helper/helper-function";
import { Check } from "lucide-react";

interface ThemeWatchProps {
  color: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function ThemeWatch({
  color,
  label,
  selected,
  onClick,
}: ThemeWatchProps) {
  const hex = hslStringToHex(color);
  return (
    <ConditionalTooltip
      content={label}
      alwaysShow={true}
      align="center"
      showArrow={true}
    >
      <button
        onClick={onClick}
        className="group transition-all cursor-pointer"
        aria-label={`${label} theme`}
      >
        <div
          className={`h-10 w-10 rounded-md border flex items-center justify-center transition-all ${
            selected ? "ring-2 ring-offset-2 scale-105" : "hover:scale-110"
          }`}
          style={{ backgroundColor: hex }}
        >
          {selected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
        </div>
      </button>
    </ConditionalTooltip>
  );
}
