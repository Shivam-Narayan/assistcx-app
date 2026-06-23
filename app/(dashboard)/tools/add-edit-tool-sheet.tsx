"use client";

import CustomDeleteDialog from "@/components/custom-delete-dialog";
import { Form } from "@/components/ui/form";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  capitalizeMessage,
  errorMessageHandler,
  getCardHeaderTitle,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canEdit } from "@/lib/permissions";
import { displayNameToIdentifierKey } from "@/lib/utils";

import { handleToolsEvents } from "@/redux/agents/create-agents-data-slice";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import {
  handleToolsData,
  handleToolUpdateEvents,
} from "@/redux/tools/tools-data-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  addNewToolFormSchema,
  AddNewToolFormSchemaType,
} from "@/lib/schemas/tools-schemas";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as z from "zod";
import { AddEditModal } from "./add-edit-modal";
import {
  DEFAULT_FORM_VALUES,
  INITIAL_TOOL_DATA,
} from "./add-edit-tool-components/initial-form-state";
import { ToolForm } from "./add-edit-tool-components/tool-form";
import {
  generateRequestBody,
  buildToolEditPayload,
  shouldSkipToolFormValidation,
} from "./add-edit-tool-components/tool-helper-function";
import {
  addNewToolProps,
  apiType,
  CustomFieldDef,
  IDataSchemas,
  InputSchemaData,
} from "./add-edit-tool-components/tool-interfaces";
import { CustomFieldsCard } from "./add-edit-tool-components/custom-fields-card";
import { ToolSheetFooter } from "./add-edit-tool-components/tool-sheet-footer";
import { ToolSheetHeader } from "./add-edit-tool-components/tool-sheet-header";
import { ViewTool } from "./add-edit-tool-components/view-tool";
import AgentToolAuth from "./agent-tool-auth";
import { useInitializeToolForm } from "./hook/useInitializeToolForm";
import { TestToolModal } from "./test-tool-modal";

