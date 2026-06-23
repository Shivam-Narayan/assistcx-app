"use client";

import { LLMToolSelector } from "@/components/tool-selectors/llm-tool-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DynamicMultiSelectUserListCombobox } from "@/components/user-management/dynamic-multi-select-user-list";
import {
  User,
  useUsersListManagement,
} from "@/components/user-management/hook/useUserManagement";
import { handleSpaceValidation } from "@/lib/utils";
import { Loader2, NotebookTabs, Pencil } from "lucide-react";
import Loading from "../loading";
import type { PreferenceSettingsApi } from "./hook/usePreference";
import ViewPreferanceData from "./view-preferance-data";
import { useMemo } from "react";

const AddEditViewPreferancePage = ({
  isOrganizationUpdate,
  preference,
}: {
  isOrganizationUpdate: boolean;
  preference: PreferenceSettingsApi;
}) => {
  const {
    loading,
    isEdit,
    configData,
    isLoading,
    isLoadingData,
    form,
    handleCancel,
    onSubmit,
    addCompanyInfo,
    filteredLlmItems,
    llmSearch,
    setLlmSearch,
  } = preference;
  const {
    usersList,
    usersLoading,
    page,
    setPage,
    hasMore,
    isFetchingMore,
    setIsFetchingMore,
    userSearch,
    setUserSearch,
  } = useUsersListManagement();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex justify-center pb-4">
      <Card className="w-160 p-0 gap-0">
        <CardHeader className="px-4 py-4!">
          <CardTitle className="flex flex-row justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary shrink-0">
                <NotebookTabs className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold">Account Preference</p>
                <p className="text-xs text-muted-foreground font-normal">
                  Configure default behavior and application settings
                </p>
              </div>
            </div>
            {isOrganizationUpdate &&
              (!isEdit ? (
                <div
                  className="p-2 rounded-md cursor-pointer hover:bg-secondary"
                  onClick={addCompanyInfo}
                >
                  <Pencil size={18} />
                </div>
              ) : (
                <div className="space-x-2">
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isLoading}
                    size="sm"
                    className="cursor-pointer"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              ))}
          </CardTitle>
        </CardHeader>
        {!isEdit && (
          <CardContent className="pb-2 flex flex-col divide-y">
            <ViewPreferanceData
              configData={configData}
              // platformAlertRecipients={platformAlertRecipients}
              isLoadingData={isLoadingData}
            />
          </CardContent>
        )}
        {isEdit && (
          <CardContent className="pb-6">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="agentllm"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel
                        className="text-foreground required"
                        onClick={(e) => e.preventDefault()}
                      >
                        Default LLM Model
                      </FormLabel>
                      <LLMToolSelector
                        items={filteredLlmItems}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Default LLM Model"
                        buttonClassName="w-full hover:bg-background"
                        searchPlaceholder="Search Default LLM..."
                        localSearch={llmSearch}
                        setLocalSearch={setLlmSearch}
                        disabled={!isOrganizationUpdate}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fastllm"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel
                        className="text-foreground required"
                        onClick={(e) => e.preventDefault()}
                      >
                        Fast LLM Model
                      </FormLabel>
                      <LLMToolSelector
                        items={filteredLlmItems}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Fast LLM Model"
                        buttonClassName="w-full hover:bg-background"
                        searchPlaceholder="Search Fast LLM..."
                        localSearch={llmSearch}
                        setLocalSearch={setLlmSearch}
                        disabled={!isOrganizationUpdate}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel className="text-foreground required">
                        Default Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter email"
                          maxLength={80}
                          {...field}
                          onChange={(event) => {
                            const cleaned = event.target.value
                              .replaceAll(/\s*/g, "")
                              .toLowerCase();
                            field.onChange(cleaned);
                          }}
                          onKeyDown={handleSpaceValidation}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platform_alert_recipients"
                  render={({ field }) => {
                    const selectedUsers = Array.isArray(field.value)
                      ? field.value.map((user: any) => ({
                          id: user.id || user.user_id,
                          email: user.email || user.email_id,
                          name: user.name,
                        }))
                      : [];

                    const normalizedUsersList = usersList.map((user: User) => ({
                      id: user.id || user.user_id,
                      name:
                        user.name ||
                        `${user.first_name || ""} ${user.last_name || ""}`.trim(),
                      email: user.email || user.email_id,
                    }));

                    const mergedUsersList = useMemo(() => {
                      const usersMap = new Map(
                        normalizedUsersList.map((u) => [u.id, u]),
                      );

                      return [
                        ...normalizedUsersList,
                        ...selectedUsers.filter((s) => !usersMap.has(s.id)),
                      ];
                    }, [normalizedUsersList, selectedUsers]);

                    const userItems = mergedUsersList.map((user) => ({
                      value: user.id,
                      label: user.name,
                      description: user.email,
                    }));

                    const valuesArray: string[] = selectedUsers
                      .map((user) => user.id)
                      .filter(Boolean);
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-foreground">
                          Platform Alert Recipients
                        </FormLabel>
                        <FormControl>
                          <DynamicMultiSelectUserListCombobox
                            maxRows={2}
                            items={userItems}
                            value={valuesArray}
                            onChange={(selectedValues: string[]) => {
                              const selected = mergedUsersList
                                .filter((user) =>
                                  selectedValues.includes(user.id),
                                )
                                .map((user) => ({
                                  id: user.id,
                                  email: user.email,
                                  name: user.name,
                                }));

                              field.onChange(selected);
                            }}
                            placeholder="Select reviewers..."
                            searchPlaceholder="Search users..."
                            buttonClassName="w-full bg-white dark:bg-input/30"
                            loading={usersLoading}
                            localSearch={userSearch}
                            setLocalSearch={setUserSearch}
                            setPage={setPage}
                            hasMore={hasMore}
                            isFetchingMore={isFetchingMore}
                            setIsFetchingMore={setIsFetchingMore}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </form>
            </Form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AddEditViewPreferancePage;
