"use client";

import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  preferanceInfoSchema,
  PreferanceInfoType,
} from "@/lib/schemas/settings/accounts-schemas";
import { setColorTheme } from "@/redux/app-theme/theme-slice";
import { RootState } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

type AgentLLM = {
  llm_key: string;
  name: string;
  description?: string;
  is_active?: boolean;
};

const getActiveLLMModels = (data: any): AgentLLM[] => {
  const models = data?.llm_models ?? data?.agent_llms ?? [];
  return Array.isArray(models)
    ? models.filter((model) => model?.is_active === true)
    : [];
};

export const usePreferenceSettings = () => {
  const dispatch = useDispatch();
  const { colorTheme } = useSelector((state: RootState) => state.themeSlice);
  const [isEdit, setIsEdit] = useState(false);
  const { axiosAuth, loading } = useAxiosAuth();
  const [agentllmsList, setAgentllmsList] = useState<AgentLLM[]>([]);
  const [configData, setConfigData] = useState<any>({});
  const [isLoading, setLoading] = useState(false);
  const [isLoadingData, setLoadingData] = useState(false);
  const [llmSearch, setLlmSearch] = useState("");

  const form = useForm<PreferanceInfoType>({
    resolver: zodResolver(preferanceInfoSchema),
    defaultValues: {
      agentllm: configData?.preferences?.default_llm,
      fastllm: configData?.preferences?.fast_llm,
      default_email: configData?.preferences?.default_email || "",
      platform_alert_recipients:
        configData?.preferences?.platform_alert_recipients,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (configData?.preferences) {
      const prefs = configData.preferences;
      form.reset({
        agentllm: configData.preferences.default_llm || "",
        fastllm: configData.preferences.fast_llm || "",
        default_email: configData.preferences.default_email || "",
        platform_alert_recipients: (prefs.platform_alert_recipients || []).map(
          (user: any) => ({
            id: user.user_id,
            email: user.email_id,
            name: user.name,
          }),
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configData]);

  async function onSubmit(values: PreferanceInfoType) {
    if (loading) return;
    const dataModal = {
      preferences: {
        default_llm: values["agentllm"],
        fast_llm: values["fastllm"],
        default_email: values.default_email,
        theme: colorTheme,
        platform_alert_recipients: (values.platform_alert_recipients || []).map(
          (user) => user.id,
        ),
      },
    };

    try {
      setLoading(true);
      const result = await axiosAuth.post(url.POST_CONFIGURATION, dataModal);
      if (result?.status === 200) {
        successMessageHandler("Configuration created successfully");
        getConfigurationData();
        addCompanyInfo();
      }
    } catch (error: any) {
      console.error("Error in onSubmit of preferance:", error);
      errorMessageHandler(error);
    } finally {
      setLoading(false);
    }
  }

  const addCompanyInfo = () => {
    setIsEdit((perv) => !perv);
  };

  const getAgentLLMDetails = async () => {
    if (!loading) {
      try {
        const result = await axiosAuth.get(url.AGENT_LLMS);
        if (result?.status === 200) {
          setAgentllmsList(getActiveLLMModels(result?.data));
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    setIsEdit(false);

    form.reset({
      agentllm: configData?.preferences?.default_llm,
      fastllm: configData?.preferences?.fast_llm,
      default_email: configData?.preferences?.default_email || "",
      platform_alert_recipients: (
        configData?.preferences?.platform_alert_recipients || []
      ).map((user: any) => ({
        id: user.user_id,
        email: user.email_id,
        name: user.name,
      })),
    });
  };

  const getConfigurationData = async () => {
    if (!loading) {
      setLoadingData(true);
      try {
        const result = await axiosAuth.get(url.GET_CONFIGURATION);
        if (result?.status === 200) {
          setConfigData(result.data);
          dispatch(setColorTheme(result.data.preferences.theme));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    }
  };

  const llmItems = agentllmsList.map((llm: any) => ({
    value: llm.llm_key,
    label: llm.name,
    description: llm.description,
    // LLM data for popover
    provider: llm.provider,
    model_name: llm.model_name,
    name: llm.name,
    integration_key: llm.integration_key,
    ...llm,
  }));

  const filteredLlmItems = llmItems.filter((item) => {
    const text = `${item.label} ${item.value}`.toLowerCase();
    return text.includes(llmSearch.toLowerCase());
  });

  useEffect(() => {
    if (loading) return;
    getAgentLLMDetails();
    getConfigurationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
    isEdit,
    setIsEdit,
    loading,
    configData,
    getConfigurationData,
    isLoading,
    isLoadingData,
    form,
    addCompanyInfo,
    handleCancel,
    onSubmit,
    filteredLlmItems,
    llmSearch,
    setLlmSearch,
  };
};

export type PreferenceSettingsApi = ReturnType<typeof usePreferenceSettings>;
