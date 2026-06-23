"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Columns3, Rows3, Table2 } from "lucide-react";

import { ConfirmationDialog } from "@/components/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import {
  getIconsData,
  getIconSvg,
} from "@/components/icon-manager/icon-render-component";
import {
  errorMessageHandler,
  formatNumberUS,
  getStatusColor,
  getTimeAgo,
} from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { getTableApi } from "@/app/(dashboard)/data-tables/hook/useTableApi";
import { DynamicTable } from "@/app/(dashboard)/data-tables/types/table-types";

import { useAgentConfigData } from "../hook/useAgentConfigData";
import { AgentFormValues } from "../schemas/agent-schema";
import ContextItemSelectModal from "./context-item-select-modal";
import DataTableSheetModal from "./data-table-sheet-modal";
import ContextSectionCard, {
  ContextRemoveItemButton,
} from "./context-section-card";

const DataTablesContextCard = ({ isEditing }: { isEditing: boolean }) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const { control, trigger, getValues, setValue } =
    useFormContext<AgentFormValues>();
  const [isDataTableSelectorOpen, setIsDataTableSelectorOpen] = useState(false);
  const [selectedDataTable, setSelectedDataTable] =
    useState<DynamicTable | null>(null);
  const [isDataTableSheetOpen, setIsDataTableSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(
    null,
  );
  const hasFetched = useRef(false);

  const { dataTableList, isDataTableLoading, getDataTableList } =
    useAgentConfigData();

  const dataTables = useWatch({
    control,
    name: "data_tables",
    defaultValue: [],
  });

  useEffect(() => {
    if (!loading && !hasFetched.current) {
      getDataTableList();
      hasFetched.current = true;
    }
  }, [loading]);

  const handleRemoveDataTable = (index: number) => {
    setPendingRemoveIndex(index);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = () => {
    if (pendingRemoveIndex === null) return;
    const current = getValues("data_tables") || [];
    const updated = current.filter(
      (_: any, i: number) => i !== pendingRemoveIndex,
    );
    setValue("data_tables", updated, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    trigger("data_tables");
    setPendingRemoveIndex(null);
    setConfirmOpen(false);
  };

  const handleViewDataTable = async (tableId: string) => {
    try {
      const tableData = await getTableApi(axiosAuth, tableId);
      if (tableData) {
        setSelectedDataTable(tableData);
        setIsDataTableSheetOpen(true);
      }
    } catch (err: any) {
      errorMessageHandler(err);
    }
  };

  const dataTablesEnriched = dataTables.map((table: any) => {
    const fromList = dataTableList.find((t: any) => t.id === table.id);
    return fromList ? { ...table, ...fromList } : table;
  });

  const dataTableIconsData = getIconsData("data_table_icons");
  const defaultDataTableIcon = getIconSvg("grid-table", "data_table_icons");

  return (
    <>
      <ContextSectionCard
        icon={<Table2 className="h-5 w-5" />}
        title="Data Tables"
        count={dataTables.length}
        selectLabel="Add Data Tables"
        onSelect={() => setIsDataTableSelectorOpen(true)}
        isEditing={isEditing}
        isEmpty={!dataTables.length}
        isLoading={isDataTableLoading}
        emptyIcon={<Table2 />}
        emptyTitle="No data tables added"
        emptyDescription="Link data tables to provide structured data to your agent"
      >
        <div className="space-y-3">
          {dataTablesEnriched.map((table: any, index: number) => {
            const updatedAt = table.updated_at || table.updatedAt;
            return (
              <Card
                key={table.id || index}
                className="relative p-0 gap-0 group shadow-none break-words overflow-hidden hover:bg-primary/5 hover:border-primary/20 cursor-pointer"
                onClick={() => handleViewDataTable(table.id)}
              >
                <CardContent className="grid gap-3 px-4 !py-4 relative">
                  <div className="flex gap-3 w-full min-w-0">
                    <div className="shrink-0">
                      <div className="p-2.5 bg-primary/10 text-primary rounded-full w-auto">
                        <div
                          className="h-full flex text-primary"
                          dangerouslySetInnerHTML={{
                            __html:
                              (dataTableIconsData as Record<string, string>)?.[
                                table.icon
                              ] ||
                              defaultDataTableIcon ||
                              "",
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-1 min-w-0">
                      <div className="flex flex-row justify-between items-start gap-2 min-w-0">
                        <div className="flex flex-col min-w-0 flex-1 pr-8">
                          <div className="flex flex-row w-full gap-x-2 items-center">
                            <ConditionalTooltip content={table.name}>
                              <p className="text-lg  font-medium text-foreground/90 line-clamp-1">
                                {table.name}
                              </p>
                            </ConditionalTooltip>
                            {table?.availability ? (
                              <span className="text-sm font-normal shrink-0">
                                <Badge
                                  variant="outline"
                                  className={`shrink-0 ${getStatusColor(table.availability)}`}
                                >
                                  {table.availability}
                                </Badge>
                              </span>
                            ) : null}
                          </div>
                          {/* {updatedAt ? (
                            <p className="text-xs text-muted-foreground">
                              Updated {getTimeAgo(updatedAt)}
                            </p>
                          ) : null} */}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {table.description || "No description"}
                      </p>

                      <div className="flex items-center gap-6 text-sm mt-2">
                        <div className="flex items-center gap-1">
                          <Columns3 className="h-4 w-4 text-muted-foreground " />
                          <span>
                            {" "}
                            {formatNumberUS(table?.columns?.length)}{" "}
                            {table?.columns?.length === 1
                              ? "column"
                              : "columns"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Rows3 className="h-4 w-4 text-muted-foreground " />
                          <span>
                            {" "}
                            {formatNumberUS(table?.rowCount)}{" "}
                            {table?.rowCount === 1 ? "row" : "rows"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="absolute top-3 right-3">
                      <ConditionalTooltip
                        content="Remove Data Table"
                        alwaysShow={true}
                        align="center"
                        showArrow={true}
                      >
                        <ContextRemoveItemButton
                          onRemove={(e) => {
                            e.stopPropagation();
                            handleRemoveDataTable(index);
                          }}
                        />
                      </ConditionalTooltip>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ContextSectionCard>

      <ContextItemSelectModal
        open={isDataTableSelectorOpen}
        setOpen={setIsDataTableSelectorOpen}
        data={dataTableList}
        isLoading={isDataTableLoading}
        selectedItems={dataTables}
        onAdd={(items) => {
          const transformed = (items || []).map((item: any) => ({
            id: item.id ?? "",
            icon: item.icon ?? "",
            name: item.name ?? "",
            description: item.description ?? "",
            availability: item.availability ?? "",
            updated_at: item.updated_at ?? "",
          }));
          setValue("data_tables", transformed, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          trigger("data_tables");
        }}
        dialogTitle="Data Tables"
        searchPlaceholder="Search data tables..."
        emptyTitle="No data tables found"
        emptyDescription="No data tables match your search."
        iconSet="data_table_icons"
        defaultIconKey="grid-table"
        context="data_tables"
      />

      <DataTableSheetModal
        isOpen={isDataTableSheetOpen}
        onClose={() => {
          setIsDataTableSheetOpen(false);
          setSelectedDataTable(null);
        }}
        table={selectedDataTable}
      />

      <ConfirmationDialog
        open={confirmOpen}
        confirm={handleConfirmRemove}
        cancel={() => {
          setConfirmOpen(false);
          setPendingRemoveIndex(null);
        }}
        title="Remove this data table?"
        description="This data table will be removed from the agent."
      />
    </>
  );
};

export default DataTablesContextCard;
