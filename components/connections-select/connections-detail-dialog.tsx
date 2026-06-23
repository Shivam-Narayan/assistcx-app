"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, handleSpaceValidation } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getIconSvg } from "../icon-manager/icon-render-component";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";

export type IntegrationDetailDialogProps = {
  onBack: () => void;
  authSchemaFields?: any[];
  credentialLoading?: boolean;
  onSubmitData?: (data: any) => void;
  connectionLoading?: boolean;
  detailIntegration?: any;
  step?: string;
};

export function ConnectionsDetailDialog({
  onBack,
  authSchemaFields,
  credentialLoading,
  onSubmitData,
  connectionLoading,
  detailIntegration,
  step,
}: IntegrationDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("credentials");

  const validationSchema = useMemo(() => {
    const fields = authSchemaFields?.[0]?.input_fields;

    const shape: Record<string, z.ZodTypeAny> = {
      name: z.string().nonempty("Connection name is required"),
    };

    if (fields) {
      Object.entries(fields).forEach(([key, field]: any) => {
        shape[key] = field.required
          ? z.string().nonempty(`${field.label} is required`)
          : z.string().optional();
      });
    }

    return z.object(shape);
  }, [authSchemaFields]);

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {},
  });

  const defaultIcon = getIconSvg("pencil-ruler", "tool_icons");

  const onSubmit = async (data: any) => {
    const { name, ...rest } = data;
    const updateData = {
      name: data.name ?? "",
      credentials: { ...rest },
      provider_key: detailIntegration.key ?? "",
      auth_schema_key: authSchemaFields?.[0]?.key ?? "",
    };

    onSubmitData?.(updateData);
  };

  useEffect(() => {
    if (step === "detail") {
      form.reset({});
      setActiveTab("credentials");
    }
  }, [step]);
  return (
    <DialogContent
      showCloseButton={false}
      className={cn(
        "z-[100] flex max-h-[min(90vh,880px)] w-full flex-col gap-0 overflow-visible p-0",
        "min-w-[min(100%,18rem)] max-w-xl sm:max-w-2xl",
      )}
    >
      <DialogHeader className="flex rounded-lg shrink-0 flex-row items-center justify-between gap-3 space-y-0  bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium">
            <div className="h-fit w-fit shrink-0 rounded-full bg-muted p-1.5 border text-foreground">
              <img
                src={detailIntegration?.logo_url}
                alt={detailIntegration?.name}
                className="h-4 w-4 object-contain"
              />
            </div>
            <span className="whitespace-nowrap">{detailIntegration?.name}</span>
          </DialogTitle>
        </div>
        <DialogClose>
          <div
            className="p-1 rounded-md cursor-pointer hover:bg-secondary"
            onClick={onBack}
          >
            <X />
          </div>
        </DialogClose>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="gap-0 rounded-lg border-none bg-card p-0 text-card-foreground shadow-none">
          <CardContent className="flex flex-col gap-4 px-4 pb-3">
            <Tabs
              defaultValue="credentials"
              className="min-w-0 "
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList
                className="mb-2 h-9 w-full justify-start sm:w-auto border-b"
                variant="line"
              >
                <TabsTrigger value="credentials" className="cursor-pointer">
                  Credentials
                </TabsTrigger>
                <TabsTrigger value="tools" className="cursor-pointer">
                  Tools
                </TabsTrigger>
                <TabsTrigger value="trigger" className="cursor-pointer">
                  Trigger
                </TabsTrigger>
                <TabsTrigger value="Overview" className="cursor-pointer">
                  Overview
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="Overview"
                className="mt-0 space-y-3 text-sm min-h-[320px] max-h-[40vh] overflow-y-auto"
              >
                {detailIntegration?.description.length > 0 ? (
                  <p className="leading-relaxed text-muted-foreground">
                    {detailIntegration?.description}
                  </p>
                ) : (
                  <div className="min-h-[320px] flex items-center justify-center">
                    <p className="text-md text-muted-foreground">
                      No description available for your integration.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent
                value="tools"
                className="mt-0 space-y-3 text-sm min-h-[320px] max-h-[40vh] overflow-y-auto"
              >
                <div className="space-y-3">
                  {detailIntegration?.tools?.length > 0 ? (
                    <>
                      <p className="text-md text-muted-foreground">
                        Tools availble for your integration.
                      </p>
                      {detailIntegration?.tools?.map((tool: any) => (
                        <div
                          className="flex gap-2 w-full min-w-0 border p-2 rounded-md"
                          key={tool.action}
                        >
                          <div className="p-1.5  rounded-full w-fit h-fit shrink-0 bg-primary/10 text-primary">
                            <img
                              src={INTEGRATION_ICON_SRC[tool?.integration_key]}
                              alt={tool?.name}
                              className="h-4 w-4 object-contain"
                            />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <p className="font-medium text-foreground/90 leading-tight">
                              {tool?.name}
                            </p>

                            <p className="text-xs mt-1 leading-snug text-muted-foreground leading-relaxed line-clamp-2">
                              {tool?.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="min-h-[320px] flex items-center justify-center">
                      <p className="text-md text-muted-foreground">
                        No tools information available for this integration.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="trigger"
                className="mt-0 space-y-3 text-sm min-h-[320px] max-h-[40vh] overflow-y-auto"
              >
                {detailIntegration?.triggers?.length > 0 ? (
                  <>
                    <p className="text-md text-muted-foreground">
                      Triggers available for your integration.
                    </p>
                    {detailIntegration?.triggers?.map((trigger: any) => (
                      <div
                        className="flex gap-2 w-full min-w-0 border p-2 rounded-md"
                        key={trigger.slug}
                      >
                        <div className="p-1.5  rounded-full w-fit h-fit shrink-0 bg-primary/10 text-primary">
                          <img
                            src={INTEGRATION_ICON_SRC[trigger?.integration_key]}
                            alt={trigger?.name}
                            className="h-4 w-4 object-contain"
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <p className="font-medium text-foreground/90 leading-tight">
                            {trigger?.name}
                          </p>
                          <p className="text-xs mt-1 leading-snug text-muted-foreground leading-relaxed line-clamp-2">
                            {trigger?.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="min-h-[320px] flex items-center justify-center">
                    <p className="text-md text-muted-foreground">
                      No triggers information available for this integration.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent
                value="credentials"
                className="mt-0 space-y-3 text-sm min-h-[320px] max-h-[40vh] overflow-y-auto"
              >
                <div className="space-y-4 px-1">
                  {credentialLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Form {...form}>
                      <form
                        id="connection-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-foreground required">
                                Connection Name
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                Give your connection a friendly name to identify
                                it in your workflows and settings
                              </p>

                              <FormControl>
                                <Input
                                  placeholder="Enter connection name"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <p className="text-sm font-medium text-foreground">
                          Connection Credentials
                        </p>
                        <div className="bg-muted/30 p-4 border rounded-md">
                          <div className=" rounded-md space-y-4">
                            {authSchemaFields?.[0]?.input_fields &&
                              Object.entries(
                                authSchemaFields[0].input_fields,
                              ).map(([key, field]: any) => (
                                <FormField
                                  key={`${key}-${field?.label}`}
                                  control={form.control}
                                  name={key}
                                  render={({ field: formField }) => (
                                    <FormItem className="space-y-2">
                                      <FormLabel
                                        className={`text-foreground ${field.required ? "required" : ""}`}
                                      >
                                        {field.label}
                                      </FormLabel>
                                      <p className="text-xs text-muted-foreground">
                                        {field.description}
                                      </p>

                                      <FormControl>
                                        <Input
                                          type={"text"}
                                          placeholder={
                                            field.example || field.label
                                          }
                                          {...formField}
                                          value={formField.value ?? ""}
                                          onKeyDown={handleSpaceValidation}
                                          autoComplete={
                                            field.type === "password"
                                              ? "new-password"
                                              : "off"
                                          }
                                        />
                                      </FormControl>

                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              ))}
                          </div>
                        </div>
                      </form>
                    </Form>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <DialogFooter className="flex items-center border-t bg-background px-4 py-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>

        <div className="ml-auto">
          {activeTab === "credentials" && (
            <Button
              type="submit"
              form="connection-form"
              className="min-w-[7.5rem]"
              disabled={connectionLoading}
            >
              {connectionLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Connect
            </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
