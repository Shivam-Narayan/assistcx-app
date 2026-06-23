import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorMessageHandler } from "@/helper/helper-function";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Pencil, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { cn, handleSpaceValidation } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const ConnectionManageDialog = ({
  isOpen,
  onOpenChange,
  schemaKey,
  handleAuthTypeChange,
  authSchemaFields,
  credentialLoading,
  onSubmitData,
  connectionLoading,
  editingConnectionId,
  connectionName,
  currentMode,
  setCurrentMode,
  handleEditOpen,
  deatilsData,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  schemaKey: string | null;
  handleAuthTypeChange?: (authType: string) => void;
  authSchemaFields?: any[];
  credentialLoading?: boolean;
  onSubmitData?: (data: any) => void;
  connectionLoading?: boolean;
  editingConnectionId: string | null;
  connectionName: string;
  currentMode: "view" | "edit";
  setCurrentMode: (mode: "view" | "edit") => void;
  handleEditOpen: () => void;
  deatilsData: any;
}) => {
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("credentials");
  const { axiosAuth } = useAxiosAuth();
  const [credentialsFetching, setCredentialsFetching] = useState(false);
  const [existingCredentials, setExistingCredentials] = useState<Record<
    string,
    string
  > | null>(null);

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

  useEffect(() => {
    if (isOpen && schemaKey) {
      handleAuthTypeChange?.(schemaKey);
      form.reset({});
      setExistingCredentials(null);
    }
  }, [isOpen, schemaKey]);

  useEffect(() => {
    if (!isOpen || !editingConnectionId) return;

    const fetchCredentials = async () => {
      try {
        setCredentialsFetching(true);
        const result = await axiosAuth.get(
          `/connections/${editingConnectionId}/credentials`,
        );
        if (result?.status === 200) {
          setExistingCredentials(result.data);
        }
      } catch (error: any) {
        errorMessageHandler(error?.response?.data?.detail);
      } finally {
        setCredentialsFetching(false);
      }
    };

    fetchCredentials();
  }, [isOpen, editingConnectionId]);

  useEffect(() => {
    const fields = authSchemaFields?.[0]?.input_fields;
    if (!fields) return;

    const defaults: Record<string, string> = { name: connectionName };
    Object.keys(fields).forEach((key) => {
      defaults[key] = "";
    });

    if (existingCredentials) {
      const creds = existingCredentials.credentials ?? existingCredentials;
      Object.keys(fields).forEach((key) => {
        if ((creds as any)?.[key]) {
          defaults[key] = (creds as any)[key];
        }
      });
    }

    form.reset(defaults);
  }, [authSchemaFields, existingCredentials]);

  const onSubmit = async (data: any) => {
    const { name, ...rest } = data;
    const updateData = {
      name: data.name,
      credentials: { ...rest },
      provider_key: authSchemaFields?.[0]?.provider_key,
      auth_schema_key: authSchemaFields?.[0]?.key,
    };
    onSubmitData?.(updateData);
  };
  const resetToOriginalValues = () => {
    const fields = authSchemaFields?.[0]?.input_fields;
    if (!fields) return;

    const defaults: Record<string, string> = { name: connectionName };

    Object.keys(fields).forEach((key) => {
      defaults[key] = "";
    });

    if (existingCredentials) {
      const creds = existingCredentials.credentials ?? existingCredentials;

      Object.keys(fields).forEach((key) => {
        if ((creds as any)?.[key]) {
          defaults[key] = (creds as any)[key];
        }
      });
    }

    form.reset(defaults);
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab("credentials");
    }
  }, [isOpen]);

  const showEdit =
    !credentialLoading && currentMode === "view" && activeTab === "credentials";
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "z-[100] flex max-h-[min(90vh,880px)] w-full flex-col gap-0 overflow-visible p-0",
          "min-w-[min(100%,18rem)] max-w-xl sm:max-w-2xl",
        )}
      >
        <DialogHeader className="sticky rounded-lg top-0 z-10 flex px-4 py-3 flex-row justify-between items-center bg-background">
          <div className="w-full">
            <DialogTitle>
              {currentMode === "edit" ? "Edit Connection" : "View Connection"}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2">
            {showEdit && (
              <div
                onClick={handleEditOpen}
                className="p-2 rounded-md cursor-pointer hover:bg-secondary"
              >
                <Pencil className="h-5 w-5" />
              </div>
            )}

            <DialogClose asChild>
              <div className="p-1 rounded-md cursor-pointer hover:bg-secondary">
                <X />
              </div>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-[400px] max-h-[70vh] flex flex-col">
          {credentialLoading || credentialsFetching ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto px-4 pb-4">
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
                    {deatilsData?.[0]?.description ? (
                      <p className="leading-relaxed text-muted-foreground">
                        {deatilsData?.[0]?.description}
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
                      {deatilsData?.[0]?.tools?.length > 0 ? (
                        <>
                          <p className="text-md text-muted-foreground">
                            Tools availble for your integration.
                          </p>
                          {deatilsData?.[0]?.tools?.map((tool: any) => (
                            <div
                              className="flex gap-2 w-full min-w-0 border p-2 rounded-md"
                              key={tool.action}
                            >
                              <div className="p-1.5  rounded-full w-fit h-fit shrink-0 bg-primary/10 text-primary">
                                <img
                                  src={
                                    INTEGRATION_ICON_SRC[tool?.integration_key]
                                  }
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
                    {deatilsData?.[0]?.triggers?.length > 0 ? (
                      <>
                        <p className="text-md text-muted-foreground">
                          Triggers available for your integration.
                        </p>
                        {deatilsData?.[0]?.triggers?.map((trigger: any) => (
                          <div
                            className="flex gap-2 w-full min-w-0 border p-2 rounded-md"
                            key={trigger.slug}
                          >
                            <div className="p-1.5  rounded-full w-fit h-fit shrink-0 bg-primary/10 text-primary">
                              <img
                                src={
                                  INTEGRATION_ICON_SRC[trigger?.integration_key]
                                }
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
                          No triggers information available for this
                          integration.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent
                    value="credentials"
                    className="mt-0 space-y-3 text-sm min-h-[320px] max-h-[40vh] overflow-y-auto"
                  >
                    {currentMode === "edit" ? (
                      <Form {...form}>
                        <form
                          id="edit-connection-form"
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
                                  Give your connection a friendly name to
                                  identify it in your workflows and settings
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
                          <div className="bg-muted/50 p-4 border rounded-md">
                            <div className="bg-muted/30 rounded-md space-y-4">
                              {authSchemaFields?.[0]?.input_fields &&
                                Object.entries(
                                  authSchemaFields[0].input_fields,
                                ).map(([key, field]: any) => (
                                  <FormField
                                    key={key}
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
                                          <div className="relative">
                                            <Input
                                              type={
                                                field.type === "password"
                                                  ? showPassword[key]
                                                    ? "text"
                                                    : "password"
                                                  : "text"
                                              }
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
                                              className={
                                                field.type === "password"
                                                  ? "pr-10"
                                                  : ""
                                              }
                                            />

                                            {field.type === "password" && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setShowPassword((prev) => ({
                                                    ...prev,
                                                    [key]: !prev[key],
                                                  }))
                                                }
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                              >
                                                {showPassword[key] ? (
                                                  <EyeOff className="h-4 w-4" />
                                                ) : (
                                                  <Eye className="h-4 w-4" />
                                                )}
                                              </button>
                                            )}
                                          </div>
                                        </FormControl>

                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                ))}{" "}
                            </div>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Connection Name
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Give your connection a friendly name to identify it
                            in your workflows and settings
                          </p>

                          <div className="border rounded-md px-3 py-2 bg-muted/30 text-sm">
                            {form.getValues("name") || "-"}
                          </div>
                        </div>

                        <p className="text-sm font-medium text-foreground">
                          Connection Credentials
                        </p>

                        <div className="bg-muted/50 p-4 border rounded-md">
                          <div className="bg-muted/30 rounded-md space-y-4">
                            {authSchemaFields?.[0]?.input_fields &&
                              Object.entries(
                                authSchemaFields[0].input_fields,
                              ).map(([key, field]: any) => {
                                const value = form.getValues(key);

                                return (
                                  <div key={key} className="space-y-2">
                                    <p
                                      className={`text-sm font-medium text-foreground`}
                                    >
                                      {field.label}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                      {field.description}
                                    </p>

                                    <div className="border break-all rounded-md px-3 py-2 bg-muted/30 text-sm flex justify-between items-center">
                                      <span>
                                        {field.type === "password"
                                          ? value
                                            ? showPassword[key]
                                              ? value
                                              : "••••••••••••"
                                            : "-"
                                          : value || "-"}
                                      </span>

                                      {field.type === "password" && value && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setShowPassword((prev) => ({
                                              ...prev,
                                              [key]: !prev[key],
                                            }))
                                          }
                                          className="ml-2 text-muted-foreground hover:text-foreground"
                                        >
                                          {showPassword[key] ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {currentMode === "edit" && activeTab === "credentials" && (
                <DialogFooter className="border-t px-4 py-3 bg-background">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetToOriginalValues();
                      setShowPassword({});
                      setCurrentMode("view");
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    form="edit-connection-form"
                    disabled={connectionLoading}
                  >
                    {connectionLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Update
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionManageDialog;
