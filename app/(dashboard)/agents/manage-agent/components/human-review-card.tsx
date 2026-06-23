"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { DynamicMultiSelectUserListCombobox } from "@/components/user-management/dynamic-multi-select-user-list";
import {
  User,
  useUsersListManagement,
} from "@/components/user-management/hook/useUserManagement";
import { useFormContext, useWatch } from "react-hook-form";
import { AgentFormValues } from "../schemas/agent-schema";
import { useEffect, useMemo } from "react";
import { normalizeUser } from "../helper/helper";

const HumanReviewCard = ({ isEditing }: { isEditing: boolean }) => {
  const { control, setValue } = useFormContext<AgentFormValues>();

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

  const allowHumanReview = useWatch({
    control,
    name: "settings.enable_human_review",
  });

  useEffect(() => {
    if (!allowHumanReview) {
      setValue("settings.human_review_users", []);
    }
  }, [allowHumanReview, setValue]);

  return (
    <div className="w-full space-y-2">
      <FormField
        control={control}
        name="settings.enable_human_review"
        render={({ field }) => (
          <FormItem>
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>Enable Human Review</ItemTitle>
                <ItemDescription>
                  Agent will pause before executing specific tool actions and
                  send them for human review and approval.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                    className="mb-0 cursor-pointer"
                  />
                </FormControl>
              </ItemActions>
            </Item>
          </FormItem>
        )}
      />
      {allowHumanReview && (
        <div className="mt-3 rounded-lg border border-dashed bg-muted/50 p-4">
          <FormField
            control={control}
            name="settings.human_review_users"
            render={({ field }) => {
              const selectedUsers = Array.isArray(field.value)
                ? field.value.filter(Boolean).map(normalizeUser)
                : [];

              const normalizedUsersList = usersList.map(normalizeUser);

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
                  <ItemTitle>Reviewers</ItemTitle>
                  <p className="text-xs text-muted-foreground">
                    Select users who can review and approve agent actions during
                    task execution.
                  </p>
                  <FormControl>
                    <DynamicMultiSelectUserListCombobox
                      maxRows={2}
                      items={userItems}
                      value={valuesArray}
                      onChange={(selectedValues: string[]) => {
                        const selected = mergedUsersList
                          .filter((user) => selectedValues.includes(user.id))
                          .map(normalizeUser);

                        field.onChange(selected);
                      }}
                      placeholder="Select reviewers..."
                      searchPlaceholder="Search users..."
                      buttonClassName="w-full bg-white dark:bg-input/30"
                      loading={usersLoading}
                      disabled={!isEditing}
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
        </div>
      )}
    </div>
  );
};

export default HumanReviewCard;
