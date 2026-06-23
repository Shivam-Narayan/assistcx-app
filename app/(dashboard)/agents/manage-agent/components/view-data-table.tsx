import {
  COLUMN_TYPE_OPTIONS,
  DynamicTable,
} from "@/app/(dashboard)/data-tables/types/table-types";
import { CollapsibleContent } from "@/components/collapsible-content";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatNumberUS,
  getStatusColor,
  getTimeAgo,
} from "@/helper/helper-function";
import { capitalize } from "@/lib/utils";
import { Columns3, Rows3 } from "lucide-react";
interface ViewDataTableProps {
  table: DynamicTable;
}

const ViewDataTable = ({ table }: ViewDataTableProps) => {
  const defaultIcon = getIconSvg("grid-table", "data_table_icons");

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-none gap-0 p-0">
        <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-medium leading-none tracking-tight">
            Table Details
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-xl border bg-primary/10 text-primary border-primary/20 p-1.5 shrink-0">
              <div
                className="w-6 h-6 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-[1.5]"
                dangerouslySetInnerHTML={{
                  __html:
                    getIconSvg(table?.icon, "data_table_icons") || defaultIcon,
                }}
              />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="text-base font-medium text-foreground truncate">
                {table?.name}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated {getTimeAgo(table?.updatedAt)}
              </p>
            </div>
            {table?.availability ? (
              <span className="text-sm font-normal shrink-0 ml-auto">
                <Badge
                  variant="outline"
                  className={`${getStatusColor(
                    table?.availability,
                  )} whitespace-nowrap`}
                >
                  {table?.availability}
                </Badge>
              </span>
            ) : null}
          </div>

          {table?.description && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Description</span>
              <CollapsibleContent
                className="prose prose-sm max-w-none dark:prose-invert"
                gradientStart="from-slate-50"
                maxHeight={50}
              >
                <p className="text-sm text-foreground leading-relaxed">
                  {table?.description}
                </p>
              </CollapsibleContent>
            </div>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Columns3 className="h-4 w-4" />
              <span>
                {formatNumberUS(table?.columns.length)}{" "}
                {table.columns.length === 1 ? "column" : "columns"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Rows3 className="h-4 w-4" />
              <span>
                {formatNumberUS(table?.rowCount)}{" "}
                {table?.rowCount === 1 ? "row" : "rows"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {table.columns.length > 0 && (
        <Card className="shadow-none gap-0 p-0">
          <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium leading-none tracking-tight">
              Columns
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({table?.columns?.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-4">
            <div className="flex flex-col gap-3">
              {table.columns.map((col) => {
                const typeOption = COLUMN_TYPE_OPTIONS.find(
                  (t) => t.value === col.type,
                );
                console.log(col, "col");
                const TypeIcon = typeOption?.icon;
                return (
                  <div
                    key={col?.id}
                    className="flex flex-col gap-1.5 p-3 rounded-lg border bg-muted/20"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {col?.name}
                        {col?.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        {typeOption && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 text-xs"
                          >
                            {TypeIcon && <TypeIcon className="h-3 w-3" />}
                            {capitalize(typeOption?.label)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {col?.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {col?.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewDataTable;
