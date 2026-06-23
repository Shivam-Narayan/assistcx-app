import { Button } from "@/components/ui/button";
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
  capitalizeMessage,
  errorMessageHandler,
  getCardHeaderTitle,
} from "@/helper/helper-function";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  passwordformSchema,
  PasswordformSchemaType,
} from "@/lib/schemas/settings/team-members-schemas";
import { useAppSelector } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface ChangePasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePassword({ open, onOpenChange }: ChangePasswordProps) {
  const [passwordShow, setPasswordShow] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const { axiosAuth, loading } = useAxiosAuth();
  const teamMemberData = useAppSelector(
    (state) => state?.teamMembersReducer?.value,
  );

  const form = useForm<PasswordformSchemaType>({
    resolver: zodResolver(passwordformSchema),
    defaultValues: {
      password: "",
    },
    mode: "onChange",
  });

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

  async function onSubmit(values: PasswordformSchemaType) {
    if (!loading) {
      setLoading(true);
      let body = {
        // email: teamMemberData.email,
        // first_name: teamMemberData.first_name,
        // last_name: teamMemberData.last_name,
        password: values.password,
        // user_id: teamMemberData?.id,
      };
      try {
        const result = await axiosAuth.patch(
          `${url.UPDATE_TEAM_MEMBERS}/${teamMemberData?.id}`,
          body,
        );
        if (result?.status === 200) {
          toast.success("Password updated", {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
          onOpenChange(false);
          setLoading(false);
        } else {
          console.log("error");
          setLoading(false);
        }
      } catch (error: any) {
        console.error(error);
        setLoading(true);
        if (error.response.status == url.WHITESPACE_INPUT_ERROR_CODE) {
          if (
            error?.response?.data?.detail &&
            Array.isArray(error.response.data.detail)
          ) {
            errorMessageHandler(
              capitalizeMessage(error?.response?.data?.detail[0]["msg"]) +
                " : " +
                getCardHeaderTitle(error?.response?.data?.detail[0]?.loc[1]),
            );
          }
        } else {
          toast.error("Failed to update password", {
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
        }
      }
    }
  }

  const handleResetForm = () => {
    form.reset();
  };
  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col sm:max-w-[425px] p-0 overflow-auto gap-2"
        onCloseAutoFocus={handleResetForm}
      >
        <DialogHeader className="sticky top-0 z-10 flex px-4 py-3 flex-row justify-between items-center space-y-0 bg-background">
          <div className="w-full">
            <DialogTitle>Update Password</DialogTitle>
          </div>

          <DialogClose>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary"
              onClick={(e) => handleClose()}
            >
              <X />
            </div>
          </DialogClose>
        </DialogHeader>

        <div className="grow">
          <div className="px-4">
            <p>
              Create new password for this user. Do remember to share the new
              password with the user.
            </p>
          </div>
        </div>

        <div className="grow">
          <div className="px-4 py-2 items-center">
            <Form {...form}>
              {/* This hidden div acts as a trap for the browser's autofill. */}
              <div
                style={{
                  position: "absolute",
                  top: "-9999px",
                  left: "-9999px",
                }}
              >
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  tabIndex={-1}
                />
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  tabIndex={-1}
                />
              </div>
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
                          maxLength={80}
                          {...field}
                          autoFocus={false}
                          // autoComplete="false"
                          autoComplete="new-password"
                        />
                      </FormControl>
                      {viewPassword()}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </div>
        </div>

        <DialogFooter className="px-4 py-3 pb-6 bg-background">
          <Button
            type="submit"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
            className="w-full cursor-pointer"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
