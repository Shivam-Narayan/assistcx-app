import { errorMessageHandler } from "@/helper/helper-function";
import {
  postActionStateSync,
  PostActionStateSyncAction,
} from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import { getDefaultParams } from "../../settings-filter-params";

export interface cellObject {
  id: number;
  name: string;
  user_uuid: string;
  key_hint: string;
  api_key: string;
  last_used_at: string;
  created_at: string;
  updated_at: string;
  user_name: string;
}

const useGetApiKeyData = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const params = getDefaultParams();
  const searchData = useAppSelector(
    (state) => state?.searchDataReducer?.value?.searchData,
  );

  const [cellData, setCellData] = useState<cellObject[]>([]);

  //===============[Function::: Get/Serch Intent class List details]===============================//
  const getApiKeyData = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";

      if (searchData != "") {
        API_ENDPOINT_PATH =
          url.SEARCH_API_KEY + "?keyword=" + searchData.trim();
      } else {
        API_ENDPOINT_PATH = `${url.LIST_API_KEY}`;
      }

      try {
        setIsLoading(true);
        const result = await axiosAuth.get(`${API_ENDPOINT_PATH}`, { params });
        if (result?.status === 200) {
          setCellData(result?.data);
        }
      } catch (error: any) {
        errorMessageHandler(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  //===============[Function::: Check search intent class]=======================================//
  useEffect(() => {
    getApiKeyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, loading]);

  //===============[Function::: Loading Loading intent class]=======================================//
  const loadTableData = (data: cellObject, type: PostActionStateSyncAction) => {
    setCellData((prevData) => postActionStateSync(prevData, data, type));
  };

  return {
    loading,
    isLoading,
    searchData,
    cellData,
    getApiKeyData,
    loadTableData,
  };
};

export default useGetApiKeyData;
