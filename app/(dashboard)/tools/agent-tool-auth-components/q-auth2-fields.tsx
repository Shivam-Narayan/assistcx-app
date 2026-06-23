import HeaderHoverCard from "@/components/header";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleSpaceValidation } from "@/lib/utils";
import { Form, FormProvider } from "react-hook-form";
import { AgentToolAuthProps, AuthToolsProps } from "../agent-tool-auth";
export default function OAuth2Fields({
  formValue,
  userEvents,
}: AgentToolAuthProps & AuthToolsProps) {
  return (
    <div>
      <FormProvider {...formValue}>
        <Form>
          <div className="w-full space-y-4">
            <FormField
              control={formValue.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="Client ID"
                    message="The client ID for OAuth2"
                    type="field"
                    isRequired={true}
                  />
                  <FormControl>
                    <Input
                      placeholder="Enter client id"
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
              name="client_secret"
              render={({ field }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="Client Secret"
                    message="The client secret for OAuth2"
                    type="field"
                    isRequired={true}
                  />
                  <FormControl>
                    <Input
                      placeholder="Enter client secret"
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
              name="token_url"
              render={({ field }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="Token URL"
                    message="The token endpoint URL for OAuth2"
                    type="field"
                    isRequired={true}
                  />
                  <FormControl>
                    <Input
                      id="token_url"
                      type="url"
                      placeholder="Enter token url"
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
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="Scope"
                    message="The scope of access being requested"
                    type="field"
                    isRequired={false}
                  />
                  <FormControl>
                    <Input
                      placeholder="Enter scope"
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
          </div>
        </Form>
      </FormProvider>
    </div>
  );
}
