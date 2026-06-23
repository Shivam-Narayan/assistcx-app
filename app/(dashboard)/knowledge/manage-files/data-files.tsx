"use client";

import PaginationComponent from "@/components/pagination-componet";
import PaginationService from "@/helper/pagination-service";
import * as url from "@/helper/url-helper";
import { canEdit } from "@/lib/permissions";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  clearSelectedFiles,
  resetSearchFileState,
  setSearchFileText,
} from "@/redux/knowledge/collections-slice";
import { AppDispatch, RootState, useAppSelector } from "@/redux/store";
import { FileDataItem } from "@/types/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useDebounce } from "use-debounce";
import DataTable from "./data-table";
import FilesHeader from "./files-header";
import Loading from "./loading";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";

export interface ICollectionItem {
  collection_id: string | null;
  collection_name: string | null;
  totalFileRecords?: number;
}

const DataFiles = () => {
  const { axiosAuth, loading } = useAxiosAuth();
  const searchParams = useSearchParams();
  const isHeaderStuck = useHeaderStuck();
  const dispatch = useDispatch<AppDispatch>();
  const searchText = useAppSelector(
    (state: RootState) => state?.collectionsReducer?.searchText,
  );
  const [searchedDebounce] = useDebounce<string>(searchText, 300);
  const [isListLoading, setListLoading] = useState(false);
  const [fileData, setFileData] = useState<FileDataItem[]>([]);
  const [pager, setPager]: any = useState({});
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const pageSize: number = 20;
  const collectionName = useRef<string | null>(null);

  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const isUploadFile = canEdit(permissions, "knowledge");

  const isDataFileAction = canEdit(permissions, "knowledge");

  const collectionItem: ICollectionItem = {
    collection_id: searchParams?.get("collection_id") || null,
    collection_name: collectionName.current,
    totalFileRecords: totalRecords,
  };

  const getManageFileData = async (pageNo: number) => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";
      if (searchedDebounce != "") {
        // Search file data list api calling

        API_ENDPOINT_PATH = `${url.SEARCH_COLLECTION}?collection_id=${
          collectionItem.collection_id
        }&page=${pageNo}&page_size=${pageSize}&keyword=${searchedDebounce.trim()}`;
      } else {
        // data file list api calling
        API_ENDPOINT_PATH = `${url.GET_COLLECTION_LIST}?collection_id=${collectionItem.collection_id}&page=${pageNo}&page_size=${pageSize}`;
      }

      try {
        setListLoading(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH);
        if (result?.status === 200) {
          let data = result.data.data_files;
          // Add collection_name to each file data item from localStorage
          const enhancedData = data.map((file: any) => ({
            ...file,
            collection_name: collectionName.current,
          }));
          setFileData(enhancedData);
          setListLoading(false);
          setTotalRecords(result.data.total);
          let pager = PaginationService.getPager(result.data.total, pageNo);
          setPager(pager);
        }
      } catch (error) {
        console.log(error);
        setListLoading(false);
        setTotalRecords(0);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(resetSearchFileState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevDebouncedSearch = useRef<string | undefined>(undefined);

  useEffect(() => {
    const searchChanged =
      prevDebouncedSearch.current !== undefined &&
      prevDebouncedSearch.current !== searchedDebounce;
    if (searchChanged) {
      dispatch(clearSelectedFiles());
    }
    prevDebouncedSearch.current = searchedDebounce;

    getManageFileData(1);
    collectionName.current = localStorage.getItem("collection_name");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, searchedDebounce]);

  const handlePaginationChange = (pageNo: number) => {
    dispatch(clearSelectedFiles());
    getManageFileData(pageNo);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <div
        className={`sticky top-0 bg-background z-10 ${
          isHeaderStuck ? "border-b bg-background py-4" : "py-2"
        }`}
      >
        <FilesHeader
          searchText={searchText}
          setSearchText={(value) => dispatch(setSearchFileText(value))}
          collectionItem={collectionItem}
          isUploadFile={isUploadFile}
          getManageFileData={getManageFileData}
        />
      </div>
      <DataTable
        filesData={fileData}
        isListLoading={isListLoading}
        getManageFileData={getManageFileData}
        isDataFileAction={isDataFileAction}
      />
      {totalRecords != 0 && (
        <div className="pt-5 flex justify-center items-center">
          <PaginationComponent
            pager={pager}
            totalRecords={totalRecords}
            setPagination={handlePaginationChange}
          />
        </div>
      )}
    </div>
  );
};

export default DataFiles;
