"use client";

import { ConfirmationDialog } from "@/components/confirmation-modal";
import { SettingCommonHeader } from "@/components/ui/setting-header";
import { useSettingHeaderStuck } from "@/lib/hook/useSettingHeaderStuck";
import { useMemo, useState } from "react";
import { ProviderCard } from "./component/provider-card";
import { ProviderConfigDialog } from "./component/provider-config-dialog";
import { ProviderCredentialsDialog } from "./component/provider-credentials-dialog";
import useGetProviders from "./hook/useGetProviders";
import Loading from "../loading";
import { ProviderCatalog } from "./component/types";

const LlmProvidersPage = () => {
  const { isStuck, sentinelRef } = useSettingHeaderStuck();
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activateProvider, setActivateProvider] =
    useState<ProviderCatalog | null>(null);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [manageProvider, setManageProvider] = useState<ProviderCatalog | null>(
    null,
  );
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [deactivateProvider, setDeactivateProvider] =
    useState<ProviderCatalog | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  const {
    isLoading,
    providerCatalog,
    updateModelConfig,
    deactivateProvider: deactivateProviderApi,
    permissions,
    getProviders,
    refreshAll,
  } = useGetProviders();

  const isRoot = permissions?.isRoot ?? false;

  // Derive selectedProvider reactively so it always reflects latest configData
  const selectedProvider = useMemo(
    () =>
      providerCatalog.find((provider) => provider.id === selectedProviderId) ??
      null,
    [providerCatalog, selectedProviderId],
  );

  const handleProviderClick = (providerId: string) => {
    setSelectedProviderId(providerId);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setSelectedProviderId(null);
  };

  const handleMakeActive = (provider: ProviderCatalog) => {
    setActivateProvider(provider);
    setActivateDialogOpen(true);
  };

  const handleActivateDialogClose = (open: boolean) => {
    setActivateDialogOpen(open);
    if (!open) setActivateProvider(null);
  };

  const handleManage = (provider: ProviderCatalog) => {
    setManageProvider(provider);
    setManageDialogOpen(true);
  };

  const handleManageDialogClose = (open: boolean) => {
    setManageDialogOpen(open);
    if (!open) setManageProvider(null);
  };

  const handleMakeDeactivate = (provider: ProviderCatalog) => {
    setDeactivateProvider(provider);
    setDeactivateDialogOpen(true);
  };

  const handleDeactivateDialogClose = () => {
    setDeactivateDialogOpen(false);
    setDeactivateProvider(null);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateProvider) return;
    const providerId = deactivateProvider.id;
    handleDeactivateDialogClose();
    await deactivateProviderApi(providerId);
  };

  const activeProviders = providerCatalog.filter(
    (provider) => provider.isActive,
  );
  const availableProviders = providerCatalog.filter(
    (provider) => !provider.isActive,
  );

  if (isLoading) return <Loading />;
  return (
    <div className="py-6 flex flex-col gap-6 pt-0">
      <div ref={sentinelRef} />
      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isStuck ? "border-b border-border py-4" : ""
        }`}
      >
        <SettingCommonHeader
          title="LLM Providers"
          infoMessage="Manage LLM provider connections, API keys, and model configurations."
          showSearch={false}
          showAddButton={false}
        />
      </div>

      {activeProviders.length > 0 && (
        <div className="px-6  mx-auto w-full  max-w-200">
          <h3 className="pb-2 mb-2 ">Active Providers</h3>
          <div className="flex flex-col gap-3">
            {activeProviders.map((provider) => (
              <ProviderCard
                key={provider?.id}
                provider={provider}
                onClick={(provider) => handleProviderClick(provider.id)}
                isRoot={isRoot}
                onManage={handleManage}
                onMakeDeactivate={handleMakeDeactivate}
              />
            ))}
          </div>
        </div>
      )}
      {availableProviders.length > 0 && (
        <div className="px-6  mx-auto w-full  max-w-200">
          <h3 className="pb-2 mb-2">Available Providers</h3>
          <div className="flex flex-col gap-3">
            {availableProviders.map((provider) => (
              <ProviderCard
                key={provider?.id}
                provider={provider}
                onClick={(provider) => handleProviderClick(provider.id)}
                isRoot={isRoot}
                onActivate={handleMakeActive}
              />
            ))}
          </div>
        </div>
      )}

      {selectedProvider && (
        <ProviderConfigDialog
          provider={selectedProvider}
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          onSetPrimary={(llmKey) => updateModelConfig("primary", llmKey)}
          onSetFast={(llmKey) => updateModelConfig("fast", llmKey)}
        />
      )}

      {activateProvider && (
        <ProviderCredentialsDialog
          provider={activateProvider}
          open={activateDialogOpen}
          onOpenChange={handleActivateDialogClose}
          onActivated={refreshAll}
          mode="activate"
        />
      )}

      {manageProvider && (
        <ProviderCredentialsDialog
          provider={manageProvider}
          open={manageDialogOpen}
          onOpenChange={handleManageDialogClose}
          onActivated={refreshAll}
          mode="manage"
        />
      )}

      <ConfirmationDialog
        open={deactivateDialogOpen}
        title={`Deactivate ${deactivateProvider?.name ?? "Provider"}`}
        description={`Are you sure you want to deactivate ${deactivateProvider?.name ?? "this provider"}? This will disable all associated models.`}
        cancel={handleDeactivateDialogClose}
        confirm={handleConfirmDeactivate}
      />
    </div>
  );
};

export default LlmProvidersPage;
