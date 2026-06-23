import {
  postActionStateSync,
  PostActionStateSyncAction,
} from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleUserGroupData } from "@/redux/settings/user-group/user-group-data-slice";
import { handleUserGroupEvents } from "@/redux/settings/user-group/user-group-events-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getDefaultParams } from "../../../settings-filter-params";

export interface cellObject {
  id: number;
  name: string;
  key: string;
  intent_user: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_schema?: any;
}

const useGetUserGroupData = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const params = getDefaultParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useDispatch<AppDispatch>();
  const searchData = useAppSelector(
    (state) => state?.searchDataReducer?.value?.searchData,
  );
  const [cellData, setCellData] = useState<cellObject[]>([]);

  //===============[Function::: View  user List details]===============================//
  const handleViewUserGroup = (rowItem: cellObject) => {
    if (rowItem) {
      dispatch(handleSheetEvents(true));
      dispatch(handleUserGroupEvents("viewUserGroup"));
      dispatch(handleUserGroupData(rowItem));
    }
  };

  //===============[Function::: Get/Serch Intent user List details]===============================//
  const getUserGroupData = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";
      if (searchData != "") {
        // API_ENDPOINT_PATH = url.SEARCH_INTENT_user +'?page='+pageNo+'&page_size='+pageSize+'&sort_by='+sortBy+'&sort_order='+sortOrder+'&keyword='+searchData.trim()
        API_ENDPOINT_PATH =
          url.SEARCH_USER_GROUP + "?keyword=" + searchData.trim();
      } else {
        // API_ENDPOINT_PATH = url.LIST_INTENT_user +'?page='+pageNo+'&page_size='+pageSize+'&sort_by='+sortBy+'&sort_order='+sortOrder
        API_ENDPOINT_PATH = url.GET_USER_GROUP_LIST;
      }

      try {
        setIsLoading(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH, { params });
        if (result?.status === 200) {
          setCellData(result?.data?.user_groups);
        } else {
          console.log("error");
          return;
        }
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  //===============[Function::: Check search intent user]=======================================//
  useEffect(() => {
    getUserGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, loading]);

  //===============[Function::: Loading Loading intent user]=======================================//
  const loadTableData = (data: cellObject, type: PostActionStateSyncAction) => {
    setCellData((prevData) => postActionStateSync(prevData, data, type));
  };

  return {
    loading,
    searchData,
    cellData,
    isLoading,
    handleViewUserGroup,
    loadTableData,
  };
};

export default useGetUserGroupData;
