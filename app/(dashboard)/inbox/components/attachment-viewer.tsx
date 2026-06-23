import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import TabComponent from "@/components/data-tabs";
import { JumpingLoadingAnimation } from "@/components/JumpingLoadingAnimation";
import Loader from "@/components/loader";
import PdfViewer from "@/components/pdfviewer";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  downloadBase64File,
  errorMessageHandler,
  successMessageHandler,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import { extractFieldsFromStructuredData } from "@/helper/invoice-formatting-helper";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleDataTemplateEvents } from "@/redux/settings/data-template/data-template-events-slice";
import { handleDataTemplate } from "@/redux/settings/data-template/data-template-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { IAttachmentDetails } from "@/types/types";
import { Download, Loader2, Repeat, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AddEditDataTemplate } from "../../settings/data-template/add-edit-data-template";
import { ReprocessAttachmentModal } from "./reprocess-attachment-modal";

interface AgentTemplateProps {
  openAttachmentSheet: boolean;
  closeAttachmentDetailsEvent: () => void;
  attachment: IAttachmentDetails | null;
  index?: number;
}

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
interface IFileAttachment {
  file_name: string | null;
  date_time: string | null;
}

const FILE_TYEP_CHECK = {
  pdf: "pdf",
  PDF: "PDF",
};

