import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import HeaderHoverCard from "@/components/header";
import { JumpingLoadingAnimation } from "@/components/JumpingLoadingAnimation";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { errorMessageHandler, getStatusColor } from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { isEqual } from "lodash";
import {
  CheckCircle,
  Clock,
  FishSymbolIcon,
  Loader2,
  Play,
  X,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  event_type: string;
  count: number;
}

interface EmailTimelineSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emailData?: any;
}

export const EmailTimelineSheet = ({
  isOpen,
  onOpenChange,
  emailData,
}: EmailTimelineSheetProps) => {
  const { axiosAuth, loading: authLoading } = useAxiosAuth();

  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previousDataRef = useRef<TimelineEvent[]>([]);
  const firstFetchDoneRef = useRef(false);
  const emailUuid = emailData?.id;
  const isTaskExecuting =
    emailData?.status === "QUEUED" || emailData?.status === "EXECUTING";

  useEffect(() => {
    if (isOpen && emailUuid) {
      fetchTaskEvents(true);

      if (isTaskExecuting) {
        const intervalId = setInterval(() => {
          fetchTaskEvents();
        }, 5000);
        return () => clearInterval(intervalId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, emailUuid, isTaskExecuting]);

  const fetchTaskEvents = async (isInitial: boolean = false) => {
    if (!emailUuid) return;
    if (isInitial || !firstFetchDoneRef.current) {
      setLoading(true);
    }
    // setLoading(true);
    setError(null);
    try {
      const result = await axiosAuth.get(`/emails/${emailUuid}/task-events`);

      if (result?.status === 200) {
        const data = result?.data || [];

        const transformedData: TimelineEvent[] = data.map((event: any) => ({
          id: event.id,
          title: event.name,
          description: event.description,
          timestamp: event.created_at,
          event_type: event.event_type,
          count: event.count,
        }));
        if (!isEqual(previousDataRef.current, transformedData)) {
          setTimelineData((prevData) => {
            if (!prevData || prevData.length === 0) {
              previousDataRef.current = transformedData;
              return transformedData;
            }

            // update only changed events
            const updatedData = prevData.map((prevItem) => {
              const newItem = transformedData.find((d) => d.id === prevItem.id);
              if (newItem && !isEqual(prevItem, newItem)) {
                return newItem;
              }
              return prevItem;
            });

            // add new items (if any)
            const newItems = transformedData.filter(
              (item) => !prevData.some((p) => p.id === item.id),
            );

            const merged = [...updatedData, ...newItems];

            previousDataRef.current = merged;
            return merged;
          });
        }
      }
      firstFetchDoneRef.current = true;
    } catch (err) {
      console.error("Error fetching task events:", err);
      errorMessageHandler(err);
      setError("Failed to load task events");
    } finally {
      if (isInitial || !firstFetchDoneRef.current) {
        setLoading(false);
      }
    }
  };

  const getEventTypeBorderleft = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-300 dark:border-l-green-400";
      case "queued":
        return "border-l-yellow-300 dark:border-l-yellow-400";
      case "execution":
        return "border-l-blue-300 dark:border-l-blue-400";
      case "failure":
        return "border-l-red-300 dark:border-l-red-400";
      default:
        return "border-l-gray-300 dark:border-l-gray-700";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <div className="border-green-300 dark:border-green-400 bg-green-100 mt-1 min-w-8 rounded-full border items-center justify-center w-8 h-8 flex ">
            <CheckCircle className="text-green-500 w-4 h-4" />
          </div>
        );
      case "queued":
        return (
          <div className="border-yellow-300 dark:border-yellow-400 bg-yellow-100 mt-1 min-w-8 rounded-full border items-center justify-center w-8 h-8 flex">
            <Clock className="text-yellow-500 w-4 h-4" />
          </div>
        );
      case "execution":
        return (
          <div className="border-blue-300 dark:border-blue-400 bg-blue-100 mt-1 min-w-8 rounded-full border items-center justify-center w-8 h-8 flex">
            <Play className="text-blue-500 w-4 h-4" />
          </div>
        );
      case "failure":
        return (
          <div className="border-red-300 dark:border-red-400 bg-red-100 mt-1 min-w-8 rounded-full border items-center justify-center w-8 h-8 flex">
            <XCircle className="text-red-500 w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="border-gray-300 dark:border-gray-700 bg-gray-100 mt-1 min-w-8 rounded-full border items-center justify-center w-8 h-8 flex">
            <FishSymbolIcon className="text-gray-500 w-4 h-4" />
          </div>
        );
    }
  };

  const isTooltipRequired = (text: string) => text?.length > 30;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full max-w-xl gap-0 sm:max-w-2xl p-0 overflow-auto">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-white dark:bg-black">
          <div className="w-full flex justify-start items-center space-x-2 divide-x">
            <SheetTitle className="sr-only">{"Email Events"}</SheetTitle>
            <HeaderHoverCard
              title={"Email Events"}
              message="View the complete timeline and history of all events related to this email thread"
              type="sheet"
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`${getStatusColor(
                emailData?.status,
              )}  h-8 text-sm px-3 py-1 flex items-center gap-1 font-normal`}
            >
              {isTaskExecuting && (
                <JumpingLoadingAnimation
                  color={
                    emailData?.status === "QUEUED"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }
                />
              )}
              <span className="leading-none p-1">{emailData?.status}</span>
            </Badge>

            <SheetClose asChild>
              <div
                className="bg-gray-100 dark:bg-gray-900 p-1.5 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </div>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="grow overflow-y-auto p-6">
          {authLoading || loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-2">Error loading events</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {error}
                </p>
                <button
                  onClick={() => fetchTaskEvents(true)}
                  className="mt-4 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : timelineData.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md p-8">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Timeline Events Yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Events and activities related to this email will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 relative">
              {timelineData.map((event, index) => (
                <div key={event.id} className="relative flex gap-4 items-start">
                  {/* Vertical line */}
                  {index > 0 && (
                    <div
                      className="absolute left-[7px] w-0.5 bg-gray-400 dark:bg-gray-600"
                      style={{
                        top: 0,
                        height: "24px",
                      }}
                    ></div>
                  )}
                  {index < timelineData.length - 1 && (
                    <div
                      className="absolute left-[7px] w-0.5 bg-gray-400 dark:bg-gray-600"
                      style={{
                        top: "25px",
                        height: "calc(100% - 8px)",
                      }}
                    ></div>
                  )}

                  {/* Black circle */}
                  <div className="shrink-0 pt-6">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground dark:bg-white relative z-10"></div>
                  </div>

                  {/* Content */}
                  <div className="grow pb-2">
                    <div
                      className={`bg-white dark:bg-black p-3 rounded-lg border border-l-4 ${getEventTypeBorderleft(
                        event.event_type,
                      )}`}
                    >
                      <div className="flex gap-3 items-start w-full">
                        <div className="flex gap-3 item-start h-auto w-full">
                          {event?.event_type && getIcon(event.event_type)}
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex w-full items-center">
                              <div className="flex gap-2 w-full">
                                <ConditionalTooltip
                                  content={event.title}
                                  align="center"
                                  side="top"
                                  showArrow={true}
                                >
                                  <h3 className="truncate max-w-[350px] w-fit truncate font-semibold text-base text-foreground/90">
                                    {event.title}
                                  </h3>
                                </ConditionalTooltip>

                                {event.count != null && event.count !== 1 && (
                                  <Badge variant="secondary">
                                    {event.count}
                                  </Badge>
                                )}
                              </div>
                              <div className="min-w-fit ml-auto text-xs text-muted-foreground">
                                {moment
                                  .utc(event.timestamp)
                                  .local()
                                  .format("MMM DD, YYYY hh:mm A")}
                              </div>
                            </div>
                            {event?.description && (
                              <p className="text-sm text-foreground/80">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Current step - not used now */}
              {/* <div className="relative flex gap-4 items-start">
               
                <div className="absolute left-[6px] top-0 h-8 w-0.5 bg-gray-400 dark:bg-gray-600"></div>

                
                <div className="flex-shrink-0 pt-8">
                  <div className="relative w-4 h-4 rounded-full bg-black dark:bg-white z-10">
                   
                    <span className="absolute inline-flex h-full w-full rounded-full bg-gray-500 dark:bg-gray-400 opacity-75 animate-ping"></span>
                    <span
                      className="absolute inline-flex h-full w-full rounded-full bg-gray-500 dark:bg-gray-400 opacity-75 animate-ping"
                      style={{ animationDelay: "1s" }}
                    ></span>
                  </div>
                </div>

                
                <div className="flex-grow pb-2">
                  <div className="bg-white dark:bg-black rounded-lg border-2 border-black dark:border-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-black dark:text-white">
                        Awaiting Response
                      </h3>
                      <span className="text-xs px-2 py-1 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium">
                        Ongoing
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Waiting for the client's next response or action on this
                      email thread.
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EmailTimelineSheet;
