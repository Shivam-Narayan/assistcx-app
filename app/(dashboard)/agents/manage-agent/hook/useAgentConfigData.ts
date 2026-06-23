import { errorMessageHandler } from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useCallback, useState } from "react";
import { useDebounce } from "use-debounce";

export type AgentLLM = {
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


export const useAgentConfigData = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [searchedCollectionDebounce] = useDebounce<string>(searchText, 300);
  const [llmSearch, setLlmSearch] = useState("");
  const [agentllmsList, setAgentllmsList] = useState<AgentLLM[]>([]);
  const [mailboxData, setMailboxData] = useState<any>([]);
  const [dataTemplates, setDataTemplates] = useState<any>([]);
  const [classGroupList, setClassGroupList] = useState<any>([]);
  const [mountPaths, setMountPaths] = useState<any[]>([]);
  const [dataTableList, setDataTableList] = useState<any[]>([]);
  const [isDataTableLoading, setIsDataTableLoading] = useState(false);
  const [isDataTemplateLoading, setIsDataTemplateLoading] = useState(false);
  const [isClassGroupLoading, setIsClassGroupLoading] = useState(false);
  const [providerList, setProviderList] = useState<any[]>([]);

  const getCollectionList = async () => {
    if (loading) return;

    try {
      setIsCollectionLoading(true);

      const keyword = searchedCollectionDebounce.trim();

      const params: Record<string, string> = {
        filters: JSON.stringify({ availability: "PUBLISHED" }),
      };

      if (keyword) {
        params.keyword = keyword;
      }

      const API_ENDPOINT_PATH = keyword
        ? url.SEARCH_COLLECTION
        : url.GET_COLLECTION_LIST;
      const res = await axiosAuth.get(API_ENDPOINT_PATH, { params });

      const raw = res?.data?.data_collections ?? [];
      setKnowledgeList(raw);
    } catch (err: any) {
      errorMessageHandler(err);
    } finally {
      setIsCollectionLoading(false);
    }
  };

  const getAgentLLMDetails = useCallback(async () => {
    try {
      const result = await axiosAuth.get(url.AGENT_LLMS);
      if (result?.status === 200) {
        setAgentllmsList(getActiveLLMModels(result?.data));
      }
    } catch (error: any) {
      errorMessageHandler(error);
    }
  }, [axiosAuth]);

  const getMailboxPolling = async () => {
    if (!loading) {
      try {
        const result = await axiosAuth.get(url.LIST_MAILBOX_POLLING);
        if (result?.status === 200) {
          var sortedData = result?.data?.mailbox_pollings;
          if (
            sortedData != null &&
            sortedData != undefined &&
            sortedData != "" &&
            sortedData.length != 0
          ) {
            sortedData = sortedData.map((item: any) => {
              return {
                ...item,
                label: item["task_name"],
                value: item["task_name"],
              };
            });
          }
          setMailboxData(
            sortedData != undefined &&
              sortedData != null &&
              sortedData.length != 0
              ? sortedData
              : [],
          );
        }
      } catch (error: any) {
        setMailboxData([]);
        errorMessageHandler(error);
      }
    }
  };

  const getDataTemplates = async () => {
    if (loading) return;
    try {
      setIsDataTemplateLoading(true);
      const result = await axiosAuth.get(url.LIST_DATA_TEMPLATE);
      if (result?.status === 200) {
        let sortedData = result?.data?.data_templates;
        if (sortedData?.length) {
          sortedData = sortedData.map((item: any) => ({
            ...item,
            label: item["name"],
            value: item["template_class"],
          }));
        }
        setDataTemplates(sortedData || []);
      } else {
        setDataTemplates([]);
      }
    } catch (error: any) {
      setDataTemplates([]);
      errorMessageHandler(error);
    } finally {
      setIsDataTemplateLoading(false);
    }
  };

  const fetchClassGroup = async () => {
    if (loading) return;
    try {
      setIsClassGroupLoading(true);
      const result = await axiosAuth.get(url.GET_CLASS_GROUP_LIST);
      if (result?.status === 200) {
        let sortedData = result.data;
        if (sortedData?.length) {
          sortedData = sortedData.map((item: any) => ({
            ...item,
            label: item["name"],
            value: item["key"],
            description: item["description"],
          }));
        }

        setClassGroupList(sortedData);
      }
    } catch (err: any) {
      errorMessageHandler(err);
    } finally {
      setIsClassGroupLoading(false);
    }
  };

  const getDataTableList = async () => {
    if (loading) return;
    try {
      setIsDataTableLoading(true);
      const res = await axiosAuth.get(url.DATA_TABLES, {
        params: { page: 1, page_size: 100 },
      });
      const raw = res?.data?.data_tables ?? res?.data?.items ?? res?.data ?? [];
      const tables = Array.isArray(raw)
        ? raw.map((item: any) => ({
            id: item.id,
            icon: item.icon || "grid-table",
            name: item.name || "",
            description: item.description || "",
            availability: item.availability || "",
            updated_at: item.updated_at || "",
            columns: item?.column_schema,
            rowCount: item?.row_count || 0,
          }))
        : [];
      setDataTableList(tables);
    } catch (err: any) {
      errorMessageHandler(err);
    } finally {
      setIsDataTableLoading(false);
    }
  };

  const getMountPaths = async () => {
    try {
      const result = await axiosAuth.get(url.AGENT_MOUNT_PATHS);
      setMountPaths(result.data?.storage_mount_points || []);
    } catch (error: any) {
      setMountPaths([]);
      errorMessageHandler(error);
    }
  };

  const getProviderList = async () => {
    if (!loading) {
    try {
       const result = await axiosAuth.get(`/providers`);
      setProviderList(result.data);
    } catch (error: any) {
      errorMessageHandler(error);
    }}
  };

  return {
    knowledgeList,
    getCollectionList,
    searchedCollectionDebounce,
    isCollectionLoading,
    searchText,
    setSearchText,
    getAgentLLMDetails,
    agentllmsList,
    llmSearch,
    setLlmSearch,
    getMailboxPolling,
    mailboxData,
    dataTemplates,
    classGroupList,
    getDataTemplates,
    fetchClassGroup,
    getMountPaths,
    mountPaths,
    dataTableList,
    isDataTableLoading,
    getDataTableList,
    isDataTemplateLoading,
    isClassGroupLoading,
    getProviderList,
    providerList,
  };
};
