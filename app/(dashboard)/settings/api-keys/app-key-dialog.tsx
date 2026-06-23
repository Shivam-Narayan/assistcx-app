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
import { handleSpaceValidation } from "@/helper/assistant-helper/helper";
import {
  errorMessageHandler,
  successMessageHandler,
  useCopyToClipboard,
} from "@/helper/helper-function";
import { PostActionStateSyncAction } from "@/helper/post-action-state-sync";
import * as url from "@/helper/url-helper";
import * as messages from "@/lib/constants";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import {
  apiKeyFormSchema,
  ApiKeyFormSchemaType,
} from "@/lib/schemas/settings/api-key-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Info, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { cellObject } from "./hook/useGetApiKeyData";

interface ApiKeyDialogProps {
  mode: "add" | "edit";
  open: boolean;
  onClose: () => void;
  loadTableData: (data: any, type: PostActionStateSyncAction) => void;
  rowData?: cellObject;
  setOpen?: (open: boolean) => void;
}
const ApiKeyDialog = ({
  mode,
  open,
  setOpen,
  onClose,
  loadTableData,
  rowData,
}: ApiKeyDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const { axiosAuth } = useAxiosAuth();
  const [isCopied, copyToClipboard] = useCopyToClipboard(2000);

  const form = useForm<ApiKeyFormSchemaType>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: rowData?.name || "",
    },
    mode: "onChange",
  });
  useEffect(() => {
    if (mode === "edit" && rowData) {
      form.setValue("name", rowData.name);
    }
  }, [mode, rowData, form]);

  const handleApiKeyModalConfirm = () => {
    setShowApiKeyModal(false);
    onClose();
    setGeneratedApiKey("");
    form.reset();
  };

  async function onSubmit(values: ApiKeyFormSchemaType) {
    if (!loading) {
      if (mode === "add") {
        setLoading(true);
        let body = {
          name: values.name,
        };
        try {
          const result = await axiosAuth.post(url.ADD_API_KEY, body);
          if (result?.status === 200) {
            setLoading(false);
            successMessageHandler(messages.api_key_added_successfully);
            const newApiKey = result.data?.api_key ?? result.data?.key ?? "";
            setGeneratedApiKey(newApiKey);
            setShowApiKeyModal(true);
            loadTableData(result.data, "add");
          }
        } catch (error: any) {
          setLoading(false);
          errorMessageHandler(error.response.data.detail);
        }
      } else {
        setLoading(true);
        let body = {
          name: values.name,
        };
        try {
          const result = await axiosAuth.patch(
            `${url.UPDATE_API_KEY}/${rowData?.id}`,
            body,
          );
          if (result?.status === 200) {
            const updatedItem = result.data;
            setLoading(false);
            successMessageHandler(messages.api_key_updated_successfully);
            loadTableData(updatedItem, "update");
            onClose();
          }
        } catch (error: any) {
          errorMessageHandler(error.response.data.detail);
          setLoading(false);
        }
      }
    }
  }

  const handleCopy = async () => {
    try {
      await copyToClipboard(generatedApiKey);
      toast.success("Copied to clipboard", {
        duration: 1500,
        position: "top-center",
      });
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  };
  const currentName = form.watch("name");
  const isNameChanged =
    mode === "edit" && rowData?.name !== currentName?.trim();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (showApiKeyModal) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (showApiKeyModal) {
            e.preventDefault();
          }
        }}
        className="w-full max-w-lg p-0 overflow-auto"
      >
        <DialogHeader className="sticky top-0 z-10 border-b flex px-4 py-4 flex-row justify-between items-center space-y-0 bg-background">
          <DialogTitle className="text-base font-semibold">
            {mode === "add"
              ? `${showApiKeyModal ? "Save API Key" : "Create a new API Key"}`
              : "Edit API Key"}
          </DialogTitle>
        </DialogHeader>
        {!showApiKeyModal ? (
          <>
            <div className="px-4 flex flex-col gap-4">
              <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {mode === "add"
                      ? "Create a new API key to securely authenticate external systems interacting with the platform. Provide a clear and meaningful name to easily identify its purpose and associated integration"
                      : "Edit the API key name to align with its current usage or integration context without affecting its authentication validity."}
                  </p>
                </div>
              </div>
            </div>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="px-4 pb-4">
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
                            onChange={(e) => {
                              field.onChange(e);
                            }}
                            onKeyDown={handleSpaceValidation}
                            maxLength={80}
                            minLength={4}
                            autoFocus={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="bg-background border-t justify-end p-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      onClose();
                    }}
                    disabled={loading}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    type="submit"
                    disabled={loading || (mode === "edit" && !isNameChanged)}
                    className="cursor-pointer"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === "add" ? "Create API Key" : "Update API Key"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <div className="px-4 flex flex-col gap-5 pb-2">
              <div className="flex gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500/15 dark:bg-amber-500/20">
                  <ShieldAlert className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    This API key is displayed only once for security reasons.
                    Please copy and store it securely. It cannot be retrieved
                    after this window is closed
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex min-h-[2.75rem] items-stretch gap-2 rounded-lg border border-border bg-muted/40 p-1.5">
                  <Input
                    id="generated-api-key"
                    readOnly
                    value={generatedApiKey}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.currentTarget.select()}
                    className="h-auto min-w-0 flex-1 border-0 bg-transparent px-2 py-1.5 font-mono text-sm shadow-none focus-visible:ring-0"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!generatedApiKey}
                    aria-label={
                      isCopied ? "Copied to clipboard" : "Copy API key"
                    }
                    className="shrink-0 gap-1.5 px-3"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                        <span className="text-muted-foreground">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="bg-background border-t justify-end p-4">
              <Button
                type="button"
                onClick={handleApiKeyModalConfirm}
                className="cursor-pointer"
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default ApiKeyDialog;
