"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface CollapsibleContentProps {
  children: React.ReactNode;
  maxHeight?: number; // in pixels, default is 128px (8rem)
  className?: string;
  gradientStart?: string; // The complete from-X Tailwind class
}

export function CollapsibleContent({
  children,
  maxHeight = 160,
  className = "",
  gradientStart = "from-slate-50", // Default class
}: CollapsibleContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsCollapsing, setNeedsCollapsing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if content needs collapsing on mount and resize
  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const isOverflowing = contentRef.current.scrollHeight > maxHeight;
        setNeedsCollapsing(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [maxHeight, children]);

  // Build the full gradient class with the provided from-X class
  const gradientClass = `bg-linear-to-t ${gradientStart} dark:from-slate-700 to-transparent`;

  return (
    <div>
      <div
        className={`${className} ${
          !isExpanded && needsCollapsing ? "relative overflow-hidden" : ""
        }`}
        style={{
          maxHeight:
            !isExpanded && needsCollapsing ? `${maxHeight}px` : undefined,
        }}
        ref={contentRef}
      >
        {children}

        {!isExpanded && needsCollapsing && (
          <div
            className={`absolute bottom-0 left-0 w-full h-12 pointer-events-none ${gradientClass}`}
          ></div>
        )}
      </div>

      {needsCollapsing && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-0 mt-2 h-auto cursor-pointer text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/70 
`}
        >
          {isExpanded ? "Show Less" : "Show More"}
          <span className="inline-flex items-center ml-1">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </Button>
      )}
    </div>
  );
}
