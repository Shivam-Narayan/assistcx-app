import {
  getIconsData,
  getIconSvg,
} from "@/components/icon-manager/icon-render-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getToolIcon } from "@/helper/helper-function";
import { defaultFolderIcon } from "@/lib/constants";

export const ViewToolInfo = ({ toolsData }: { toolsData: any }) => {
  const toolIcons = getIconsData("tool_icons");
  const defaultIcon =
    getIconSvg("tool-icon-huge", "tool_icons") || defaultFolderIcon;

  return (
    <Card className="shadow-none p-0 gap-0">
      <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex gap-3 text-foreground/80 items-center text-lg font-medium leading-none tracking-tight">
          <span>Tool Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-4 pb-4 flex flex-col">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-xl border bg-primary/10 text-primary border-primary/20 p-1.5 shrink-0">
            {getToolIcon(toolsData, toolIcons, defaultIcon)}
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-base font-medium text-foreground truncate">
              {toolsData?.tool_name || toolsData?.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {toolsData?.action || "—"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 pt-4">
          <span className="text-xs text-muted-foreground">Description</span>
          <p className="text-sm text-foreground leading-relaxed">
            {toolsData?.description || "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
