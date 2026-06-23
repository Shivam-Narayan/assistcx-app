import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  renderSyntaxHighlight,
  useCopyToClipboard,
} from "@/helper/helper-function";
import { CopyIcon, Loader, Loader2 } from "lucide-react";
import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const ExtractedDataCard = lazy(() => import("./extracted-data-card"));

interface Geometry {
  [0]: number;
  [1]: number;
}

interface DocumentField {
  data_field: string;
  data_value: string;
  original_text: string;
  geometry: Geometry[][];
  page_idx: number | null;
}

interface TabComponentProps {
  documentData: Record<string, DocumentField> | null;
  onHover: (field: DocumentField | null) => void;
  attachmentContent: string | null;
  extractedJson: any | null;
  selectedPageIndex: number;
}

const TabComponent: React.FC<TabComponentProps> = ({
  documentData,
  onHover,
  attachmentContent,
  extractedJson,
  selectedPageIndex,
}) => {
  const [activeTab, setActiveTab] = useState<string>("ExtractedData");
  const [cleanedExtractedJson, setCleanedExtractedJson] = useState<any>(null);
  const [expandedRecordIndex, setExpandedRecordIndex] = useState<number | null>(
    0
  );
  const [, copyRawContent] = useCopyToClipboard(1000);

  const handleCopyRawContent = async () => {
    if (!attachmentContent) return;
    try {
      await copyRawContent(attachmentContent);
      toast.success("Copied to Clipboard", {
        duration: 1000,
        position: "top-center",
      });
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  };

  const cleanValue = useCallback((value: string): string => {
    return value.replace(/<<[\s\S]*?>>/g, "").trim();
  }, []);

  const cleanData = useCallback(
    (data: any): any => {
      if (typeof data === "string") {
        return cleanValue(data);
      }
      if (Array.isArray(data)) {
        return data.map((item) => cleanData(item));
      }
      if (typeof data === "object" && data !== null) {
        const cleanedObj: { [key: string]: any } = {};
        for (const [key, value] of Object.entries(data)) {
          // Filter out meta fields during cleaning
          if (key !== "meta__fields" && key !== "meta__document") {
            cleanedObj[key] = cleanData(value);
          }
        }
        return cleanedObj;
      }
      return data;
    },
    [cleanValue]
  );

  useEffect(() => {
    if (extractedJson) {
      const cleaned = cleanData(extractedJson);
      setCleanedExtractedJson(cleaned);
    }
  }, [extractedJson, cleanData]);

  const handleRecordToggle = (index: number | null) => {
    setExpandedRecordIndex(index);
  };

  const formatValueView = (value: string) => {
    if (typeof value === "string") {
      return (
        <div className="min-w-max inline-block">
          <pre className="whitespace-pre-wrap p-4 font-mono text-xs rounded max-w-7xl break-words">
            {value}
          </pre>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-0 flex flex-col h-[calc(100vh-5.5rem)]">
      <div className="px-4 py-4">
        <div className="flex p-1 space-x-1 bg-border rounded-xl cursor-pointer">
          <button
            className={`w-full py-1  xl:py-2.5 leading-5 rounded-lg cursor-pointer text-gray-800 xl:text-base text-sm font-semibold ${
              activeTab === "ExtractedData"
                ? "bg-white shadow-sm cursor-pointer"
                : "cursor-pointer"
            }`}
            onClick={() => setActiveTab("ExtractedData")}
          >
            Extracted Fields
          </button>
          <button
            className={`w-full py-1  xl:py-2.5 leading-5 rounded-lg cursor-pointer text-gray-800 xl:text-base text-sm font-semibold ${
              activeTab === "ExtractedJson"
                ? "bg-white shadow-sm cursor-pointer"
                : "cursor-pointer"
            }`}
            onClick={() => setActiveTab("ExtractedJson")}
          >
            Combined Data
          </button>
          <button
            className={`w-full py-1  xl:py-2.5 leading-5 rounded-lg cursor-pointer text-gray-800 xl:text-base text-sm font-semibold ${
              activeTab === "RawContent"
                ? "bg-white shadow-sm cursor-pointer"
                : "cursor-pointer"
            }`}
            onClick={() => setActiveTab("RawContent")}
          >
            Raw Content
          </button>
        </div>
      </div>
      <div className="px-4 flex-1 overflow-hidden">
        {activeTab === "ExtractedData" && (
          <Suspense
            fallback={
              <main className="flex flex-1 items-center justify-center">
                <Loader className="h-10 w-10 animate-spin text-primary" />
              </main>
            }
          >
            <div className="h-full overflow-y-auto space-y-4">
              {documentData ? (
                Array.isArray(documentData) ? (
                  documentData.map((field, index) => (
                    <ExtractedDataCard
                      key={`field-${index}`}
                      title={field.data_field || `Record ${index + 1}`}
                      data={field}
                      onHover={onHover}
                      isParentRecord={!field.data_field}
                      recordIndex={index}
                      expandedRecordIndex={expandedRecordIndex}
                      onRecordToggle={handleRecordToggle}
                    />
                  ))
                ) : (
                  Object.entries(documentData)
                    .filter(
                      ([key]) =>
                        key !== "meta__fields" && key !== "meta__document"
                    )
                    .map(([key, field]) => (
                      <ExtractedDataCard
                        key={key}
                        title={key}
                        data={field}
                        onHover={onHover}
                      />
                    ))
                )
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span>No extracted data found</span>
                </div>
              )}
            </div>
          </Suspense>
        )}

        {activeTab === "ExtractedJson" && (
          <div className="h-full overflow-y-auto">
            {cleanedExtractedJson ? (
              Array.isArray(cleanedExtractedJson) ? (
                <div className="space-y-4">
                  {cleanedExtractedJson.map((item, index) => (
                    <Card
                      key={`json-${index}`}
                      className="shadow-none border p-0 gap-0"
                    >
                      <CardHeader className="border-b gap-0 px-4 rounded-t-xl !py-2 bg-gray-50">
                        <div className="font-semibold">Record {index + 1}</div>
                      </CardHeader>
                      <CardContent className="px-4 py-4 flex text-sm flex-col">
                        {renderSyntaxHighlight(item)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-none border-none p-0 gap-0">
                  <CardContent className="px-4 !py-4 flex text-sm flex-col divide-y divide-dashed">
                    {renderSyntaxHighlight(cleanedExtractedJson)}
                  </CardContent>
                </Card>
              )
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span>No extracted json data found</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "RawContent" && (
          <div className="h-full flex flex-col">
            <div className="flex-1 relative group">
              {attachmentContent && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <button
                    type="button"
                    aria-label="Copy raw content"
                    onClick={handleCopyRawContent}
                    className="rounded-lg border-0 bg-transparent p-0"
                  >
                    <CopyIcon className="cursor-pointer h-8 w-8 p-2 rounded-lg bg-white shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted" />
                  </button>
                </div>
              )}
              <div className="absolute border rounded-lg inset-0 overflow-y-scroll overflow-x-auto">
                {attachmentContent ? (
                  <div className="h-full">
                    <Card className="shadow-none border-none inline-block min-w-full p-0 gap-0">
                      <CardContent className="p-0">
                        {formatValueView(attachmentContent)}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span>No raw data found</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabComponent;
