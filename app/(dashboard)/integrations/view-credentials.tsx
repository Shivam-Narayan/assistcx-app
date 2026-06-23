import { EmptyState } from "@/components/empty-state/empty-state";
import HeaderHoverCard from "@/components/header";
import Loader from "@/components/loader";
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
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { activateIntegrationSchema } from "@/lib/schemas/integrations-schemas";
import { handleSpaceValidation } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Key, Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type CredentialsInfo = {
  credentials?: Record<string, string>;
};

interface ViewIntegrationProps {
  credentialsInfo: CredentialsInfo | null;
  Authtype: string;
  integration: any;
  fetchIntegrationsList: () => void;
  integrationsDeatils: any;
  onOpenChange: any;
  canEditIntegrations: boolean;
}

const ViewCredentialsSheet = ({
  credentialsInfo,
  Authtype,
  integration,
  fetchIntegrationsList,
  integrationsDeatils,
  onOpenChange,
  canEditIntegrations,
}: ViewIntegrationProps) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);

  const validationSchema = useMemo(
    () => activateIntegrationSchema(integrationsDeatils),
    [integrationsDeatils],
  );

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(validationSchema),
    defaultValues:
      integrationsDeatils && integrationsDeatils.auth_schema_fields.user
        ? Object.keys(integrationsDeatils.auth_schema_fields.user).reduce(
            (acc, key) => {
              acc[
                integrationsDeatils.auth_schema_fields.user?.[key]?.name ?? ""
              ] = "";
              return acc;
            },
            {} as Record<string, string>,
          )
        : {}, // Provide an empty default if `integrationsDeatils` is not available
  });

  if (!credentialsInfo) {
    return <Loader className="h-6 w-6" />;
  }

  if (!credentialsInfo.credentials) {
    return (
      <EmptyState
        variant="card"
        compact
        icon={<Key />}
        title="Credentials Not Configured"
        description="Provide the required authentication details to securely connect this integration."
      />
    );
  }

  const formatKey = (key: string) => {
    return key
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const credentials = credentialsInfo.credentials;
  const entries = Object.entries(credentials);

  const onEdit = () => {
    if (credentialsInfo?.credentials) {
      const prefillData = Object.entries(credentialsInfo.credentials).reduce(
        (acc, [key, value]) => {
          acc[key.toLowerCase()] = value; // match your schema field names
          return acc;
        },
        {} as Record<string, string>,
      );

      form.reset(prefillData);
    }

    setEditMode(true);
  };

  const onCancel = () => {
    setEditMode(false);
  };

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
          // getIntegrationsDetails();
          fetchIntegrationsList();
          successMessageHandler("Integration Updated successfully");
        }
      } catch (error: any) {
        if (error.response) {
          errorMessageHandler(
            error.response.data.detail || "Something went wrong",
          );
          setIsLoading(false);
        }
      } finally {
        setIsLoading(false);
        onCancel();
      }
    }
  };

  return (
    <Card className="h-full flex flex-col snap-center max-w-full p-0 gap-0">
      <div className="md:p-4 border-b pb-2 mb-2 flex items-center justify-between">
        {/* Left side: Title and Badge */}
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium tracking-tight">Credentials</h3>
          <Badge variant="outline" className="text-sm">
            Auth Type: {Authtype}
          </Badge>
        </div>

        {/* Right side: Buttons */}
        <div className="flex items-center space-x-2">
          {!editMode && (
            <React.Fragment>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllFields((prev) => !prev)}
                className="cursor-pointer"
              >
                {showAllFields ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              {canEditIntegrations ? (
                <Button
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-pointer"
                >
                  Edit
                </Button>
              ) : null}
            </React.Fragment>
          )}
        </div>
      </div>

      <CardContent className="px-4 pb-2">
        {editMode ? (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <div className="flex flex-col gap-4 pb-2 whitespace-pre-wrap break-words">
              <Form {...form}>
                <div className="space-y-4">
                  <div className="space-y-3">
                    {integrationsDeatils?.auth_schema_fields?.user &&
                      Object.keys(integrationsDeatils.auth_schema_fields.user)
                        .sort((a, b) => a.localeCompare(b))
                        .map((key) => {
                          const field =
                            integrationsDeatils.auth_schema_fields.user?.[key];
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
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {integrationsDeatils?.is_active ? "Update" : "Activate"}
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
        ) : (
          Object.entries(credentials)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, value], index) => {
              const stringValue = String(value);
              const maskedValue = "•".repeat(15);
              const isFirst = index === 0;

              return (
                <div
                  key={key}
                  className={`flex flex-col gap-1 pb-2 pt-2 whitespace-pre-wrap break-all 
        ${!isFirst ? "border-t border-dashed border-gray-300 mt-2 pt-4" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-sm font-semibold text-mute-foreground"
                    >
                      {formatKey(key)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-mute-foreground">
                    {showAllFields ? stringValue : maskedValue}
                  </p>
                </div>
              );
            })
        )}
      </CardContent>
    </Card>
  );
};

export default ViewCredentialsSheet;