export function AttachmentViewer({
  openAttachmentSheet,
  closeAttachmentDetailsEvent,
  attachment,
}: AgentTemplateProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { axiosAuth, loading } = useAxiosAuth();
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [attachmentContent, setAttachmentContent] = useState<string | null>(
    null,
  );
  const [extractedJson, setExtractedJson] = useState<any>(null);
  const [fileDetails, setFileDetails] = useState<IFileAttachment | null>(null);
  const [loader, setLoader] = useState<boolean>(false);
  const [hoveredField, setHoveredField] = useState<DocumentField | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [documentData, setDocumentData] = useState<any>(null);
  const [samplePages, setSamplePages] = useState<any[] | null>(null);
  const [templateClass, setTemplateClass] = useState<string | null>(null);
  const [attachmentsDetails, setAttachmentsDetails] = useState<any | null>(
    null,
  );
  const [openReprocessAttachmentModal, setOpenReprocessAttachmentModal] =
    useState<boolean>(false);
  const [isReprocessing, setIsReprocessing] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const pollingRef = useRef(false);
  const attemptRef = useRef(1);
  const prevIsPollingRef = useRef(false);
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const isCreateUpdateDataTemplate = canEdit(permissions, "data_templates");
  const canEditTask = canEdit(permissions, "task_inbox");

  const setSheetAttachmentOpenHandler = () => {
    setFileDetails(null);
    setHoveredField(null);
    setDocumentData(null);
    setSamplePages(null);
    setTemplateClass(null);
    closeAttachmentDetailsEvent();
  };

  //==============[Function::: Download attachment file with signed url]================================///
  const downloadAttachment = async () => {
    let viewEmailUUID: any = attachment?.id;
    if (!loading && viewEmailUUID && viewEmailUUID != null) {
      let API_ENDPOINT_PATH =
        url.DOWNLOAD_MAILBOX_ATTACHMENT + `/${viewEmailUUID}/download`;
      try {
        const result = await axiosAuth.get(API_ENDPOINT_PATH);
        if (result?.status === 200) {
          if (
            result.data.content &&
            result.data.content != null &&
            result.data.content != ""
          ) {
            downloadBase64File(
              result.data.content,
              result.data.file_name,
              result.data.mime_type,
            );

            successMessageHandler(
              messages.mailbox_attachment_downloaded_successfully,
            );
          }
        } else {
          errorMessageHandler(result);
          return;
        }
      } catch (error: any) {
        console.error(error);
        errorMessageHandler(error);
      }
    }
  };

  //==============[Function::: GET attachment file Details with signed url]================================///
  const getAttachmentDetails = async (fileUUID: any) => {
    let viewFileUUID: any = fileUUID;
    if (!loading && viewFileUUID && viewFileUUID != null) {
      let API_ENDPOINT_PATH = url.DOWNLOAD_ATTACHMENT + `/${viewFileUUID}`;
      try {
        if (!isPolling && !isReprocessing) setLoader(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH);
        if (result?.status === 200) {
          if (result.data) {
            const isReprocessing =
              result.data?.attachment_metadata?.is_reprocessing;
            if (isReprocessing) {
              setIsPolling(true);
            } else {
              if (prevIsPollingRef.current === true) {
                toast.success("Attachment reprocessed.");
              }
              setIsPolling(false);
            }
            prevIsPollingRef.current = isReprocessing;
            setAttachmentContent(
              result["data"]["content"] && result["data"]["content"].length != 0
                ? result.data["content"][0]
                : [],
            );
            if (
              result["data"]["structured_output"] &&
              result["data"]["structured_output"].length != 0
            ) {
              const formattedStructuredOutput = extractFieldsFromStructuredData(
                result["data"]["structured_output"],
              );
              setDocumentData(formattedStructuredOutput);
              setExtractedJson(result["data"]["structured_output"]);
              setTemplateClass(result["data"]["template_class"]);
            } else {
              setDocumentData(null);
              setExtractedJson(null);
              setTemplateClass(null);
            }
            setLoader(false);
          }
        } else {
          setLoader(false);
          errorMessageHandler(result);
          return;
        }
      } catch (error: any) {
        setLoader(false);
        console.error(error);
        errorMessageHandler(error);
      } finally {
        if (!isPolling && !isReprocessing) setLoader(false);
      }
    }
  };

  //==============[Function::: GET attachment images for PDF renderer (Streaming API)]================================///
  const getAttachmentImages = async (fileUUID: any) => {
    let viewFileUUID: any = fileUUID;
    if (!loading && viewFileUUID && viewFileUUID != null) {
      let API_ENDPOINT_PATH =
        url.DOWNLOAD_ATTACHMENT + `/${viewFileUUID}/view-images`;

      try {
        setLoader(true);
        setSamplePages([]);

        const response = await axiosAuth.get(API_ENDPOINT_PATH, {
          responseType: "stream",
          adapter: "fetch",
          headers: {
            Accept: "text/event-stream",
          },
        });

        if (response.status !== 200) {
          setSamplePages(null);
          throw new Error(`HTTP Error ${response.status}`);
        }

        const reader = response.data
          .pipeThrough(new TextDecoderStream())
          .getReader();

        let buffer = "";
        const processedPages = new Set(); // Track pages already added

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          buffer += value;

          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            if (!chunk.trim()) continue;

            const lines = chunk.split("\n");
            let dataContent = "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                dataContent = line.slice(6).trim();
                break;
              }
            }

            if (!dataContent) continue;

            // DONE signal
            if (dataContent === "[DONE]" || dataContent === "DONE") {
              setLoader(false);
              return;
            }

            try {
              const parsed = JSON.parse(dataContent);

              if (
                parsed.page_number !== undefined &&
                parsed.image &&
                typeof parsed.image === "string" &&
                parsed.image.length > 0
              ) {
                // Skip if already processed
                if (processedPages.has(parsed.page_number)) {
                  continue;
                }

                // Clean the base64 string
                let base64Image = parsed.image.trim();

                if (base64Image.startsWith("data:")) {
                  // Remove prefix
                  base64Image = base64Image.split(",")[1] || base64Image;
                }

                // Mark as processed
                processedPages.add(parsed.page_number);

                // update state with new image
                setSamplePages((prevPages) => {
                  const newPages = [...(prevPages || [])];
                  // Insert at correct position in array
                  const index = parsed.page_number - 1;
                  newPages[index] = base64Image;
                  return newPages;
                });
              }
            } catch (err) {
              console.warn("Failed to parse chunk:", err);
            }
          }
        }
      } catch (error: any) {
        console.error("Error in image stream:", error);
        setSamplePages(null);
        errorMessageHandler(error);
      } finally {
        setLoader(false);
      }
    }
  };

  const openTemplateViewDialog = async (templateClass: string | null) => {
    if (!loading) {
      if (templateClass) {
        setTemplateClass(templateClass);
        try {
          const result = await axiosAuth.get(
            `${url.LIST_DATA_TEMPLATE}/${templateClass}`,
          );
          if (result?.status === 200) {
            if (
              result?.data?.data_templates &&
              result?.data?.data_templates?.length != 0
            ) {
              dispatch(handleSheetEvents(true));
              dispatch(handleDataTemplateEvents("viewDataTemplate"));
              dispatch(handleDataTemplate(result?.data?.data_templates[0]));
            }
          } else {
            console.log("error");
          }
        } catch (error: any) {
          console.error(error);
        }
      }
    }
  };

  useEffect(() => {
    if (openAttachmentSheet) {
      if (attachment && Object.keys(attachment).length != 0) {
        setFileDetails(null);
        setFileDetails({
          file_name: attachment?.file_name,
          date_time: attachment?.created_at,
        });

        // fetch attachment image
        if (
          attachment?.file_type === FILE_TYEP_CHECK?.pdf ||
          attachment?.file_type === FILE_TYEP_CHECK?.PDF
        ) {
          getAttachmentImages(attachment?.id);
        }

        // fetch attachment details
        getAttachmentDetails(attachment?.id);

        setAttachmentsDetails(attachment);
      }
    }
    setSheetOpen(openAttachmentSheet);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAttachmentSheet, loading, attachment]);

  useEffect(() => {
    let timer: any;
    if (!attachment?.id) return;
    // Avoid multiple polling loops running simultaneously
    if (pollingRef.current) {
      return;
    }
    pollingRef.current = true;

    // Polling function start
    const executePoll = () => {
      const attempt = attemptRef.current;
      // Call API to get updated attachment status (reprocessing completed or not)
      getAttachmentDetails(attachment?.id);

      let delay;
      // First 5 attempts → 5 seconds delay
      if (attempt <= 5) {
        delay = 5000;
      } else {
        // After 5th attempt, delay increases gradually
        const extraGroups = Math.floor((attempt - 6) / 2) + 1;
        delay = 5000 + extraGroups * 2000;
      }
      // Increment attempt count
      attemptRef.current += 1;
      // Schedule next polling call based on delay
      timer = setTimeout(executePoll, delay);
    };
    // Start polling only when reprocessing is running or polling state is true
    if (isPolling || isReprocessing) executePoll();

    return () => {
      clearTimeout(timer);
      pollingRef.current = false;
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPolling, isReprocessing, attachment?.id]);

  useEffect(() => {
    if (!isPolling && !isReprocessing) {
      attemptRef.current = 1;
    }
  }, [isPolling, isReprocessing]);

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetAttachmentOpenHandler}>
        <SheetContent
          onCloseAutoFocus={setSheetAttachmentOpenHandler}
          className={`p-0 bg-white overflow-hidden ${
            attachmentsDetails &&
            (attachmentsDetails?.file_type === FILE_TYEP_CHECK?.pdf ||
              attachmentsDetails?.file_type === FILE_TYEP_CHECK?.PDF)
              ? "w-full max-w-full sm:max-w-full"
              : "w-4xl max-w-4xl sm:max-w-4xl"
          }`}
        >
          <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 space-x-2 bg-white">
            <div
              className="w-full flex justify-start items-center space-x-2 divide-x"
              onClick={setSheetAttachmentOpenHandler}
            >
              <div>
                <SheetTitle className="px-2 text-lg font-medium">
                  {fileDetails?.file_name}
                </SheetTitle>
                <p className="px-2 text-sm text-muted-foreground">
                  Received: {UTCToLocalTimezon(fileDetails?.date_time)}
                </p>
              </div>
            </div>
            <>
              {loader == false && templateClass && (
                <div className="p-2 rounded-md">
                  <span
                    onClick={() => openTemplateViewDialog(templateClass)}
                    className="inline-flex items-center px-3 py-1.5 text-sm leading-4 font-medium 
               rounded-lg text-white bg-primary hover:bg-primary/90 
               transition duration-200 ease-in-out max-w-xs truncate cursor-pointer"
                  >
                    {templateClass}
                  </span>
                </div>
              )}
              {loader == false &&
                canEditTask &&
                (isReprocessing || isPolling ? (
                  <Badge
                    variant="outline"
                    className={` bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700/20 dark:text-blue-400 h-8 text-sm px-3 py-1 flex items-center gap-1 font-normal`}
                  >
                    <JumpingLoadingAnimation color={"bg-blue-500"} />
                    <span className="leading-none p-1">Reprocessing</span>
                  </Badge>
                ) : (
                  <ConditionalTooltip
                    content={isReprocessing ? "Reprocessing..." : "Reprocess"}
                    alwaysShow={true}
                    align="center"
                    showArrow={true}
                    side="bottom"
                  >
                    <div
                      className={`p-2 rounded-md hover:bg-secondary transition ${
                        isReprocessing
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer "
                      }`}
                      onClick={() => {
                        setOpenReprocessAttachmentModal(true);
                      }}
                    >
                      {isReprocessing ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      ) : (
                        <Repeat className="h-5 w-5 text-slate-700" />
                      )}
                    </div>
                  </ConditionalTooltip>
                ))}
              {loader == false && (
                <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
                  <Download className="h-5 w-5" onClick={downloadAttachment} />
                </div>
              )}
              <SheetClose asChild>
                <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
                  <X className="h-5 w-5" />
                </div>
              </SheetClose>
            </>
          </SheetHeader>

          {loader == true ? (
            <div className="">
              <div className="flex flex-col items-center justify-center h-screen">
                <Loader className="h-full" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-1 md:grid-cols-7 lg:grid-cols-7 h-screen">
                {attachmentsDetails &&
                  (attachmentsDetails?.file_type === FILE_TYEP_CHECK?.pdf ||
                    attachmentsDetails?.file_type === FILE_TYEP_CHECK?.PDF) && (
                    <div className="md:col-span-4 lg:col-span-4 border-r border-r-inherit rounded-none border">
                      <PdfViewer
                        pages={samplePages}
                        hoveredField={hoveredField}
                        onSelectedPageIndex={setSelectedPageIndex}
                      />
                    </div>
                  )}

                <div
                  className={`rounded-none border overflow-hidden ${
                    attachmentsDetails &&
                    (attachmentsDetails?.file_type === FILE_TYEP_CHECK?.pdf ||
                      attachmentsDetails?.file_type === FILE_TYEP_CHECK?.PDF)
                      ? "md:col-span-3 lg:col-span-3"
                      : "md:col-span-7 lg:col-span-7"
                  }`}
                >
                  <TabComponent
                    documentData={documentData}
                    onHover={setHoveredField}
                    attachmentContent={attachmentContent}
                    extractedJson={extractedJson}
                    selectedPageIndex={selectedPageIndex}
                    // ocrJsonData={ocrJsonData}
                  />
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      {templateClass && (
        <AddEditDataTemplate
          loadTableData={() => {}}
          isCreateUpdateDataTemplate={isCreateUpdateDataTemplate}
        />
      )}

      <ReprocessAttachmentModal
        open={openReprocessAttachmentModal}
        onOpenChange={setOpenReprocessAttachmentModal}
        attachmentId={attachment?.id || ""}
        setIsReprocessing={setIsReprocessing}
      />
    </>
  );
}
