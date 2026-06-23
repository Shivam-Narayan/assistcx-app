import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import HeaderHoverCard from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import VersionHistory from "@/components/version-history/version-history-page";
import { ChevronDown, ChevronUp, Download, Pencil, X } from "lucide-react";
import { useState } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import DocumentInstructionInput from "../document-instruction-input";

interface ViewTemplateProps {
  dataTemplate: any;
  handleRestoreVersionData: (data?: any) => void;
  convertDataInJson: () => string | React.ReactNode;
  DataSchemaInfo: any[];
  isCreateUpdateDataTemplate: boolean;
  handleEditDataTemplate: () => void;
  setOpenConfirmation: (open: boolean) => void;
  handleResetForm: () => void;
  DataTemplateInfo: any[];
  form: UseFormReturn<any>;
  userEvents: "addDataTemplate" | "editDataTemplate" | "viewDataTemplate";
  ViewDataSchemaJSON: boolean;
  viewDataSchemaJeson: (isView: boolean) => void;
}

export function ViewTemplate({
  dataTemplate,
  handleRestoreVersionData,
  convertDataInJson,
  DataSchemaInfo,
  isCreateUpdateDataTemplate,
  handleEditDataTemplate,
  setOpenConfirmation,
  handleResetForm,
  DataTemplateInfo,
  form,
  userEvents,
  ViewDataSchemaJSON,
  viewDataSchemaJeson,
}: ViewTemplateProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
        <div className="w-full flex justify-start items-center space-x-2 divide-x">
          <SheetTitle className="sr-only">Data Template</SheetTitle>
          <HeaderHoverCard
            title="Data Template"
            message="Configure data templates and define data schema to perform intelligent data extraction from different documents"
            type="sheet"
          />
        </div>

        {/* Version History */}
        <div className="flex items-center gap-2">
          <VersionHistory
            currentJson={dataTemplate}
            entityType="data_template"
            entityId={dataTemplate?.id}
            isRestoreVersionAllowed={isCreateUpdateDataTemplate}
            handleRestoreVersionData={handleRestoreVersionData}
          />
        </div>
        {isCreateUpdateDataTemplate && (
          <>
            <ConditionalTooltip
              content="Export"
              alwaysShow={true}
              align="center"
              showArrow={true}
            >
              <div
                onClick={() => setOpenConfirmation(true)}
                className="p-2 rounded-md cursor-pointer hover:bg-secondary"
              >
                <Download className="h-5 w-5" />
              </div>
            </ConditionalTooltip>
            <ConditionalTooltip
              content="Edit"
              alwaysShow={true}
              align="center"
              showArrow={true}
            >
              <div
                onClick={handleEditDataTemplate}
                className="p-2 rounded-md cursor-pointer hover:bg-secondary"
              >
                <Pencil className="h-5 w-5" />
              </div>
            </ConditionalTooltip>
          </>
        )}
        <SheetClose asChild>
          <div
            className="p-2 rounded-md cursor-pointer hover:bg-secondary"
            onClick={handleResetForm}
          >
            <X className="h-5 w-5" />
          </div>
        </SheetClose>
      </SheetHeader>
      <div className="grow">
        <div className="grid gap-5 px-4 pb-4">
          <Card className="shadow-none p-0 gap-0">
            <CardHeader className="border-b px-4 py-4! flex flex-row items-center justify-between space-y-0">
              <CardTitle
                className="flex gap-3 items-center text-lg font-medium
           leading-none tracking-tight"
              >
                <span>Common Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 py-2 flex flex-col divide-y divide-dashed overflow-wrap-anywhere">
              {DataTemplateInfo.map((row, index) => (
                <div key={index} className="flex flex-row px-4 py-2.5">
                  <div className="w-1/4 pr-4 font-semibold">
                    <Badge variant="secondary" className="text-sm">
                      {row.label}
                    </Badge>
                  </div>
                  <div className="w-3/4 flex gap-4 text-sm">{row?.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <FormProvider {...form}>
            <DocumentInstructionInput userEvents={userEvents} />
          </FormProvider>

          <Card className="shadow-none p-0 gap-0">
            <CardHeader
              className={`cursor-pointer border-b px-4 py-4! flex flex-row items-center justify-between space-y-0 `}
              onClick={() => {
                setIsCollapsed((prev) => !prev);
              }}
            >
              <HeaderHoverCard
                title="Data Schema"
                message={`Data fields for AI agents to extract data from the document. Provide proper field names, descriptions and data types.<br><br>
                      Data type could be: String, Integer, Decimal, List. Object.<br><br>
                      For object or list of objects, use description to provide the field names enclosed in angle brackets (&lt;field_name&gt;) followed by the description. Mention the data type in the description as 'integer type' or 'decimal type' etc.`}
                type="card"
              />
              <div className="flex gap-3 items-center">
                <span className="text-sm font-medium">JSON View</span>
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={ViewDataSchemaJSON}
                    onCheckedChange={viewDataSchemaJeson}
                    aria-readonly
                  />
                </div>

                {isCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                )}
              </div>
            </CardHeader>
            {!isCollapsed && (
              <CardContent className="p-4 grow space-y-3 overflow-y-auto">
                {ViewDataSchemaJSON ? (
                  <div className="px-4 py-4 rounded-b-lg whitespace-pre-wrap break-all text-sm">
                    {convertDataInJson()}
                  </div>
                ) : (
                  DataSchemaInfo?.map((row, index) => (
                    <div
                      key={index}
                      className="group gap-2 py-4 px-4 border rounded-lg space-y-3"
                    >
                      <div className="flex gap-2 font-semibold">
                        <div className="text-sm font-semibold min-w-0 max-w-full">
                          <ConditionalTooltip content={row?.label ?? ""}>
                            <Badge
                              variant="outline"
                              className="text-sm inline-flex max-w-[480px] overflow-hidden"
                            >
                              <span className="block w-full truncate">
                                {row.label}
                              </span>
                            </Badge>
                          </ConditionalTooltip>
                        </div>

                        {row.dataType && (
                          <Badge variant="secondary" className="text-sm w-fit">
                            <span className="truncate">{row.dataType}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        {" "}
                        <p className="text-sm whitespace-normal w-full">
                          {row?.value}
                        </p>
                      </div>
                      {row.keywords?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-medium">Keywords:</span>
                          {row.keywords
                            .filter((keyword: any) => keyword?.trim() !== "")
                            .map((keyword: any, idx: any) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="font-normal text-xs w-fit border border-gray-400"
                              >
                                {keyword.trim().toLowerCase()}
                              </Badge>
                            ))}
                        </div>
                      )}
                      {(row?.field_schema ?? []).length > 0 && (
                        <Card className="mt-4 p-0 gap-0 border border-dashed">
                          <CardHeader className="p-4 gap-0">
                            <CardTitle className="text-md">
                              Nested Fields
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 space-y-4 pt-0">
                            {(row.field_schema ?? []).map(
                              (nested: any, nestedIndex: any) => (
                                <div
                                  key={nestedIndex}
                                  className="border p-3 rounded-md bg-muted/50 space-y-2 relative"
                                >
                                  <div className="flex gap-2 font-semibold items-center">
                                    <Badge variant="outline">
                                      {nested.fieldName
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (l: any) =>
                                          l.toUpperCase(),
                                        )}
                                    </Badge>
                                    <Badge variant="secondary">
                                      {nested.dataType}
                                    </Badge>
                                  </div>
                                  <div className="pl-1 mt-2">
                                    <p className="text-sm whitespace-normal w-full">
                                      {nested.fieldDescription}
                                    </p>
                                  </div>
                                </div>
                              ),
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
