"use client";

import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import CustomDeleteDialog from "@/components/custom-delete-dialog";
import HeaderHoverCard from "@/components/header";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  capitalizeMessage,
  errorMessageHandler,
  successMessageHandler,
  UTCToLocalTimezon,
} from "@/helper/helper-function";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { canDelete } from "@/lib/permissions";
import {
  formSchema,
  FormSchemaType,
} from "@/lib/schemas/settings/user-roles-schemas";
import { displayNameToIdentifierKey, handleSpaceValidation } from "@/lib/utils";
import { handleSheetEvents } from "@/redux/common/sheet-event-slice";
import { handleRolesEvents } from "@/redux/settings/roles/role-event-slice";
import {
  handleRolesData,
  RolePermissionsPayload,
} from "@/redux/settings/roles/roles-data-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import PermissionCard, {
  buildRolePermissionRows,
  extractPermissionDefinitions,
  PermissionDefinition,
  RolePermissionRow,
} from "./permissions-card";

function formatValidationFieldLabel(raw: string) {
  return raw.replace(/_/g, " ").replace(/\w+/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

function rolePermissionRowsToApiPayload(
  rows: RolePermissionRow[],
): RolePermissionsPayload {
  const modules: Record<string, { level: string }> = {};
  for (const row of rows) {
    if (row.access_level === "none") continue;
    modules[row.key] = { level: row.access_level };
  }
  return { modules };
}

function getExistingPermissions(
  roleData: Record<string, unknown> | undefined,
): RolePermissionRow[] {
  const raw = roleData?.role_permissions ?? roleData?.permissions;
  if (
    raw &&
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    "modules" in raw
  ) {
    const mod = (raw as RolePermissionsPayload).modules;
    if (!mod || typeof mod !== "object") return [];
    return Object.entries(mod).map(([key, value]) => ({
      key,
      access_level: (value?.level ?? "none").toLowerCase(),
    }));
  }
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      const row = item as RolePermissionRow;
      return {
        key: row.key,
        access_level: row.access_level.toLowerCase(),
      };
    });
  }
  return [];
}

interface IDataRow {
  label?: string;
  value?: string;
}
interface ReceivingComponentProps {
  loadTableData: (data: any, type: PostActionStateSyncAction) => void;
  isCreateUpdateRole: boolean;
}

