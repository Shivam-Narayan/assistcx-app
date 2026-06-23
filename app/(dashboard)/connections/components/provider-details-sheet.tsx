"use client";

import { EmptyState } from "@/components/empty-state/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";
import {
  Database,
  Loader2Icon,
  Plug,
  PlusCircleIcon,
  SquareChartGantt,
  X,
} from "lucide-react";
import Image from "next/image";
import { Suspense, useState } from "react";
import MarkdownContent from "../../integrations/mark-down-content";
import ConnectionsList from "./connections-list";
import CreateNewConnectionDialog from "./new-connection-dialog";

const ProviderDetailsSheet = ({
  open,
  onOpenChange,
  data,
  onDeleteConnection,
  isDeleteLoading,
  detailsLoading,
  onTestConnection,
  isTestLoading,
  handleSubmit,
  formLoading,
  selectedItem,
  setSelectedItem,
  setMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  onDeleteConnection?: (id: number) => Promise<void>;
  isDeleteLoading?: boolean;
  detailsLoading?: boolean;
  onTestConnection?: any;
  isTestLoading?: boolean;
  handleSubmit?: any;
  formLoading?: boolean;
  selectedItem?: any;
  setSelectedItem?: any;
  setMode?: any;
}) => {
  const [activeTab, setActiveTab] = useState("Connections");
  const [openAddConnection, setOpenAddConnection] = useState(false);

  const handleSheetOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setActiveTab("Connections");
    }
    onOpenChange(isOpen);
  };

  const connectionIcon =
    data?.key && INTEGRATION_ICON_SRC[data.key]
      ? INTEGRATION_ICON_SRC[data.key]
      : undefined;

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-y-auto overflow-x-hidden">
          <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
            <div className="w-full flex justify-start items-center space-x-2 divide-x">
              <SheetTitle className="px-3 text-lg font-medium">
                View Details
              </SheetTitle>
            </div>

            {activeTab === "Connections" && data?.connections_count > 0 && (
              <Button
                type="button"
                size="sm"
                className="gap-2 mr-3 cursor-pointer"
                onClick={() => setOpenAddConnection(true)}
              >
                <PlusCircleIcon className="h-4 w-4" />
                New Connection
              </Button>
            )}

            <SheetClose asChild>
              <div className="p-1.5 rounded-md cursor-pointer hover:bg-secondary">
                <X className="h-5 w-5" />
              </div>
            </SheetClose>
          </SheetHeader>

          <div className="grow">
            {detailsLoading ? (
              <div className="flex h-full min-h-[500px] items-center justify-center">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !data ? (
              <div className="p-4">
                <EmptyState
                  variant="card"
                  icon={<Database />}
                  title="No Data Found"
                  description="The requested integration details are not available."
                />
              </div>
            ) : (
              <div className="grid gap-5 px-4 pb-4">
                <Card className="shadow-none gap-0 p-0">
                  <CardContent className="px-4 py-4 pb-4 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full w-fit h-fit bg-primary/10 text-primary `}
                      >
                        {connectionIcon ? (
                          <Image
                            src={connectionIcon}
                            alt="provider"
                            width={24}
                            height={24}
                            className="h-auto w-6"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0 ">
                        <div className="text-base font-medium text-foreground">
                          {data?.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-4">
                      <span className="text-xs text-muted-foreground">
                        Description
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">
                        {data?.description}
                      </p>
                    </div>
                    {data?.tags?.length > 0 && (
                      <div className="flex flex-col gap-1 pt-4">
                        <span className="text-xs text-muted-foreground">
                          Tags
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {data.tags.map((tag: string) => (
                            <Badge
                              variant="outline"
                              key={tag}
                              className="whitespace-nowrap"
                            >
                              {tag.replace("_", " ").toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-none gap-0 p-0">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <CardHeader className="px-0 py-2 gap-0">
                      <TabsList
                        variant="line"
                        className="w-full justify-start border-b rounded-none"
                      >
                        <TabsTrigger
                          value="Connections"
                          className="cursor-pointer"
                        >
                          Connections{" "}
                          {data?.connections_count > 0 && (
                            <span className="text-xs text-white bg-primary rounded-full px-2 py-0.5">
                              {data?.connections_count}
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="Tools" className="cursor-pointer">
                          Tools{" "}
                          <span className="text-xs text-white bg-primary rounded-full px-2 py-0.5">
                            {data?.tools?.length}
                          </span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="Overview"
                          className="cursor-pointer"
                        >
                          Overview
                        </TabsTrigger>
                      </TabsList>
                    </CardHeader>

                    <CardContent className="px-4 pt-0 pb-4">
                      <TabsContent
                        value="Connections"
                        className="text-sm w-full"
                      >
                        <Suspense
                          fallback={
                            <div className="flex items-center justify-center py-4 text-muted-foreground">
                              <Loader2Icon className="animate-spin mr-2 h-6 w-6" />
                            </div>
                          }
                        >
                          {data?.connections_count === 0 ? (
                            <EmptyState
                              variant="card"
                              compact
                              icon={<Plug />}
                              title="No Connections Found"
                              description="Create a new connection from a provider to start integrating external services with your workspace."
                              action={
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="cursor-pointer"
                                  onClick={() => setOpenAddConnection(true)}
                                >
                                  <PlusCircleIcon className="h-4 w-4" />
                                  New Connection
                                </Button>
                              }
                            />
                          ) : (
                            <ConnectionsList
                              connectionList={data?.connections || []}
                              onDeleteConnection={onDeleteConnection}
                              isDeleteLoading={isDeleteLoading}
                              onTestConnection={onTestConnection}
                              isTestLoading={isTestLoading}
                              selectedItem={selectedItem}
                              setSelectedItem={setSelectedItem}
                              setMode={setMode}
                              handleSubmit={handleSubmit}
                              formLoading={formLoading}
                            />
                          )}
                        </Suspense>
                      </TabsContent>

                      <TabsContent
                        value="Tools"
                        className="mt-0 space-y-3 text-sm"
                      >
                        <div className="space-y-3">
                          {data?.tools?.length > 0 ? (
                            <>
                              {data?.tools?.map((tool: any) => (
                                <div
                                  className="flex gap-2 w-full min-w-0 border p-2 rounded-md"
                                  key={tool.action}
                                >
                                  <div className="p-1.5 rounded-full w-fit h-fit shrink-0 bg-primary/10 text-primary">
                                    {connectionIcon ? (
                                      <Image
                                        src={connectionIcon}
                                        alt="provider"
                                        width={24}
                                        height={24}
                                        className="h-auto w-6"
                                      />
                                    ) : null}
                                  </div>

                                  <div className="flex flex-col min-w-0">
                                    <p className="font-medium text-foreground/90 leading-tight">
                                      {tool?.name}
                                    </p>
                                    <p className="text-xs mt-1 text-muted-foreground leading-relaxed line-clamp-2">
                                      {tool?.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="py-10 flex items-center justify-center">
                              <p className="text-md text-muted-foreground">
                                No tools information available for this
                                integration.
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="Overview" className="mt-0">
                        <Suspense
                          fallback={
                            <div className="flex items-center justify-center py-6 text-muted-foreground">
                              <Loader2Icon className="animate-spin mr-2 h-5 w-5" />
                            </div>
                          }
                        >
                          {data?.markdown_content ? (
                            <div className="w-full table table-fixed">
                              <MarkdownContent
                                variant="provider"
                                markdownContent={data?.markdown_content}
                              />
                            </div>
                          ) : (
                            <EmptyState
                              variant="card"
                              compact
                              icon={<SquareChartGantt />}
                              title="No Overview Found"
                              description="No overview information is available for this provider at the moment."
                            />
                          )}
                        </Suspense>
                      </TabsContent>
                    </CardContent>
                  </Tabs>
                </Card>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CreateNewConnectionDialog
        open={openAddConnection}
        onOpenChange={setOpenAddConnection}
        data={data}
        handleSubmit={handleSubmit}
        formLoading={formLoading}
        setMode={setMode}
      />
    </>
  );
};
export default ProviderDetailsSheet;
