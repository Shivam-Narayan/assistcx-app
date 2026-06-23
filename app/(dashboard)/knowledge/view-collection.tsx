import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { EmptyState } from "@/components/empty-state/empty-state";
import HeaderHoverCard from "@/components/header";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { SmartContentViewer } from "@/components/smart-content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusColor } from "@/helper/assistant-helper/helper";
import { capitalize } from "@/lib/utils";
import { RootState, useAppSelector } from "@/redux/store";
import { IconsData } from "@/types/types";
import { Brain, BrainCircuit, Code, Eye, LoaderCircle } from "lucide-react";

type KnowledgeTopic = {
  name: string;
  description: string;
  keywords: string[];
};

type SmartField = {
  name: string;
  description: string;
  keywords: string[];
  data_type: string;
};

interface ViewCollectionProps {
  iconsData: IconsData;
  advanceFiledsLoading: boolean;
  getSmartfiledsList: SmartField[];
  getknowledegTopicsList: KnowledgeTopic[];
  onSwitchToEdit: () => void;
  onImportAndSwitchToEdit: (
    importType: "smart_fields" | "knowledge_topics",
    items: any[],
  ) => void;
}

interface IDataRow {
  label?: string;
  value?: string;
  isIcon?: boolean;
}

const ViewCollection = (props: ViewCollectionProps) => {
  const {
    iconsData,
    advanceFiledsLoading,
    getSmartfiledsList,
    getknowledegTopicsList,
    onSwitchToEdit,
    onImportAndSwitchToEdit,
  } = props;
  const defaultIcon = getIconSvg("ai-book", "collection_icons");
  const { isOpen, type, data } = useAppSelector(
    (state: RootState) => state.modalReducer,
  );

  const showAdvanceField =
    data?.collection_config?.advanced_knowledge_extraction || false;

  return (
    <>
      <Card className="shadow-none gap-0 p-0">
        <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle
            className="flex gap-3 items-center text-lg font-medium
           leading-none tracking-tight"
          >
            <span>Collection Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 pb-4 flex flex-col">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-xl border bg-primary/10 text-primary border-primary/20 p-1.5 shrink-0">
              {
                <div
                  className="w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-[1.5]"
                  dangerouslySetInnerHTML={{
                    __html:
                      data?.icon && iconsData?.[data.icon]
                        ? iconsData[data?.icon]
                        : defaultIcon,
                  }}
                />
              }
            </div>
            {data?.name && (
              <div className="flex flex-col gap-0.5 min-w-0 ">
                <div className="text-base font-medium text-foreground">
                  {data?.name}
                </div>
              </div>
            )}
            {data?.availability && (
              <div className="ml-auto">
                <Badge
                  variant="outline"
                  className={getStatusColor(data?.availability)}
                >
                  {data?.availability}
                </Badge>
              </div>
            )}
          </div>

          {data?.description && (
            <div className="flex flex-col gap-1 pt-4">
              <span className="text-xs text-muted-foreground">Description</span>
              <p className="text-sm text-foreground leading-relaxed">
                {data?.description}
              </p>
            </div>
          )}
          {data?.collection_config?.embedding_model && (
            <div className="flex flex-col gap-1 pt-4">
              <span className="text-xs text-muted-foreground">
                Embedding Model
              </span>
              <p className="text-sm text-foreground leading-relaxed">
                {data?.collection_config?.embedding_model}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {advanceFiledsLoading ? (
        <div className="flex justify-center items-center h-24 text-muted-foreground">
          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
        </div>
      ) : showAdvanceField ? (
        <>
          {/* // Smart Fields Card */}
          <Card className="h-full max-h-full w-full max-w-full flex flex-col shrink-0 snap-center shadow-none border p-0 gap-0">
            <Tabs
              defaultValue="form"
              className="flex flex-col flex-1 min-h-0 gap-0"
            >
              <CardHeader
                className="border-b px-4 py-3 [.border-b]:pb-2 flex items-center justify-between text-xl font-semibold 
           leading-none tracking-tight"
              >
                <HeaderHoverCard
                  title="Smart Fields"
                  message="Automatically detect and map key information fields using AI to simplify data extraction."
                  type="card"
                  isRequired={false}
                />
                <div className="flex items-center gap-2 shrink-0">
                  <TabsList className="bg-muted h-9 p-0.5">
                    <ConditionalTooltip
                      content="Form view"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                      side="bottom"
                    >
                      <TabsTrigger
                        value="form"
                        className="cursor-pointer size-8 p-0 data-[state=inactive]:opacity-70"
                        aria-label="Form view"
                      >
                        <span className="inline-flex size-full items-center justify-center">
                          <Eye className="h-4 w-4" />
                        </span>
                      </TabsTrigger>
                    </ConditionalTooltip>

                    <ConditionalTooltip
                      content="JSON view"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                      side="bottom"
                    >
                      <TabsTrigger
                        value="json"
                        className="cursor-pointer size-8 p-0 data-[state=inactive]:opacity-70"
                        aria-label="JSON view"
                      >
                        <span className="inline-flex size-full items-center justify-center">
                          <Code className="h-4 w-4" />
                        </span>
                      </TabsTrigger>
                    </ConditionalTooltip>
                  </TabsList>
                </div>
              </CardHeader>

              <CardContent className="flex grow flex-col p-4 space-y-4 overflow-y-auto">
                <TabsContent
                  value="form"
                  className="flex-1 overflow-y-auto m-0"
                >
                  {getSmartfiledsList.length === 0 ? (
                    <EmptyState
                      variant="card"
                      compact
                      icon={<BrainCircuit />}
                      title="No Smart Fields Defined"
                      description="Add fields to structure and standardize extracted information across this collection."
                    />
                  ) : (
                    <div className="flex flex-col gap-4 m-0">
                      {getSmartfiledsList.map((field) => (
                        <div
                          key={field.name}
                          className="group p-4 border rounded-lg"
                        >
                          <div className="space-y-2">
                            {/* Field Name */}
                            <div className="flex flex-wrap gap-2 item-center">
                              <ConditionalTooltip
                                content={field.name
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              >
                                <div className="truncate max-w-[480px] text-sm px-3 py-1 break-words border rounded-md font-semibold">
                                  {field.name
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </div>
                              </ConditionalTooltip>
                              {field.data_type && (
                                <Badge
                                  variant="secondary"
                                  className="text-sm w-fit break-words"
                                >
                                  <span className="truncate">
                                    {capitalize(field.data_type)}
                                  </span>
                                </Badge>
                              )}
                            </div>

                            {/* Field Description */}
                            <div className="pl-1">
                              <p className="text-sm break-all whitespace-normal w-full">
                                {field.description}
                              </p>
                            </div>

                            {field.keywords && field.keywords.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {field.keywords.filter(
                                  (keyword: any) =>
                                    keyword && keyword.trim() !== "",
                                ).length > 0 && (
                                  <>
                                    <span className="text-sm font-medium ">
                                      Keywords:
                                    </span>
                                    {field.keywords
                                      .filter(
                                        (keyword: any) =>
                                          keyword && keyword.trim() !== "",
                                      )
                                      .map((keyword: any, idx: any) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="font-normal text-xs w-fit border border-gray-400"
                                        >
                                          {keyword.trim().toLowerCase()}
                                        </Badge>
                                      ))}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value="json"
                  className="flex-1 overflow-y-auto mt-0"
                >
                  <div className="rounded-md border bg-card overflow-hidden min-h-[240px] max-h-[360px] flex-1 flex flex-col">
                    <SmartContentViewer
                      content={getSmartfiledsList}
                      maxHeight="100%"
                      fullHeight
                      className="border-none"
                    />
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          {/* // Knowledge Topics Card */}
          <Card className="h-full max-h-full w-full max-w-full flex flex-col shrink-0 snap-center shadow-none border p-0 gap-0">
            <Tabs
              defaultValue="form"
              className="flex flex-col flex-1 min-h-0 gap-0"
            >
              <CardHeader className="border-b px-4 py-3 [.border-b]:pb-2 flex items-center justify-between text-xl font-semibold leading-none tracking-tight">
                <HeaderHoverCard
                  title="Knowledge Topics"
                  message="Group related information into key topics for better organization and retrieval."
                  type="card"
                  isRequired={false}
                />

                <div className="flex items-center gap-2 shrink-0">
                  <TabsList className="bg-muted h-9 p-0.5">
                    <ConditionalTooltip
                      content="Form view"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                      side="bottom"
                    >
                      <TabsTrigger
                        value="form"
                        className="cursor-pointer size-8 p-0 data-[state=inactive]:opacity-70"
                        aria-label="Form view"
                      >
                        <span className="inline-flex size-full items-center justify-center">
                          <Eye className="h-4 w-4" />
                        </span>
                      </TabsTrigger>
                    </ConditionalTooltip>

                    <ConditionalTooltip
                      content="JSON view"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                      side="bottom"
                    >
                      <TabsTrigger
                        value="json"
                        className="cursor-pointer size-8 p-0 data-[state=inactive]:opacity-70"
                        aria-label="JSON view"
                      >
                        <span className="inline-flex size-full items-center justify-center">
                          <Code className="h-4 w-4" />
                        </span>
                      </TabsTrigger>
                    </ConditionalTooltip>
                  </TabsList>
                </div>
              </CardHeader>

              <CardContent className="flex grow flex-col p-4 space-y-4 overflow-y-auto">
                <TabsContent
                  value="form"
                  className="flex-1 overflow-y-auto m-0 "
                >
                  {getknowledegTopicsList.length === 0 ? (
                    <EmptyState
                      variant="card"
                      compact
                      icon={<Brain />}
                      title="No Knowledge Topics Defined"
                      description="Create topics to organize content and improve semantic retrieval."
                    />
                  ) : (
                    <div className="flex flex-col gap-4">
                      {getknowledegTopicsList.map((field) => (
                        <div
                          key={field.name}
                          className="group p-4 border rounded-lg"
                        >
                          <div className="space-y-3">
                            {/* Field Name */}
                            <div className="flex flex-wrap gap-2 item-center">
                              <ConditionalTooltip
                                content={field.name
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              >
                                <div className="truncate max-w-[550px] text-sm px-3 py-1 break-words border rounded-md font-semibold">
                                  {field.name
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </div>
                              </ConditionalTooltip>
                            </div>

                            {/* Field Description */}
                            <div className="pl-1">
                              <p className="text-sm break-words whitespace-normal w-full">
                                {field.description}
                              </p>
                            </div>

                            {field.keywords && field.keywords.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {field.keywords.filter(
                                  (keyword: any) =>
                                    keyword && keyword.trim() !== "",
                                ).length > 0 && (
                                  <>
                                    <span className="text-sm font-medium ">
                                      Keywords:
                                    </span>
                                    {field.keywords
                                      .filter(
                                        (keyword: any) =>
                                          keyword && keyword.trim() !== "",
                                      )
                                      .map((keyword: any, idx: any) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="font-normal text-xs w-fit border border-gray-400"
                                        >
                                          {keyword.trim().toLowerCase()}
                                        </Badge>
                                      ))}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent
                  value="json"
                  className="flex-1 overflow-y-auto m-0 "
                >
                  <div className="rounded-md border bg-card overflow-hidden min-h-[240px] max-h-[360px] flex-1 flex flex-col">
                    <SmartContentViewer
                      content={getknowledegTopicsList}
                      maxHeight="100%"
                      fullHeight
                      className="border-none"
                    />
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </>
      ) : null}
    </>
  );
};

export default ViewCollection;