export function AddEditViewRoles({
  loadTableData,
  isCreateUpdateRole,
}: ReceivingComponentProps) {
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole,
  );
  const showDeleteRole = permissions
    ? canDelete(permissions, "user_management")
    : false;

  const { axiosAuth, loading } = useAxiosAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [permissionDefinitions, setPermissionDefinitions] = useState<
    PermissionDefinition[]
  >([]);
  const [loader, setLoader] = useState<boolean>(false);
  const [openconfirmModel, setOpenconfirmModel] = useState(false);

  const userEvents = useAppSelector(
    (state) => state?.rolesReducer?.value?.userEvent,
  );
  const editRolesData = useAppSelector(
    (state) => state?.rolesDataReducer?.value,
  );
  const sheetEvent = useAppSelector(
    (state) => state?.sheetTriggerReducer?.value?.sheetEvent,
  );
  const [isLoading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sendUserRoleAPIModal, setSendUserRoleAPIModal] = useState<
    RolePermissionRow[] | null
  >(null);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role_name: "",
      description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setSheetOpen(sheetEvent);
    if (!sheetEvent) {
      setPermissionDefinitions([]);
      setSendUserRoleAPIModal(null);
      return;
    }
    getPermissionsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetEvent, loading]);

  useEffect(() => {
    if (userEvents === "editRoles") {
      form.setValue("role_name", editRolesData?.name ?? "");
      form.setValue("description", editRolesData?.description ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEvents]);

  const rolesInfo: IDataRow[] = [
    { label: "Role Name", value: editRolesData?.name ?? "" },
    {
      label: "Role Type",
      value: editRolesData?.default_role ? "Default" : "Custom",
    },
    {
      label: "Created At",
      value: UTCToLocalTimezon(editRolesData?.created_at) ?? "",
    },
    {
      label: "Updated At",
      value: UTCToLocalTimezon(editRolesData?.updated_at) ?? "",
    },
    { label: "Description", value: editRolesData?.description ?? "" },
  ];

  async function onSubmit(values: FormSchemaType) {
    if (!loading) {
      if (userEvents === "addRoles") {
        setLoading(true);
        let roleKey: any = values.role_name;
        roleKey =
          roleKey && roleKey != null
            ? displayNameToIdentifierKey(values.role_name.trim())
            : null;
        let body = {
          name: values.role_name,
          description: values.description,
          default_role: false,
          role_permissions: rolePermissionRowsToApiPayload(
            sendUserRoleAPIModal ?? [],
          ),
          role_key: roleKey,
        };
        try {
          const result = await axiosAuth.post(url.USER_ROLES, body);
          if (result?.status === 200) {
            const newItem = result.data;
            setLoading(false);
            successMessageHandler(messages.user_role_added_successfully);
            setSheetOpen(false);
            loadTableData(newItem, "add");
          } else {
            console.log("error");
            errorMessageHandler(result);
          }
        } catch (error: any) {
          console.error(error);
          setLoading(false);
          if (error.response.status == url.WHITESPACE_INPUT_ERROR_CODE) {
            if (
              error?.response?.data?.detail &&
              Array.isArray(error.response.data.detail)
            ) {
              errorMessageHandler(
                capitalizeMessage(error?.response?.data?.detail[0]["msg"]) +
                  " : " +
                  formatValidationFieldLabel(
                    error?.response?.data?.detail[0]?.loc[1],
                  ),
              );
            }
          } else {
            errorMessageHandler(error);
          }
        }
      } else {
        setLoading(true);
        let roleKey: any = values.role_name;
        roleKey =
          roleKey && roleKey != null
            ? displayNameToIdentifierKey(values.role_name.trim())
            : null;
        let body = {
          name: values.role_name,
          description: values.description,
          role_permissions: rolePermissionRowsToApiPayload(
            sendUserRoleAPIModal ?? [],
          ),
          default_role: editRolesData.default_role,
          role_key: roleKey,
        };
        try {
          const result = await axiosAuth.patch(
            `${url.USER_ROLES}/${editRolesData?.id}`,
            body,
          );
          if (result?.status === 200) {
            const updatedItem = result.data;
            setLoading(false);
            successMessageHandler(messages.user_role_updated_successfully);
            setSheetOpen(false);
            loadTableData(updatedItem, "update");
          } else {
            console.log("error");
            setLoading(false);
            errorMessageHandler(result);
          }
        } catch (error: any) {
          console.error(error);
          setLoading(false);
          if (error.response.status == url.WHITESPACE_INPUT_ERROR_CODE) {
            if (
              error?.response?.data?.detail &&
              Array.isArray(error.response.data.detail)
            ) {
              errorMessageHandler(
                capitalizeMessage(error?.response?.data?.detail[0]["msg"]) +
                  " : " +
                  formatValidationFieldLabel(
                    error?.response?.data?.detail[0]?.loc[1],
                  ),
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
    const resetRolesData = {
      id: "",
      name: "",
      description: "",
      created_at: "",
      updated_at: "",
      role_type: "",
      role_permissions: { modules: {} } as RolePermissionsPayload,
      default_role: false,
    };
    form.reset();
    setSendUserRoleAPIModal(null);
    dispatch(handleSheetEvents(false));
    dispatch(handleRolesEvents(""));
    dispatch(handleRolesData(resetRolesData));
  }

  const handleEditRoles = () => {
    const existing = getExistingPermissions(
      editRolesData as Record<string, unknown>,
    );
    setSendUserRoleAPIModal(
      buildRolePermissionRows(permissionDefinitions, existing, false),
    );
    dispatch(handleRolesEvents("editRoles"));
  };

  const getButtonProps = () => {
    switch (userEvents) {
      case "addRoles":
        return {
          label: "Add Role",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      case "editRoles":
        return {
          label: "Update Role",
          onClick: form.handleSubmit(onSubmit),
          variant: "default" as const,
        };
      default:
        return {};
    }
  };

  const { label, variant, onClick } = getButtonProps();

  const cancleEdit = () => {
    dispatch(handleRolesEvents("viewRoles"));
  };

  const getPermissionsList = async () => {
    if (!loading) {
      try {
        setLoader(true);
        const result = await axiosAuth.get(url.GET_PERMISSIONS);
        if (result?.status === 200) {
          setPermissionDefinitions(extractPermissionDefinitions(result?.data));
        }
      } catch (error: any) {
        setPermissionDefinitions([]);
      } finally {
        setLoader(false);
      }
    }
  };

  const handlePermissionAccessLevelChange = (
    permissionKey: string,
    accessLevel: string,
  ) => {
    setSendUserRoleAPIModal((previousRows) => {
      if (!previousRows) return previousRows;
      return previousRows.map((row) =>
        row.key === permissionKey ? { ...row, access_level: accessLevel } : row,
      );
    });
  };

  useEffect(() => {
    if (
      !sheetOpen ||
      userEvents !== "addRoles" ||
      !permissionDefinitions.length
    )
      return;
    setSendUserRoleAPIModal(
      buildRolePermissionRows(permissionDefinitions, [], true),
    );
  }, [sheetOpen, userEvents, permissionDefinitions]);

  const handleDeleteClick = () => {
    setOpenconfirmModel(true);
  };

  const handleConfirmDelete = async () => {
    if (loading || !editRolesData?.id) return;

    setIsDeleteLoading(true);
    try {
      const API_ENDPOINT_PATH = `${url.DELETE_USER_ROLES}/${editRolesData?.id}`;
      const result = await axiosAuth.delete(API_ENDPOINT_PATH);

      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        setOpenconfirmModel(false);
        setSheetOpen(false);
        loadTableData(editRolesData, "delete");
      } else {
        errorMessageHandler(result);
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          onCloseAutoFocus={handleResetForm}
          preventAutoClose={
            userEvents === "addRoles" || userEvents === "editRoles"
          }
          className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto"
        >
          <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
            <div className="w-full flex justify-start items-center space-x-2 divide-x">
              <SheetTitle className="sr-only">User Group</SheetTitle>
              <HeaderHoverCard
                title={
                  userEvents === "addRoles"
                    ? "Add Role"
                    : userEvents === "editRoles"
                      ? "Edit Role"
                      : "View Role"
                }
                message="Configure and manage user roles with their permissions"
                type="sheet"
              />
            </div>

            {userEvents === "viewRoles" && isCreateUpdateRole && (
              <div
                onClick={handleEditRoles}
                className="p-2 rounded-md cursor-pointer hover:bg-secondary "
              >
                <Pencil size={20} />
              </div>
            )}
            <SheetClose asChild>
              <div
                className="p-2 rounded-md cursor-pointer hover:bg-secondary"
                onClick={handleResetForm}
              >
                <X className="w-5 h-5" />
              </div>
            </SheetClose>
          </SheetHeader>
          {loader ? (
            <Loader className="h-full" />
          ) : (
            <div className="grow">
              <div className="grid gap-5 px-4">
                {(userEvents === "addRoles" || userEvents === "editRoles") && (
                  <Card className="shadow-none p-0 gap-0">
                    <CardHeader
                      className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0 text-xl font-semibold 
           leading-none tracking-tight"
                    >
                      <HeaderHoverCard
                        title="Common Details"
                        message="Basic information fo the user role"
                        type="card"
                      />
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col ">
                      <div className="p-4">
                        <Form {...form}>
                          <form className="space-y-4">
                            <FormField
                              control={form.control}
                              name="role_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground required">
                                    Role Name{" "}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter role name"
                                      {...field}
                                      onKeyDown={handleSpaceValidation}
                                      maxLength={80}
                                      minLength={4}
                                      autoFocus={false}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-foreground required">
                                    Description{" "}
                                  </FormLabel>
                                  <FormControl>
                                    <AutoGrowingTextarea
                                      placeholder="Enter description"
                                      maxLength={280}
                                      maxHeight={100}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </form>
                        </Form>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(userEvents === "addRoles" || userEvents === "editRoles") &&
                  permissionDefinitions.length > 0 &&
                  sendUserRoleAPIModal != null && (
                    <PermissionCard
                      permissionDefinitions={permissionDefinitions}
                      rolePermissionRows={sendUserRoleAPIModal}
                      onAccessLevelChange={handlePermissionAccessLevelChange}
                    />
                  )}

                {userEvents === "viewRoles" && (
                  <>
                    <Card className="shadow-none p-0 gap-0">
                      <CardHeader
                        className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0 text-xl font-semibold 
           leading-none tracking-tight"
                      >
                        <HeaderHoverCard
                          title="Common Details"
                          message="Basic information fo the user role"
                          type="card"
                        />
                      </CardHeader>
                      <CardContent className="p-0 py-2 flex flex-col divide-y divide-dashed overflow-wrap-anywhere">
                        {rolesInfo.map((row: any, index: any) => (
                          <div
                            key={index}
                            className="flex flex-row px-4 py-2.5"
                          >
                            <div className="w-1/4 pr-4 font-semibold">
                              <Badge variant="secondary" className="text-sm">
                                {row.label}
                              </Badge>
                            </div>
                            <div className="w-3/4 flex gap-4 text-sm">
                              {row?.label == "Role Type" ? (
                                <Badge variant="secondary" className="text-sm">
                                  {row?.value}
                                </Badge>
                              ) : (
                                row?.value
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {permissionDefinitions.length > 0 && (
                      <PermissionCard
                        permissionDefinitions={permissionDefinitions}
                        rolePermissionRows={buildRolePermissionRows(
                          permissionDefinitions,
                          getExistingPermissions(
                            editRolesData as Record<string, unknown>,
                          ),
                          false,
                        )}
                        readOnly
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {userEvents != "viewRoles" && (
            <SheetFooter
              className={`${
                userEvents == "editRoles" && "justify-between!"
              } sticky z-10 p-3 border-t bg-background bottom-0`}
            >
              {userEvents == "editRoles" && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={cancleEdit}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  {showDeleteRole && (
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
                onClick={onClick}
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
        title={"Are you sure you want to delete this User Role?"}
        description={
          "This action cannot be undone and will permanently remove the role and its assigned permissions."
        }
      />
    </>
  );
}
