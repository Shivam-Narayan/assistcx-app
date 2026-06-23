"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { errorMessageHandler } from "@/helper/helper-function";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { handleSpaceValidation } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import * as url from "@/helper/url-helper";

const EditConnectionDialog = ({
  open,
  onOpenChange,
  selectedItem,
  onSubmitData,
  formLoading,
}: any) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [authSchemaform, setAuthSchemaform] = useState<any>({});
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [isGetCredential, setIsGetCredential] = useState(false);
  const [credentialData, setCredentialData] = useState<any>(null);

  const validationSchema = useMemo(() => {
    const fields = authSchemaform;

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
  }, [authSchemaform]);

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: any) => {
    const { name, ...rest } = data;
    const updateData = {
      name: data.name ?? "",
      credentials: { ...rest },
      provider_key: selectedItem.provider_key ?? "",
      auth_schema_key: selectedItem?.auth_schema_key ?? "",
    };
    onSubmitData?.(updateData);
  };

  const getCredentialDetails = async (id: any) => {
    if (loading) return;

    try {
      setIsGetCredential(true);
      const result = await axiosAuth.get(
        `${url.CONNECTIONS}/${id}/credentials`,
      );
      if (result.status === 200) {
        setCredentialData(result.data);
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setIsGetCredential(false);
    }
  };

  useEffect(() => {
    if (!open || !selectedItem?.auth_schema_key) return;
    const getFormDetails = async () => {
      if (!open || !selectedItem?.auth_schema_key) return;

      try {
        setCredentialLoading(true);

        const filters = {
          key: selectedItem.auth_schema_key,
        };

        const result = await axiosAuth.get(
          `/auth-schema-catalog?filters=${encodeURIComponent(
            JSON.stringify(filters),
          )}`,
        );

        if (result.status === 200) {
          setAuthSchemaform(result.data?.[0]?.input_fields || {});
        }
      } catch (error) {
        errorMessageHandler(error);
      } finally {
        setCredentialLoading(false);
      }
    };

    getFormDetails();
    getCredentialDetails(selectedItem?.id);
  }, [open, selectedItem?.auth_schema_key, axiosAuth]);

  useEffect(() => {
    if (!open) return;
    if (!authSchemaform || Object.keys(authSchemaform).length === 0) return;
    if (!credentialData) return;

    const credentials = credentialData.credentials || {};

    form.reset({
      name: selectedItem?.name || "",
      ...credentials,
    });
  }, [authSchemaform, credentialData, open]);

  const connectionIcon =
    selectedItem?.provider_key &&
    INTEGRATION_ICON_SRC[selectedItem.provider_key]
      ? INTEGRATION_ICON_SRC[selectedItem.provider_key]
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100] flex w-full max-w-xl flex-col gap-0 overflow-hidden p-0 max-h-[90vh]">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <DialogTitle className="flex items-center gap-2 text-lg font-medium">
              <div className="p-2 rounded-full w-fit h-fit bg-primary/10 text-primary">
                {connectionIcon ? (
                  <Image
                    src={connectionIcon}
                    alt="provider"
                    width={24}
                    height={24}
                    className="h-auto w-6"
                  />
                ) : null}
              </div>
              <span className="whitespace-nowrap">{selectedItem?.name}</span>
            </DialogTitle>
          </div>
          <DialogClose>
            <div className="p-1 rounded-md cursor-pointer hover:bg-secondary">
              <X />
            </div>
          </DialogClose>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Card className="gap-0 rounded-lg border-none bg-card p-0 text-card-foreground shadow-none">
            <CardContent className="flex flex-col gap-4 px-4 pt-4 pb-4">
              <div className="space-y-4">
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
                          {authSchemaform &&
                            Object.entries(authSchemaform).map(
                              ([key, field]: any) => (
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
                                        <Input
                                          type="text"
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
                              ),
                            )}
                        </div>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex items-center border-t bg-background px-4 py-3">
          <div className="ml-auto">
            <Button
              type="submit"
              form="connection-form"
              className="min-w-[7.5rem]"
              disabled={formLoading}
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditConnectionDialog;
