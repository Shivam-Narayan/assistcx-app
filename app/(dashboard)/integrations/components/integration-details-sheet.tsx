import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit, canView } from "@/lib/permissions";
import { useAppSelector } from "@/redux/store";
import { IntegrationsItem } from "@/types/types";
import { Loader2Icon, X } from "lucide-react";
import Image from "next/image";
import { lazy, Suspense, useEffect, useState } from "react";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";

const ViewCredentialsSheet = lazy(() => import("../view-credentials"));
const MarkdownContent = lazy(() => import("../mark-down-content"));

type Credentials = any;
type Preset = any;
export type CredentialsInfo = {
  id: string;
  key: string;
  preset: Preset;
  credentials: Credentials;
};

interface SheetProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  integration: IntegrationsItem;
  fetchIntegrationsList: () => void;
}

const IntegrationDetailsSheet = ({
  open,
  onOpenChange,
  integration,
  fetchIntegrationsList,
}: SheetProps) => {
  const { axiosAuth } = useAxiosAuth();
  const [integrationsDeatils, setIntegrationsDeatils] =
    useState<IntegrationsItem | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const defaultIcon = getIconSvg("ai-book", "collection_icons");
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const canEditIntegrations = permissions
    ? canEdit(permissions, "integrations")
    : false;
  const isAllowedViewCredentials = canView(permissions, "integrations");

  const [credentialsData, setCredentialsData] =
    useState<CredentialsInfo | null>(null);

  const getIntegrationsDetails = async () => {
    let API_ENDPOINT_PATH = `${url.GET_INTEGRATIONS_LIST}/${integration.id}`;
    try {
      const result = await axiosAuth.get(API_ENDPOINT_PATH);
      if (result?.status === 200) {
        setIntegrationsDeatils(result?.data?.integrations[0]);
        setMarkdownContent(result?.data?.markdown_content);
      }
    } catch (error) {
      errorMessageHandler(error);
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
    if (open && integration?.id) {
      getIntegrationsDetails();

      if (open && isAllowedViewCredentials) {
        getCredentialsData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, integration?.id, isAllowedViewCredentials]);

  const Authtype: string = integration?.auth_type
    ? integration.auth_type.replace("_", " ")
    : "";

  const integrationIcon =
    integration?.key && INTEGRATION_ICON_SRC[integration.key]
      ? INTEGRATION_ICON_SRC[integration.key]
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-y-auto overflow-x-hidden">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="w-full flex justify-start items-center space-x-2 divide-x">
            <SheetTitle className="px-3 text-lg font-medium">
              View Details
            </SheetTitle>
          </div>
          <SheetClose asChild>
            <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
              <X className="h-5 w-5" />
            </div>
          </SheetClose>
        </SheetHeader>

        <div className="grow">
          <div className="grid gap-5 px-4">
            <Card className="mb-4 rounded-lg border bg-card text-card-foreground shadow-none p-0 gap-0">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 bg-muted border text-primary p-2 rounded-lg">
                    <Image
                      src={integrationIcon || defaultIcon}
                      alt={integration.key}
                      width={24}
                      height={24}
                      className="h-auto w-6"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-semibold text-foreground text-lg break-words">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-muted-foreground break-words whitespace-pre-line">
                      {integration.description}
                    </p>

                    {integration?.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {integration.tags.map((tag, i) => (
                          <Badge
                            variant="outline"
                            key={i}
                            className="whitespace-nowrap"
                          >
                            {tag.replace("_", " ").toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* tab start  */}
                {isAllowedViewCredentials ? (
                  <div className="flex w-full mt-2 flex-col gap-6 min-w-0">
                    <Tabs defaultValue="Overview" className="w-full">
                      <TabsList className="mb-2">
                        <TabsTrigger
                          value="Overview"
                          className="cursor-pointer"
                        >
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="credentials"
                          className="cursor-pointer"
                        >
                          Credentials
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="Overview"
                        className="w-full table table-fixed ml-2"
                      >
                        <Suspense
                          fallback={
                            <div className="flex items-center justify-center py-4 text-muted-foreground">
                              <Loader2Icon className="animate-spin mr-2 h-6 w-6" />
                            </div>
                          }
                        >
                          <MarkdownContent markdownContent={markdownContent} />
                        </Suspense>
                      </TabsContent>
                      <TabsContent
                        value="credentials"
                        className="text-sm w-full"
                      >
                        <Suspense
                          fallback={
                            <div className="flex items-center justify-center py-4 text-muted-foreground">
                              <Loader2Icon className="animate-spin mr-2 h-6 w-6" />
                            </div>
                          }
                        >
                          <ViewCredentialsSheet
                            credentialsInfo={credentialsData}
                            Authtype={Authtype}
                            integration={integration}
                            fetchIntegrationsList={fetchIntegrationsList}
                            integrationsDeatils={integrationsDeatils}
                            onOpenChange={onOpenChange}
                            canEditIntegrations={canEditIntegrations}
                          />
                        </Suspense>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="w-full table table-fixed ml-2">
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center py-4 text-muted-foreground">
                          <Loader2Icon className="animate-spin mr-2 h-6 w-6" />
                        </div>
                      }
                    >
                      <MarkdownContent markdownContent={markdownContent} />
                    </Suspense>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default IntegrationDetailsSheet;
