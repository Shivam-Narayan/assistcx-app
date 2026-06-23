"use client";

import { Blocks } from "lucide-react";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useAppSelector } from "@/redux/store";
import { IntegrationsItem } from "@/types/types";
import IntegrationCardDetailsView from "./integration-card-details";
import { LoadingCards } from "./loading";
import { canEdit, canView } from "@/lib/permissions";
import { EmptyState } from "@/components/empty-state/empty-state";

export interface IntegrationToolbarProps {
  integrationsList: IntegrationsItem[];
  isListLoading: boolean;
  handleToggleActive: (id: string, newStatus: boolean) => void;
  fetchIntegrationsList: () => void;
}

export function IntegrationsActionCards({ ...props }: IntegrationToolbarProps) {
  const {
    integrationsList,
    isListLoading,
    handleToggleActive,
    fetchIntegrationsList,
  } = props;
  const { loading } = useAxiosAuth();

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const canEditIntegrations = permissions
    ? canEdit(permissions, "integrations")
    : false;
  const isAllowedViewCredentials = canView(permissions, "integrations");

  if (isListLoading || loading) {
    return <LoadingCards />;
  }

  if (!isListLoading && integrationsList?.length === 0) {
    return (
      <EmptyState variant="fullpage" title="No Integration Found" icon={Blocks} />
    );
  }

  return (
    <div className="flex flex-col h-fit">
      <div className="grid gap-5 2xl:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 py-2">
        {integrationsList &&
          integrationsList?.map((data, i) => (
            <IntegrationCardDetailsView
              data={data}
              key={i}
              isAllowedViewCredentials={isAllowedViewCredentials}
              fetchIntegrationsList={fetchIntegrationsList}
              canEditIntegrations={canEditIntegrations}
            />
          ))}
      </div>
    </div>
  );
}
