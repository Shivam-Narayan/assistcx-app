import CommonCardComponent from "@/components/common-card-component";
import HeaderHoverCard from "@/components/header";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicMultiSelectUserListCombobox } from "@/components/user-management/dynamic-multi-select-user-list";
import {
  User,
  useUsersListManagement,
} from "@/components/user-management/hook/useUserManagement";
import { StatusIndicator } from "./status-indicator";
import { SwitchField } from "./switch-field";
import { useMemo } from "react";

interface MailboxProps {
  userEvents: any;
  form: any;
  isTaskFailureAlert: any;
  isDataParsingEnabled: any;
  emailData: any;
  notificationRecipientsEmails: any;
}

const MailboxSettingsCard = ({
  userEvents,
  form,
  isTaskFailureAlert,
  isDataParsingEnabled,
  emailData,
  notificationRecipientsEmails,
}: MailboxProps) => {
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

  const copyEmailData = emailData["polling_config"]?.copy_email_data;

  const mailboxPriority = emailData["polling_config"]?.mailbox_priority;

  const sendNotifications = emailData["polling_config"]?.send_notifications;

  const dataParsing = emailData["polling_config"]?.data_parsing;
  const fixPageRotation = emailData["polling_config"]?.fix_page_rotation;
  const splitPDFPages = emailData["polling_config"]?.split_pdf_pages;

  return (
    <CommonCardComponent cardTitle="Mailbox Settings">
      {(userEvents === "addMailboxPolling" ||
        userEvents === "editMailboxPolling") && (
        <div className="p-4">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="mailbox_priority"
                render={({ field: { onChange, value, name, ref } }) => (
                  <FormItem className="rounded-lg border p-4">
                    <div className="flex flex-row items-center justify-between gap-4">
                      <HeaderHoverCard
                        title="Priority Level"
                        message="Determines the processing order for emails in the selected mailbox (1 = highest, 5 = lowest). Lower values receive priority, ensuring those emails are processed before mailboxes with higher values."
                        type="field"
                        isRequired={false}
                      />
                      <Select
                        onValueChange={(value) => {
                          onChange(value);
                        }}
                        value={
                          value === 0 || value === "0" ? "" : String(value)
                        }
                        name={name}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer w-auto min-w-[70px] focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          align="end"
                          className="overflow-y-auto max-h-40"
                        >
                          <SelectGroup>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem
                                value={String(num)}
                                key={`priority-${num}`}
                                className="cursor-pointer"
                              >
                                {String(num)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SwitchField
                form={form}
                name="copy_email_data"
                title="Save Email Copy"
                message="Save a copy of the original email as PDF file in the mailbox storage. This is useful when you want to keep a record of the original email."
              />

              <SwitchField
                form={form}
                name="send_notifications"
                title="Task Failure Alert"
                message="Receive email alerts when a task is not executed successfully on the platform."
              />

              {isTaskFailureAlert && (
                <div className="rounded-lg border p-4 space-y-3 overflow-wrap-anywhere">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <HeaderHoverCard
                      title="Alert Recipients"
                      message="Emails where notifications will be sent when an task is not executed successfully on the platform."
                      type="field"
                      isRequired={false}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="alert_recipients"
                    render={({ field }) => {
                      const selectedUsers = Array.isArray(field.value)
                        ? field.value.map((user: any) => ({
                            id: user.id || user.user_id,
                            email: user.email || user.email_id,
                            name: user.name,
                          }))
                        : [];

                      const normalizedUsersList = usersList.map(
                        (user: User) => ({
                          id: user.id || user.user_id,
                          name:
                            user.name ||
                            `${user.first_name || ""} ${user.last_name || ""}`.trim(),
                          email: user.email || user.email_id,
                        }),
                      );

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
                </div>
              )}

              <SwitchField
                form={form}
                name="data_parsing"
                title="Data Parsing"
                message="Enable data parsing to automatically process and extract data from incoming email attachments."
              />

              <SwitchField
                form={form}
                name="fix_page_rotation"
                title="Fix Page Rotation"
                disabled={!isDataParsingEnabled}
                message="Automatically correct the rotation of received PDFs and extract data seamlessly."
              />

              <SwitchField
                form={form}
                name="split_pdf_pages"
                title="Auto Document Splitting"
                disabled={!isDataParsingEnabled}
                message="Split PDF document using blank pages as delimiter and process each part separately. Useful when a single PDF document contains multiple records."
              />
            </form>
          </Form>
        </div>
      )}

      {userEvents === "viewMailboxPolling" && (
        <div className="py-2 flex flex-col divide-y divide-dashed">
          <div className="flex flex-row px-4 py-2.5">
            <div className="w-2/5 pr-4 font-semibold">
              <Badge variant="secondary" className="text-sm">
                Priority Level
              </Badge>
            </div>
            <div className="w-3/5 flex gap-4 text-sm">
              {mailboxPriority > 0 ? mailboxPriority : "No Priority"}
            </div>
          </div>

          <div className="flex flex-row px-4 py-2.5">
            <div className="w-2/5 pr-4 font-semibold">
              <Badge variant="secondary" className="text-sm">
                Save Email Copy
              </Badge>
            </div>
            <div className="w-3/5 flex gap-4 items-center flex-wrap">
              <StatusIndicator enabled={copyEmailData} />
            </div>
          </div>
          <div className="flex flex-row px-4 py-2.5">
            <div className="w-2/5 pr-4 font-semibold">
              <Badge variant="secondary" className="text-sm">
                Task Failure Alert
              </Badge>
            </div>
            <div className="w-3/5 flex gap-4 items-center flex-wrap">
              <StatusIndicator enabled={sendNotifications} />
            </div>
          </div>
          {sendNotifications &&
            notificationRecipientsEmails &&
            notificationRecipientsEmails.length > 0 && (
              <div className="flex flex-row px-4 py-2.5">
                <div className="w-2/5 pr-4 font-semibold">
                  <Badge variant="secondary" className="text-sm">
                    Alert Recipients
                  </Badge>
                </div>
                <div className="w-3/5 flex gap-4 flex-wrap">
                  {notificationRecipientsEmails?.map((ele: any, i: any) => {
                    const email = ele?.email_id || ele?.email;
                    return (
                      <Badge variant="outline" className="text-sm" key={i}>
                        {email?.toLowerCase() || "N/A"}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          <div className="flex flex-row px-4 py-2.5">
            <div className="w-2/5 pr-4 font-semibold">
              <Badge variant="secondary" className="text-sm">
                Data Parsing
              </Badge>
            </div>
            <div className="w-3/5 flex gap-4 items-center flex-wrap">
              <StatusIndicator enabled={dataParsing} />
            </div>
          </div>
          <div className="flex flex-row px-4 py-2.5">
            <div className="w-2/5 pr-4 font-semibold">
              <Badge variant="secondary" className="text-sm whitespace-nowrap">
                Fix Page Rotation
              </Badge>
            </div>
            <div className="w-3/5 flex gap-4">
              <StatusIndicator enabled={fixPageRotation} />
            </div>
          </div>
          <div className="flex flex-row px-4 py-2.5">
            <div className="w-2/5 pr-4 font-semibold">
              <Badge variant="secondary" className="text-sm whitespace-nowrap">
                Auto Document Splitting
              </Badge>
            </div>
            <div className="w-3/5 flex gap-4">
              <StatusIndicator enabled={splitPDFPages} />
            </div>
          </div>
        </div>
      )}
    </CommonCardComponent>
  );
};
export default MailboxSettingsCard;
