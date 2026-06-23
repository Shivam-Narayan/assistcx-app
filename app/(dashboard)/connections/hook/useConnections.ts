"use client";

import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";

interface Provider {
  key: string;
  name: string;
  description: string;
  tags: string[];
  is_active: boolean;
  connections_count: number;
  logo_url: string;
}

interface ProviderList {
  active: Provider[];
  available: Provider[];
}
type Mode = "create" | "edit";

export function useConnections() {
  const { axiosAuth, loading } = useAxiosAuth();
  const [providerList, setProviderList] = useState<ProviderList>({
    active: [],
    available: [],
  });
  const [isListLoading, setListLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedDebounce] = useDebounce<string>(searchText, 500);
  const [openDetailSheet, setOpenDetailSheet] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // get provider list
  const getAllProviderList = useCallback(async () => {
    if (loading) return;

    try {
      setListLoading(true);
      const result = await axiosAuth.get(url.PROVIDER);
      if (result?.status === 200) {
        const providers = result.data;
        setProviderList({
          active: providers.filter((provider: any) => provider.is_active),
          available: providers.filter((provider: any) => !provider.is_active),
        });
      }
    } catch (error: any) {
      errorMessageHandler(error);
    } finally {
      setListLoading(false);
    }
  }, [loading, axiosAuth]);

  //details provider view
  const handleViewDetails = async (provider: any) => {
    if (loading) return;
    try {
      setSelectedProvider(provider);
      setOpenDetailSheet(true);
      setDetailsLoading(true);

      const result = await axiosAuth.get(`${url.PROVIDER}/${provider.key}`);

      if (result.status === 200) {
        setProviderDetails(result.data);
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // create & update connection
  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true);

      const payload = data;

      let result;

      if (mode === "edit") {
        result = await axiosAuth.patch(
          `${url.CONNECTIONS}/${selectedItem.id}`,
          payload,
        );
      } else {
        result = await axiosAuth.post(url.CONNECTIONS, payload);
      }

      if (result.status === 200 || result.status === 201) {
        successMessageHandler(
          mode === "edit"
            ? result.data.message || "Connection updated successfully"
            : result.data.message || "Connection created successfully",
        );

        handleViewDetails(selectedProvider);
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setFormLoading(false);
    }
  };

  // test connection
  const handleTestConnection = async (id: any) => {
    if (!id) return;
    setIsTestLoading(true);

    try {
      const result = await axiosAuth.post(`${url.CONNECTIONS}/${id}/test`);

      if (result.status === 200) {
        successMessageHandler(result.data.message);
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setIsTestLoading(false);
    }
  };

  // delete connection
  const handleDeleteConnection = async (id: any) => {
    if (!id) return;

    setIsDeleteLoading(true);

    try {
      const result = await axiosAuth.delete(`${url.CONNECTIONS}/${id}`);

      if (result.status === 200) {
        successMessageHandler(result.data.message);
        handleViewDetails(selectedProvider);
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // search handle here
  const filteredProviderList = useMemo(() => {
    const search = searchedDebounce.trim().toLowerCase();

    if (!search) return providerList;

    const filterProviders = (providers: any[]) =>
      providers.filter(
        (provider) =>
          provider.name?.toLowerCase().includes(search) ||
          provider.description?.toLowerCase().includes(search) ||
          provider.tags?.some((tag: string) =>
            tag.toLowerCase().includes(search),
          ),
      );

    return {
      active: filterProviders(providerList.active),
      available: filterProviders(providerList.available),
    };
  }, [providerList, searchedDebounce]);

  useEffect(() => {
    getAllProviderList();
  }, [getAllProviderList]);

  return {
    searchList: filteredProviderList,
    providerList,
    isListLoading,
    searchText,
    setSearchText,
    getAllProviderList,
    loading,
    axiosAuth,
    openDetailSheet,
    setOpenDetailSheet,
    selectedProvider,
    setSelectedProvider,
    providerDetails,
    setProviderDetails,
    detailsLoading,
    setDetailsLoading,
    isDeleteLoading,
    setIsDeleteLoading,
    handleViewDetails,
    handleDeleteConnection,
    handleTestConnection,
    isTestLoading,
    handleSubmit,
    formLoading,
    selectedItem,
    setSelectedItem,
    mode,
    setMode,
  };
}
