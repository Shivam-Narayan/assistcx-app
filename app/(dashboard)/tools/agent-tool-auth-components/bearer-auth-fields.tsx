import HeaderHoverCard from "@/components/header";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { handleSpaceValidation } from "@/lib/utils";
import { Form, FormProvider } from "react-hook-form";
import { AgentToolAuthProps, AuthToolsProps } from "../agent-tool-auth";

export default function BearerAuthFields({
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
              name="token"
              render={({ field }) => (
                <FormItem>
                  <HeaderHoverCard
                    title="Token"
                    message="The Bearer token for authentication"
                    type="field"
                    isRequired={true}
                  />
                  <FormControl>
                    <Textarea
                      placeholder="Enter token"
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
