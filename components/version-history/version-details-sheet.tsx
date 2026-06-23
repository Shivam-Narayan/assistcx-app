"use client";

import {
  errorMessageHandler,
  handleJsonFormatting,
  removeMetadata,
} from "@/helper/helper-function";
import React, { useEffect, useState } from "react";

import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { GitBranch, X } from "lucide-react";
import moment from "moment";
import { ConfirmationDialog } from "../confirmation-modal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

import { SmartContentViewer } from "../smart-content";
import { DiffCheckerComponent } from "./change-log-component";
import { compareJSONSummary } from "./useDiffCheckedHook";

import HeaderHoverCard from "../header";
import VersionDetailsCard from "./version-details-card-component";

interface VersionHistory {
  id: string;
  version: string;
  name: string;
  created_at: string;
  config_data?: any;
  user_id: string | number;
  user_name: string;
  user_email: string;
  entity_type: string;
  entity_id: string | number;
  version_number: number;
}

interface VersionDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentJson: any;
  entityType: string;
  entityId: string;
  handleToggleSheet: () => void;
  isRestoreVersionAllowed?: boolean;
  handleRestoreVersionData: any;
  setCurrentSelectedVersion?: React.Dispatch<React.SetStateAction<any>>;
}

const VersionDetailsSheet: React.FC<VersionDetailsSheetProps> = ({
  open,
  onOpenChange,
  currentJson,
  entityType,
  entityId,
  handleToggleSheet,
  isRestoreVersionAllowed = true,
  handleRestoreVersionData,
  setCurrentSelectedVersion,
}) => {
  const { axiosAuth, loading: authLoading } = useAxiosAuth();

  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [selectedVersionData, setSelectedVersionData] =
    useState<VersionHistory | null>(null);
  const [versionHistories, setVersionHistories] = useState<VersionHistory[]>(
    [],
  );
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState<number>(1);
  const page_size = 10;
  const sort_by = "created_at";
  const sort_order = "desc";
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch version histories
  const handleGetVersionHistories = async () => {
    if (authLoading || !entityType || !entityId) return;

    setLoadingVersions(true);
    setHasMore(true);

    try {
      const filtersObj = {
        entity_type: entityType,
        entity_id: entityId,
      };
      const queryParams = {
        page,
        page_size,
        sort_by,
        sort_order,
        filters: JSON.stringify(filtersObj),
      };

      const result = await axiosAuth.get(url.VERSION_HISTORIES, {
        params: queryParams,
      });

      if (result?.status === 200) {
        const newData: VersionHistory[] = result.data || [];
        setVersionHistories((prev) =>
          page === 1 ? newData : [...prev, ...newData],
        );

        if (newData.length < page_size) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching version histories:", error);
      errorMessageHandler(error);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Fetch versions when sheet opens
  useEffect(() => {
    if (open) {
      handleGetVersionHistories();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, authLoading, entityId, entityType]);

  // Reset selection when sheet opens and versions loaded
  useEffect(() => {
    if (open && versionHistories.length > 0) {
      const firstVersion = versionHistories[0];
      setSelectedVersion(firstVersion.id);
      setSelectedVersionData(firstVersion);
    }
  }, [open, versionHistories]);

  // Reset when sheet close
  useEffect(() => {
    if (!open) {
      setSelectedVersion("");
      setSelectedVersionData(null);
      setPage(1);
      setVersionHistories([]);
      setHasMore(true);
      setIsFetchingMore(false);
    }
  }, [open]);

  useEffect(() => {
    if (!dropdownOpen) return;

    const viewport = document.querySelector("[data-radix-select-viewport]");
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 5;

      if (isBottom && hasMore && !isFetchingMore && !loadingVersions) {
        setIsFetchingMore(true);
        setPage((prev) => prev + 1);
      }
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });

    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [dropdownOpen, isFetchingMore, hasMore, loadingVersions]);

  useEffect(() => {
    if (!loadingVersions && isFetchingMore) {
      setIsFetchingMore(false);
    }
  }, [loadingVersions, isFetchingMore]);

  useEffect(() => {
    if (page === 1) return;
    handleGetVersionHistories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Handle version change
  const handleVersionChange = (value: string) => {
    setSelectedVersion(value);

    const selectedVersionInfo = versionHistories.find(
      (version) => version.id === value,
    );

    setSelectedVersionData(selectedVersionInfo || null);
  };

  // Get comparison JSON (empty for first version || previous version)
  const getComparisonJson = () => {
    if (!selectedVersionData || versionHistories.length === 0) {
      return currentJson || {};
    }

    // Find previous version by version_number
    const previousVersion = versionHistories.find(
      (v) => v.version_number === selectedVersionData.version_number - 1,
    );

    // First Version
    if (!previousVersion) {
      return {};
    }

    return previousVersion?.config_data || {};
  };

  const versionJsonRaw = selectedVersionData?.config_data || {};
  const comparisonJsonRaw = getComparisonJson();

  const versionJson =
    entityType === "agent"
      ? handleJsonFormatting(versionJsonRaw)
      : versionJsonRaw;

  const cleanedComparisonJson =
    entityType === "agent"
      ? handleJsonFormatting(comparisonJsonRaw)
      : removeMetadata(comparisonJsonRaw);

  const { diff } = compareJSONSummary(
    cleanedComparisonJson,
    versionJson,
    entityType as "agent" | "data_template",
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
        preventAutoClose={true}
      >
        <SheetHeader className="sticky top-0 z-50 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="flex justify-start items-center gap-2">
            <SheetTitle className="sr-only">Version History</SheetTitle>
            <HeaderHoverCard
              title="Version History"
              message="Tracks all changes to your configuration, capturing each version as a snapshot in time so you can review history or revert to earlier settings when needed."
              type="sheet"
            />
          </div>

          <div className="flex items-center">
            <div>
              <Select
                value={selectedVersion}
                onValueChange={handleVersionChange}
                onOpenChange={setDropdownOpen}
              >
                <SelectTrigger className="inline-flex items-center justify-between rounded-md bg-white border border-gray-300 hover:bg-gray-50 h-8 gap-1.5 font-medium shadow-xs w-auto cursor-pointer px-2.5">
                  <GitBranch className="h-3.5 w-3.5 text-gray-700" />
                  <SelectValue
                    placeholder={
                      <span className="text-gray-500 font-normal text-sm">
                        Select
                      </span>
                    }
                    className="text-gray-900 font-medium text-sm"
                  >
                    {selectedVersionData ? (
                      <span className="text-gray-900 font-medium text-sm whitespace-nowrap">
                        v{selectedVersionData.version_number} -{" "}
                        {moment
                          .utc(selectedVersionData.created_at)
                          .local()
                          .format("MMM DD, YYYY hh:mm A")}
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="end"
                  className="bg-white border border-gray-200 shadow-lg text-gray-900 max-h-80 w-[280px]"
                >
                  {loadingVersions && versionHistories.length === 0 ? (
                    <SelectItem
                      value="loading"
                      disabled
                      className="text-gray-500 justify-center py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                        Loading versions...
                      </div>
                    </SelectItem>
                  ) : versionHistories.length > 0 ? (
                    <>
                      {[...versionHistories].map((version) => (
                        <SelectItem
                          key={version.id}
                          className="cursor-pointer text-gray-900 hover:bg-gray-50 focus:bg-gray-100 py-2"
                          value={version.id}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-xs font-medium px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 shrink-0">
                              v{version.version_number}
                            </span>
                            <div className="text-xs text-gray-600 truncate">
                              {moment
                                .utc(version.created_at)
                                .local()
                                .format("MMM DD, YYYY hh:mm A")}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                      {isFetchingMore && (
                        <SelectItem
                          value="loading-more"
                          disabled
                          className="text-gray-500 justify-center cursor-default py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                            Loading...
                          </div>
                        </SelectItem>
                      )}
                    </>
                  ) : (
                    <SelectItem
                      value="no-versions"
                      disabled
                      className="text-gray-500 justify-center cursor-default py-4"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <GitBranch className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600">
                          No versions found
                        </div>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-2 rounded-md cursor-pointer hover:bg-secondary">
              <SheetClose asChild>
                <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
                  <X className="w-5 h-5" />
                </div>
              </SheetClose>
            </div>
          </div>
        </SheetHeader>

        <div className="grow ">
          {selectedVersionData ? (
            <div className="grid gap-5 px-4">
              <Card className="shadow-none p-0 gap-0">
                <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex gap-3 items-center text-lg font-medium leading-none tracking-tight">
                    <span>Version Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <VersionDetailsCard versionData={selectedVersionData} />
                </CardContent>
              </Card>

              <Accordion type="single" collapsible defaultValue="changelog">
                <AccordionItem value="changelog">
                  <Card className="shadow-none p-0 gap-0">
                    <AccordionTrigger className="w-full px-4 !py-4 flex flex-row items-center justify-between cursor-pointer [&[data-state=open]>svg]:rotate-180 hover:no-underline">
                      <CardTitle className="flex gap-3 items-center text-lg font-medium leading-none tracking-tight">
                        <span>Change Log</span>
                      </CardTitle>
                    </AccordionTrigger>

                    <AccordionContent className="p-0">
                      <CardContent className="p-4 border-t">
                        <DiffCheckerComponent diff={diff} />
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="config">
                  <Card className="shadow-none p-0 gap-0">
                    <AccordionTrigger className="w-full px-4 !py-4 flex flex-row items-center justify-between cursor-pointer [&[data-state=open]>svg]:rotate-180 hover:no-underline">
                      <CardTitle className="flex gap-3 items-center text-lg font-medium leading-none tracking-tight">
                        Config Viewer
                      </CardTitle>
                    </AccordionTrigger>

                    <AccordionContent className="p-0">
                      <CardContent className="px-2 py-2 border-t">
                        <SmartContentViewer
                          content={selectedVersionData?.config_data || {}}
                          maxHeight="fullHeight"
                          className="border-none"
                        />
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {loadingVersions
                ? "Loading versions..."
                : "Select a version to view details"}
            </div>
          )}
        </div>
        {isRestoreVersionAllowed && (
          <SheetFooter className="sticky bottom-0 z-50 px-4 py-3 border-t bg-background">
            <Button
              onClick={() => setOpenConfirmation(true)}
              className="bg-primary text-primary-foreground cursor-pointer"
              disabled={!selectedVersionData || !isRestoreVersionAllowed}
            >
              Restore this version
            </Button>
          </SheetFooter>
        )}
      </SheetContent>

      {openConfirmation && (
        <ConfirmationDialog
          open={openConfirmation}
          confirm={() => {
            handleRestoreVersionData(selectedVersionData, currentJson);
            handleToggleSheet();

            // Set version number
            if (selectedVersionData) {
              const formattedDate = selectedVersionData.created_at
                ? moment(selectedVersionData.created_at).format(
                    "MMM DD, YYYY hh:mm A",
                  )
                : "";

              setCurrentSelectedVersion?.(
                `v${selectedVersionData.version_number} - ${formattedDate}`,
              );
            } else {
              setCurrentSelectedVersion?.(null);
            }
          }}
          cancel={() => setOpenConfirmation(false)}
          title="Are you sure you want to restore this version?"
          description={`Restoring will overwrite the current ${
            entityType === "agent" ? "agent" : "template"
          } with the selected version.`}
        />
      )}
    </Sheet>
  );
};

export default VersionDetailsSheet;
