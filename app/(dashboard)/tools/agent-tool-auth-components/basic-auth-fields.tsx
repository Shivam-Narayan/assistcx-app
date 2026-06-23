import HeaderHoverCard from "@/components/header";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleSpaceValidation } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Form, FormProvider } from "react-hook-form";
import { AgentToolAuthProps, AuthToolsProps } from "../agent-tool-auth";
export default function BasicAuthFields({
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="Username"
                    message="The username for Basic Authentication"
                    type="field"
                    isRequired={true}
                  />
                  <FormControl>
                    <Input
                      id="username"
                      placeholder="Enter user name"
                      {...field}
                      maxLength={80}
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="Password"
                    message="The password for Basic Authentication"
                    type="field"
                    isRequired={true}
                  />
                  <div className="relative flex">
                    <FormControl>
                      <Input
                        id="password"
                        type={passwordShow ? "text" : "password"}
                        placeholder="Enter password"
                        maxLength={120}
                        {...field}
                        autoComplete="off"
                        onKeyDown={handleSpaceValidation}
                        disabled={userEvents == "viewTool"}
                      />
                    </FormControl>
                    {viewPassword()}
                  </div>
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
