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
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import MarkdownContent from "./mark-down-content";
import ViewCredentialsSheet from "./view-credentials";

interface SheetModalProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  integration: IntegrationsItem;
  fetchIntegrationsList: () => void;
}
type Action = {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: string;
  type: string;
};

type Integration = {
  id: string;
  key: string;
  integration_type: string;
  actions: Action[];
};
type Credentials = any; // Replace 'any' with the actual shape if known

type Preset = any; // TODO: Replace 'any' with the actual type definition for Preset if known

export type CredentialsInfo = {
  id: string;
  key: string;
  preset: Preset;
  credentials: Credentials;
};

const SheetModal = (props: SheetModalProps) => {
  const { open, onOpenChange, integration, fetchIntegrationsList } = props;
  const { axiosAuth, loading } = useAxiosAuth();
  const [isListLoading, setIsListLoading] = useState(false);
  const [integrationsDeatils, setIntegrationsDeatils] =
    useState<IntegrationsItem | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole
  );

  const canEditIntegrations = permissions
    ? canEdit(permissions, "integrations")
    : false;

  const isAllowedViewCredentials = canView(permissions, "integrations");

  const [credentialsData, setCredentialsData] =
    useState<CredentialsInfo | null>(null);
  // const hasAgentLLM = useRef(false);

  const getIntegrationsDetails = async () => {
    let API_ENDPOINT_PATH = `${url.GET_INTEGRATIONS_LIST}/${integration.id}`;
    try {
      setIsListLoading(true);
      const result = await axiosAuth.get(API_ENDPOINT_PATH);
      if (result?.status === 200) {
        setIntegrationsDeatils(result?.data?.integrations[0]);
        setMarkdownContent(result?.data?.markdown_content);
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setIsListLoading(false);
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
    if (integration?.id) {
      getIntegrationsDetails();

      if (isAllowedViewCredentials) {
        getCredentialsData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integration?.id]);

  const Authtype: string = integration?.auth_type
    ? integration.auth_type.replace("_", " ")
    : "";

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
            <Card className="rounded-lg border bg-card text-card-foreground shadow-none p-0 gap-0">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 bg-muted border text-primary p-2 rounded-lg">
                    {integration?.logo_url && (
                      <Image
                        src={integration?.logo_url}
                        alt="image-open-ai"
                        height={24}
                        width={24}
                      />
                    )}
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
                        <TabsTrigger value="Overview">Overview</TabsTrigger>
                        <TabsTrigger value="credentials">
                          Credentials
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="Overview"
                        className="w-full table table-fixed ml-2"
                      >
                        <MarkdownContent markdownContent={markdownContent} />
                      </TabsContent>
                      <TabsContent
                        value="credentials"
                        className="text-sm w-full"
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
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="w-full table table-fixed ml-2">
                    <MarkdownContent markdownContent={markdownContent} />
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

export default SheetModal;
