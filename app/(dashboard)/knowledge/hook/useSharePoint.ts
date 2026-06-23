import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FileOrFolder, Site } from "@/types/types";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import * as url from "@/helper/url-helper";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import { setUploadFileList } from "@/redux/knowledge/collections-slice";
import { useDispatch } from "react-redux";

const useSharePoint = (
  open: boolean,
  collectionId: string,
  onClose: () => void,
  getManageFileData: (value: number) => void
) => {
  const dispatch = useDispatch();
  const { axiosAuth, loading } = useAxiosAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [path, setPath] = useState<
    {
      id: string;
      name: string;
      isSite?: boolean;
      siteId?: string;
      folderId?: string;
    }[]
  >([]);
  const [items, setItems] = useState<FileOrFolder[]>([]);
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState<Record<string, boolean>>(
    {}
  );
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [importSitesStatus, setImportSitesStatus] = useState({
    successful_downloads: [],
    unsuccessful_downloads: [],
  });

  // Fetch sites on open
  useEffect(() => {
    if (open) {
      setPath([]);
      setItems([]);
      setSelectedIds(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchFiles = async () => {
    if (loading) return;
    try {
      let url = "";

      if (path.length === 0) {
        return;
      }

      const last = path[path.length - 1];
      const targetSiteId = last.siteId || last.id;
      const folderId = last.folderId;

      if (!targetSiteId) {
        return;
      }

      if (last.id.includes(".com")) {
        url = `/sharepoint/sites/${targetSiteId}/objects`;
      } else if (folderId) {
        url = `/sharepoint/sites/${targetSiteId}/${folderId}/objects`;
      } else {
        url = `/sharepoint/sites/${targetSiteId}/objects`;
      }

      setLoadingFolders((prev) => ({
        ...prev,
        [targetSiteId]: true,
      }));

      const response = await axiosAuth.get(url);
      setItems(response.data);

      setLoadingFolders((prev) => ({
        ...prev,
        [targetSiteId]: false,
      }));
    } catch (error) {
      console.error("Error fetching files:", error);
      setItems([]);
    }
  };

  const getCollection = async () => {
    try {
      const result = await axiosAuth.get(
        `${url.GET_COLLECTION_LIST}/${collectionId}`
      );
      if (result.status === 200) {
        const newSites =
          result.data?.data_collections?.[0]?.collection_config
            ?.connected_sharepoint_sites || [];
        setSites(newSites);

       
      }
    } catch (err) {
      console.error("Failed to fetch SharePoint sites", err);
    } 
  };

  // Handle folder click
  const handleFolderClick = (
    item: FileOrFolder & { isSite?: boolean; siteId?: string }
  ) => {
    console.log("handleFolderClick", item.isSite);
    if (item.folder || item.isSite) {
      setPath([
        ...path,
        {
          id: item.id,
          name: item.name,
          isSite: item.isSite || false,
          siteId: item.siteId || item.parentReference?.siteId,
          folderId: item.folder ? item.id : undefined,
        },
      ]);
    }
  };

  // Handle file click (select/deselect)
  const handleFileClick = (item: FileOrFolder) => {
    if (item.folder) {
      // Folder → navigate inside
      setPath([
        ...path,
        {
          id: item.id,
          name: item.name,
          isSite: false,
          siteId: item.parentReference?.siteId,
          folderId: item.id,
        },
      ]);
    }
  };

  // Handle breadcrumb click
  const handleCrumbClick = (idx: number) => {
    console.log("idx", idx);
    if (idx === -1) {
      // Back button → reset path and items
      setPath([]);
      setItems([]);
    } else if (idx === -2) {
      // Home button → fetch top-level sites
      setPath([]);
      setItems([]);
      getCollection();
    } else {
      setPath(path.slice(0, idx + 1));
    }
  };

  // Selection logic
  const toggleSelect = (id: string) => {
    setSelectedIds((prevSelectedIds) => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return newSelectedIds;
    });
  };

  // List to show: sites or items
  const list =
    path.length === 0
      ? sites.map((site) => ({
          id: site.id,
          name: site.displayName || site.name,
          folder: { childCount: 0, decorator: { iconColor: "#2563eb" } },
        }))
      : items;

  // Filtered list for search
  const filteredList = searchText
    ? list.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : list;

  // Get selected items
  const selectedItems = list.filter((item) => selectedIds.has(item.id));

  const importSelectedFiles = async () => {
    if (selectedItems.length === 0) return;
    const siteId = path[0]?.id || selectedItems[0]?.id;
    console.log("api call here ");
    // files
    const files = selectedItems
      .filter((item) => !item.folder)
      .map((item) => ({
        site_id: siteId,
        file_id: item.id,
        collection_id: collectionId,
      }));

    // folders
    const folders = selectedItems
      .filter((item) => item.folder && !item.id.includes(".com"))
      .map((item) => ({
        site_id: siteId,
        folder_id: item.id,
        collection_id: collectionId,
      }));
    // site items
    const websites = selectedItems
      .filter((item: any) => item.id.includes(".com") || item.isSite)
      .map((item) => ({
        site_id: item.id,
        collection_id: collectionId,
      }));

    const body = {
      sharepoint_files: files,
      sharepoint_folders: folders,
      sharepoint_sites: websites,
    };
    if (!loading) {
      setIsImportLoading(true);
      try {
        const API_ENDPOINT_PATH = url.SHARE_POINT_SITE_FILE;
        const result = await axiosAuth.post(
          API_ENDPOINT_PATH,
          JSON.stringify(body)
        );
        if (result.status === 200) {
          const successful_downloads =
            result.data.successful_downloads.data_files || [];
          const unsuccessful_downloads =
            result.data.unsuccessful_downloads || [];
          setImportSitesStatus({
            successful_downloads: result.data.accessible_sites || [],
            unsuccessful_downloads: result.data.unsuccessful_downloads || [],
          });
          if (successful_downloads.length > 0) {
            onClose();
            setSelectedIds(new Set());
            successMessageHandler("Import file successfully");
            getManageFileData(1);
            const uploadList = selectedItems
              .map((item) =>
                typeof item === "object" && item.name
                  ? { name: item.name, status: "" }
                  : null
              )
              .filter(Boolean);

            dispatch(setUploadFileList(uploadList));
          }
        }
      } catch (error) {
        console.error("Error importing files:", error);
        errorMessageHandler(error);
      } finally {
        setIsImportLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, loading]);

  return {
    fetchFiles,
    setPath,
    isLoading,
    isImportLoading,
    items: filteredList,
    searchText,
    setSearchText,
    path,
    selectedIds,
    selectedItems,
    loadingFolders,
    handleFolderClick,
    handleFileClick,
    handleCrumbClick,
    toggleSelect,
    importSelectedFiles,
    // addSites,
    importSitesStatus,
    setImportSitesStatus,
  };
};

export default useSharePoint;
