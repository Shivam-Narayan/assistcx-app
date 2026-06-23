import { Button } from "@/components/ui/button";
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
import { SecurityCardProps } from "@/types/types";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const SecurityCard = ({
  loadingPassword,
  isEditPassword,
  passwordForm,
  passwordToggleState,
  handlePasswordShowHideToggle,
  submitPasswordUpdate,
  handleupdatePassword,
  handlePasswordCancel,
}: SecurityCardProps) => {
  return (
    <div className="w-full p-6 bg-white border rounded-lg shadow-xs">
      <div className="flex items-start justify-between mb-4 flex-col gap-y-4 lg:flex-row lg:gap-y-0">
        <div>
          <h3 className="text-lg font-semibold">Security</h3>
          {!isEditPassword && (
            <p className="text-sm text-gray-500 mt-1">
              Click the “Change Password” button if you want to update your
              password. Your new password must be at least 6 characters long to
              keep your account secure.
            </p>
          )}
        </div>
        {!isEditPassword && (
          <Button
            onClick={handleupdatePassword}
            variant="secondary"
            className="cursor-pointer"
          >
            Change Password
          </Button>
        )}
      </div>

      {isEditPassword && (
        <Form {...passwordForm}>
          <form className="grid grid-cols-1 gap-4">
            <FormField
              control={passwordForm.control}
              name="current_password"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-4">
                  <FormLabel className="text-foreground whitespace-nowrap required">
                    Current Password{" "}
                  </FormLabel>
                  <div className="w-[400px] space-y-1">
                    <div className="relative group">
                      <FormControl>
                        <Input
                          placeholder="Enter current password"
                          {...field}
                          type={
                            passwordToggleState.current ? "text" : "password"
                          }
                          maxLength={80}
                          autoComplete="current-password"
                          onKeyDown={handleSpaceValidation}
                        />
                      </FormControl>
                      <div
                        className="absolute top-2.5 right-2 cursor-pointer text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handlePasswordShowHideToggle("current")}
                      >
                        {passwordToggleState.current ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-4">
                  <FormLabel className="text-foreground whitespace-nowrap required">
                    New Password{" "}
                  </FormLabel>
                  <div className="w-[400px] space-y-1">
                    <div className="relative group">
                      <FormControl>
                        <Input
                          placeholder="Enter new password"
                          {...field}
                          type={passwordToggleState.new ? "text" : "password"}
                          maxLength={80}
                          autoComplete="new-password"
                          onKeyDown={handleSpaceValidation}
                        />
                      </FormControl>
                      <div
                        className="absolute top-2.5 right-2 cursor-pointer text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handlePasswordShowHideToggle("new")}
                      >
                        {passwordToggleState.new ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-4">
                  <FormLabel className="text-foreground whitespace-nowrap required">
                    Confirm Password{" "}
                  </FormLabel>
                  <div className="w-[400px] space-y-1">
                    <div className="relative group">
                      <FormControl>
                        <Input
                          placeholder="Re-enter new password"
                          {...field}
                          type={
                            passwordToggleState.confirm ? "text" : "password"
                          }
                          autoComplete="new-password"
                          onKeyDown={handleSpaceValidation}
                        />
                      </FormControl>
                      <div
                        className="absolute top-2.5 right-2 cursor-pointer text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handlePasswordShowHideToggle("confirm")}
                      >
                        {passwordToggleState.confirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePasswordCancel}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={passwordForm.handleSubmit(submitPasswordUpdate)}
                disabled={loadingPassword}
                className="cursor-pointer"
              >
                {loadingPassword && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Update Password
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
