import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canEdit, canView } from "@/lib/permissions";
import { KNOWLEDGE } from "@/lib/urls";
import { formatFileSize } from "@/lib/utils";
import { openModal } from "@/redux/common/modal-slice";
import { clearSelectedFiles } from "@/redux/knowledge/collections-slice";
import { RootState, useAppSelector } from "@/redux/store";
import {
  ArrowLeft,
  Files,
  FileUp,
  HardDrive,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useCollectionList } from "../hook/useCollectionList";
import SheetModal from "../sheet-modal";
import ImportSheet from "./components/sharepoint/import-sheet";
import NewSharePointSheet from "./components/sharepoint/new-sharepoint";
import { ICollectionItem } from "./data-files";
import FileUpload from "./file-upload";

interface CollectionHeaderProps {
  searchText: string;
  setSearchText: (val: string) => void;
  collectionItem: ICollectionItem;
  isUploadFile: boolean;
  getManageFileData: (value: number) => void;
}

const FilesHeader = (props: CollectionHeaderProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openSharePointSheet, setOpenSharePointSheet] = useState(false);
  const [openLocalUpload, setOpenLocalUpload] = useState(false);
  const {
    searchText,
    setSearchText,
    collectionItem,
    isUploadFile,
    getManageFileData,
  } = props;
  const dispatch = useDispatch();
  const [selectImport, setSelectImport] = useState<string>("");
  const [collectionName, setcollectionName] = useState<string>(
    collectionItem?.collection_name ?? "",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionInfo, setCollectionInfo] = useState<any>({});
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const collectionList = useAppSelector(
    (state: RootState) => state.collectionsReducer.collectionList,
  );
  const {
    getCollectionList,
    iconsData,
    isDirectEdit,
    setDirectEdit,
    isCreateUpdateCollection,
  } = useCollectionList();

  const isImportSharePoint = canEdit(permissions, "knowledge");

  const isviewSharePoint = canView(permissions, "knowledge");

  const handleAutoRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    getManageFileData(1);
  };

  const handleOpenViewModal = (item: ICollectionItem) => {
    const filterItem = collectionList.filter(
      (elem) => elem.id === item.collection_id,
    );
    dispatch(openModal({ type: "view", data: filterItem[0] }));
  };

  useEffect(() => {
    dispatch(clearSelectedFiles());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updatedCollection = collectionList.find(
      (item) => item.id === collectionItem.collection_id,
    );

    if (updatedCollection) {
      setcollectionName(updatedCollection.name);
      setCollectionInfo(updatedCollection);
    }
  }, [collectionList, collectionItem.collection_id]);

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-2 xl:items-center justify-between">
        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            onClick={() => {
              router.push(KNOWLEDGE);
            }}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <ConditionalTooltip content={collectionName}>
            <h2
              className="text-2xl xl:text-3xl truncate font-semibold tracking-tight cursor-pointer max-w-[100px] sm:max-w-sm md:max-w-md"
              onClick={() => handleOpenViewModal(collectionItem)}
            >
              {collectionName}
            </h2>
          </ConditionalTooltip>

          <div className="ml-auto h-8 xl:ml-0 inline-flex items-cente text-sm font-medium space-x-2">
            <Badge
              variant="secondary"
              className="text-sm bg-primary/10 text-primary"
            >
              <Files className="h-4 w-4 mr-1 text-primary" />
              <span>{collectionItem?.totalFileRecords} files</span>
            </Badge>

            <Badge
              variant="secondary"
              className="text-sm bg-primary/10 text-primary"
            >
              <HardDrive className="h-4 w-4 mr-1 text-primary" />
              <span>{formatFileSize(collectionInfo.total_size || 0)}</span>
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3 xl:justify-between ">
          <div className="relative grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="flex h-9 w-full items-center rounded-md border border-input bg-white pl-10 pr-10 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isUploadFile && (
            <Button
              variant="default"
              className="cursor-pointer ml-auto xl:ml-0"
              onClick={() => setOpenLocalUpload(true)}
            >
              <FileUp className="h-4 w-4" />
              Import File
            </Button>
          )}
          <ConditionalTooltip
            content="Refresh"
            alwaysShow={true}
            align="center"
            showArrow={true}
          >
            <Button
              onClick={handleAutoRefresh}
              variant="outline"
              className="cursor-pointer"
            >
              <RefreshCcw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </ConditionalTooltip>
        </div>
      </div>

      <FileUpload
        open={openLocalUpload}
        onClose={() => {
          setOpenLocalUpload(false);
          setSelectImport("");
        }}
        refresh={() => getManageFileData(1)}
        collection_id={collectionItem.collection_id ?? ""}
        collection_name={collectionName}
      />

      <ImportSheet
        isImportSharePoint={isImportSharePoint}
        open={open}
        getManageFileData={getManageFileData}
        onClose={() => {
          setOpen(false);
          setSelectImport("");
        }}
        onImport={(selected) => {
          setOpen(false);
          setSelectImport("");
          alert("Imported: " + selected.map((f) => f.name).join(", "));
        }}
        collectionId={collectionItem.collection_id ?? ""}
      />

      <NewSharePointSheet
        isImportSharePoint={isImportSharePoint}
        open={openSharePointSheet}
        onClose={() => {
          setOpenSharePointSheet(false);
          setSelectImport("");
        }}
        collectionInfo={collectionInfo}
        getManageFileData={getManageFileData}
      />

      <SheetModal
        getCollectionList={getCollectionList}
        iconsData={iconsData}
        isDirectEdit={isDirectEdit}
        setDirectEdit={setDirectEdit}
      />
    </>
  );
};

export default FilesHeader;
