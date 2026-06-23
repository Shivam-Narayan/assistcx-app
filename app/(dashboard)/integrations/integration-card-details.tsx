import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { IntegrationsItem } from "@/types/types";
import { Settings } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import StatusCheckBadge from "./components/statusCheckBadge";
import CustomAlertDialog from "@/components/custom-alert-dialog";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import IntegrationDetailsSheet from "./components/integration-details-sheet";
import CredentialAddSheet from "./credentials-add";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";

interface DetailProps {
  data: IntegrationsItem;
  isAllowedViewCredentials: boolean;
  fetchIntegrationsList: any;
  canEditIntegrations: boolean;
}

const IntegrationCardDetailsView = ({
  data,
  isAllowedViewCredentials,
  fetchIntegrationsList,
  canEditIntegrations,
}: DetailProps) => {
  const { axiosAuth } = useAxiosAuth();
  const defaultIcon = getIconSvg("ai-book", "collection_icons");
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [pendingChecked, setPendingChecked] = useState<boolean | null>(null);
  const [cridentialSheetOpen, setCridentialSheetOpen] =
    useState<boolean>(false);

  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const handleViewDetails = (data: IntegrationsItem) => {
    setOpenViewDetails(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingChecked === null) return;
    const integrationId = data.id;

    setIsToggleLoading(true);
    try {
      const action = pendingChecked ? "activate" : "deactivate";
      const API_ENDPOINT_PATH = `${url.ACTIVATE_INTEGRATION}/${integrationId}/${action}`;

      const result = await axiosAuth.post(API_ENDPOINT_PATH);

      if (result.status === 200) {
        successMessageHandler(
          pendingChecked
            ? "Integration activated successfully."
            : "Integration deactivated successfully.",
        );
        fetchIntegrationsList();
        setOpenDeactivate(false);
        setPendingChecked(null);
      }
    } catch (error: any) {
      if (error.response) {
        errorMessageHandler(
          error.response.data.detail || "Something went wrong",
        );
        setOpenDeactivate(false);
      }
    } finally {
      setIsToggleLoading(false);
    }
  };

  const integrationIcon =
    data?.key && INTEGRATION_ICON_SRC[data.key]
      ? INTEGRATION_ICON_SRC[data.key]
      : null;

  return (
    <>
      <Card
        className={`rounded-lg shadow-xs flex flex-col w-full hover:shadow-md transition-all duration-300 !p-0 gap-0 hover:bg-primary/5 hover:border-primary/20 `}
      >
        <CardHeader className="flex flex-col space-y-1.5 p-6 px-4 pt-2 pb-0">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-row items-center justify-end">
              <div
                className={`p-2.5 rounded-full w-fit h-fit bg-primary/10 text-primary `}
              >
                <Image
                  src={integrationIcon || defaultIcon}
                  alt={data.key}
                  width={24}
                  height={24}
                  className="h-auto w-6"
                />
              </div>
              <div className="flex flex-col ml-3">
                <CardTitle className="font-semibold tracking-tight text-xl">
                  {data.name}
                </CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 grow px-4 py-4">
          <p className="text-wrap text-secondary-foreground line-clamp-2 overflow-hidden h-[50px]">
            {data?.description}
          </p>

          <div className="flex flex-wrap gap-2  mt-2">
            {data?.tags?.length > 0 &&
              data.tags.map((tag, i) => (
                <Badge variant="secondary" key={i}>
                  <span>{tag.replace("_", " ").toUpperCase()}</span>
                </Badge>
              ))}
          </div>
        </CardContent>
        <CardFooter className="!pt-3 flex justify-between items-center border-t px-4 py-3">
          <Button
            className={`h-7 px-3 text-xs font-medium cursor-pointer hover:border-primary/30 hover:bg-primary/5 `}
            variant="outline"
            onClick={() => handleViewDetails(data)}
          >
            <Settings className="h-4 w-4" />
            Manage
          </Button>
          {canEditIntegrations ? (
            <Switch
              className={`data-[state=checked]:bg-green-600 data-[state=checked]:bg-primary cursor-pointer`}
              checked={data?.is_active}
              onCheckedChange={(checked) => {
                setPendingChecked(checked);
                if (!data?.is_active && checked) {
                  setCridentialSheetOpen(true);
                } else {
                  setOpenDeactivate(true);
                }
              }}
            />
          ) : data?.is_active ? (
            <div className="relative">
              <StatusCheckBadge active={true} />
            </div>
          ) : (
            <div className="relative">
              <StatusCheckBadge active={false} />
            </div>
          )}
        </CardFooter>
      </Card>

      <IntegrationDetailsSheet
        open={openViewDetails}
        onOpenChange={setOpenViewDetails}
        integration={data}
        fetchIntegrationsList={fetchIntegrationsList}
      />

      <CredentialAddSheet
        open={cridentialSheetOpen}
        onOpenChange={setCridentialSheetOpen}
        integration={data}
        fetchIntegrationsList={fetchIntegrationsList}
        isAllowedViewCredentials={isAllowedViewCredentials}
      />

      <CustomAlertDialog
        open={openDeactivate}
        onOpenChange={(open) => {
          setOpenDeactivate(open);
          if (!open) {
            setPendingChecked(null);
          }
        }}
        handleAlert={handleConfirmToggle}
        isLoading={isToggleLoading}
        title={`Are you sure you want to ${
          pendingChecked ? "activate" : "deactivate"
        } this integration?`}
        description={`This action will ${
          pendingChecked ? "activate" : "deactivate"
        } the integration.`}
      />
    </>
  );
};

export default IntegrationCardDetailsView;
