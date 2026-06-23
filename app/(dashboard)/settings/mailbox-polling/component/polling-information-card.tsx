import AutoGrowingTextarea from "@/components/auto-grow-textarea";
import CommonCardComponent from "@/components/common-card-component";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleSpaceValidation } from "@/lib/utils";
import {
  CheckCircledIcon,
  CircleBackslashIcon,
  SymbolIcon,
} from "@radix-ui/react-icons";

interface PollingProps {
  userEvents: any;
  form: any;
  emailInfo: any;
}

const PollingInformationCard = ({
  userEvents,
  form,
  emailInfo,
}: PollingProps) => {
  return (
    <CommonCardComponent cardTitle="Polling Information">
      {(userEvents === "addMailboxPolling" ||
        userEvents === "editMailboxPolling") && (
        <div className="p-4">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="emailId"
                render={({ field: { onChange, value, name, ref } }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email"
                        onChange={(e) => onChange(e.target.value.toLowerCase())}
                        onKeyDown={handleSpaceValidation}
                        ref={ref}
                        value={value}
                        name={name}
                        // {...field}
                        maxLength={50}
                        minLength={6}
                        autoFocus={false}
                        disabled={userEvents === "editMailboxPolling"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mailbox_folder"
                render={({ field: { onChange, value, name, ref } }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Mailbox Folder
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter mailbox folder name"
                        maxLength={80}
                        minLength={4}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleSpaceValidation}
                        ref={ref}
                        value={value}
                        name={name}
                        // {...field}
                        disabled={userEvents === "editMailboxPolling"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pollingFrequency"
                render={({ field: { onChange, value, name, ref } }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Polling frequency
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        onChange(value);
                      }}
                      defaultValue={value}
                      value={value}
                      name={name}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                          <SelectValue placeholder="Select polling frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30" className="cursor-pointer">
                          30 sec
                        </SelectItem>
                        <SelectItem value="60" className="cursor-pointer">
                          60 sec
                        </SelectItem>
                        <SelectItem value="90" className="cursor-pointer">
                          90 sec
                        </SelectItem>
                        <SelectItem value="120" className="cursor-pointer">
                          120 sec
                        </SelectItem>
                        <SelectItem value="150" className="cursor-pointer">
                          150 sec
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field: { onChange, value, name, ref } }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Description
                    </FormLabel>
                    <FormControl>
                      <AutoGrowingTextarea
                        placeholder="Enter description"
                        maxLength={280}
                        onChange={(e) => onChange(e.target.value)}
                        // ref={ref}
                        value={value}
                        name={name}
                        // {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      )}
      {userEvents === "viewMailboxPolling" && (
        <CardContent className="p-0 py-2 flex flex-col divide-y divide-dashed">
          {emailInfo.map((row: any, index: any) => (
            <div key={index} className="flex flex-row px-4 py-2.5">
              <div className="w-2/5 pr-4 font-semibold">
                <Badge variant="secondary" className="text-sm">
                  {row.label}
                </Badge>
              </div>
              {row.label != "Status" ? (
                <div
                  className={`w-3/5 flex gap-4 text-sm ${
                    row.label === "Description" && "overflow-wrap-anywhere"
                  }`}
                >
                  {row?.value}
                </div>
              ) : null}
              {row.label === "Status" ? (
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                      row?.value === "RUNNING"
                        ? "border-green-500 text-green-600 bg-green-50"
                        : row?.value === "STOPPED"
                          ? "border-red-500 text-red-600 bg-red-50"
                          : row?.value === "CREATED"
                            ? "border-blue-500 text-blue-600 bg-blue-50"
                            : "border-muted text-muted-foreground"
                    }
                          `}
                  >
                    {row?.value === "STOPPED" && (
                      <CircleBackslashIcon className="h-4 w-4" />
                    )}
                    {row?.value === "RUNNING" && (
                      <SymbolIcon className="h-4 w-4" />
                    )}
                    {row?.value === "CREATED" && (
                      <CheckCircledIcon className="h-4 w-4" />
                    )}
                    {row?.value}
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      )}
    </CommonCardComponent>
  );
};

export default PollingInformationCard;
