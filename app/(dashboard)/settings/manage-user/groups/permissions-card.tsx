"use client";
import React, { useEffect, useMemo } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  allValuesUndefinedNullOrEmpty,
  getCardHeaderTitle,
  setOptions,
  setOptionsWithValue,
} from "@/helper/helper-function";
import HeaderHoverCard from "@/components/header";

function flatNoAccessDefaults(
  list: Array<{ key: string; data_filters?: Record<string, unknown> }> | null,
): Record<string, string> {
  if (!list?.length) return {};
  const out: Record<string, string> = {};
  for (const feature of list) {
    const df = feature.data_filters;
    if (!df || typeof df !== "object") continue;
    for (const filterKey of Object.keys(df)) {
      out[`${feature.key}&${filterKey}`] = "no_access";
    }
  }
  return out;
}

interface PermissionsProps {
  permissionList: any;
  permissionFormSchemaModal: any;
  setUserRolesPermission: (permissionModal: any) => void;
  sendUserRoleAPIModal: any;
  formType: string | null;
}

const PermissionCard = ({
  permissionList,
  permissionFormSchemaModal,
  setUserRolesPermission,
  sendUserRoleAPIModal,
  formType,
}: PermissionsProps) => {
  const permissionFormSchema = z.object(permissionFormSchemaModal);
  const defaultValues = useMemo(
    () => flatNoAccessDefaults(permissionList),
    [permissionList],
  );
  const permissionForm = useForm<z.infer<typeof permissionFormSchema>>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues,
    mode: "onChange",
  });

  //================[Function: Change handler sub controls ]=============================================//
  const onChangeSubHandler = (value: any, sub_key: any) => {
    let values = permissionForm.getValues();
    if (
      values[sub_key] != null &&
      values[sub_key] != undefined &&
      values[sub_key] != "" &&
      value != "all_access" &&
      value != "no_access" &&
      !values[sub_key].includes("all_access") &&
      !values[sub_key].includes("no_access")
    ) {
      let subValue = values[sub_key];
      let valuesList =
        subValue && subValue != undefined && subValue != ""
          ? subValue.split("|")
          : [];
      let findIndex =
        valuesList && valuesList.length != 0
          ? valuesList.findIndex((item: any) => item == value)
          : -1;
      if (findIndex == -1) {
        let valueNew = values[sub_key] + "|" + value;
        permissionForm.setValue(sub_key, valueNew);
      } else {
        valuesList.splice(findIndex, 1);
        permissionForm.setValue(sub_key, valuesList.join("|"));
      }
    } else {
      permissionForm.setValue(sub_key, value);
    }
    sendBackToAPI();
  };

  const sendBackToAPI = () => {
    let getFormModal = permissionForm.getValues();
    let sendAPIModal: any = {};

    if (
      getFormModal &&
      Object.keys(getFormModal).length !== 0 &&
      !allValuesUndefinedNullOrEmpty(getFormModal)
    ) {
      Object.keys(getFormModal).forEach((key: any) => {
        if (getFormModal.hasOwnProperty(key)) {
          let newKey = key.split("&");
          if (newKey && newKey.length !== 0) {
            let dataAccess = getFormModal[key];
            dataAccess =
              dataAccess && dataAccess !== null && dataAccess !== ""
                ? dataAccess.split("|")
                : null;

            if (dataAccess) {
              let dataAccessPoint: any = {};

              if (dataAccess.includes("all_access")) {
                // Set key value as true for "all_access"
                dataAccessPoint[newKey[1]] = true;
              } else if (dataAccess.includes("no_access")) {
                // Set key value as false for "no_access"
                dataAccessPoint[newKey[1]] = false;
              } else {
                // Include actual values if neither "all_access" nor "no_access"
                dataAccessPoint[newKey[1]] = dataAccess;
              }

              sendAPIModal[newKey[0]] = dataAccessPoint;
            }
          }
        }
      });
      // Set the filtered permission data
      setUserRolesPermission(sendAPIModal);
    } else {
      setUserRolesPermission(null);
    }
  };

  useEffect(() => {
    if (formType === "editUserGroup") {
      if (
        sendUserRoleAPIModal &&
        Object.keys(sendUserRoleAPIModal).length > 0
      ) {
        Object.entries(sendUserRoleAPIModal).forEach(([key, value]) => {
          if (value && Object.keys(value).length > 0) {
            Object.entries(value).forEach(([subKey, keyValue]) => {
              if (Array.isArray(keyValue)) {
                if (keyValue.length === 0) {
                  permissionForm.setValue(`${key}&${subKey}`, "all_access");
                } else if (keyValue.includes("")) {
                  permissionForm.setValue(`${key}&${subKey}`, "no_access");
                } else {
                  permissionForm.setValue(
                    `${key}&${subKey}`,
                    keyValue.join("|"),
                  );
                }
              } else if (typeof keyValue === "boolean") {
                permissionForm.setValue(
                  `${key}&${subKey}`,
                  keyValue ? "all_access" : "no_access",
                );
              } else {
                permissionForm.setValue(`${key}&${subKey}`, "");
              }
            });
          }
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formType]);

  useEffect(() => {
    if (
      (formType === "addUserGroup" || formType === "editUserGroup") &&
      permissionList?.length
    ) {
      sendBackToAPI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formType, permissionList]);

  return (
    <Form {...permissionForm}>
      <form className="space-y-3">
        {permissionList && permissionList.length != 0
          ? permissionList.map((mainFeature: any) => (
              <div className="" key={mainFeature.key}>
                <HeaderHoverCard
                  title={getCardHeaderTitle(mainFeature.key)}
                  message={mainFeature["description"]}
                  type="field"
                />

                {/* </CardHeader> */}
                <div className="py-3">
                  {mainFeature["data_filters"] &&
                  mainFeature["data_filters"] != null &&
                  Object.keys(mainFeature["data_filters"]).length != 0
                    ? Object.keys(mainFeature["data_filters"]).map((key) => (
                        <div className="" key={mainFeature.key + "&" + key}>
                          {/* <span>{getCardHeaderTitle(key)}</span> */}
                          {/* <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
                            {getCardHeaderTitle(key)}
                          </label> */}
                          <FormField
                            control={permissionForm.control}
                            name={mainFeature.key + "&" + key}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                          "max-w-full justify-between cursor-pointer",
                                          !field.value &&
                                            "text-muted-foreground",
                                        )}
                                      >
                                        {field.value &&
                                        setOptions(
                                          mainFeature["data_filters"][key],
                                          field.value,
                                        ).length > 1 ? (
                                          <div className="flex flex-row items-center justify-content space-x-3">
                                            <span>
                                              {
                                                setOptions(
                                                  mainFeature["data_filters"][
                                                    key
                                                  ],
                                                  field.value,
                                                )[0]
                                              }
                                            </span>
                                            <span>
                                              <Badge variant="outline">
                                                {setOptions(
                                                  mainFeature["data_filters"][
                                                    key
                                                  ],
                                                  field.value,
                                                ).length -
                                                  1 +
                                                  "+"}
                                              </Badge>
                                            </span>
                                          </div>
                                        ) : field.value &&
                                          setOptions(
                                            mainFeature["data_filters"][key],
                                            field.value,
                                          ).length == 1 ? (
                                          <span>
                                            {setOptions(
                                              mainFeature["data_filters"][key],
                                              field.value,
                                            ).map((item) => item + " ")}
                                          </span>
                                        ) : (
                                          <span>
                                            Select {getCardHeaderTitle(key)}
                                          </span>
                                        )}
                                        <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-(--radix-popover-trigger-width) max-h-(--radix-popover-content-available-height) p-0">
                                    <Command>
                                      <CommandInput
                                        placeholder="Search..."
                                        className="h-9"
                                      />
                                      <CommandEmpty>
                                        No data found.
                                      </CommandEmpty>
                                      <CommandGroup
                                        onWheel={(e) => e.stopPropagation()}
                                        className="max-h-[200px] overflow-y-auto"
                                      >
                                        {mainFeature["data_filters"][key].map(
                                          (option: any) => (
                                            <CommandItem
                                              className="cursor-pointer"
                                              value={option.label}
                                              key={option.value}
                                              onSelect={() => {
                                                onChangeSubHandler(
                                                  option.value,
                                                  mainFeature.key + "&" + key,
                                                );
                                              }}
                                            >
                                              {getCardHeaderTitle(option.label)}
                                              <CheckIcon
                                                className={cn(
                                                  "ml-auto h-4 w-4",
                                                  setOptionsWithValue(
                                                    mainFeature["data_filters"][
                                                      key
                                                    ],
                                                    field.value,
                                                  ).find(
                                                    (templateI) =>
                                                      templateI == option.value,
                                                  )
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                                )}
                                              />
                                            </CommandItem>
                                          ),
                                        )}
                                      </CommandGroup>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </FormItem>
                            )}
                          />
                        </div>
                      ))
                    : null}
                </div>
              </div>
            ))
          : null}
      </form>
    </Form>
  );
};

export default PermissionCard;