export function AddEditToolsSheet({
  addToolSheetOpenEvent,
  closeAddToolSheetEvent,
  isCreatUpdateAgentTool,
}: addNewToolProps) {
  const { axiosAuth, loading } = useAxiosAuth(); // User Session
  const dispatch = useDispatch<AppDispatch>();
  const userEvents = useAppSelector(
    (state) => state?.toolsEventReducer?.toolsEventReducer?.value?.userEvent,
  );
  const toolsData = useAppSelector(
    (state) => state?.toolsDataReducer?.toolsDataReducer?.value,
  );
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const canMutateTools = permissions
    ? canEdit(permissions, "agent_tools")
    : false;

  const [isLoading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [openconfirmModel, setOpenconfirmModel] = useState(false);
  const [addToolSheetOpen, setAddToolSheetOpen] = React.useState(false);
  const [isTestingToolOpen, setIsTestingToolOpen] = useState(false);
  const [inputSchemaData, setInputSchemaData] =
    useState<InputSchemaData | null>(null);
  const [endPointMethod, setEndPointMethod] = React.useState<string>("");
  const [APIType, setApiType] = React.useState<string>("REST");
  const [headersList, setHeadersList] = React.useState<IDataSchemas[]>([]);
  const [queryParametersList, setQueryParametersList] = React.useState<
    IDataSchemas[]
  >([]);
  const [addEditModalOpen, setAddEditModalOpen] =
    React.useState<boolean>(false);
  const [openModalType, setOpenModalType] = React.useState<string | null>(null);
  const [editDetails, setEditDetails] = React.useState<IDataSchemas | null>(
    null,
  );
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [testToolsLoading, setTestToolsLoading] = useState<boolean>(false);
  const [supportsCustomFields, setSupportsCustomFields] = useState(false);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);

  const addNewToolForm = useForm<AddNewToolFormSchemaType>({
    resolver: zodResolver(addNewToolFormSchema),
    defaultValues: DEFAULT_FORM_VALUES as z.infer<typeof addNewToolFormSchema>,
    mode: "onChange",
  });
  const { getApiType } = useInitializeToolForm({
    form: addNewToolForm,
    setHeadersList,
    setQueryParametersList,
    setEndPointMethod,
    setApiType,
    endPointMethod,
  });

  // =================Test tool ===============
  const toggleTestingModal = (toggleValue: boolean) => {
    setIsTestingToolOpen(toggleValue);
  };

  // =================End Edit functionality ================
  const closeSheetEventHandler = () => {
    addNewToolForm.reset(DEFAULT_FORM_VALUES);
    let resetToolsData = INITIAL_TOOL_DATA;
    setHeadersList([]);
    setQueryParametersList([]);
    setEndPointMethod("");
    setSupportsCustomFields(false);
    setCustomFields([]);
    closeAddToolSheetEvent();
    dispatch(handleSheetEvents(false));
    dispatch(handleToolsData(resetToolsData));
    dispatch(handleToolsEvents(""));
  };
  const setMethodSelectionHandler = (method: string) => {
    setEndPointMethod(method);
  };

  useEffect(() => {
    setAddToolSheetOpen(addToolSheetOpenEvent);
    setEndPointMethod(toolsData?.method ? toolsData?.method : "GET");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToolSheetOpenEvent]);

  const handleFieldChange = (e: any) => {
    const action = displayNameToIdentifierKey(e.target.value.trim());
    addNewToolForm.resetField("action");
    addNewToolForm.setValue("action", action);
    const nameValue = e.target.value;
    addNewToolForm.resetField("name");
    addNewToolForm.setValue("name", nameValue);
  };

  const skipToolFormValidation = shouldSkipToolFormValidation(
    userEvents,
    supportsCustomFields,
    toolsData?.is_default,
  );

  const handleFormInvalid = (errors: Record<string, unknown>) => {
    const firstError = Object.values(errors)[0] as { message?: string };
    errorMessageHandler(
      firstError?.message ?? "Please fix the highlighted fields and try again.",
    );
  };

  const handleApiError = (error: any) => {
    if (error?.response?.status == url.WHITESPACE_INPUT_ERROR_CODE) {
      if (
        error?.response?.data?.detail &&
        Array.isArray(error.response.data.detail)
      ) {
        errorMessageHandler(
          capitalizeMessage(error?.response?.data?.detail[0]["msg"]) +
            " : " +
            getCardHeaderTitle(error?.response?.data?.detail[0]?.loc[1]),
        );
        return;
      }
    }
    errorMessageHandler(error);
  };

  async function onSubmit(values?: AddNewToolFormSchemaType) {
    if (loading) return;

    if (userEvents === "addTool") {
      if (!values) return;
      const requestBody = generateRequestBody(values, {
        headersList,
        queryParametersList,
        endPointMethod,
        customFields: supportsCustomFields ? customFields : undefined,
      });

      setLoading(true);
      try {
        const result = await axiosAuth.post(url.CREATE_TOOLS, requestBody);
        if (result?.status === 200) {
          successMessageHandler(messages.tool_added_successfully);
          setHeadersList([]);
          setQueryParametersList([]);
          dispatch(handleToolUpdateEvents(true));
          setAddToolSheetOpen(false);
        } else {
          console.error("Failed to create agent tool");
          errorMessageHandler(result);
        }
      } catch (error: any) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (userEvents === "editTool") {
      if (!skipToolFormValidation && !values) return;

      const payload = buildToolEditPayload(
        values ?? ({} as AddNewToolFormSchemaType),
        {
          skipMainForm: skipToolFormValidation,
          customFields,
          supportsCustomFields,
          headersList,
          queryParametersList,
          endPointMethod,
        },
      );

      setLoading(true);
      try {
        const result = await axiosAuth.patch(
          `${url.UPDATE_TOOLS}/${toolsData.id}`,
          payload,
        );
        if (result?.status === 200) {
          successMessageHandler(messages.tool_updated_successfully);
          setHeadersList([]);
          setQueryParametersList([]);
          dispatch(handleToolUpdateEvents(true));
          setAddToolSheetOpen(false);
        } else {
          console.error("Failed to update tool");
          errorMessageHandler(result);
        }
      } catch (error: any) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    }
  }

  const handleSheetSubmit = () => {
    if (skipToolFormValidation) {
      void onSubmit();
      return;
    }
    addNewToolForm.handleSubmit(onSubmit, handleFormInvalid)();
  };

  const getButtonProps = () => {
    switch (userEvents) {
      case "addTool":
        return {
          label: "Save Tool",
          onClick: handleSheetSubmit,
          variant: "default" as const,
        };
      case "editTool":
        return {
          label: "Update Tool",
          onClick: handleSheetSubmit,
          variant: "default" as const,
        };
      default:
        return {};
    }
  };

  const { label, variant, onClick } = getButtonProps();

  const onSubmitValues = (values: IDataSchemas, index: number | null) => {
    if (openModalType === "header") {
      const isDuplicate = headersList.some(
        (item, i) =>
          item.your_key.trim().toLowerCase() ===
            values.your_key.trim().toLowerCase() && i !== index,
      );
      if (isDuplicate) {
        errorMessageHandler("Header name already exists");
        return false;
      }

      if (editDetails) {
        const updatedItems = [...headersList];
        if (index !== null) updatedItems[index] = values;
        setHeadersList(updatedItems);
      } else {
        setHeadersList([...headersList, values]);
      }
    } else if (openModalType === "parameter") {
      const isDuplicate = queryParametersList.some(
        (item, i) =>
          item.your_key.trim().toLowerCase() ===
            values.your_key.trim().toLowerCase() && i !== index,
      );
      if (isDuplicate) {
        errorMessageHandler("Query Parameter name already exists");
        return false;
      }
      if (editDetails) {
        const updatedItems = [...queryParametersList];
        if (index !== null) updatedItems[index] = values;
        setQueryParametersList(updatedItems);
      } else {
        setQueryParametersList([...queryParametersList, values]);
      }
    }
    setAddEditModalOpen(false);
    setOpenModalType(null);
    setEditDetails(null);
    setEditIndex(null);
    return true;
  };

  // --- START: Delete agent tools  ---
  const handleDeleteClick = () => {
    setOpenconfirmModel(true);
  };

  const handleConfirmDelete = async () => {
    if (loading || !toolsData.id) return;

    setIsDeleteLoading(true);
    try {
      const API_ENDPOINT_PATH = `${url.DELETE_AGENT_TOOLS_LIST}/${toolsData.id}`;
      const result = await axiosAuth.delete(API_ENDPOINT_PATH);

      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setOpenconfirmModel(false);
        setAddToolSheetOpen(false);
        dispatch(handleToolUpdateEvents(true));
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setIsDeleteLoading(false);
    }
  };
  // --- END: Delete agent tools  ---

  const fetchTestTool = async () => {
    setTestToolsLoading(true);
    let API_ENDPOINT_PATH = `${url.LIST_TOOLS}/${toolsData?.id}`;
    try {
      const result = await axiosAuth.get(API_ENDPOINT_PATH);
      if (result.status === 200) {
        setInputSchemaData(result.data.input_schema);
        setSupportsCustomFields(
          !!result.data.tool_config?.supports_custom_fields,
        );
        setCustomFields(
          Array.isArray(result.data.custom_fields)
            ? result.data.custom_fields
            : [],
        );
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    } finally {
      setTestToolsLoading(false);
    }
  };

  useEffect(() => {
    if (toolsData?.id) {
      fetchTestTool();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolsData?.id]);

  return (
    <>
      <Sheet open={addToolSheetOpen} onOpenChange={setAddToolSheetOpen}>
        <SheetContent
          onCloseAutoFocus={closeSheetEventHandler}
          preventAutoClose={
            userEvents === "editTool" ||
            userEvents === "addTool" ||
            userEvents === "viewTool"
          }
          className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
        >
          <ToolSheetHeader
            toggleTestingModal={toggleTestingModal}
            userEvents={userEvents}
            inputSchemaData={inputSchemaData}
            isCreatUpdateAgentTool={isCreatUpdateAgentTool ?? false}
            canMutateTools={canMutateTools}
            supportsCustomFields={supportsCustomFields}
          />
          <div className="grow">
            <div
              className={`grid gap-4 px-4 ${
                userEvents === "editTool" ? "" : "last:pb-4"
              }`}
            >
              <Form {...addNewToolForm}>
                <ToolForm
                  userEvents={userEvents}
                  handleFieldChange={handleFieldChange}
                  getApiType={getApiType}
                  endPointMethod={endPointMethod}
                  setMethodSelectionHandler={setMethodSelectionHandler}
                  setOpenModalType={setOpenModalType}
                  setEditIndex={setEditIndex}
                  setEditDetails={setEditDetails}
                  setAddEditModalOpen={setAddEditModalOpen}
                  headersList={headersList}
                  setHeadersList={setHeadersList}
                  queryParametersList={queryParametersList}
                  setQueryParametersList={setQueryParametersList}
                  supportsCustomFields={supportsCustomFields}
                />
              </Form>
              {(userEvents === "addTool" ||
                ((userEvents === "viewTool" || userEvents === "editTool") &&
                  apiType.includes(toolsData?.api_type))) && (
                <AgentToolAuth
                  cardTitle="Authentication"
                  formValue={addNewToolForm}
                  userEvents={userEvents}
                />
              )}

              {testToolsLoading ? (
                <div className="flex justify-center items-center py-10 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  {userEvents === "viewTool" &&
                    inputSchemaData &&
                    Object.keys(inputSchemaData).length > 0 && (
                      <ViewTool inputSchemaData={inputSchemaData} />
                    )}

                  {supportsCustomFields &&
                    (userEvents === "viewTool" ||
                      userEvents === "editTool") && (
                      <CustomFieldsCard
                        customFields={customFields}
                        setCustomFields={setCustomFields}
                        userEvents={userEvents}
                      />
                    )}
                </>
              )}
            </div>
          </div>

          {userEvents !== "viewTool" && canMutateTools && (
            <ToolSheetFooter
              variant={variant}
              label={label}
              onClick={onClick}
              isLoading={isLoading}
              form={addNewToolForm}
              handleDeleteClick={handleDeleteClick}
              setHeadersList={setHeadersList}
              setQueryParametersList={setQueryParametersList}
              supportsCustomFields={supportsCustomFields}
            />
          )}
        </SheetContent>
      </Sheet>

      {addEditModalOpen && (
        <AddEditModal
          open={addEditModalOpen}
          editDetails={editDetails}
          title={
            editIndex !== null
              ? openModalType === "header"
                ? "Edit Header"
                : openModalType === "parameter"
                  ? "Edit Query Parameter"
                  : ""
              : openModalType === "header"
                ? "Add New Header"
                : openModalType === "parameter"
                  ? "Add New Query Parameter"
                  : ""
          }
          onClode={() => {
            setAddEditModalOpen(false);
            setOpenModalType(null);
            setEditDetails(null);
            setEditIndex(null);
          }}
          onSubmitValues={onSubmitValues}
          index={editIndex}
        />
      )}

      {/* Test Tool Modal */}
      <TestToolModal
        open={isTestingToolOpen}
        onClose={() => toggleTestingModal(false)}
        inputSchemaData={inputSchemaData ?? undefined}
        id={toolsData?.id}
      />

      <CustomDeleteDialog
        open={openconfirmModel}
        onOpenChange={setOpenconfirmModel}
        handleAlert={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title={"Are you sure you want to delete this Agent tool?"}
        description={
          "This action cannot be undone and will permanently delete this tool."
        }
      />
    </>
  );
}
