import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import { Badge } from "@/components/ui/badge";
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
import { handleSpaceValidation } from "@/lib/utils";

interface UserGroupsProps {
  userEvents: any;
  form: any;
  userGroupInfo: any;
}

const UserGroupCard = ({
  userEvents,
  form,
  userGroupInfo,
}: UserGroupsProps) => {
  return (
    <Card className="shadow-none p-0 gap-0">
      <CardHeader className="border-b px-4 !py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle
          className="flex gap-3 items-center text-lg font-medium 
                   leading-none tracking-tight"
        >
          <span>User Group Info</span>
        </CardTitle>
      </CardHeader>
      {(userEvents === "addUserGroup" || userEvents === "editUserGroup") && (
        <CardContent className="p-0 pb-2 flex flex-col ">
          <div className="p-4">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground required">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter name"
                          {...form.register("name")}
                          // onChange={handleUserGroupField}
                          onKeyDown={handleSpaceValidation}
                          maxLength={80}
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
                          minLength={6}
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
      )}

      {userEvents === "viewUserGroup" && (
        <CardContent className="p-0 py-2 flex flex-col divide-y divide-dashed overflow-wrap-anywhere">
          {userGroupInfo.map((row: any, index: any) => (
            <div key={index} className="flex flex-row px-4 py-2.5">
              <div className="w-2/5 pr-4 font-semibold">
                <Badge variant="secondary" className="text-sm">
                  {row.label}
                </Badge>
              </div>
              <div className="w-3/5 flex gap-4 text-sm">{row?.value}</div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};
export default UserGroupCard;
