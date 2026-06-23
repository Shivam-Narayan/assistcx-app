"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { BookText } from "lucide-react";

import CustomAgentKnowledgeCard from "@/components/agent-knowledge";
import CollectionSelectModal from "@/components/collection-select-modal";
import { ConfirmationDialog } from "@/components/confirmation-modal";
import * as url from "@/helper/url-helper";
import { errorMessageHandler } from "@/helper/helper-function";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { openModal } from "@/redux/common/modal-slice";
import { AppDispatch } from "@/redux/store";
import { getIconsData } from "@/components/icon-manager/icon-render-component";
import { IconsData } from "@/types/types";
import SheetModal from "@/app/(dashboard)/knowledge/sheet-modal";
import { useAgentConfigData } from "../hook/useAgentConfigData";
import { AgentFormValues } from "../schemas/agent-schema";
import ContextSectionCard from "./context-section-card";

const KnowledgeContextCard = ({ isEditing }: { isEditing: boolean }) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const iconsData = getIconsData("collection_icons") as IconsData;
  const [isDirectEdit, setDirectEdit] = useState(true);
  const [isKnowledgeSelectorOpen, setIsKnowledgeSelectorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(
    null,
  );
  const hasFetched = useRef(false);

  const { control, trigger, getValues, setValue } =
    useFormContext<AgentFormValues>();

  const {
    knowledgeList,
    getCollectionList,
    searchedCollectionDebounce,
    isCollectionLoading,
    searchText,
    setSearchText,
  } = useAgentConfigData();

  const knowledge = useWatch({ control, name: "knowledge", defaultValue: [] });

  useEffect(() => {
    if (!loading && !hasFetched.current) {
      getCollectionList();
      hasFetched.current = true;
    }
  }, [loading]);

  useEffect(() => {
    if (isKnowledgeSelectorOpen && !loading) {
      getCollectionList();
    }
  }, [isKnowledgeSelectorOpen, searchedCollectionDebounce, loading]);

  const handleRemoveKnowledge = (index: number) => {
    setPendingRemoveIndex(index);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = () => {
    if (pendingRemoveIndex === null) return;
    const current = getValues("knowledge") || [];
    const updated = current.filter(
      (_: any, i: number) => i !== pendingRemoveIndex,
    );
    setValue("knowledge", updated, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    trigger("knowledge");
    setPendingRemoveIndex(null);
    setConfirmOpen(false);
  };

  const handleViewCollection = async (ele: any) => {
    try {
      const res = await axiosAuth.get(`${url.CREATE_COLLECTION}/${ele.id}`);
      const collectionData = res.data.data_collections[0];
      dispatch(openModal({ type: "view", data: collectionData }));
    } catch (err: any) {
      errorMessageHandler(err);
    }
  };

  const knowledgeFilterList =
    knowledgeList.length > 0
      ? knowledgeList.filter((ele) => knowledge.some((k) => k.id === ele.id))
      : knowledge;

  return (
    <>
      <ContextSectionCard
        icon={<BookText className="h-5 w-5" />}
        title="Knowledge Collections"
        count={knowledge.length}
        selectLabel="Add Collections"
        onSelect={() => setIsKnowledgeSelectorOpen(true)}
        isEditing={isEditing}
        isEmpty={!knowledge.length}
        isLoading={isCollectionLoading}
        emptyIcon={<BookText />}
        emptyTitle="No knowledge added"
        emptyDescription="Assign knowledge collections to your agent"
      >
        <div className="space-y-3">
          {knowledgeFilterList.map((collection: any, index: number) => (
            <CustomAgentKnowledgeCard
              isDisabled={!isEditing}
              key={collection.id || index}
              className="shadow-none"
              index={index}
              knowledge={collection}
              pageType="2"
              removeRuleHandler={handleRemoveKnowledge}
              viewKnowledge={handleViewCollection}
            />
          ))}
        </div>
      </ContextSectionCard>

      <CollectionSelectModal
        open={isKnowledgeSelectorOpen}
        setOpen={setIsKnowledgeSelectorOpen}
        data={knowledgeList}
        isLoading={isCollectionLoading}
        selectedItems={knowledge}
        searchText={searchText}
        setSearchText={setSearchText}
        onAdd={(items) => {
          const transformed = (items || []).map((item: any) => ({
            id: item.id ?? "",
            icon: item.icon ?? "",
            name: item.name ?? item.label ?? "",
            description: item.description ?? "",
            availability: item.availability ?? "private",
            index_name: item.index_name ?? "",
          }));
          setValue("knowledge", transformed, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          trigger("knowledge");
        }}
        addButtonText="Apply"
        dialogTitle="Knowledge Collections"
        searchPlaceholder="Search collections..."
        debouncedSearch={searchedCollectionDebounce}
      />

      <SheetModal
        isDirectEdit={isDirectEdit}
        setDirectEdit={setDirectEdit}
        getCollectionList={getCollectionList}
        iconsData={iconsData}
        viewInsideAgent={true}
      />

      <ConfirmationDialog
        open={confirmOpen}
        confirm={handleConfirmRemove}
        cancel={() => {
          setConfirmOpen(false);
          setPendingRemoveIndex(null);
        }}
        title="Remove this knowledge collection?"
        description="This collection will be removed from the agent."
      />
    </>
  );
};

export default KnowledgeContextCard;
