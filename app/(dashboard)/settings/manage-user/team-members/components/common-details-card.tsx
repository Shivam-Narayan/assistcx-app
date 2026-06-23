import { DynamicMultiSelectCombobox } from "@/components/dynamic-multi-select-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComboBox } from "@/components/ui/combo-box";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleSpaceValidation } from "@/lib/utils";
import { ViewPassword } from "./view-password";

interface CommonDetailsProps {
  userEvents: any;
  form: any;
  roleItems: any;
  userGroupItems: any;
  passwordShow: any;
  setPasswordShow: any;
  handleUpdatePassword: any;
  isCreateUpdateUser: any;
  TeamMemeberInfo: any;
}

const CommonDetailsCard = ({
  userEvents,
  form,
  roleItems,
  userGroupItems,
  passwordShow,
  setPasswordShow,
  handleUpdatePassword,
  isCreateUpdateUser,
  TeamMemeberInfo,
}: CommonDetailsProps) => {
  const isAddOrEdit =
    userEvents === "addTeamMember" || userEvents === "editTeamMember";
  const isView = userEvents === "viewTeamMember";
  return (
    <Card className="shadow-none p-0 gap-0">
      <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex gap-3 items-center text-lg font-medium leading-none tracking-tight">
          Common Details
        </CardTitle>
        {isView && isCreateUpdateUser && (
          <Button
            className="max-w-max cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              handleUpdatePassword();
            }}
          >
            Change Password
          </Button>
        )}
      </CardHeader>
      {isAddOrEdit && (
        <CardContent className="p-0 pb-2 flex flex-col ">
          <div className="p-4">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground required">
                        First Name{" "}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter first name"
                          {...field}
                          onKeyDown={handleSpaceValidation}
                          maxLength={120}
                          autoFocus={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground required">
                        Last Name{" "}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter last name"
                          {...field}
                          onKeyDown={handleSpaceValidation}
                          maxLength={120}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel
                        className="text-foreground required"
                        onClick={(e) => e.preventDefault()}
                      >
                        Role
                      </FormLabel>
                      <ComboBox
                        items={roleItems}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Role"
                        buttonClassName="max-w-full"
                        commandGroupClassName="max-h-[250px] overflow-y-scroll"
                        searchPlaceholder="Search Role"
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="user_group"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel
                        className="text-foreground "
                        onClick={(e) => e.preventDefault()}
                      >
                        User Group
                      </FormLabel>

                      <DynamicMultiSelectCombobox
                        maxRows={2}
                        items={userGroupItems}
                        value={field.value || []}
                        onChange={(selected: string[]) =>
                          field.onChange(selected)
                        }
                        placeholder="Select User Group"
                        searchPlaceholder="Search User Group"
                        buttonClassName="w-full"
                        showClearButton={true}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground required">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter email"
                          maxLength={120}
                          minLength={6}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toLowerCase())
                          }
                          onKeyDown={handleSpaceValidation}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {userEvents !== "editTeamMember" && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground required">
                          Password
                        </FormLabel>
                        <div className="relative flex">
                          <FormControl>
                            <Input
                              type={passwordShow ? "text" : "password"}
                              placeholder="Enter password"
                              maxLength={120}
                              minLength={6}
                              {...field}
                              onKeyDown={handleSpaceValidation}
                            />
                          </FormControl>
                          {/* {viewPassword()} */}
                          <ViewPassword
                            passwordShow={passwordShow}
                            setPasswordShow={setPasswordShow}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </form>
            </Form>
          </div>
        </CardContent>
      )}

      {isView && (
        <CardContent className="p-0 py-2 flex flex-col divide-y divide-dashed overflow-wrap-anywhere">
          {TeamMemeberInfo.map((row: any, index: any) => (
            <div key={index} className="flex flex-row px-4 py-2.5">
              {/* Label */}
              <div className="w-2/5 pr-4 font-semibold">
                <Badge variant="secondary" className="text-sm">
                  {row.label}
                </Badge>
              </div>
              {/* Value */}
              <div className="w-3/5 flex flex-wrap gap-2 items-center text-sm">
                {Array.isArray(row.value)
                  ? row.value.map((group: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {group}
                      </Badge>
                    ))
                  : row.value}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};

export default CommonDetailsCard;
