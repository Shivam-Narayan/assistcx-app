"use client";

import { useCopyToClipboard } from "@/helper/helper-function";
import { Copy } from "lucide-react";
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";

import { SourceDocument } from "@/app/assistant/chat/_components/types";
import ContentViewerWithSearch from "./content-viewer-with-search";
import { ExpandedView } from "./expanded-view";
import { Markdown, MarkdownSize } from "./ui/markdown";

// Define custom component props
interface CopyButtonProps {
  text: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className = "top-0 right-0",
}) => {
  // Use our centralized copy hook instead of local state
  const [isCopied, copyToClipboard] = useCopyToClipboard();

  const handleCopy = () => {
    copyToClipboard(text);
  };

  return (
    <button
      onClick={handleCopy}
      className={`absolute cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 rounded-md p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 shadow-xs ${className}`}
      aria-label={isCopied ? "Copied" : "Copy to clipboard"}
    >
      {isCopied ? (
        <span className="text-green-500 text-xs font-semibold">✓ Copied</span>
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
};

interface SmartContentViewerProps {
  content: any;
  className?: string; // For wrapper styling
  maxHeight?: string | number; // For controlling the syntax highlighter's max height
  fullHeight?: boolean; // Option to use full available container height
  expandView?: boolean;
  withCitations?: boolean;
  sources?: SourceDocument[];
  size?: MarkdownSize;
  search?: string;
  currentSearchIndex?: number;
  scrollRoot?: HTMLElement | null;
}

/**
 * Renders content smartly based on its type (JSON, XML, Markdown, or plain text)
 */
export const SmartContentViewer: React.FC<SmartContentViewerProps> = ({
  content,
  className = "",
  maxHeight = "1200px",
  fullHeight = false,
  expandView = false,
  withCitations = false,
  sources,
  size = "sm",
  search = "",
  currentSearchIndex = 0,
  scrollRoot = null,
}) => {
  if (content === null || content === undefined) {
    return <span className="text-gray-500 italic text-sm">No content</span>;
  }

  let formattedData = "";
  let language: "json" | "xml" | "text" = "text";
  let isStructuredData = false;

  if (typeof content === "object" && !React.isValidElement(content)) {
    // Always stringify objects
    try {
      formattedData = JSON.stringify(content, null, 2);
      language = "json";
      isStructuredData = true;
    } catch {
      return (
        <div className="text-red-500 text-xs">
          Error displaying object: Could not stringify.
        </div>
      );
    }
  } else {
    const contentStr = String(content);
    const trimmedContent = contentStr.trim();

    if (
      (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) ||
      (trimmedContent.startsWith("[") && trimmedContent.endsWith("]"))
    ) {
      try {
        const parsedJson = JSON.parse(trimmedContent);
        formattedData = JSON.stringify(parsedJson, null, 2);
        language = "json";
        isStructuredData = true;
      } catch {
        // ✅ fallback: still stringify, so CopyButton is consistent
        formattedData = JSON.stringify(contentStr, null, 2);
        language = "json";
        isStructuredData = true;
      }
    } else if (trimmedContent.startsWith("<") && trimmedContent.endsWith(">")) {
      formattedData = contentStr;
      language = "xml";
      isStructuredData = true;
    } else {
      formattedData = contentStr;
      language = "text";
    }
  }

  if (isStructuredData) {
    return (
      <div
        className={`bg-white dark:bg-slate-800 relative group rounded-md overflow-hidden border my-2 text-sm ${className} ${
          fullHeight ? "h-full flex flex-col" : ""
        }`}
      >
        <CopyButton
          text={formattedData}
          className={`top-2 ${expandView ? "right-10" : "right-2 "}`}
        />
        {expandView && (
          <ExpandedView
            content={formattedData}
            language={language}
            isStructuredData={isStructuredData}
            className="top-2 right-2"
          />
        )}
        {search ? (
          <ContentViewerWithSearch
            content={formattedData}
            search={search}
            currentIndex={currentSearchIndex}
            SyntaxHighlighterContent={true}
            language={language}
            scrollRoot={scrollRoot}
          />
        ) : (
          <SyntaxHighlighter
            language={language}
            style={docco}
            wrapLongLines
            wrapLines
            customStyle={{
              padding: "0.75rem",
              margin: "0",
              fontSize: "0.85rem",
              background: "transparent",
              border: "none",
              borderRadius: "0",
              maxHeight: fullHeight ? "none" : maxHeight,
              height: fullHeight ? "100%" : "auto",
              overflowY: "auto",
              flex: fullHeight ? 1 : "unset",
            }}
            codeTagProps={{
              style: {
                fontFamily: "inherit",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              },
            }}
          >
            {formattedData}
          </SyntaxHighlighter>
        )}
      </div>
    );
  }

  // Markdown custom renderers

  return (
    <div
      className={`relative group rounded-md  dark:bg-slate-800 text-sm ${className}`}
    >
      {expandView && (
        <ExpandedView
          content={formattedData}
          language={language}
          isStructuredData={isStructuredData}
          className="top-0 right-0"
        />
      )}

      <CopyButton
        text={formattedData}
        className={expandView ? "right-8  top-0" : " top-0 right-0"}
      />
      <div className={className}>
        {search ? (
          <ContentViewerWithSearch
            content={formattedData}
            search={search}
            currentIndex={currentSearchIndex}
            SyntaxHighlighterContent={false}
            // size={size}
          />
        ) : withCitations ? (
          <Markdown citations={sources} size={size}>
            {formattedData}
          </Markdown>
        ) : (
          <Markdown size={size}>{formattedData}</Markdown>
        )}
      </div>
    </div>
  );
};
