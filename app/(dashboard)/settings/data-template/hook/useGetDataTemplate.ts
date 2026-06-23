import {
  postActionStateSync,
  PostActionStateSyncAction,
} from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleDataTemplateEvents } from "@/redux/settings/data-template/data-template-events-slice";
import { handleDataTemplate } from "@/redux/settings/data-template/data-template-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getDefaultParams } from "../../settings-filter-params";
export interface cellObject {
  id: string;
  name?: string;
  template_class: string;
  description?: string;
  data_schema: [];
  updated_at?: string;
}
const useGetDataTemplate = () => {
  const params = getDefaultParams();
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchData = useAppSelector(
    (state) => state?.searchDataReducer?.value?.searchData,
  );
  const [cellData, setCellData] = useState<cellObject[]>([]);
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const isCreateUpdateDataTemplate = canEdit(permissions, "data_templates");

  const handleViewDataTemplate = (rowItem: cellObject) => {
    if (rowItem) {
      dispatch(handleSheetEvents(true));
      dispatch(handleDataTemplateEvents("viewDataTemplate"));
      dispatch(handleDataTemplate(rowItem));
    }
  };

  const getDataTemplateInfo = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH;

      if (searchData != "") {
        API_ENDPOINT_PATH = `${
          url.SEARCH_DATA_TEMPLATE
        }?keyword=${searchData.trim()}`;
      } else {
        API_ENDPOINT_PATH = `${url.LIST_DATA_TEMPLATE}`;
      }
      try {
        setIsLoading(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH, { params });
        if (result?.status === 200) {
          setCellData(result?.data?.data_templates);
        } else {
          console.log("error");
          return;
        }
      } catch (error: any) {
        console.error(error.response.data);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    getDataTemplateInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData, loading]);

  const loadTableData = (data: cellObject, type: PostActionStateSyncAction) => {
    setCellData((prevData) => postActionStateSync(prevData, data, type));
  };

  return {
    handleViewDataTemplate,
    isCreateUpdateDataTemplate,
    loadTableData,
    cellData,
    isLoading,
    loading,
  };
};

export default useGetDataTemplate;
