import { Globe } from "lucide-react";
import React from "react";
import { CitationBlockProps } from "./types";

export const CitationBlock: React.FC<CitationBlockProps> = ({
  citation,
  onClick,
  IconComponent,
  iconColor = "text-gray-500",
}) => {
  return (
    <div
      className={`flex items-start gap-2 max-w-[250px] group ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick} // Safe even if undefined
    >
      <div className="mt-1 text-gray-500 shrink-0">
        {citation?.source_type === "doc_chunk" && IconComponent ? (
          <IconComponent className={`${iconColor} h-5 w-5`} />
        ) : citation?.source_type === "web_page" ? (
          <Globe className="h-5 w-5" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center">
          <p className="text-sm font-semibold text-gray-800 flex-1 transition-colors group-hover:text-primary line-clamp-2">
            {citation?.title || "Untitled"}
          </p>
        </div>

        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {citation?.content}
        </p>
      </div>
    </div>
  );
};
