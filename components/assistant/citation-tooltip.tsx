import { SourceDocument } from "@/app/assistant/chat/_components/types";
import { getIconForFileType } from "@/helper/assistant-helper/helper";
import * as Icons from "lucide-react";
import Link from "next/link";
import ConditionalTooltip from "../conditional-tooltip-renderer";
import { CitationBlock } from "./citation-block";
import { CitationTooltipProps } from "./types";

export const CitationTooltip = ({
  citations,
  number,
  extraNumbers,
}: CitationTooltipProps) => {
  // --- "More" Mode ---
  if (extraNumbers && extraNumbers.length > 0) {
    const resolvedCitations = extraNumbers
      .map((num) =>
        Array.isArray(citations) ? citations[parseInt(num) - 1] : undefined,
      )
      .filter((c): c is SourceDocument => !!c);

    if (resolvedCitations.length === 0) return null;

    return (
      <ConditionalTooltip
        content={
          <div className="flex flex-col gap-1">
            {resolvedCitations.map((citation, idx) => {
              const iconData = getIconForFileType(
                citation?.metadata?.file_extension || "",
              );
              const IconComponent = (
                iconData && Icons[iconData.icon as keyof typeof Icons]
                  ? Icons[iconData.icon as keyof typeof Icons]
                  : Icons.File
              ) as React.ElementType;

              const isMore = resolvedCitations.length > 1;
              return (
                <div
                  className={`${
                    isMore ? "border border-gray-200 p-2 mb-2 rounded-md" : ""
                  }`}
                  key={idx}
                >
                  {citation?.source_type === "doc_chunk" ? (
                    <CitationBlock
                      citation={citation}
                      IconComponent={IconComponent}
                      iconColor={iconData?.color}
                    />
                  ) : (
                    <Link
                      href={`${citation?.url}`}
                      target="_blank"
                      className="group"
                    >
                      <CitationBlock
                        citation={citation}
                        IconComponent={IconComponent}
                        iconColor={iconData?.color}
                      />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        }
        alwaysShow={true}
        align="center"
        className="rounded-md bg-white p-3 text-black border max-w-sm max-h-64 overflow-y-auto no-arrow "
        side="top"
        sideOffset={8}
      >
        <span className="mx-1 px-1.5 py-0.5 bg-gray-400 text-white rounded text-xs whitespace-nowrap">
          {`+${resolvedCitations?.length}`}
        </span>
      </ConditionalTooltip>
    );
  }

  // --- Normal Citation Mode ---
  let citation: SourceDocument | undefined;
  if (Array.isArray(citations)) {
    citation = citations[parseInt(number) - 1];
  }
  if (!citation) return null;

  const iconData = getIconForFileType({
    name: citation?.metadata?.file_name,
    mime: citation?.metadata?.file_extension,
  });
  const IconComponent = (
    iconData && Icons[iconData.icon as keyof typeof Icons]
      ? Icons[iconData.icon as keyof typeof Icons]
      : Icons.File
  ) as React.ElementType;

  return (
    <ConditionalTooltip
      content={
        citation?.source_type === "doc_chunk" ? (
          <CitationBlock
            citation={citation}
            IconComponent={IconComponent}
            iconColor={iconData?.color}
          />
        ) : (
          <Link href={`${citation?.url}`} target="_blank" className="group">
            <CitationBlock
              citation={citation}
              IconComponent={IconComponent}
              iconColor={iconData?.color}
            />
          </Link>
        )
      }
      alwaysShow={true}
      align="center"
      className="flex items-center gap-1 rounded-md bg-white p-3 text-black border max-w-sm no-arrow"
      sideOffset={8}
    >
      <span className="mx-1 px-1.5 py-0.5 bg-gray-400 text-white rounded text-xs whitespace-nowrap cursor-pointer">
        {number}
      </span>
    </ConditionalTooltip>
  );
};
