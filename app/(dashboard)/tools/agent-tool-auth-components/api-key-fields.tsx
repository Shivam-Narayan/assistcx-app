import HeaderHoverCard from "@/components/header";
import {
  FormControl,
  FormField,
  FormItem,
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
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Form, FormProvider } from "react-hook-form";
import { AgentToolAuthProps, AuthToolsProps } from "../agent-tool-auth";

export default function APIKeyFields({
  formValue,
  userEvents,
}: AgentToolAuthProps & AuthToolsProps) {
  const [passwordShow, setPasswordShow] = useState(false);
  const viewPassword = () => {
    return (
      <div
        className="absolute right-0 p-2 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          setPasswordShow(!passwordShow);
        }}
      >
        {!passwordShow ? <Eye size={20} /> : <EyeOff size={20} />}
      </div>
    );
  };
  return (
    <div>
      <FormProvider {...formValue}>
        <Form>
          <div className="w-full space-y-4">
            <FormField
              control={formValue.control}
              name="api_key_name"
              render={({ field }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="API Key Name"
                    message="The name of the API key (e.g., 'X-API-Key')"
                    type="field"
                    isRequired={true}
                  />
                  <FormControl>
                    <Input
                      id="api_key_name"
                      placeholder="Enter API key name"
                      {...field}
                      maxLength={700}
                      autoFocus={false}
                      autoComplete="off"
                      onKeyDown={handleSpaceValidation}
                      disabled={userEvents == "viewTool"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formValue.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="API Key"
                    message="The API key value"
                    type="field"
                    isRequired={true}
                  />
                  <FormControl>
                    <div className="relative flex">
                      <FormControl>
                        <Input
                          id="api_key"
                          type={passwordShow ? "text" : "password"}
                          placeholder="Enter api key"
                          maxLength={700}
                          {...field}
                          autoComplete={"off"}
                          onKeyDown={handleSpaceValidation}
                          disabled={userEvents == "viewTool"}
                        />
                      </FormControl>
                      {viewPassword()}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formValue.control}
              name="api_key_location"
              render={({ field: { onChange, value, name, ref } }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="API Key Location"
                    message="Where to put the API key"
                    type="field"
                    isRequired={true}
                  />
                  <Select
                    onValueChange={(value) => {
                      onChange(value);
                    }}
                    defaultValue={value}
                    value={value}
                    name={name}
                    disabled={userEvents == "viewTool"}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                        <SelectValue placeholder="Select API key location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="header" className="cursor-pointer">
                        Header
                      </SelectItem>
                      <SelectItem value="query" className="cursor-pointer">
                        Query
                      </SelectItem>
                      <SelectItem value="cookie" className="cursor-pointer">
                        Cookie
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </FormProvider>
    </div>
  );
}
