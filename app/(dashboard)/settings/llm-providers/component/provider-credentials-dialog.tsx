"use client";

import HeaderHoverCard from "@/components/header";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { activateIntegrationSchema } from "@/lib/schemas/integrations-schemas";
import { handleSpaceValidation } from "@/lib/utils";
import { IntegrationsItem } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ProviderCredentialsDialogProps } from "./types";
import { ICONS_LIST } from "@/components/icon-manager/icons-list";

export const ProviderCredentialsDialog = ({
  provider,
  open,
  onOpenChange,
  onActivated,
  mode,
}: ProviderCredentialsDialogProps) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [integrationDetails, setIntegrationDetails] =
    useState<IntegrationsItem | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isManage = mode === "manage";

  const validationSchema = useMemo(
    () => activateIntegrationSchema(integrationDetails),
    [integrationDetails],
  );

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {},
  });

  const fetchIntegrationDetails = async () => {
    if (loading) return;
    setIsFetchingDetails(true);
    try {
      const result = await axiosAuth.get(
        `${url.GET_INTEGRATIONS_LIST}/${provider.id}`,
      );
      if (result?.status === 200) {
        const details: IntegrationsItem = result?.data?.integrations[0];
        setIntegrationDetails(details);
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const fetchAndPrefillCredentials = async (details: IntegrationsItem) => {
    try {
      const result = await axiosAuth.get(
        `${url.INTEGRATION_CREDENTIALS}/${provider.id}/credentials`,
      );
      if (result?.status === 200 && result.data?.credentials) {
        const creds: Record<string, string> = result.data.credentials;
        const userFields = details?.auth_schema_fields?.user ?? {};
        const prefillData = Object.keys(userFields).reduce(
          (acc, key) => {
            const field = userFields[key];
            if (field?.name) {
              acc[field.name] = creds[field.name.toUpperCase()] ?? "";
            }
            return acc;
          },
          {} as Record<string, string>,
        );
        form.reset(prefillData);
      }
    } catch {
      console.error("Failed to fetch credentials for pre-filling the form.");
    }
  };

  useEffect(() => {
    if (open && provider?.id && !loading) {
      setIntegrationDetails(null);
      form.reset({});
      fetchIntegrationDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, provider?.id, loading]);

  useEffect(() => {
    if (integrationDetails) {
      const userFields = integrationDetails?.auth_schema_fields?.user ?? {};
      const emptyDefaults = Object.keys(userFields).reduce(
        (acc, key) => {
          const field = userFields[key];
          if (field?.name) acc[field.name] = "";
          return acc;
        },
        {} as Record<string, string>,
      );

      form.reset(emptyDefaults);
      fetchAndPrefillCredentials(integrationDetails);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationDetails]);

  const onSubmit = async (data: Record<string, string>) => {
    if (loading || isSubmitting) return;
    setIsSubmitting(true);

    const requestBody = {
      key: integrationDetails?.key ?? "",
      preset: integrationDetails?.auth_schema_fields?.preset ?? {},
      credentials: integrationDetails?.auth_schema_fields?.user
        ? Object.keys(integrationDetails.auth_schema_fields.user).reduce(
            (acc, key) => {
              const field = integrationDetails.auth_schema_fields.user?.[key];
              if (field?.name) {
                acc[field.name.toUpperCase()] = data[field.name]?.trim() ?? "";
              }
              return acc;
            },
            {} as Record<string, string>,
          )
        : {},
    };

    try {
      const result = await axiosAuth.post(
        `${url.ACTIVATE_LLM_PROVIDER}/${provider.id}/activate`,
        requestBody,
      );
      if (result.status === 200) {
        successMessageHandler(
          isManage
            ? "Provider updated successfully"
            : "Provider activated successfully",
        );
        onOpenChange(false);
        onActivated?.();
      }
    } catch (error: any) {
      errorMessageHandler(
        error?.response?.data?.detail || "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const userFields = integrationDetails?.auth_schema_fields?.user;
  const sortedFieldKeys = userFields
    ? Object.keys(userFields).sort((a, b) => a.localeCompare(b))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,640px)] w-full flex-col gap-0 overflow-visible p-0 min-w-[min(100%,18rem)] max-w-lg sm:max-w-xl"
        onOpenAutoFocus={(e: any) => e?.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="sticky border-b rounded-t-lg top-0 z-10 flex px-4 py-3 flex-row justify-between items-center bg-background">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md bg-muted shrink-0"
              dangerouslySetInnerHTML={{
                __html:
                  ICONS_LIST.ai_icons[
                    provider.iconKey as keyof typeof ICONS_LIST.ai_icons
                  ] || "",
              }}
            />
            <div className="flex flex-col ">
              <DialogTitle className="text-sm font-medium">
                {isManage ? `${provider.name}` : `${provider.name}`}
              </DialogTitle>
            </div>
          </div>
          <div
            className="p-1 rounded-md cursor-pointer hover:bg-secondary"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isFetchingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-4 w-6" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="space-y-3">
                  {sortedFieldKeys.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No credentials required for this provider.
                    </p>
                  )}
                  {sortedFieldKeys.map((key) => {
                    const field = userFields?.[key];
                    if (!field?.name) return null;
                    return (
                      <FormField
                        key={key}
                        control={form.control}
                        name={field.name as string}
                        render={({ field: formField }) => (
                          <FormItem>
                            <HeaderHoverCard
                              title={field?.label}
                              message={field?.description}
                              type="field"
                              isRequired={field?.required}
                            />
                            <FormControl>
                              <Input
                                placeholder={field?.example || field?.label}
                                {...formField}
                                onKeyDown={handleSpaceValidation}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>

                <div className="sticky bottom-0 z-10 bg-background pt-2 pb-1 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isFetchingDetails}
                    className="cursor-pointer"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    )}
                    {isManage ? "Update" : "Activate"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
