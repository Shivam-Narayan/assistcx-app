import {
  postActionStateSync,
  PostActionStateSyncAction,
} from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleClassGroupData } from "@/redux/settings/class-group/classgroup-data-slice";
import { handleClassGroupEvents } from "@/redux/settings/class-group/classgroup-events-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getDefaultParams } from "../../settings-filter-params";

export interface cellObject {
  id: string;
  name: string;
  key: string;
  intent_class: string;
  description: string;
  created_at: string;
  updated_at: string;
  class_schema?: any;
}

const useGetClassGroupData = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const params = getDefaultParams();
  const dispatch = useDispatch<AppDispatch>();
  const searchData = useAppSelector(
    (state) => state?.searchDataReducer?.value?.searchData,
  );

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const isCreateClass = canEdit(permissions, "class_groups");

  const [cellData, setCellData] = useState<cellObject[]>([]);

  //===============[Function::: View Intent class List details]===============================//
  const handleViewClassGroup = (rowItem: cellObject) => {
    if (rowItem) {
      dispatch(handleSheetEvents(true));
      dispatch(handleClassGroupEvents("viewClassGroup"));
      dispatch(
        handleClassGroupData({
          ...rowItem,
          class_schema: rowItem.class_schema ?? [],
        }),
      );
    }
  };

  //===============[Function::: Get/Serch Intent class List details]===============================//
  const getClassGroupData = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";

      if (searchData != "") {
        API_ENDPOINT_PATH =
          url.SEARCH_CLASS_GROUP + "?keyword=" + searchData.trim();
      } else {
        API_ENDPOINT_PATH = url.GET_CLASS_GROUP_LIST;
      }

      try {
        setIsLoading(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH, { params });
        if (result?.status === 200) {
          setCellData(result?.data);
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

  //===============[Function::: Check search intent class]=======================================//
  useEffect(() => {
    getClassGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, loading]);

  //===============[Function::: Loading Loading intent class]=======================================//
  const loadTableData = (data: cellObject, type: PostActionStateSyncAction) => {
    setCellData((prevData) => postActionStateSync(prevData, data, type));
  };

  return {
    loading,
    searchData,
    isLoading,
    cellData,
    isCreateClass,
    handleViewClassGroup,
    loadTableData,
  };
};
export default useGetClassGroupData;
