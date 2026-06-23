import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTypeIcon,
  getTypeLabel,
  isFieldRequired,
} from "@/helper/helper-function";
import { InputSchemaData } from "./tool-interfaces";

interface ViewToolProps {
  inputSchemaData: InputSchemaData;
}
export function ViewTool({ inputSchemaData }: ViewToolProps) {
  return (
    <Card className="shadow-none p-0 gap-0 ">
      <CardHeader className="border-b px-4 py-4! flex flex-row items-center justify-between space-y-0">
        <CardTitle
          className="flex gap-3 text-foreground/80 items-center text-lg font-medium  
               leading-none tracking-tight"
        >
          <span>Input Data </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex flex-col space-y-4">
        <div className="grid gap-4">
          {Object.entries(inputSchemaData).map(([key, value]) => {
            const isRequired = isFieldRequired(value);
            return (
              <div
                key={key}
                className="flex gap-2 flex-col rounded-xl p-3 border border-border bg-muted"
              >
                <div className="flex items-center justify-between ">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center bg-primary/10 rounded-md p-1.5">
                      {getTypeIcon(value)}
                    </div>

                    {/* Container holds the title and default, stacked column */}
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-foreground/80">
                        {value?.title}
                        {isRequired && (
                          <span className="text-destructive text-base">
                            &nbsp;*
                          </span>
                        )}
                      </span>
                      {value?.default !== undefined &&
                        value?.default !== null && (
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>Default:</span>
                            <span className="bg-background px-1 py-0.5 leading-none rounded-sm border border-border">
                              {value.default}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {getTypeLabel(value)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
