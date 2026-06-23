import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canDelete, canEdit, canView } from "@/lib/permissions";
import {
  collectionSchema,
  CollectionSchemaType,
} from "@/lib/schemas/knowledge-schemas";
import { closeModal, openModal } from "@/redux/common/modal-slice";
import { AppDispatch, RootState, useAppSelector } from "@/redux/store";
import { IconsData } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "lodash";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import CreateUpdateCollection from "./create-update-collection";
import ViewCollection from "./view-collection";

interface SheetModalProps {
  getCollectionList: () => void;
  iconsData: IconsData;
  isDirectEdit: boolean;
  setDirectEdit: (value: boolean) => void;
  viewInsideAgent?: boolean;
}

const SheetModal = (props: SheetModalProps) => {
  const {
    getCollectionList,
    iconsData,
    isDirectEdit,
    setDirectEdit,
    viewInsideAgent = false,
  } = props;
  const { axiosAuth, loading } = useAxiosAuth();
  const pathname: string | null = usePathname();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen, type, data } = useAppSelector(
    (state: RootState) => state.modalReducer,
  );
  const permissionsRole = useAppSelector(
    (state: RootState) =>
      state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const showDeleteCollection = permissionsRole
    ? canDelete(permissionsRole, "knowledge")
    : false;

  const canViewKnowledge = permissionsRole
    ? canView(permissionsRole, "knowledge")
    : false;
  const canEditKnowledge = permissionsRole
    ? canEdit(permissionsRole, "knowledge")
    : false;

  const showCollectionEditor =
    canEditKnowledge && (type === "create" || type === "update");
  const showViewCollection =
    canViewKnowledge &&
    (type === "view" || (type === "update" && !canEditKnowledge));

  //new fields
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);
  const [savedFields, setSavedFields] = useState<any>([]);
  const [knowledgeFields, setKnowledgeFields] = useState<any>([]);
  const [openconfirmModel, setOpenconfirmModel] = useState(false);
  const [advanceFiledsLoading, setAdvanceFiledsLoading] =
    useState<boolean>(false);

  const [getSmartfiledsList, setgetSmartfiledsList] = useState<any>([]);
  const [getknowledegTopicsList, setgetknowledegTopicsList] = useState<any>([]);

  const formValidation = useForm<CollectionSchemaType>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      icon: "ai-book",
      collection_name: "",
      description: "",
      availability: "UNLISTED",
      embedding_model: "",
    },
    mode: "onChange",
  });

  //get Advance Fields api call

  const getAdvanceFieldsList = async () => {
    if (!loading) {
      setAdvanceFiledsLoading(true);

      try {
        const [smartFieldsRes, knowledgeTopicsRes] = await Promise.all([
          axiosAuth.get(`${url.CREATE_COLLECTION}/${data.id}/smart-fields`),
          axiosAuth.get(`${url.CREATE_COLLECTION}/${data.id}/knowledge-topics`),
        ]);

        const smartFieldsData = smartFieldsRes.data || [];
        const knowledgeTopicsData = knowledgeTopicsRes.data || [];

        // Set state for ViewCollection
        setgetSmartfiledsList(smartFieldsData);
        setgetknowledegTopicsList(knowledgeTopicsData);

        // This populates the state that is passed to CreateUpdateCollection
        setSavedFields(smartFieldsData);
        setKnowledgeFields(knowledgeTopicsData);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setAdvanceFiledsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (data?.id && (type === "update" || type === "view")) {
      getAdvanceFieldsList();
      setIsAdvanced(data?.collection_config?.advanced_knowledge_extraction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, type]);

  // Set the value in form
  useEffect(() => {
    if (data) {
      formValidation.setValue("collection_name", data.name);
      formValidation.setValue("icon", data.icon);
      formValidation.setValue("description", data.description);
      formValidation.setValue("availability", data.availability);
      formValidation.setValue(
        "embedding_model",
        data.collection_config?.embedding_model || "",
      );
    } else {
      formValidation.reset();
    }
  }, [data, formValidation]);

  const onSubmit = async (values: CollectionSchemaType) => {
    if (!loading) {
      let value = _.mapValues(values, (v) => _.trim(v));

      const requestBody = {
        name: value.collection_name,
        icon: values.icon,
        description: value.description,
        collection_config: {
          advanced_knowledge_extraction: isAdvanced,
          embedding_model: value.embedding_model,
        },
        availability: value.availability,
      };
      setLoading(true);
      try {
        let result;
        if (type === "create") {
          result = await axiosAuth.post(url.CREATE_COLLECTION, requestBody);
          if (result?.status === 200) apiSuccessHandler("create");
        } else if (type === "update") {
          const [updateCollectionRes, smartFieldsRes, knowledgeTopicsRes] =
            await Promise.all([
              axiosAuth.patch(
                `${url.UPDATE_COLLECTION}/${data.id}`,
                requestBody,
              ),
              axiosAuth.put(
                `${url.CREATE_COLLECTION}/${data.id}/smart-fields`,
                savedFields,
              ),
              axiosAuth.put(
                `${url.CREATE_COLLECTION}/${data.id}/knowledge-topics`,
                knowledgeFields,
              ),
            ]);

          if (
            updateCollectionRes?.status === 200 &&
            smartFieldsRes?.status === 200 &&
            knowledgeTopicsRes?.status === 200
          ) {
            apiSuccessHandler("update");
          } else {
            errorMessageHandler("One or more update API calls failed");
          }
        }
      } catch (error: any) {
        errorMessageHandler(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const apiSuccessHandler = (successType: string) => {
    successMessageHandler(
      successType === "create"
        ? messages.collection_added_successfully
        : messages.collection_update_successfully,
    );
    getCollectionList();
    dispatch(closeModal());
  };

  const getButtonProps = () => {
    switch (type) {
      case "create":
        return {
          label: "Save",
          submitForm: formValidation.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      case "update":
        return {
          label: "Update",
          submitForm: formValidation.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      default:
        return {};
    }
  };

  const { label, variant, submitForm } = getButtonProps();

  function handleResetFields() {
    formValidation.reset();
    dispatch(closeModal());
    setSavedFields([]);
    setKnowledgeFields([]);
    setIsAdvanced(false);
    setgetSmartfiledsList([]);
    setgetknowledegTopicsList([]);
  }

  // --- START: Delete Knowledge  ---
  const handleDeleteClick = () => {
    setOpenconfirmModel(true);
  };

  const handleConfirmDelete = async () => {
    if (loading || !data?.id) return;
    setIsDeleteLoading(true);
    try {
      const API_ENDPOINT_PATH = `${url.DELETE_COLLECTION}/${data?.id}`;
      const result = await axiosAuth.delete(API_ENDPOINT_PATH);

      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setOpenconfirmModel(false);
        getCollectionList();
        dispatch(closeModal());
        if (pathname && pathname.includes("/knowledge/manage-files")) {
          router.push("/knowledge");
        }
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setIsDeleteLoading(false);
    }
  };
  // --- END: Delete Knowledge  ---

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => open || handleResetFields()}>
        <SheetContent
          preventAutoClose={showCollectionEditor}
          className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
        >
          <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
            <div className="w-full flex justify-start items-center space-x-2 divide-x">
              <SheetTitle className="px-3 text-lg font-medium">
                {type === "create"
                  ? "Add Collection"
                  : type === "update" && canEditKnowledge
                    ? "Update Collection"
                    : "View Collection"}
              </SheetTitle>
            </div>

            {type === "view" && canEditKnowledge && !viewInsideAgent && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(openModal({ type: "update", data: data }));
                }}
                className="p-2 rounded-md cursor-pointer hover:bg-secondary "
              >
                <Pencil className="h-5 w-5" />
              </div>
            )}

            <SheetClose asChild>
              <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
                <X className="h-5 w-5" />
              </div>
            </SheetClose>
          </SheetHeader>
          <div className="grow">
            <div className="grid gap-5 px-4 pb-4 ">
              {showCollectionEditor && (
                <CreateUpdateCollection
                  formValidation={formValidation}
                  iconsData={iconsData}
                  type={type}
                  isAdvanced={isAdvanced}
                  setIsAdvanced={setIsAdvanced}
                  savedFields={savedFields}
                  setSavedFields={setSavedFields}
                  knowledgeFields={knowledgeFields}
                  setKnowledgeFields={setKnowledgeFields}
                />
              )}
              {showViewCollection && (
                <ViewCollection
                  iconsData={iconsData}
                  advanceFiledsLoading={advanceFiledsLoading}
                  getSmartfiledsList={getSmartfiledsList}
                  getknowledegTopicsList={getknowledegTopicsList}
                  onSwitchToEdit={() =>
                    dispatch(openModal({ type: "update", data: data }))
                  }
                  onImportAndSwitchToEdit={(
                    importType: "smart_fields" | "knowledge_topics",
                    items: any[],
                  ) => {
                    if (importType === "smart_fields") {
                      setSavedFields(items);
                    } else {
                      setKnowledgeFields(items);
                    }
                    dispatch(openModal({ type: "update", data: data }));
                  }}
                />
              )}
            </div>
          </div>

          {showCollectionEditor && (
            <SheetFooter
              className={`${
                type === "update" && "justify-between!"
              } sticky z-10 bottom-0 p-3 border-t bg-background`}
            >
              {type === "update" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      if (isDirectEdit) {
                        dispatch(closeModal());
                        setDirectEdit(false);
                      } else {
                        dispatch(openModal({ type: "view", data: data }));
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  {showDeleteCollection && (
                    <ConditionalTooltip
                      content="Delete"
                      alwaysShow={true}
                      align="center"
                      showArrow={true}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteClick}
                        className="cursor-pointer h-9 sm:h-9 w-9 sm:w-9 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 pr-2 pl-2"
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </ConditionalTooltip>
                  )}
                </div>
              )}

              <Button
                variant={variant}
                onClick={submitForm}
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {label}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <CustomDeleteDialog
        open={openconfirmModel}
        onOpenChange={setOpenconfirmModel}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title={"Are you sure you want to delete this Knowledge?"}
        description={
          "This action cannot be undone and will permanently delete this Knowledge."
        }
      />
    </>
  );
};

export default SheetModal;
