import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Markdown } from "@/components/ui/markdown";
import {
  downloadBase64File,
  getIconForFileType,
  getSourceTypeDisplay,
} from "@/helper/assistant-helper/helper";
import { errorMessageHandler } from "@/helper/helper-function";
import { DOWNLOAD_FILES } from "@/lib/assistant-urls";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { Accordion } from "@radix-ui/react-accordion";
import { AnimatePresence, motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ChevronDown, ChevronUp, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { SourceCardFooter } from "./source-card-footer";
import { SourceCardProps } from "./types";

export function CollapsibleSourceCard({
  groupedSource,
  index = 0,
  isOpen = false,
  onToggle,
  isCollapsed,
}: SourceCardProps) {
  const { axiosAuth, loading } = useAxiosAuth();

  const firstSource = groupedSource?.items[0]?.source;

  const iconData = getIconForFileType({
    name: firstSource?.metadata?.file_name || "",
    mime: firstSource?.metadata?.file_extension || "",
  });
  const IconComponent = (
    iconData && Icons[iconData.icon as keyof typeof Icons]
      ? Icons[iconData.icon as keyof typeof Icons]
      : Icons.File
  ) as React.ElementType;

  const citationNumbers = groupedSource?.items?.map(
    (item) => item.citationNumber,
  );
  const isMultiple = groupedSource?.items?.length > 1;

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
      errorMessageHandler(error || "Failed to download file");
    }
  };

  const CardHeader = () => (
    <div className="flex items-start gap-2">
      <div className="mt-1 text-gray-500 shrink-0">
        {groupedSource.source_type === "doc_chunk" ? (
          <IconComponent
            className={`${iconData?.color || "text-gray-500"} h-5 w-5 mr-2`}
          />
        ) : groupedSource.source_type === "web_page" ? (
          <Globe className="h-5 w-5 mr-2" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex gap-3 items-center">
          <p className="text-base font-medium text-gray-800 truncate flex-1 transition-colors group-hover:text-primary">
            {groupedSource.title}
          </p>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {!isMultiple &&
              citationNumbers.map((num) => (
                <span
                  key={num}
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs whitespace-nowrap"
                >
                  {num}
                </span>
              ))}
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs whitespace-nowrap">
              {getSourceTypeDisplay(firstSource)}
            </span>
          </div>
        </div>

        {isMultiple && (
          <p className="text-xs text-gray-400 mt-0.5">
            {groupedSource.items.length} excerpts from this source
          </p>
        )}

        {firstSource.content && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {firstSource.content}
          </p>
        )}
      </div>
    </div>
  );

  const ContentBlocks = () => (
    <>
      {isMultiple ? (
        <Accordion
          type="multiple"
          defaultValue={groupedSource?.items?.map(
            ({ citationNumber }) => `item-${citationNumber}`,
          )}
          className="space-y-4 gap-4 px-4 py-4"
        >
          {groupedSource?.items?.map(({ source, citationNumber }) => (
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
            {groupedSource?.items[0]?.source?.content || ""}
          </Markdown>
        </div>
      )}
    </>
  );
  return (
    <motion.div
      key={groupedSource?.groupKey}
      initial={{ opacity: 0, x: -10 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: { delay: 0.3 + index * 0.05 },
      }}
      className="min-h-[80px] block w-full rounded-lg border border-gray-200 hover:border-primary/40 transition-colors group"
    >
      {!isCollapsed ? (
        <>
          <div className="p-2.5">
            <CardHeader />
          </div>
          <div className="bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <ContentBlocks />
          </div>
          <SourceCardFooter
            source={firstSource}
            handleDownload={handleDownload}
          />
        </>
      ) : (
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <div className="p-2.5 cursor-pointer group transition-colors">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <CardHeader />
                </div>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors ml-2 mt-1 shrink-0"
                  aria-label="Toggle content"
                >
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CollapsibleTrigger>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden rounded-b-lg bg-gray-50 border-t border-gray-200 "
              >
                <ContentBlocks />
              </motion.div>
            )}
          </AnimatePresence>

          <SourceCardFooter
            source={firstSource}
            handleDownload={handleDownload}
          />
        </Collapsible>
      )}
    </motion.div>
  );
}
