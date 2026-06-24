import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useAppSelector } from "@/redux/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AgentLLM, LlmProvider, ProviderCatalog } from "../component/types";

const useGetProviders = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [agentllmsList, setAgentllmsList] = useState<AgentLLM[]>([]);
  const [configData, setConfigData] = useState<any>({});
  const [isLoadingData, setLoadingData] = useState(false);
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const getProviders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, status } = await axiosAuth.get(url.LIST_PROVIDERS);
      if (status === 200) {
        setProviders(data?.integrations ?? []);
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error(
          "Failed to fetch providers:",
          error?.response?.data || error?.message,
        );
      }
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  }, [axiosAuth]);

  const getAgentLLMDetails = useCallback(async () => {
    try {
      const result = await axiosAuth.get(url.LIST_AGENT_LLMS);
      if (result?.status === 200) {
        setAgentllmsList(result?.data?.agent_llms ?? []);
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error("Failed to fetch Agent LLMs:", error);
      }
      setAgentllmsList([]);
    }
  }, [axiosAuth]);

  const getConfigurationData = useCallback(async () => {
    setLoadingData(true);
    try {
      const result = await axiosAuth.get(url.GET_CONFIGURATION);
      if (result?.status === 200) {
        setConfigData(result.data);
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error("Failed to fetch configuration:", error);
      }
    } finally {
      setLoadingData(false);
    }
  }, [axiosAuth]);

  const providerCatalog = useMemo<ProviderCatalog[]>(() => {
    return providers.map((provider) => {
      const models = agentllmsList
        .filter((model) => model.provider === provider.key)
        .map((model) => ({
          ...model,
          isDefault: model.llm_key === configData?.preferences?.default_llm,
          isFast: model.llm_key === configData?.preferences?.fast_llm,
        }));

      return {
        id: provider.id ?? "",
        name: provider.name,
        description: provider.description,
        isActive: provider.isActive ?? provider?.is_active,
        iconKey: provider.key ?? "",
        logoUrl: provider.logoUrl ?? null,

        ...(models.length > 0 && { models }),
      };
    });
  }, [providers, agentllmsList, configData]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      getProviders(),
      getAgentLLMDetails(),
      getConfigurationData(),
    ]);
  }, [getProviders, getAgentLLMDetails, getConfigurationData]);

  const deactivateProvider = useCallback(
    async (providerId: string) => {
      try {
        const result = await axiosAuth.post(
          `${url.DEACTIVATE_LLM_PROVIDER}/${providerId}/deactivate`,
        );
        if (result?.status === 200) {
          successMessageHandler("Provider deactivated successfully");
          await refreshAll();
        }
      } catch (error) {
        errorMessageHandler(error);
      }
    },
    [axiosAuth, refreshAll],
  );

  const updateModelConfig = useCallback(
    async (type: "primary" | "fast", llmKey: string) => {
      const prefs = configData?.preferences ?? {};
      const payload = {
        preferences: {
          ...prefs,
          platform_alert_recipients: (
            prefs.platform_alert_recipients ?? []
          ).map((u: any) => u.user_id ?? u),
          ...(type === "primary"
            ? { default_llm: llmKey }
            : { fast_llm: llmKey }),
        },
      };

      try {
        const result = await axiosAuth.post(url.POST_CONFIGURATION, payload);
        if (result?.status === 200) {
          successMessageHandler(
            type === "primary"
              ? "Default LLM model updated successfully"
              : "Fast LLM model updated successfully",
          );
          await getConfigurationData();
        }
      } catch (error: any) {
        errorMessageHandler(error);
      }
    },
    [axiosAuth, configData, getConfigurationData],
  );

  useEffect(() => {
    if (!loading) {
      getProviders();
      getAgentLLMDetails();
      getConfigurationData();
    }
  }, [loading, getProviders, getAgentLLMDetails, getConfigurationData]);

  return {
    providers,
    providerCatalog,
    isLoading,
    loading,
    permissions,
    agentllmsList,
    configData,
    isLoadingData,
    updateModelConfig,
    deactivateProvider,
    getConfigurationData,
    getProviders,
    refreshAll,
  };
};

export default useGetProviders;
