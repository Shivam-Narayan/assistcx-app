import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/ui/combo-box";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  switchOrgFormSchema,
  SwitchOrgFormType,
} from "@/lib/schemas/settings/accounts-schemas";
import { useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface SwitchOrgPasswordProps<T extends Record<string, any>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOrg: string;
}

export function SwitchOrgDialog<T extends Record<string, any>>({
  open,
  onOpenChange,
  currentOrg,
}: SwitchOrgPasswordProps<T>) {
  const { update } = useSession();
  const { axiosAuth, loading } = useAxiosAuth();
  const [passwordShow, setPasswordShow] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [organizationList, setOrganizationList] = useState<any>([]);
  const [orgSearch, setOrgSearch] = useState("");

  const userData = useAppSelector(
    (state) => state.userDetailsReducer.value.userData
  );
  const permissions = useAppSelector(
    (state) => state?.conditionalPermissionReducer?.value?.permissionsRole
  );

  const form = useForm<SwitchOrgFormType>({
    resolver: zodResolver(switchOrgFormSchema),
    defaultValues: {
      organization_name: currentOrg,
      password: "",
    },
    mode: "onChange",
  });

  const togglePassword = () => setPasswordShow(!passwordShow);

  // Format organization list for ComboBox
  const formatOrganizationsForCombobox = (organizations: any[]) => {
    return organizations.map((org) => ({
      value: org.name,
      label: org.name,
    }));
  };

  const selectedOrgName = form.watch("organization_name");
  const emailId = userData?.email;

  async function onSubmit(values: SwitchOrgFormType) {
    if (!loading) {
      const selectedOrg = organizationList.find(
        (org: any) => org.name === values.organization_name
      );

      const payload = {
        db_schema: selectedOrg?.db_schema ?? "",
        email: emailId,
        password: values.password,
      };

      try {
        setLoading(true);
        const result = await axiosAuth.post("/login", payload);
        if (result?.status === 200) {
          await update({
            user: {
              // ...currentSession.user,
              id: result.data?.user_uuid,
              accessToken: result.data?.access_token,
              //  refreshToken: result.data?.refresh_token,
            },
          });

          successMessageHandler("Organization switched successfully!");
          form.reset();
          onOpenChange(false);
          window.location.reload();
        }
      } catch (error: any) {
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message;
        errorMessageHandler(message);
      } finally {
        setLoading(false);
      }
    }
  }

  const getAllOrganizationList = async () => {
    if (!loading) {
      try {
        const result = await axiosAuth.get(url.CREATE_ORGANIZATION);
        if (result?.status === 200) {
          const data = result.data.organizations;
          setOrganizationList(data);
        }
      } catch (error: any) {
        errorMessageHandler(error);
      }
    }
  };

  useEffect(() => {
    if (!loading && permissions?.isRoot) {
      getAllOrganizationList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, permissions]);

  const handleResetForm = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset({
        organization_name: currentOrg,
        password: "",
      });
    }
  }, [open, currentOrg, form]);

  const formattedOrgs = formatOrganizationsForCombobox(organizationList);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col sm:max-w-[425px] p-0 overflow-hidden"
        onCloseAutoFocus={handleResetForm}
      >
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 flex px-4 py-3 flex-row justify-between items-center space-y-0 bg-background border-b">
          <div className="w-full">
            <DialogTitle>Switch Organization</DialogTitle>
          </div>
          <DialogClose>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary transition-colors"
              onClick={(e) => handleClose()}
            >
              <X />
            </div>
          </DialogClose>
        </DialogHeader>

        <div className="grow overflow-y-auto px-4 py-4">
          <Form {...form}>
            <form className="space-y-4">
              {/* Organization Dropdown */}
              <FormField
                control={form.control}
                name="organization_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Organization <span className="text-destructive">*</span>
                    </FormLabel>
                    <ComboBox
                      items={formattedOrgs}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select an organization..."
                      buttonClassName="w-full disabled:opacity-70"
                      searchPlaceholder="Search organization..."
                      popoverContentClassName="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                      localSearch={orgSearch}
                      setLocalSearch={setOrgSearch}
                      commandGroupClassName="max-h-56 overflow-y-auto overscroll-contain
            scrollbar-thin scrollbar-thumb-rounded-md
            scrollbar-thumb-muted-foreground/30
            scrollbar-track-transparent"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedOrgName && selectedOrgName !== currentOrg && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to switch to{" "}
                    <span className="font-medium text-foreground">
                      {selectedOrgName}
                    </span>
                    ?
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please enter your password to confirm and proceed.
                  </p>
                </div>
              )}

              {/* Password  */}
              {selectedOrgName && selectedOrgName !== currentOrg && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={passwordShow ? "text" : "password"}
                            placeholder="Enter your password"
                            maxLength={120}
                            {...field}
                            autoComplete="off"
                            className="pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={togglePassword}
                        >
                          {passwordShow ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 py-3 border-t bg-muted/20">
          <Button
            type="submit"
            disabled={isLoading || !selectedOrgName}
            className="w-full cursor-pointer"
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Switch Organization
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
