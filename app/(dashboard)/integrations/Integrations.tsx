"use client";

import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";
import { AppDispatch } from "@/redux/store";
import { IntegrationsItem } from "@/types/types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";
import IntegrationHeader from "./header";
import { IntegrationsActionCards } from "./integration-card";
import Loading from "./loading";

export default function IntegrationsPage() {
  const { axiosAuth, loading } = useAxiosAuth();
  const isHeaderStuck = useHeaderStuck();
  const dispatch = useDispatch<AppDispatch>();
  // States
  const [searchText, setSearchText] = useState("");
  const [filterText, setFilterText] = useState<string[]>([]);
  const [integrationsList, setIntegrationsList] = useState<IntegrationsItem[]>(
    [],
  );
  const [isListLoading, setListLoading] = useState(false);

  // Debounced search text to reduce API calls
  const [searchedDebounce] = useDebounce<string>(searchText, 300);

  // Fetch integrations from API
  const fetchIntegrations = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";

      if (searchedDebounce != "") {
        // Search integration list api calling
        API_ENDPOINT_PATH =
          url.SEARCH_INTEGRATIONS + "?keyword=" + searchedDebounce.trim();
      } else {
        // integration list api calling
        API_ENDPOINT_PATH = url.GET_INTEGRATIONS_LIST;
      }

      try {
        setListLoading(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH);
        if (result?.status === 200) {
          setIntegrationsList(result.data.integrations);
          setListLoading(false);
        }
      } catch (error) {
        console.error("Error fetching integrations:", error);
        setListLoading(false);
      }
    }
  };

  const handleToggleActive = async (id: string, newStatus: boolean) => {
    try {
      // Optional: call backend API
      // await axiosAuth.patch(`/api/integrations/${id}/status`, {
      //   is_active: newStatus,
      // });

      // Update the local state
      setIntegrationsList((prevList) =>
        prevList.map((item) =>
          item.id === id ? { ...item, is_active: newStatus } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle integration status:", error);
    }
  };

  // Fetch on mount and whenever search or loading changes
  useEffect(() => {
    fetchIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedDebounce, loading]);

  // Filter the fetched integrations by filterText
  const filteredIntegrationsList = useMemo(() => {
    if (filterText.length === 0) {
      return integrationsList;
    }

    return integrationsList.filter((item) =>
      item.tags.some((tag) =>
        filterText
          .map((f) => f.toLowerCase().trim())
          .includes(tag.toLowerCase().trim()),
      ),
    );
  }, [filterText, integrationsList]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col py-6 gap-6">
      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isHeaderStuck ? "border-b bg-background py-4" : ""
        }`}
      >
        <IntegrationHeader
          filterText={filterText}
          onFilterChange={setFilterText}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </div>
      <div className="px-6">
        <IntegrationsActionCards
          integrationsList={filteredIntegrationsList}
          isListLoading={isListLoading}
          handleToggleActive={handleToggleActive}
          fetchIntegrationsList={fetchIntegrations}
        />
      </div>
    </div>
  );
}
