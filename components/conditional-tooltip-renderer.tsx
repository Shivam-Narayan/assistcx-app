import { ReactElement, ReactNode, useCallback, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Defines the shape of props accepted by ConditionalTooltip
interface ConditionalTooltipProps {
  content: ReactNode; // Text to display inside the tooltip
  children: ReactNode; // The element that acts as the tooltip trigger
  className?: string; // Optional extra CSS classes applied to the tooltip content
  maxWidth?: string; // Maximum width of the tooltip box (default: 300px)
  alwaysShow?: boolean; // When true, tooltip shows regardless of text truncation
  align?: "start" | "center" | "end"; // Horizontal alignment of the tooltip relative to trigger
  side?: "left" | "top" | "bottom" | "right"; // Side on which the tooltip appears
  showArrow?: boolean; // Controls whether the tooltip shows a directional arrow
  sideOffset?: number; // Pixel gap between the tooltip and its trigger element
  fullWidth?: boolean; // Use block layout so the trigger can fill a flex row (default: inline-block)
  disabled?: boolean; // When true, disables the tooltip functionality and just renders children
}

// Component that shows a tooltip only when the child text is truncated (or always if alwaysShow is set)
const ConditionalTooltip = ({
  content,
  children,
  maxWidth = "300px", // Default max width for tooltip content box
  alwaysShow = false, // Default: only show tooltip when text overflows
  align = "start", // Default horizontal alignment of the tooltip
  side = "top", // Default side the tooltip appears on
  showArrow = false, // Default: no arrow on the tooltip
  className = "", // Default: no additional class
  sideOffset = 0, // Default: no gap between trigger and tooltip
  fullWidth = false,
  disabled = false,
}: ConditionalTooltipProps) => {
  // Tracks whether the child text element is currently truncated (overflowing its container)
  const [isTruncated, setIsTruncated] = useState(false);

  // Callback ref that measures the child element to detect text truncation on mount/update
  const checkTruncation = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const textElement = node.querySelector(".truncate") as HTMLElement;
      if (textElement) {
        const truncated = textElement.scrollWidth > textElement.clientWidth;

        setIsTruncated(truncated);
      }
    }
  }, []);

  // Wraps children in a div so we can attach the truncation-check ref
  const wrappedChildren = (
    <div
      ref={checkTruncation}
      style={
        fullWidth
          ? { display: "block", width: "100%", maxWidth: "100%" }
          : { display: "inline-block", maxWidth: "100%" }
      }
    >
      {children}
    </div>
  );

  // Returns just the wrapped children without a tooltip when truncation is not detected and alwaysShow is false
  if (!alwaysShow && !isTruncated) {
    return wrappedChildren;
  }

  //  Renders the full tooltip when text is truncated or alwaysShow is enabled
  return (
    <Tooltip>
      {/* Makes the wrapped children the clickable/hoverable tooltip trigger */}
      <TooltipTrigger asChild disabled={disabled}>
        {wrappedChildren}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className={`${!showArrow ? "no-arrow" : ""} whitespace-normal break-words w-fit ${className}`} // Builds class list; suppresses arrow when showArrow is false
        style={{ maxWidth }}
        sideOffset={sideOffset}
      >
        {/* Renders the tooltip text content */}
        {typeof content === "string" ? <p>{content}</p> : content}
      </TooltipContent>
    </Tooltip>
  );
};

export default ConditionalTooltip;
