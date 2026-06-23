import { useCopyToClipboard } from "@/helper/helper-function";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
import React from "react";
import ConditionalTooltip from "./conditional-tooltip-renderer";
import { Button } from "./ui/button";

interface CopyToClipboardProps {
  text: string; // either plain text OR id to build sharable link
  tooltipLabel?: string;
  className?: string;
  resetDelay?: number;
  iconType?: "copy" | "link";
  renderFrom?: "email-details" | "task-details" | "single-email-viewer"; // used only when iconType="link"
  size?: "default" | "sm";
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  tooltipLabel = "Copy to clipboard",
  className = "",
  resetDelay,
  iconType = "copy",
  renderFrom,
  size = "default",
}) => {
  const [isCopied, copyToClipboard] = useCopyToClipboard(resetDelay);

  const generateSharableLink = (id: string, renderFrom?: string) => {
    const currentUrl = window.location.href;

    switch (renderFrom) {
      case "single-email-viewer":
        // just copy the current page link
        return currentUrl;

      case "email-details":
        // append the ID
        return `${currentUrl}/${id}`;

      case "task-details": {
        const inboxIndex = currentUrl.indexOf("/inbox");
        if (inboxIndex !== -1) {
          const baseUrl = currentUrl.substring(0, inboxIndex + "/inbox".length);
          return `${baseUrl}/${id}`;
        }
        return currentUrl; // fallback
      }

      default:
        return id; // fallback: just copy the raw ID
    }
  };

  const handleCopy = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      let valueToCopy = text;

      if (iconType === "link") {
        valueToCopy = generateSharableLink(text, renderFrom);
      }

      if (valueToCopy) {
        await copyToClipboard(valueToCopy);
      }
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const BaseIcon = iconType === "link" ? LinkIcon : Copy;

  const sizeStyles = {
    default: {
      button: "h-6 w-6 p-0.5",
      check: "h-3.5! w-3.5!",
      icon: "h-2.5! w-2.5!",
    },
    sm: {
      button: "h-5 w-5 p-0.5",
      check: "h-2.5! w-2.5!",
      icon: "h-2.5! w-2.5!",
    },
  }[size];

  return (
    <ConditionalTooltip
      content={isCopied ? "Copied!" : tooltipLabel}
      alwaysShow={true}
      align="center"
      showArrow={true}
    >
      <Button
        variant="ghost"
        size="icon"
        className={`${sizeStyles.button} ml-1 rounded-full cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 ${className}`}
        onClick={handleCopy}
      >
        {isCopied ? (
          <Check className={`${sizeStyles.check} text-green-500`} />
        ) : (
          <BaseIcon
            className={`${sizeStyles.icon} text-slate-500 cursor-pointer`}
          />
        )}
      </Button>
    </ConditionalTooltip>
  );
};

export default CopyToClipboard;
