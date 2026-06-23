import HeaderHoverCard from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface CredentialAddSheetProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  integration: any;
  fetchIntegrationsList: () => void;
  isAllowedViewCredentials: boolean;
}

type Preset = {
  token_url: string;
  scope: string;
};

type Credentials = {
  CLIENT_ID: string;
  TENANT_ID: string;
  CLIENT_SECRET: string;
};

export type CredentialsInfo = {
  id: string;
  key: string;
  preset: Preset;
  credentials: Credentials;
};

const CredentialAddSheet = ({
  open,
  onOpenChange,
  integration,
  fetchIntegrationsList,
  isAllowedViewCredentials,
}: CredentialAddSheetProps) => {
  const { axiosAuth, loading } = useAxiosAuth();

  const [isLoading, setIsLoading] = useState(false);

  const [credentialsData, setCredentialsData] =
    useState<CredentialsInfo | null>(null);

  const [integrationsDeatils, setIntegrationsDeatils] =
    useState<IntegrationsItem | null>(null);

  const validationSchema = useMemo(
    () => activateIntegrationSchema(integrationsDeatils),
    [integrationsDeatils],
  );

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: Record<string, string>) => {
    if (!loading) {
      setIsLoading(true);
      const requestBody = {
        key: integrationsDeatils?.key ?? "",
        preset: integrationsDeatils?.auth_schema_fields?.preset ?? {},
        credentials: integrationsDeatils?.auth_schema_fields?.user
          ? Object.keys(integrationsDeatils.auth_schema_fields.user).reduce(
              (acc, key) => {
                const field =
                  integrationsDeatils.auth_schema_fields.user?.[key];
                if (field && field.name) {
                  acc[field.name.toUpperCase()] =
                    data[field.name]?.trim() ?? "";
                }
                return acc;
              },
              {} as Record<string, string>,
            )
          : {},
      };

      try {
        const API_ENDPOINT = `${url.ACTIVATE_INTEGRATION}/${integration.id}/activate`;
        const result = await axiosAuth.post(API_ENDPOINT, requestBody);
        if (result.status === 200) {
          getIntegrationsDetails();
          fetchIntegrationsList();
          successMessageHandler("Integration activated successfully");
        }
      } catch (error) {
        errorMessageHandler(error);
      } finally {
        onCancel();
        setIsLoading(false);
      }
    }
  };

  const onCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const getIntegrationsDetails = async () => {
    let API_ENDPOINT_PATH = `${url.GET_INTEGRATIONS_LIST}/${integration.id}`;
    try {
      const result = await axiosAuth.get(API_ENDPOINT_PATH);
      if (result?.status === 200) {
        setIntegrationsDeatils(result?.data?.integrations[0]);
      }
    } catch (error: any) {
      if (error.response) {
        errorMessageHandler(
          error.response.data.detail || "Something went wrong",
        );
      }
    }
  };

  const getCredentialsData = async () => {
    let API_ENDPOINT_PATH: string = `${url.INTEGRATION_CREDENTIALS}/${integration.id}/credentials`;

    try {
      const result = await axiosAuth.get(API_ENDPOINT_PATH);
      if (result?.status === 200) {
        let data = result?.data;
        setCredentialsData(data);
      }
    } catch (error) {
      errorMessageHandler(error);
    }
  };

  useEffect(() => {
    if (open) {
      getIntegrationsDetails();
      getCredentialsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (integrationsDeatils?.auth_schema_fields?.user) {
      const defaults = Object.keys(
        integrationsDeatils.auth_schema_fields.user,
      ).reduce(
        (acc, key) => {
          const field = integrationsDeatils.auth_schema_fields.user?.[key];
          if (field?.name) acc[field.name] = "";
          return acc;
        },
        {} as Record<string, string>,
      );

      form.reset(defaults);
    }
  }, [integrationsDeatils, form]);

  const Authtype: string = integration?.auth_type
    ? integration.auth_type.replace("_", " ")
    : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-y-auto overflow-x-hidden">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="w-full flex justify-start items-center space-x-2 divide-x">
            <SheetTitle className="px-3 text-lg font-medium">
              Activate Integration
            </SheetTitle>
          </div>
          <div
            className="bg-background p-1 rounded-md cursor-pointer hover:bg-secondary"
            onClick={() => onOpenChange(false)}
          >
            <SheetClose asChild>
              <div className="p-1 rounded-md cursor-pointer hover:bg-secondary">
                <X />
              </div>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="grow">
          <div className="grid gap-5 px-4 pb-4">
            <Card className="rounded-lg border bg-card text-card-foreground shadow-none p-0 gap-0">
              <div className="md:p-4 border-b pb-2 mb-2 flex items-center justify-between">
                {/* Left side: Title and Badge */}
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium tracking-tight">
                    Credentials
                  </h3>
                  <Badge variant="outline" className="text-sm">
                    Auth Type: {Authtype}
                  </Badge>
                </div>
              </div>
              <CardContent className="px-4 pb-2">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col h-full"
                >
                  <div className="flex flex-col gap-4 pb-2 whitespace-pre-wrap break-words">
                    <Form {...form}>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {integrationsDeatils?.auth_schema_fields?.user &&
                            Object.keys(
                              integrationsDeatils.auth_schema_fields.user,
                            ).map((key) => {
                              const field =
                                integrationsDeatils.auth_schema_fields.user?.[
                                  key
                                ];
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
                                          placeholder={
                                            field?.example || field?.label
                                          }
                                          {...formField}
                                          onKeyDown={handleSpaceValidation}
                                          value={formField.value ?? ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              );
                            })}
                        </div>
                      </div>
                    </Form>
                  </div>

                  {/* Sticky Footer */}
                  <div className="sticky bottom-0 z-10 bg-background py-2 w-full">
                    <div className="w-full flex justify-end gap-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="cursor-pointer"
                      >
                        {isLoading && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Activate
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CredentialAddSheet;
