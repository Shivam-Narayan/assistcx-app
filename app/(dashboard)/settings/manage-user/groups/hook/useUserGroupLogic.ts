import {
  errorMessageHandler,
  setOptionsFormatter,
  successMessageHandler,
} from "@/helper/helper-function";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canDelete, canEdit } from "@/lib/permissions";
import { userGroupformSchema } from "@/lib/schemas/settings/user-group-schemas";
import { displayNameToIdentifierKey } from "@/lib/utils";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleUserGroupEvents } from "@/redux/settings/user-group/user-group-events-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as z from "zod";

interface IDataRow {
  label?: string;
  value?: string;
}
const useUserGroupLogic = (
  loadTableData: (data: any, type: PostActionStateSyncAction) => void,
) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const userEvents = useAppSelector(
    (state) => state?.userGroupEventReducer?.value?.userEvent,
  );
  const userGroupData = useAppSelector(
    (state) => state?.userGroupDataReducer?.value,
  );
  const sheetEvent = useAppSelector(
    (state) => state?.sheetTriggerReducer?.value?.sheetEvent,
  );
  const [isLoading, setLoading] = useState(false);
  const [loader, setLoader] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [openconfirmModel, setOpenconfirmModel] = useState(false);
  const [permissionFormSchema, setPermissionFormSchema] =
    React.useState<any>(null);
  const [permissionList, setPermissionList] = useState<any>(null);
  const [sendUserRoleAPIModal, setSendUserRoleAPIModal] =
    React.useState<any>(null);
  const [formType, setFormType] = React.useState<string | null>(null);
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );

  const isCreateUpdateUser = canEdit(permissions, "user_management");
  const isDeleteUser = canDelete(permissions, "user_management");

  const form = useForm<z.infer<typeof userGroupformSchema>>({
    resolver: zodResolver(userGroupformSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setSheetOpen(sheetEvent);
    if (sheetEvent) {
      getDataAccessRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetEvent, loading]);

  const getDataAccessRole = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = url.GET_PERMISSIONS_DATA_ACCESS;
      try {
        setLoader(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH);
        if (result?.status === 200) {
          var permissionListData = result?.data?.features;
          if (
            permissionListData != null &&
            permissionListData != undefined &&
            permissionListData != "" &&
            permissionListData.length != 0
          ) {
            var permissionSchemas = [];
            for (var j = 0; j < permissionListData.length; j++) {
              let subControls = permissionListData[j]["data_filters"];
              let MainKey = permissionListData[j]["key"];
              let subControlsList = [];
              if (!subControls || typeof subControls !== "object") {
                permissionListData[j]["data_filters"] = {};
                subControls = permissionListData[j]["data_filters"];
              }
              if (Object.keys(subControls).length != 0) {
                for (const key in subControls) {
                  if (subControls.hasOwnProperty(key)) {
                    subControlsList.push(
                      z.object({
                        [MainKey + "&" + key]: z.string().optional(),
                      }),
                    );

                    let filterOption = setOptionsFormatter(subControls[key]);
                    if (filterOption && filterOption.length != 0) {
                      filterOption.splice(0, 0, {
                        label: "All Access",
                        value: "all_access",
                      });
                      filterOption.splice(1, 0, {
                        label: "No Access",
                        value: "no_access",
                      });
                      permissionListData[j]["data_filters"][key] = filterOption;
                    } else {
                      let defaultList: any[] = [];
                      defaultList.push({
                        label: "All Access",
                        value: "all_access",
                      });
                      defaultList.push({
                        label: "No Access",
                        value: "no_access",
                      });
                      permissionListData[j]["data_filters"][key] = defaultList;
                    }
                  }
                }
              } else {
                const placeholderKey = "_access";
                subControls[placeholderKey] = [
                  { label: "All Access", value: "all_access" },
                  { label: "No Access", value: "no_access" },
                ];
                subControlsList.push(
                  z.object({
                    [MainKey + "&" + placeholderKey]: z.string().optional(),
                  }),
                );
              }

              permissionSchemas.push(
                z.object({
                  [MainKey + "_0"]: z.array(subControls),
                }),
              );
            }
            setPermissionFormSchema({
              permission: z.array<any>(permissionSchemas),
            });

            setPermissionList(null);
            setPermissionList(permissionListData);
          }
        }
      } catch (error: any) {
        errorMessageHandler(error);
      } finally {
        setLoader(false);
      }
    }
  };

  // Prefill Data Access (PermissionCard)
  useEffect(() => {
    if (
      userEvents &&
      (userEvents === "editUserGroup" || userEvents === "viewUserGroup") &&
      userGroupData?.data_access &&
      Object.keys(userGroupData.data_access).length > 0
    ) {
      setSendUserRoleAPIModal(userGroupData.data_access);
    }

    if (userEvents === "addUserGroup") {
      setSendUserRoleAPIModal(null);
      setFormType("addUserGroup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEvents, userGroupData]);

  useEffect(() => {
    if (userEvents === "addUserGroup") {
      form.reset({
        name: "",
        description: "",
      });
      setFormType("addUserGroup");
    }

    if (userEvents === "editUserGroup" && userGroupData) {
      form.reset({
        name: userGroupData.name ?? "",
        description: userGroupData.description ?? "",
      });
      setFormType("editUserGroup");
    }
  }, [userEvents, userGroupData, form]);

  const setUserRolesPermission = (permissionModal: any) => {
    if (permissionModal && Object.keys(permissionModal).length != 0) {
      setSendUserRoleAPIModal(null);
      setSendUserRoleAPIModal(permissionModal);
    } else {
      setSendUserRoleAPIModal(null);
    }
  };
  const userGroupInfo: IDataRow[] = [
    { label: "Name", value: userGroupData?.name },
    { label: "Description", value: userGroupData?.description },
  ];

  const handleUserGroupField = (e: any) => {
    const value = e.target.value.trim();
  };
  //============[Function:: Add/Edit user details]==========================//
  async function onSubmit(values: z.infer<typeof userGroupformSchema>) {
    if (!loading) {
      if (userEvents === "addUserGroup") {
        setLoading(true);
        let body = {
          name: values.name,
          description: values.description,
          key: displayNameToIdentifierKey(values.name.trim()),
          data_access:
            sendUserRoleAPIModal &&
            Object.keys(sendUserRoleAPIModal).length != 0
              ? sendUserRoleAPIModal
              : {},
        };
        try {
          const result = await axiosAuth.post(url.POST_USER_GROUP, body);
          if (result?.status === 200) {
            const newItem = result.data;
            setLoading(false);
            successMessageHandler("User group added successfully");
            setSendUserRoleAPIModal(null);
            setSheetOpen(false);

            loadTableData(newItem, "add");
          }
        } catch (error: any) {
          errorMessageHandler(error.response.data.detail);
          setLoading(false);
        }
      } else {
        setLoading(true);
        let body = {
          name: values.name,
          description: values.description,
          key: displayNameToIdentifierKey(values.name.trim()),
          data_access:
            sendUserRoleAPIModal &&
            Object.keys(sendUserRoleAPIModal).length != 0
              ? sendUserRoleAPIModal
              : {},
        };

        try {
          const result = await axiosAuth.patch(
            `${url.POST_USER_GROUP}/${userGroupData?.id}`,
            body,
          );
          if (result?.status === 200) {
            const updatedItem = result.data;
            successMessageHandler("User group updated successfully");
            setSendUserRoleAPIModal(null);
            setLoading(false);
            setSheetOpen(false);
            loadTableData(updatedItem, "update");
          } else {
            setLoading(false);
            errorMessageHandler(result);
          }
        } catch (error: any) {
          setLoading(false);
          errorMessageHandler(error?.response?.data?.detail);
        }
      }
    }
  }

  //============[Function:: Reset Add/Edit Form modal]==========================//
  function handleResetForm() {
    form.reset({
      name: "",
      description: "",
    });

    dispatch(handleSheetEvents(false));
    dispatch(handleUserGroupEvents(""));
    setSendUserRoleAPIModal(null);
    setFormType(null);
  }

  //============[Function:: Handle Edit Intent Class details]==========================//
  const handleEditUserGroup = () => {
    dispatch(handleUserGroupEvents("editUserGroup"));
  };

  const getButtonProps = () => {
    switch (userEvents) {
      case "addUserGroup":
        return {
          label: "Add User Group",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      case "editUserGroup":
        return {
          label: "Update User Group",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      default:
        return {};
    }
  };

  const { label, variant, onClick } = getButtonProps();

  //============[Function:: Handle Cancel Edit Intent Class details]==========================//
  const cancleEdit = () => {
    dispatch(handleUserGroupEvents("viewUserGroup"));
  };

  //============[Function:: delete User groups func]==========================//
  const handleDeleteClick = () => {
    setOpenconfirmModel(true);
  };

  const handleConfirmDelete = async () => {
    if (loading || !userGroupData?.id) return;

    setIsDeleteLoading(true);
    try {
      const API_ENDPOINT_PATH = `${url.DELETE_USER_GROUP}/${userGroupData?.id}`;
      const result = await axiosAuth.delete(API_ENDPOINT_PATH);

      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setOpenconfirmModel(false);
        setSheetOpen(false);
        loadTableData(userGroupData, "delete");
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return {
    userEvents,
    form,
    isLoading,
    loader,
    sheetOpen,
    setSheetOpen,
    openconfirmModel,
    permissionFormSchema,
    permissionList,
    formType,
    isCreateUpdateUser,
    isDeleteUser,
    setUserRolesPermission,
    userGroupInfo,
    handleUserGroupField,
    onSubmit,
    handleResetForm,
    handleEditUserGroup,
    label,
    variant,
    onClick,
    cancleEdit,
    handleDeleteClick,
    handleConfirmDelete,
    sendUserRoleAPIModal,
    userGroupData,
    setOpenconfirmModel,
    isDeleteLoading,
  };
};
export default useUserGroupLogic;
