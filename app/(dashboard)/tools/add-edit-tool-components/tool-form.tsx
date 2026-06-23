"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import {
  getIconsData,
  getIconSvg,
} from "@/components/icon-manager/icon-render-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { defaultFolderIcon } from "@/lib/constants";
import { AddNewToolFormSchemaType } from "@/lib/schemas/tools-schemas";
import { handleSpaceValidation } from "@/lib/utils";
import { useAppSelector } from "@/redux/store";
import { useFormContext } from "react-hook-form";
import { apiTypes } from "./initial-form-state";
import { KeyValueList } from "./key-value-list";
import ToolActionCard from "./tool-action-card";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";
import { apiType, ToolFormProps } from "./tool-interfaces";
import { ViewToolInfo } from "./view-tool-info";

export const ToolForm = ({
  userEvents,
  handleFieldChange,
  getApiType,
  endPointMethod,
  setMethodSelectionHandler,
  setOpenModalType,
  setEditIndex,
  setEditDetails,
  setAddEditModalOpen,
  headersList,
  setHeadersList,
  queryParametersList,
  setQueryParametersList,
  supportsCustomFields,
}: ToolFormProps) => {
  const form = useFormContext<AddNewToolFormSchemaType>();
  const toolIcons = getIconsData("tool_icons");
  const defaultIcon =
    getIconSvg("tool-case", "tool_icons") || defaultFolderIcon;

  const toolsData = useAppSelector(
    (state) => state?.toolsDataReducer?.toolsDataReducer?.value,
  );
  return (
    <form className="flex flex-col space-y-4">
      {(userEvents === "addTool" ||
        (userEvents === "editTool" && !supportsCustomFields)) && (
        <Card className="shadow-none p-0 gap-0 ">
          <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle
              className="flex gap-3 text-foreground/80 items-center text-lg font-medium
           leading-none tracking-tight"
            >
              <span>Tool Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-4 pb-2 flex flex-col">
            <div className="space-y-3 pb-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => {
                  const showIntegrationIcon =
                    toolsData?.is_default &&
                    toolsData?.integration_key &&
                    INTEGRATION_ICON_SRC[toolsData.integration_key];
                  if (showIntegrationIcon && toolsData.integration_key) {
                    const iconSrc =
                      INTEGRATION_ICON_SRC[toolsData.integration_key];
                    return (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Tool Icon
                        </FormLabel>
                        <div className="flex items-center justify-start">
                          <div className="flex items-center justify-center rounded-md border border-border bg-muted p-3">
                            <img
                              src={iconSrc}
                              alt={toolsData.integration_key}
                              className="size-10 shrink-0"
                            />
                          </div>
                        </div>
                      </FormItem>
                    );
                  }
                  return (
                    <IconPicker
                      label="Tool Icon"
                      icons={toolIcons}
                      field={field}
                      defaultIcon={defaultIcon}
                    />
                  );
                }}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter name"
                        {...field}
                        maxLength={120}
                        minLength={6}
                        autoFocus={false}
                        autoComplete="off"
                        onChange={(e) => {
                          field.onChange(e);
                          if (userEvents == "addTool") handleFieldChange(e);
                        }}
                        onKeyDown={handleSpaceValidation}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Action</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter action"
                        {...field}
                        maxLength={120}
                        minLength={6}
                        autoFocus={false}
                        autoComplete="off"
                        disabled={userEvents == "editTool"}
                        onChange={(event) => {
                          const value =
                            event.target.value != null
                              ? event.target.value.replaceAll(/\s*/g, "")
                              : "";
                          field.onChange(value);
                        }}
                        onKeyDown={handleSpaceValidation}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Description
                    </FormLabel>
                    <FormControl>
                      <AutoGrowingTextarea
                        placeholder="Enter description"
                        maxLength={800}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {(userEvents === "viewTool" ||
        (userEvents === "editTool" && supportsCustomFields)) && (
        <ViewToolInfo toolsData={toolsData} />
      )}

      {(userEvents === "addTool" ||
        ((userEvents === "viewTool" || userEvents === "editTool") &&
          apiType.includes(toolsData?.api_type))) && (
        <ToolActionCard
          userEvents={userEvents}
          form={form}
          apiTypes={apiTypes}
          getApiType={getApiType}
          endPointMethod={endPointMethod}
          setMethodSelectionHandler={setMethodSelectionHandler}
        />
      )}

      {(userEvents === "addTool" ||
        ((userEvents === "viewTool" || userEvents === "editTool") &&
          apiType.includes(toolsData?.api_type))) && (
        <KeyValueList
          title="Headers"
          items={headersList} // ⬅ original array, no mapping
          userEvents={userEvents}
          onAdd={() => {
            setOpenModalType("header");
            setAddEditModalOpen(true);
          }}
          onEdit={(item, index) => {
            setOpenModalType("header");
            setEditIndex(index);
            setEditDetails(item);
            setAddEditModalOpen(true);
          }}
          onDelete={(index) => {
            const updated = [...headersList];
            updated.splice(index, 1);
            setHeadersList(updated);
          }}
        />
      )}
      {(userEvents === "addTool" ||
        ((userEvents === "viewTool" || userEvents === "editTool") &&
          apiType.includes(toolsData?.api_type))) &&
        endPointMethod && (
          <KeyValueList
            title="Query Parameters"
            items={queryParametersList} // ⬅ no mapping
            userEvents={userEvents}
            onAdd={() => {
              setOpenModalType("parameter");
              setAddEditModalOpen(true);
            }}
            onEdit={(item, index) => {
              setOpenModalType("parameter");
              setEditIndex(index);
              setEditDetails(item);
              setAddEditModalOpen(true);
            }}
            onDelete={(index) => {
              const updated = [...queryParametersList];
              updated.splice(index, 1);
              setQueryParametersList(updated);
            }}
          />
        )}
    </form>
  );
};
