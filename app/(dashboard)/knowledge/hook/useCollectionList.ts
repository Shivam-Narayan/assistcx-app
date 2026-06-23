import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setCollectionList } from "@/redux/knowledge/collections-slice";
import * as url from "@/helper/url-helper";
import { AppDispatch } from "@/redux/store";
import { IconsData } from "@/types/types";
import { canEdit } from "@/lib/permissions";
import { getIconsData } from "@/components/icon-manager/icon-render-component";

export function useCollectionList() {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [searchText, setSearchText] = useState("");
  const [searchedDebounce] = useDebounce<string>(searchText, 500);
  const [isListLoading, setListLoading] = useState(false);
  const [isDirectEdit, setDirectEdit] = useState(false);

  const iconsData = getIconsData("collection_icons") as IconsData;
  
  const permissions = useAppSelector(
    (state) => state.conditionalPermissionReducer?.value?.permissionsRole
  );

  const isCreateUpdateCollection = canEdit(permissions, "knowledge");

  const getCollectionList = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";

      if (searchedDebounce !== "") {
        API_ENDPOINT_PATH = url.SEARCH_COLLECTION + "?keyword=" + searchedDebounce.trim();
      } else {
        API_ENDPOINT_PATH = url.GET_COLLECTION_LIST;
      }

      try {
        setListLoading(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH);
        if (result?.status === 200) {
          dispatch(setCollectionList(result.data.data_collections));
        }
        setListLoading(false);
      } catch (error) {
        console.error("Collection List Error:", error);
        setListLoading(false);
      }
    }
  };

  useEffect(() => {
    getCollectionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, searchedDebounce]);

  return {
    loading,
    isListLoading,
    isDirectEdit,
    setDirectEdit,
    getCollectionList,
    iconsData,
    isCreateUpdateCollection,
    searchText,
    setSearchText,
  };
}
