import {
  capitalizeMessage,
  errorMessageHandler,
  getCardHeaderTitle,
  setOptionsFormatter,
  successMessageHandler,
} from "@/helper/helper-function";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  teamMemberFormSchema,
  TeamMemberformSchemaType,
} from "@/lib/schemas/settings/team-members-schemas";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleTeamMembersEvents } from "@/redux/settings/team-members/team-members-event-slice";
import { handleTeamMembersData } from "@/redux/settings/team-members/team-members-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as z from "zod";

interface IDataRow {
  label?: string;
  value?: string;
}

export const useTeamMemberForm = (
  loadTableData: (
    data: any,
    type: PostActionStateSyncAction,
    changes?: Record<string, any>,
  ) => void,
) => {
  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const userEvents = useAppSelector(
    (state) => state?.teamMembersEventsReducer?.value?.userEvent,
  );
  const teamMemberData = useAppSelector(
    (state) => state?.teamMembersReducer?.value,
  );
  const sheetEvent = useAppSelector(
    (state) => state?.sheetTriggerReducer?.value?.sheetEvent,
  );
  const [loader, setLoader] = useState<boolean>(false);
  const [isLoading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = React.useState(false);
  const [passwordShow, setPasswordShow] = useState(false);
  const [roles, setRoles] = React.useState<any[]>([]);
  const [permissionFormSchema, setPermissionFormSchema] =
    React.useState<any>(null);
  const [permissionList, setPermissionList] = useState<any>(null);
  const [sendUserRoleAPIModal, setSendUserRoleAPIModal] =
    React.useState<any>(null);
  const [formType, setFormType] = React.useState<string | null>(null);
  const [TeamMemeberInfo, setTeamMemeberInfo] = React.useState<IDataRow[]>([]);
  const [openUserAction, setOpenUserAction] = useState(false);
  const [openconfirmModel, setOpenconfirmModel] = useState(false);
  const [userGroupList, setUserGroupList] = useState<any>([]);

  const form = useForm<TeamMemberformSchemaType>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "",
      emailId: "",
      password: "",
      user_group: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    setSheetOpen(sheetEvent);
    if (sheetEvent) {
      getTeamMembersData();
      getDataAccessRole();
      getUserGroupData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetEvent, loading]);

  useEffect(() => {
    if (userEvents === "addTeamMember") {
      form.reset();
      setFormType(userEvents);
    } else if (userEvents === "editTeamMember") {
      form.setValue("firstName", teamMemberData?.first_name ?? "");
      form.setValue("lastName", teamMemberData?.last_name ?? "");
      form.setValue("emailId", teamMemberData?.email?.toLowerCase() ?? "");

      form.setValue("password", "Password@123");
      if (
        teamMemberData?.role_id &&
        teamMemberData?.role_id != null &&
        roles != null &&
        roles.length != 0
      ) {
        let roleType = roles.filter(
          (item) => item["id"] == teamMemberData?.role_id,
        );
        form.setValue("role", roleType.length != 0 ? roleType[0]["name"] : "");
      }
      if (teamMemberData?.user_group_keys && userGroupList.length > 0) {
        const selectedUserGroupKeys = teamMemberData.user_group_keys.filter(
          (key: string) =>
            userGroupList.some((group: any) => group.key === key),
        );
        form.setValue("user_group", selectedUserGroupKeys);
      } else {
        form.setValue("user_group", []);
      }
      setFormType(userEvents);
    } else if (userEvents === "viewTeamMember") {
      let roleName = "";
      if (teamMemberData?.role_id && roles?.length) {
        const roleType = roles.find(
          (item) => item.id == teamMemberData.role_id,
        );
        roleName = roleType?.name ?? "";
      }

      let userGroups: any = [];
      if (teamMemberData.user_group_ids?.length > 0) {
        userGroups = teamMemberData.user_group_ids
          .map(
            (groupId: any) =>
              userGroupList.find((group: any) => group.id === groupId)?.name ||
              "",
          )
          .filter(Boolean);
      }

      const info = [
        {
          label: "Name",
          value:
            teamMemberData?.first_name && teamMemberData?.last_name
              ? `${teamMemberData.first_name} ${teamMemberData.last_name}`
              : "",
        },
        { label: "Email", value: teamMemberData?.email ?? "" },
        { label: "Role", value: roleName },
      ];

      if (userGroups.length > 0) {
        info.push({ label: "User Group", value: userGroups });
      }

      setTeamMemeberInfo(info);

      setFormType(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEvents, teamMemberData, roles, userGroupList]);

  async function onSubmit(values: TeamMemberformSchemaType) {
    if (!loading) {
      let getRoleID =
        roles.length != 0
          ? roles.filter((role) => role.name == values.role)
          : [];

      const userGroups = values.user_group ?? [];

      let getUserGroupID =
        userGroupList.length !== 0 && userGroups.length !== 0
          ? userGroupList.filter((ele: any) => userGroups.includes(ele.key))
          : [];

      if (userEvents === "addTeamMember") {
        // add Team member
        setLoading(true);
        let body = {
          email: values.emailId?.trim().toLowerCase(),
          first_name: values.firstName,
          last_name: values.lastName,
          password: values.password,
          role_id: getRoleID.length != 0 ? getRoleID[0]["id"] : values.role,
          data_access:
            sendUserRoleAPIModal &&
            Object.keys(sendUserRoleAPIModal).length != 0
              ? sendUserRoleAPIModal
              : {},
          user_group_keys: values.user_group,
          user_group_ids:
            getUserGroupID.length !== 0
              ? getUserGroupID.map((group: any) => group.id)
              : [],
        };
        try {
          const result = await axiosAuth.post(url.ADD_TEAM_MEMBERS, body);
          if (result?.status === 200) {
            const newItem = result.data;
            setLoading(false);
            successMessageHandler(messages.team_member_added_successfully);
            setSendUserRoleAPIModal(null);
            setSheetOpen(false);
            loadTableData(newItem, "add");
          } else {
            setLoading(false);
            errorMessageHandler(result);
          }
        } catch (error: any) {
          setLoading(false);
          if (error.response.status == url.WHITESPACE_INPUT_ERROR_CODE) {
            if (
              error?.response?.data?.detail &&
              Array.isArray(error.response.data.detail)
            ) {
              errorMessageHandler(
                capitalizeMessage(error?.response?.data?.detail[0]["msg"]) +
                  " : " +
                  getCardHeaderTitle(error?.response?.data?.detail[0]?.loc[1]),
              );
            }
          } else {
            errorMessageHandler(error);
          }
        }
      } else {
        // update Team member
        setLoading(true);
        let body = {
          email: values.emailId?.trim().toLowerCase(),
          first_name: values.firstName,
          last_name: values.lastName,
          role_id: getRoleID.length != 0 ? getRoleID[0]["id"] : values.role,
          data_access:
            sendUserRoleAPIModal &&
            Object.keys(sendUserRoleAPIModal).length != 0
              ? sendUserRoleAPIModal
              : {},
          user_group_keys: values.user_group,
          user_group_ids:
            getUserGroupID.length !== 0
              ? getUserGroupID.map((group: any) => group.id)
              : [],
        };
        try {
          const result = await axiosAuth.patch(
            `${url.UPDATE_TEAM_MEMBERS}/${teamMemberData?.id}`,
            body,
          );
          if (result?.status === 200) {
            const updatedItem = result.data;
            setLoading(false);
            setSendUserRoleAPIModal(null);
            successMessageHandler(messages.team_member_updated_successfully);
            setSheetOpen(false);
            loadTableData(updatedItem, "update");
          } else {
            setLoading(false);
            errorMessageHandler(result);
          }
        } catch (error: any) {
          setLoading(false);
          if (error.response.status == url.WHITESPACE_INPUT_ERROR_CODE) {
            if (
              error?.response?.data?.detail &&
              Array.isArray(error.response.data.detail)
            ) {
              errorMessageHandler(
                capitalizeMessage(error?.response?.data?.detail[0]["msg"]) +
                  " : " +
                  getCardHeaderTitle(error?.response?.data?.detail[0]?.loc[1]),
              );
            }
          } else {
            errorMessageHandler(error);
          }
        }
      }
    }
  }

  function handleResetForm() {
    const resetTeamMemberData = {
      id: "",
      first_name: "",
      last_name: "",
      email: "",
      user_group: "",
      created_at: "",
      account_status: "",
      last_login: "",
      role_id: "",
      data_access: null,
    };
    form.reset();
    dispatch(handleSheetEvents(false));
    dispatch(handleTeamMembersEvents(""));
    dispatch(handleTeamMembersData(resetTeamMemberData));
    setPasswordShow(false);
    setSendUserRoleAPIModal(null);
  }

  const handleEditTeamMember = () => {
    dispatch(handleTeamMembersEvents("editTeamMember"));
  };

  const getButtonProps = () => {
    switch (userEvents) {
      case "addTeamMember":
        return {
          label: "Add User",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      case "editTeamMember":
        return {
          label: "Update User",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      default:
        return {};
    }
  };

  const { label, variant, onClick } = getButtonProps();

  const cancleEdit = () => {
    dispatch(handleTeamMembersEvents("viewTeamMember"));
  };

  const handleUpdatePassword = () => {
    setPasswordModalOpen(true);
  };

  const getTeamMembersData = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH: string = "";
      API_ENDPOINT_PATH = url.USER_ROLES;

      try {
        setLoader(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH);
        if (result?.status === 200) {
          let rolesData =
            result?.data?.user_roles?.slice().sort((a: any, b: any) => {
              let dateA = moment(a.created_at, "MMM D YYYY, h:mm a");
              let dateB = moment(b.created_at, "MMM D YYYY, h:mm a");
              return dateB.diff(dateA);
            }) || [];

          rolesData = rolesData.map((item: any) => ({
            ...item,
            label: item.name,
            value: item.name,
            description: item.description,
          }));

          setRoles(rolesData);

          if (userEvents === "viewTeamMember") {
            let RoleType: any = "";
            if (
              teamMemberData?.role_id &&
              teamMemberData?.role_id != null &&
              rolesData != null &&
              rolesData.length != 0
            ) {
              let roleType = rolesData.filter(
                (item: any) => item["id"] == teamMemberData?.role_id,
              );
              RoleType = roleType.length != 0 ? roleType[0]["name"] : "";
            }
            setTeamMemeberInfo([]);
            setTeamMemeberInfo([
              {
                label: "Name",
                value:
                  teamMemberData?.first_name != null &&
                  teamMemberData?.last_name != null
                    ? `${teamMemberData?.first_name} ${teamMemberData?.last_name}`
                    : "",
              },
              { label: "email", value: teamMemberData?.email ?? "" },
              { label: "Role", value: RoleType ?? "" },
            ]);
          }
        }
      } catch (error: any) {
        errorMessageHandler(error);
      } finally {
        setLoader(false);
      }
    }
  };

  const getUserGroupData = async () => {
    if (!loading) {
      let API_ENDPOINT_PATH = url.GET_USER_GROUP_LIST;
      try {
        setLoader(true);
        const result = await axiosAuth.get(API_ENDPOINT_PATH);
        if (result?.status === 200) {
          let userGroupData = result?.data?.user_groups || [];
          setUserGroupList(userGroupData);
        }
      } catch (error: any) {
        errorMessageHandler(error);
      } finally {
        setLoader(false);
      }
    }
  };

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

  ///=============[FUNCTION: Set Permission Roles]==========================================//
  const setUserRolesPermission = (permissionModal: any) => {
    if (permissionModal && Object.keys(permissionModal).length != 0) {
      setSendUserRoleAPIModal(null);
      setSendUserRoleAPIModal(permissionModal);
    } else {
      setSendUserRoleAPIModal(null);
    }
  };

  useEffect(() => {
    if (
      teamMemberData &&
      teamMemberData["data_access"] &&
      Object.keys(teamMemberData["data_access"]).length != 0 &&
      (userEvents === "editTeamMember" || userEvents === "viewTeamMember")
    ) {
      setSendUserRoleAPIModal(null);
      setSendUserRoleAPIModal(teamMemberData["data_access"]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEvents]);

  const [isActivateLoading, setIsActivateLoading] = useState(false);

  const activateDeactivateUser = async () => {
    if (!loading && !isActivateLoading) {
      const action =
        teamMemberData?.account_status === "active" ? "deactivate" : "activate";
      setIsActivateLoading(true);
      try {
        const result = await axiosAuth.post(
          `${url.ACTIVATE_DEACTIVATE_USER}/${teamMemberData?.id}/${action}`,
        );
        if (result.status === 200) {
          successMessageHandler(result.data.message);
          setOpenUserAction(false);
          setSheetOpen(false);

          loadTableData(teamMemberData, "update", {
            account_status:
              teamMemberData?.account_status === "active"
                ? "inactive"
                : "active",
          });
        }
      } catch (error) {
        errorMessageHandler(error);
      } finally {
        setIsActivateLoading(false);
      }
    }
  };

  const roleItems = roles.map((role) => ({
    value: role.value,
    label: role.label,
    description: role.description,
  }));

  const userGroupItems = userGroupList.map((group: any) => ({
    value: group.key,
    label: group.name,
    description: group.description,
  }));

  // --- START: Delete Team Member  ---
  const handleDeleteClick = () => {
    setOpenconfirmModel(true);
  };

  const handleConfirmDelete = async () => {
    if (loading || !teamMemberData?.id) return;

    setIsDeleteLoading(true);
    try {
      const API_ENDPOINT_PATH = `${url.DELETE_TEAM_MEMBERS}/${teamMemberData?.id}`;
      const result = await axiosAuth.delete(API_ENDPOINT_PATH);

      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setOpenconfirmModel(false);
        setSheetOpen(false);
        loadTableData(teamMemberData, "delete");
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setIsDeleteLoading(false);
    }
  };
  // --- END: Delete Team Member  ---

  return {
    sheetOpen,
    setSheetOpen,
    handleResetForm,
    userEvents,
    teamMemberData,
    setOpenUserAction,
    handleEditTeamMember,
    loader,
    form,
    roleItems,
    userGroupItems,
    passwordShow,
    setPasswordShow,
    handleUpdatePassword,
    TeamMemeberInfo,
    sendUserRoleAPIModal,
    permissionList,
    permissionFormSchema,
    setUserRolesPermission,
    formType,
    cancleEdit,
    handleDeleteClick,
    variant,
    onClick,
    isLoading,
    label,
    passwordModalOpen,
    setPasswordModalOpen,
    openUserAction,
    activateDeactivateUser,
    isActivateLoading,
    openconfirmModel,
    setOpenconfirmModel,
    handleConfirmDelete,
    isDeleteLoading,
  };
};
