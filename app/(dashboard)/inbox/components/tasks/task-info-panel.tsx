"use client";

import { CollapsibleContent as ExpandableContent } from "@/components/collapsible-content";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CopyToClipboard from "@/components/copy-to-clipboard";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { SmartContentViewer } from "@/components/smart-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  getAttachmentIcon,
  getSortedTags,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import { formatFileSize } from "@/lib/utils";
import type { IAgentDetails, IAttachmentDetails } from "@/types/types";
import {
  AlertCircle,
  Bolt,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Loader2Icon,
  Play,
  Plus,
  Shield,
  X,
} from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTagsSelect } from "../../hooks/useTagsSelect";
import { AttachmentViewer } from "../attachment-viewer";
const TagSelectorComponent = lazy(
  () => import("@/components/tag-selector-combobox"),
);

interface TaskInfoPanelProps {
  taskDetails: any;
  agentDetails: IAgentDetails | null;
  isTaskListLoading: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const TaskInfoPanel: React.FC<TaskInfoPanelProps> = ({
  taskDetails,
  agentDetails,
  isTaskListLoading,
  isOpen,
  onClose,
}) => {
  const [showTagSelector, setShowTagSelector] = useState(false);

  const {
    getTagsList,
    getSelectedTags,
    setSelectedTags,
    setTagsList,
    searchTagText,
    setSearchTagText,
    setPage,
    page,
    hasMore,
    isFetchingMore,
    setIsFetchingMore,
  } = useTagsSelect(taskDetails, "task", showTagSelector);

  const tagsList = getTagsList();
  const selectedTags = getSelectedTags();
  const [selectedDocumentData, setSelectedDocumentData] =
    useState<IAttachmentDetails | null>(null);
  const [openAttachmentDetails, setOpenAttachmentDetails] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Record<number, any>>({});
  const planningData = agentDetails?.plan || [];
  const defaultIcon = getIconSvg("shapes", "agent_icons");
  const [openSection, setOpenSection] = useState<
    "instructions" | "rules" | "planning" | null
  >(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const handleOpenAttachmentEvent = (attachment: IAttachmentDetails) => {
    setSelectedDocumentData(attachment);
    setOpenAttachmentDetails(true);
  };

  const closeAttachmentDetails = () => {
    setOpenAttachmentDetails(false);
    setSelectedDocumentData(null);
  };

  const handleTagRemove = useCallback(
    (tagId: string) => {
      setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
    },
    [setSelectedTags, selectedTags],
  );

  if (!taskDetails) {
    return (
      <div className="p-4">
        <Card className="shadow-md dark:border-slate-700">
          <CardHeader>
            <CardTitle>Loading Task Info...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Task data is not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleExpand = (index: number, field: string) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: !prev[index]?.[field],
      },
    }));
  };

  return (
    <div
      ref={scrollContainerRef}
      className="h-full flex flex-col overflow-y-auto"
    >
      {/* Panel header */}
      <div className="sticky top-0 z-5 flex items-center justify-between px-4 py-3 border-b bg-background">
        <h2 className="text-lg font-semibold">Task Overview</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6 py-6 px-4 xl:px-6">
        <Card
          className={`p-0 gap-0 shadow-xs divide-y transition-colors border bg-white overflow-hidden dark:bg-slate-800`}
        >
          <CardHeader
            className={`px-4 py-3 gap-0 transition-colors bg-slate-100 dark:bg-slate-700/50`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                <CardTitle className="text-base xl:text-lg text-gray-800 dark:text-slate-200">
                  Task Information
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 xl:p-5 text-gray-700 dark:text-slate-300 flex flex-col gap-4">
            {/* Task Title, ID, and Status */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs xl:text-sm text-muted-foreground dark:text-slate-400">
                  Title
                </p>
              </div>
              <h3 className="text-base xl:text-lg font-semibold text-gray-800 dark:text-slate-100">
                {taskDetails?.title}
              </h3>
              <div className="flex items-center">
                <p className="text-xs text-muted-foreground">
                  ID: {taskDetails?.id}
                </p>

                <CopyToClipboard
                  text={taskDetails?.id || ""}
                  tooltipLabel="Copy task ID"
                  className="ml-1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-muted-foreground dark:text-slate-400 mb-1">
                Description
              </p>
              {taskDetails?.description ? (
                <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-md border text-sm wrap-break-word">
                  <ExpandableContent
                    className="prose prose-sm dark:prose-invert max-w-none reset-prose relative group"
                    maxHeight={50}
                    gradientStart="from-slate-50"
                  >
                    <SmartContentViewer
                      content={taskDetails.description}
                      className="text-gray-700 dark:text-slate-300"
                    />
                  </ExpandableContent>
                </div>
              ) : (
                <span className="text-base font-medium">N/A</span>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-4 xl:gap-x-6 gap-y-4">
              {/* Created At */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Created At
                </p>
                <div className="text-xs xl:text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{UTCToLocalTimezon(taskDetails?.created_at)}</span>
                </div>
              </div>

              {/* Completed At */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Completed At
                </p>
                <div className="text-xs xl:text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  {taskDetails?.completed_at ? (
                    <span>{UTCToLocalTimezon(taskDetails?.completed_at)}</span>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments if available */}
            {taskDetails?.attachment_details?.attachments &&
              taskDetails?.attachment_details?.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground dark:text-slate-400 mb-2 flex items-center gap-1.5">
                    Attachments ({taskDetails?.attachment_details?.total})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {taskDetails?.attachment_details?.attachments.map(
                      (att: any, index: any) => (
                        <div key={index} className="flex">
                          <Button
                            variant="outline"
                            className="justify-start text-left h-auto py-2 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors rounded-md w-fit max-w-full cursor-pointer"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleOpenAttachmentEvent(att);
                            }}
                          >
                            {getAttachmentIcon(
                              att?.file_type,
                              "w-5! h-5! mr-1! shrink-0! text-primary",
                            )}
                            <div className="flex flex-col overflow-hidden">
                              <div className="flex flex-1 items-center max-w-[280px]">
                                <ConditionalTooltip content={att?.file_name}>
                                  <span className="truncate w-full block">
                                    {att?.file_name}
                                  </span>
                                </ConditionalTooltip>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {att?.size && formatFileSize(att.size)}
                                {att?.size && att?.file_type && " • "}
                                {att?.file_type?.toUpperCase()}
                              </span>
                            </div>
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 flex-wrap relative">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Tags
                </p>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowTagSelector((prev) => {
                      const newState = !prev;
                      if (!prev) {
                        setSearchTagText("");
                      }
                      return newState;
                    });
                  }}
                  className={`inline-flex items-center justify-center h-6 w-6 rounded-md text-primary bg-primary/10 transition-colors duration-200 cursor-pointer border border-primary/20 hover:bg-primary/20`}
                  aria-label="Add tags"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <Suspense fallback={<Loader2Icon className="animate-spin" />}>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getSortedTags(selectedTags).map((tag: any) => {
                        return (
                          <Badge
                            key={tag.id}
                            className="relative flex items-center justify-center text-black-600 group px-3 py-1 rounded-full font-normal text-sm shadow-none"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                            <X
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 cursor-pointer 
               text-muted-foreground opacity-0 group-hover:opacity-100 
               hover:text-red-500 transition rounded-full bg-gray-200 p-px shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagRemove(tag.id);
                              }}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {showTagSelector ? (
                    <div
                      className="absolute top-full left-0 mt-1 z-50 min-w-[300px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TagSelectorComponent
                        dataList={tagsList || []}
                        setDataList={setTagsList}
                        selectedIds={(selectedTags || []).map((t: any) =>
                          typeof t === "object" && t != null ? t.id : t,
                        )}
                        setSelectedIds={(value: any) => {
                          const currentIds = (selectedTags || []).map(
                            (t: any) =>
                              typeof t === "object" && t != null ? t.id : t,
                          );

                          const ids =
                            typeof value === "function"
                              ? value(currentIds)
                              : value;

                          const mergedList = [
                            ...tagsList,
                            ...selectedTags,
                          ].reduce<any[]>((acc, tag) => {
                            if (!acc.find((t) => t.id === tag.id))
                              acc.push(tag);
                            return acc;
                          }, []);

                          const newSelectedTags = ids
                            .map((id: any) =>
                              mergedList.find((t) => t.id === id),
                            )
                            .filter(Boolean) as any[];

                          setSelectedTags(newSelectedTags);
                        }}
                        setSelectedTags={setSelectedTags}
                        localSearch={searchTagText}
                        setLocalSearch={setSearchTagText}
                        autoOpen={true}
                        setPage={setPage}
                        page={page}
                        hasMore={hasMore}
                        isFetchingMore={isFetchingMore}
                        setIsFetchingMore={setIsFetchingMore}
                      />
                    </div>
                  ) : null}
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Info Card */}
        <Card
          className={`p-0 gap-0 shadow-xs divide-y transition-colors border bg-white overflow-hidden dark:bg-slate-800`}
        >
          <CardHeader
            className={`px-4 py-3 gap-0 transition-colors bg-slate-100 dark:bg-slate-700/50 `}
          >
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              <CardTitle className="text-base xl:text-lg text-gray-800 dark:text-slate-200">
                Assigned Agent
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 xl:p-5 text-gray-700 dark:text-slate-300">
            {agentDetails ? (
              <div className="space-y-4">
                {/* Agent Header with Icon and Basic Info */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 bg-primary/10 border border-primary/20 text-primary p-3 rounded-lg">
                    <div
                      className="w-full h-full flex items-stretch"
                      dangerouslySetInnerHTML={{
                        __html:
                          getIconSvg(agentDetails.icon, "agent_icons") ||
                          defaultIcon,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">
                        {agentDetails?.name || "Unnamed Agent"}
                      </h3>
                    </div>
                    {agentDetails?.goal && (
                      <p className="text-xs text-muted-foreground dark:text-slate-300">
                        {agentDetails?.goal}
                      </p>
                    )}
                  </div>
                </div>

                {agentDetails?.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1.5">
                      Description
                    </h4>
                    <p className="text-sm bg-slate-50 dark:bg-slate-700/40 p-3 rounded-md border relative group">
                      <CopyToClipboard
                        text={agentDetails?.description || ""}
                        tooltipLabel="Copy agent description"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      {agentDetails?.description}
                    </p>
                  </div>
                )}

                {/* Agent Instructions */}
                {agentDetails?.instructions && (
                  <div className="border rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
                    <Collapsible
                      open={openSection === "instructions"}
                      onOpenChange={(isOpen) =>
                        setOpenSection(isOpen ? "instructions" : null)
                      }
                      className="w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <div
                          className={`${
                            openSection === "instructions" ? "border-b" : ""
                          } flex items-center justify-between w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 px-4 py-3 rounded-t-lg transition-colors last:border-b-0`}
                        >
                          <h4 className="text-sm font-medium text-gray-800 dark:text-slate-200">
                            Instructions
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full"
                          >
                            {openSection === "instructions" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="text-sm rounded-b-lg bg-slate-50 dark:bg-slate-700/40 p-3 max-h-48 overflow-y-auto relative group">
                          <CopyToClipboard
                            text={
                              typeof agentDetails?.instructions === "string"
                                ? agentDetails?.instructions
                                : Array.isArray(agentDetails?.instructions)
                                  ? agentDetails?.instructions.join("\n")
                                  : ""
                            }
                            tooltipLabel="Copy instructions"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="whitespace-pre-wrap">
                            {typeof agentDetails?.instructions === "string"
                              ? agentDetails?.instructions
                              : Array.isArray(agentDetails?.instructions)
                                ? agentDetails?.instructions.join("\n")
                                : ""}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {/* Agent Rules */}
                {agentDetails?.rules && agentDetails?.rules.length > 0 && (
                  <div className="border rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
                    <Collapsible
                      open={openSection === "rules"}
                      onOpenChange={(isOpen) =>
                        setOpenSection(isOpen ? "rules" : null)
                      }
                      className="w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <div
                          className={`${
                            openSection === "rules" ? "border-b " : ""
                          } flex items-center justify-between w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 px-4 py-3 rounded-t-lg transition-colors last:border-b-0`}
                        >
                          <h4 className="text-sm font-medium text-gray-800 dark:text-slate-200">
                            Rules
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full"
                          >
                            {openSection === "rules" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="text-sm rounded-b-lg bg-slate-50 dark:bg-slate-700/40 p-3 w-full relative group">
                          <CopyToClipboard
                            text={agentDetails?.rules?.join("\n") || ""}
                            tooltipLabel="Copy rules"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                          <ol className="list-decimal list-outside pl-4 text-justify space-y-3">
                            {agentDetails.rules.map(
                              (rule: string, idx: number) => (
                                <li key={idx}>{rule}</li>
                              ),
                            )}
                          </ol>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {/* Planning */}
                {planningData.length > 0 && (
                  <div className="border rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
                    <Collapsible
                      open={openSection === "planning"}
                      onOpenChange={(isOpen) =>
                        setOpenSection(isOpen ? "planning" : null)
                      }
                      className="w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <div
                          className={`${
                            openSection === "planning" ? "border-b" : ""
                          } flex items-center justify-between w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 px-4 py-3 rounded-t-lg transition-colors`}
                        >
                          <h4 className="text-sm font-medium text-gray-800 dark:text-slate-200">
                            Planning
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full"
                          >
                            {openSection === "planning" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/40 space-y-3 max-h-[400px] overflow-y-auto">
                          {planningData.map((step: any, index: any) => {
                            const isExpanded = expandedIndex === index;
                            const isActionExpanded =
                              expanded[index]?.action ?? false;
                            const isRulesExpanded =
                              expanded[index]?.rules ?? false;
                            const isConditionExpanded =
                              expanded[index]?.condition ?? false;

                            return (
                              <Card
                                key={step.id}
                                className={`border border-gray-200 bg-white p-0 gap-0 overflow-hidden transition-shadow ${
                                  isExpanded ? "shadow-xs" : "shadow-none"
                                }`}
                              >
                                <button
                                  onClick={() => toggleAccordion(index)}
                                  className={`w-full cursor-pointer flex items-center justify-between rounded-lg bg-white px-4 py-3 text-left hover:bg-gray-50 transition ${
                                    isExpanded && "border-b border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-6 aspect-square rounded-full bg-gray-900 text-white text-xs font-medium">
                                      {index + 1}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                                      {step.step_name}
                                    </div>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>

                                {isExpanded && (
                                  <CardContent className="p-4 space-y-4">
                                    {step.tool?.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium flex items-center gap-1 mb-1">
                                          <Bolt size={12} /> Tools
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                          {step.tool.map(
                                            (tool: any, i: any) => (
                                              <span
                                                key={i}
                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-purple-300 bg-purple-100 text-purple-700 text-xs font-medium"
                                              >
                                                {tool.replace(/_/g, " ")}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {step.condition && (
                                      <div>
                                        <label className="text-sm font-medium flex items-center gap-1 mb-1">
                                          <AlertCircle size={12} /> Condition
                                        </label>
                                        <div className="bg-amber-50 border border-amber-200 rounded-md p-2 border-l-4 border-l-amber-500">
                                          <p
                                            className={`text-sm text-gray-800 ${
                                              !isConditionExpanded
                                                ? "line-clamp-3"
                                                : ""
                                            }`}
                                          >
                                            {step.condition}
                                          </p>
                                          {step.condition.length > 60 && (
                                            <Button
                                              variant="link"
                                              size="sm"
                                              onClick={() =>
                                                toggleExpand(index, "condition")
                                              }
                                              className={`p-0 mt-2 h-auto cursor-pointer text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/70 
`}
                                            >
                                              {isConditionExpanded
                                                ? "Show Less"
                                                : "Show More"}
                                              <span className="inline-flex items-center ml-1">
                                                {isConditionExpanded ? (
                                                  <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                  <ChevronDown className="w-4 h-4" />
                                                )}
                                              </span>
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {step.action?.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium flex items-center gap-1 mb-1">
                                          <Play size={12} /> Action
                                        </label>
                                        <div className="space-y-2">
                                          {(isActionExpanded
                                            ? step.action
                                            : step.action.slice(0, 3)
                                          ).map((act: any, i: any) => (
                                            <p
                                              key={i}
                                              className="text-sm bg-slate-50 p-1.5 rounded-md border"
                                            >
                                              {act}
                                            </p>
                                          ))}
                                        </div>
                                        {step.action.length > 3 && (
                                          <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() =>
                                              toggleExpand(index, "action")
                                            }
                                            className={`p-0 mt-2 h-auto cursor-pointer text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/70 
`}
                                          >
                                            {isActionExpanded
                                              ? "Show Less"
                                              : "Show More"}
                                            <span className="inline-flex items-center ml-1">
                                              {isActionExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                              ) : (
                                                <ChevronDown className="w-4 h-4" />
                                              )}
                                            </span>
                                          </Button>
                                        )}
                                      </div>
                                    )}

                                    {step.rules && step.rules?.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium flex items-center gap-1 mb-1">
                                          <Shield size={12} /> Rules
                                        </label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-md p-2 ">
                                          <div
                                            className={`space-y-2 ${
                                              !isRulesExpanded
                                                ? "max-h-[84px] overflow-hidden"
                                                : ""
                                            }`}
                                          >
                                            {step.rules.map(
                                              (rule: any, i: any) => (
                                                <div
                                                  key={i}
                                                  className="flex gap-2"
                                                >
                                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                                                    {i + 1}
                                                  </span>
                                                  <p className="text-sm">
                                                    {rule}
                                                  </p>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                          {step.rules.length > 3 && (
                                            <Button
                                              variant="link"
                                              size="sm"
                                              onClick={() =>
                                                toggleExpand(index, "rules")
                                              }
                                              className={`p-0 mt-2 h-auto cursor-pointer text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/70 
`}
                                            >
                                              {isRulesExpanded
                                                ? "Show Less"
                                                : "Show More"}
                                              <span className="inline-flex items-center ml-1">
                                                {isRulesExpanded ? (
                                                  <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                  <ChevronDown className="w-4 h-4" />
                                                )}
                                              </span>
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
                {/* Agent Tools */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Tools
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agentDetails?.tools && agentDetails?.tools.length > 0 ? (
                      agentDetails.tools.map((tool, idx) => (
                        <Badge
                          variant="outline"
                          key={idx}
                          className="text-sm font-medium"
                        >
                          {tool.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        No tools available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Bot className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No agent information available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {openAttachmentDetails && (
          <AttachmentViewer
            openAttachmentSheet={openAttachmentDetails}
            closeAttachmentDetailsEvent={closeAttachmentDetails}
            attachment={selectedDocumentData}
          />
        )}
      </div>
    </div>
  );
};
