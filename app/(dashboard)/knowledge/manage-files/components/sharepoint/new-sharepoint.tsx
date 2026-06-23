import useSharePoint from "@/app/(dashboard)/knowledge/hook/useSharePoint";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import { EmptyState } from "@/components/empty-state/empty-state";
import HeaderHoverCard from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Import, Link, Link2Off, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Breadcrumb from "./breadcrumb";
import FolderTree from "./folder-tree";
import SitesStatusDialog from "./site-status-dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  collectionInfo: any;
  getManageFileData: (value: number) => void;
  isImportSharePoint?: boolean;
};
const sharepointSchema = z.object({
  site: z.string().min(1, "Site is required").url("Please enter a valid URL"),
});

const NewSharePointSheet = ({
  open,
  onClose,
  collectionInfo,
  getManageFileData,
  isImportSharePoint,
}: Props) => {
  const {
    fetchFiles,
    setPath,
    isLoading,
    isImportLoading,
    searchText,
    setSearchText,
    path,
    selectedItems,
    selectedIds,
    items,
    loadingFolders,
    handleFolderClick,
    handleFileClick,
    handleCrumbClick,
    toggleSelect,
    importSelectedFiles,
    importSitesStatus,
    setImportSitesStatus,
  } = useSharePoint(open, collectionInfo.id, onClose, getManageFileData);
  const { axiosAuth, loading } = useAxiosAuth();
  const [isAddSiteLoading, setIsAddSiteLoading] = useState(false);
  const [sites, setSites] = useState(
    collectionInfo?.collection_config?.connected_sharepoint_sites || [],
  );
  const [activeView, setActiveView] = useState<any>("");
  const initialFilesCheck =
    collectionInfo?.collection_config?.connected_sharepoint_sites || [];
  const [showForm, setShowForm] = useState(false);
  const [disconnectModelOpen, setDisconnectModelOpen] =
    useState<boolean>(false);
  const [siteToDelete, setSiteToDelete] = useState<any>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof sharepointSchema>>({
    resolver: zodResolver(sharepointSchema),
    defaultValues: { site: "" },
    mode: "onChange",
  });

  const getCollection = async () => {
    try {
      const result = await axiosAuth.get(
        `${url.GET_COLLECTION_LIST}/${collectionInfo.id}`,
      );
      if (result.status === 200) {
        const newSites =
          result.data?.data_collections?.[0]?.collection_config
            ?.connected_sharepoint_sites || [];
        setSites(newSites);
        if (newSites.length > 0) {
          setActiveView("sites");
        } else {
          setActiveView("");
        }
      }
    } catch (err) {
      console.error("Failed to fetch SharePoint sites", err);
    } finally {
      //setIsLoading(false);
    }
  };

  const handleConnectSite = async (
    values: z.infer<typeof sharepointSchema>,
  ) => {
    const body = {
      site_url: values.site,
      action: "connect",
    };

    // send to API here
    if (!loading) {
      setIsAddSiteLoading(true);
      try {
        const result = await axiosAuth.post(
          `collections/${collectionInfo.id}/sharepoint-sites`,
          body,
        );
        if (result.status === 200) {
          if (result.data.message) {
            successMessageHandler("Site connected successfully");
            getCollection();
            form.reset();
            setShowForm(false);
            setActiveView("sites");
          }
        }
      } catch (error: any) {
        errorMessageHandler(error?.response?.data?.detail);
      } finally {
        setIsAddSiteLoading(false);
      }
    }
  };

  const handleDisconnectSite = async (data: any) => {
    const body = {
      site_url: data.url || data.webUrl,
      action: "disconnect",
    };
    if (!loading) {
      setIsDeleteLoading(true);
      try {
        const result = await axiosAuth.post(
          `collections/${collectionInfo.id}/sharepoint-sites`,
          body,
        );
        if (result.status === 200) {
          if (result.data.message) {
            successMessageHandler("Site disconnected successfully");
            setSites((prev: any[]) =>
              prev.filter((site) => site.url !== data.url),
            );
            setDisconnectModelOpen(false);
          }
        }
      } catch (error: any) {
        errorMessageHandler(error?.response?.data?.detail);
      } finally {
        setIsDeleteLoading(false);
      }
    }
  };

  const handleSiteClick = (site: any) => {
    setActiveView("import");
    setPath([
      {
        id: site.id,
        name: site.name,
        isSite: true,
        siteId: site.id,
        folderId: undefined,
      },
    ]);
  };

  const handleBackClick = () => {
    setActiveView("sites");
  };

  useEffect(() => {
    if (open) {
      setShowForm(false);
      getCollection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, collectionInfo]);

  return (
    <Sheet
      open={open}
      onOpenChange={() => {
        form.reset();
        onClose();
      }}
    >
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto">
        {/* Header */}

        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="w-full flex justify-start items-center space-x-2 divide-x">
            <SheetTitle className="px-3 text-lg font-medium">
              SharePoint Import
            </SheetTitle>
          </div>
          <SheetClose>
            <div
              onClick={() => {
                form.reset();
                setShowForm(false);
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-muted text-muted-foreground cursor-pointer hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </div>
          </SheetClose>
        </SheetHeader>

        <div className="flex-grow">
          <div className="grid gap-4 px-4 pb-4">
            {/* empty state  */}
            {sites?.length === 0 && !showForm && (
              <EmptyState
                variant="card"
                compact
                icon={<Link />}
                title="No sites added yet"
                description="Add a site to get started with SharePoint integration."
                className="bg-white"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-md px-2 py-1 cursor-pointer"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Connect Site
                  </Button>
                }
              />
            )}

            {/* from  */}
            {showForm && (
              <Card className="w-full max-w-full flex flex-col shadow-none snap-center p-0 gap-0">
                <CardContent className="p-0 pb-2 flex flex-col">
                  <div className="p-4">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleConnectSite)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="site"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">
                                Connect site{" "}
                              </FormLabel>
                              <FormDescription className="text-muted-foreground">
                                Enter the SharePoint site URL to verify access
                                and link it with this collection. Once
                                connected, you can browse folders and import
                                files.
                              </FormDescription>
                              <FormControl>
                                <Input
                                  autoComplete="off"
                                  placeholder="Enter site..."
                                  {...field}
                                  className="disabled:opacity-80"
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowForm(false);
                              form.reset();
                            }}
                            className="cursor-pointer"
                          >
                            Cancel
                          </Button>

                          <Button
                            type="submit"
                            disabled={isAddSiteLoading}
                            className="cursor-pointer"
                          >
                            {isAddSiteLoading && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Connect
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>
            )}

            {/*  sites list  */}
            {activeView === "sites" && sites?.length > 0 && (
              <Card className="w-full max-w-full flex flex-col shadow-none snap-center p-0 gap-0">
                <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
                  <HeaderHoverCard
                    title="Connected site"
                    message="Displays all the SharePoint sites you have successfully connected and currently have access to. You can select any of these sites to import files and folders."
                    type="card"
                    isRequired={false}
                  />
                  {!showForm && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-md px-2 py-1 cursor-pointer"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Connect Site
                    </Button>
                  )}
                </CardHeader>
                {/* Sites exist */}
                {sites?.length > 0 && (
                  <CardContent className="flex flex-grow flex-col gap-2 p-4 overflow-y-auto">
                    {sites.map((data: any, i: number) => (
                      <div
                        key={i}
                        className="cursor-pointer group flex items-center justify-between p-1 border rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        {/* Left side with icon + site name */}
                        <div
                          className="flex items-center gap-2"
                          onClick={() => handleSiteClick(data)}
                        >
                          <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
                            <Globe className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {data.name}
                            </span>
                            <span className="text-xs text-muted-foreground break-all">
                              {data.url || data.webUrl}
                            </span>
                          </div>
                        </div>

                        {/* Hover delete button */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ConditionalTooltip
                            content="Disconnect link"
                            alwaysShow={true}
                            align="center"
                            showArrow={true}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full hover:bg-red-100 hover:text-red-600 cursor-pointer"
                              onClick={() => {
                                setSiteToDelete(data);
                                setDisconnectModelOpen(true);
                              }}
                            >
                              <Link2Off className="h-4 w-4" />
                            </Button>
                          </ConditionalTooltip>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}

            {/* import  */}
            {activeView === "import" && (
              <Card className="w-full max-w-full h-full flex flex-col shadow-none snap-center p-0 gap-0">
                <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
                  <HeaderHoverCard
                    title="Import site"
                    message="Browse the connected SharePoint site’s folders and files. Use the breadcrumb above to navigate between levels. Select one or more files or folders to import them into your collection."
                    type="card"
                    isRequired={false}
                  />
                </CardHeader>

                <div className="flex-1 flex flex-col gap-3 overflow-hidden px-4">
                  {/* Breadcrumb (non-scrollable) */}
                  <div className="sticky mt-3">
                    <Breadcrumb
                      path={path}
                      showBack={true}
                      onCrumbClick={(index) => {
                        if (index === -1) {
                          handleBackClick();
                        } else {
                          handleCrumbClick(index);
                        }
                      }}
                    />
                  </div>

                  {/* FolderTree (scrollable only) */}
                  <div
                    // className="flex-1 min-h-[200px] max-h-[400px] mb-4 overflow-y-scroll rounded-md border bg-slate-100"
                    className={cn(
                      "flex-1 min-h-[200px] max-h-[400px] mb-4 rounded-md border bg-slate-100",
                      items.length > 5
                        ? "overflow-y-scroll"
                        : "overflow-y-hidden",
                    )}
                  >
                    <FolderTree
                      items={items}
                      onFolderClick={handleFolderClick}
                      onFileClick={handleFileClick}
                      selectedIds={selectedIds}
                      toggleSelect={toggleSelect}
                      loadingFolders={loadingFolders}
                      loading={isLoading}
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer with Save button & import button */}

        <SheetFooter className="sticky bottom-0 z-10 p-3 border-t bg-background">
          {selectedItems?.length > 0 ? (
            // Import footer
            !isLoading && (
              <div className="flex w-full items-center justify-between">
                <div className="text-sm">
                  <Badge variant="outline" className="ml-2">
                    {selectedItems.length} file selected
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  {isImportSharePoint && (
                    <Button
                      className="flex items-center justify-center gap-2 cursor-pointer"
                      disabled={isImportLoading || selectedItems?.length === 0}
                      onClick={importSelectedFiles}
                    >
                      {isImportLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <Import className="w-4 h-4" />
                      <span>Import</span>
                    </Button>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="flex w-full items-center justify-between">
              <Button
                className="cursor-pointer"
                variant="outline"
                type="button"
                onClick={() => {
                  form.reset();
                  setShowForm(false);

                  onClose();
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>

      {importSitesStatus?.unsuccessful_downloads?.length > 0 && (
        <SitesStatusDialog
          sitesStatus={importSitesStatus}
          setSitesStatus={setImportSitesStatus}
        />
      )}

      <CustomDeleteDialog
        open={disconnectModelOpen}
        onOpenChange={setDisconnectModelOpen}
        handleAlert={() => {
          if (siteToDelete) {
            handleDisconnectSite(siteToDelete);
            setSiteToDelete(null);
          }
        }}
        deleteButtonText="Disconnect"
        isLoading={isDeleteLoading}
        title={"Are you sure you want to disconnect this site?"}
        description={
          "This action cannot be undone and will permanently disconnect this SharePoint site."
        }
      />
    </Sheet>
  );
};

export default NewSharePointSheet;
