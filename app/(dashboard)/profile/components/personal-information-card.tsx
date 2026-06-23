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
import { formatRoleName } from "@/helper/helper-function";
import { handleSpaceValidation } from "@/lib/utils";
import { Loader2, Pencil } from "lucide-react";
import { PersonalInformationCardProps } from "@/types/types";

export const PersonalInformationCard = ({
  user,
  form,
  isEditing,
  updateUserLoading,
  onEdit,
  handleCancelEdit,
  onSubmit,
}: PersonalInformationCardProps) => {
  return (
    <div className="w-full h-full p-6 bg-white border rounded-lg shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        {!isEditing && (
          <Button onClick={onEdit} className="cursor-pointer">
            <Pencil size={16} />
          </Button>
        )}
      </div>

      {isEditing ? (
        // --- Edit Mode ---
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      First Name
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Enter first name"
                        {...field}
                        maxLength={80}
                        minLength={2}
                        onKeyDown={handleSpaceValidation}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground required">
                      Last Name{" "}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter last name"
                        {...field}
                        maxLength={80}
                        minLength={2}
                        onKeyDown={handleSpaceValidation}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="">
                <FormLabel className="text-foreground mb-2">Email ID</FormLabel>
                <Input value={user?.email} disabled />
              </div>
              <div>
                <FormLabel className="text-foreground mb-2">Role</FormLabel>
                <Input value={user?.role_key} disabled />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelEdit}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateUserLoading}
                className="cursor-pointer"
              >
                {updateUserLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          {/* Name Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">First Name</p>
              <p
                className="text-base font-semibold text-gray-900 truncate"
                title={user?.first_name}
              >
                {user?.first_name?.length > 30
                  ? user.first_name.slice(0, 30) + "…"
                  : user?.first_name || "—"}
              </p>
            </div>

            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Last Name</p>
              <p
                className="text-base font-semibold text-gray-900 truncate"
                title={user?.last_name}
              >
                {user?.last_name?.length > 30
                  ? user.last_name.slice(0, 30) + "…"
                  : user?.last_name || "—"}
              </p>
            </div>
          </div>

          {/* Email & Role Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Email ID</p>
              <p
                className="text-base font-semibold text-gray-900 break-all truncate"
                title={user?.email}
              >
                {user?.email || "—"}
              </p>
            </div>

            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p
                className="text-base font-semibold text-gray-900 truncate"
                title={formatRoleName(user?.role_key)}
              >
                {formatRoleName(user?.role_key) || "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
