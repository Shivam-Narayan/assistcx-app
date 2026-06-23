"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import {
  downloadBase64File,
  getIconForFileType,
  getSourceTypeDisplay,
} from "@/helper/assistant-helper/helper";
import { DOWNLOAD_FILES } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import * as Icons from "lucide-react";
import { Globe, X } from "lucide-react";
import { FC } from "react";
import toast from "react-hot-toast";
import { SourceCardFooter } from "./source-card-footer";
import { SourceCardPopupProps } from "./types";
export const SourceCardPopup: FC<SourceCardPopupProps> = ({
  groupedSource,
  setOpen,
}) => {
  const { axiosAuth, loading } = useAxiosAuth();

  const firstSource = groupedSource.items[0].source;

  const iconData = getIconForFileType({
    name: firstSource?.metadata?.file_name || "",
    mime: firstSource?.metadata?.file_extension || "",
  });
  const IconComponent = (
    iconData && Icons[iconData.icon as keyof typeof Icons]
      ? Icons[iconData.icon as keyof typeof Icons]
      : Icons.File
  ) as React.ElementType;

  const handleDownload = async () => {
    if (loading) return;
    try {
      const response = await axiosAuth.get(
        `${DOWNLOAD_FILES}/${firstSource?.metadata?.file_uuid}/download`,
      );
      const { file_name, mime_type, content } = response.data;
      if (!content || !file_name || !mime_type) {
        toast.error("Missing file data");
        return;
      }
      const success = downloadBase64File(content, file_name, mime_type);
      if (success) toast.success("File downloaded successfully");
      else toast.error("Failed to process file download");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const isMultiple = groupedSource.items.length > 1;

  return (
    <>
      <div className="p-4 transition-colors">
        <div className="flex items-start gap-2">
          <div className="mt-1 text-gray-500 flex-shrink-0">
            {groupedSource.source_type === "doc_chunk" ? (
              <IconComponent
                className={`${iconData?.color || "text-gray-500"} h-5 w-5`}
              />
            ) : groupedSource.source_type === "web_page" ? (
              <Globe className="h-5 w-5" />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex gap-3 items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium text-gray-800">
                  {groupedSource.title}
                  <span className="px-1.5 py-0.5 bg-gray-100 mx-3 text-gray-500 rounded text-sm whitespace-nowrap">
                    {getSourceTypeDisplay(firstSource)}
                  </span>
                </p>
                {isMultiple && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {groupedSource.items.length} excerpts from this source
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                }}
                className="h-8 w-8 p-0 cursor-pointer focus-visible:ring-[0px]"
                aria-label="close"
                autoFocus={false}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border-t border-gray-200 max-h-[50vh] overflow-y-auto rounded-b-lg">
        {isMultiple ? (
          <Accordion
            type="multiple"
            defaultValue={groupedSource.items.map(
              ({ citationNumber }) => `item-${citationNumber}`,
            )}
            className="space-y-4 gap-4 px-4 py-4"
          >
            {groupedSource.items.map(({ source, citationNumber }) => (
              <AccordionItem
                key={citationNumber}
                value={`item-${citationNumber}`}
                className="!border !border-gray-200 rounded-md bg-white px-0"
              >
                <AccordionTrigger className="hover:no-underline px-2 py-2 cursor-pointer">
                  <div className="flex items-center gap-3 text-left w-full">
                    <span
                      className="
                  inline-flex items-center justify-center
                  h-6 w-6 text-sm font-semibold
                  text-gray-700 bg-gray-100
                  border rounded shrink-0
                "
                    >
                      {citationNumber}
                    </span>

                    <div className="text-sm font-semibold text-foreground line-clamp-1">
                      {(source?.content || "").slice(0, 140)}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-3 py-2 text-gray-700">
                  <Markdown
                    className="max-w-none break-normal whitespace-normal"
                    size="sm"
                  >
                    {source?.content || ""}
                  </Markdown>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="px-4 py-3 text-gray-700">
            <Markdown
              className="prose prose-sm max-w-none break-normal whitespace-normal"
              size="sm"
            >
              {groupedSource.items[0]?.source?.content || ""}
            </Markdown>
          </div>
        )}
      </div>
      <SourceCardFooter
        source={firstSource}
        handleDownload={handleDownload}
        className="p-4"
      />
    </>
  );
};
