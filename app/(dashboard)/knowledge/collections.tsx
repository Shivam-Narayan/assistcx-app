"use client";

import CommonHeader from "@/components/common-header";
import { useHeaderStuck } from "@/lib/hook/useHeaderStruck";
import { openModal } from "@/redux/common/modal-slice";
import { useDispatch } from "react-redux";
import CollectionCards from "./collection-cards";
import { useCollectionList } from "./hook/useCollectionList";
import Loading from "./loading";
import SheetModal from "./sheet-modal";

const Collections = () => {
  const isHeaderStuck = useHeaderStuck();
  const dispatch = useDispatch();
  const {
    loading,
    isListLoading,
    isDirectEdit,
    setDirectEdit,
    getCollectionList,
    iconsData,
    isCreateUpdateCollection,
    searchText,
    setSearchText,
  } = useCollectionList();

  if (loading) return <Loading />;

  return (
    <div className="py-6 flex flex-col gap-6">
      <div
        className={`px-6 sticky top-0 bg-background z-10 ${
          isHeaderStuck ? "border-b bg-background py-4" : ""
        }`}
      >
        <CommonHeader
          title={"Knowledge"}
          onCreateClick={() => {
            dispatch(openModal({ type: "create" }));
          }}
          buttonText={"New Collection"}
          searchPlaceholder={"Search..."}
          permission={isCreateUpdateCollection}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </div>
      <div className="px-6">
        <CollectionCards
          isListLoading={isListLoading}
          iconsData={iconsData}
          setDirectEdit={setDirectEdit}
        />
      </div>
      <SheetModal
        getCollectionList={getCollectionList}
        iconsData={iconsData}
        isDirectEdit={isDirectEdit}
        setDirectEdit={setDirectEdit}
      />
    </div>
  );
};

export default Collections;
