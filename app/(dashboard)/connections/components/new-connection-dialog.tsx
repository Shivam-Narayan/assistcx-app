import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ConnectionsDetailsDialog from "./connections-details-dialog";

const CreateNewConnectionDialog = ({
  open,
  onOpenChange,
  data,
  handleSubmit,
  formLoading,
  setMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  handleSubmit: any;
  formLoading?: boolean;
  setMode?: any;
}) => {
  const [step, setStep] = useState<"list" | "details">("list");
  const [selectedSchema, setSelectedSchema] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const handleOpenConnection = (integration: any, schema: string) => {
    setSelectedIntegration(integration);
    setSelectedSchema(schema);
    setStep("details");
  };

  useEffect(() => {
    if (open) {
      setStep("list");
    }
  }, [open]);

  const connectionIcon =
    data?.key && INTEGRATION_ICON_SRC[data.key]
      ? INTEGRATION_ICON_SRC[data.key]
      : undefined;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {step === "list" ? (
          <DialogContent className="flex flex-col sm:max-w-xl p-0 gap-2">
            <DialogHeader className="sticky rounded-lg top-0 z-10 flex px-4 py-3 flex-row justify-between items-center bg-background">
              <div className="flex items-center gap-2">
                <div className="w-full">
                  <DialogTitle>New Connection</DialogTitle>
                </div>
              </div>

              <DialogClose>
                <div className="p-1 rounded-md cursor-pointer hover:bg-secondary">
                  <X />
                </div>
              </DialogClose>
            </DialogHeader>
            <div className="space-y-3 p-4">
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="flex items-center justify-center gap-4">
                  <Image
                    src="/icon.svg"
                    width={40}
                    height={40}
                    alt="App"
                    className="rounded-md"
                  />

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>

                  <div className="p-2 rounded-full bg-primary/10 flex items-center justify-center">
                    {connectionIcon ? (
                      <Image
                        src={connectionIcon}
                        alt="provider"
                        width={24}
                        height={24}
                        className="h-auto w-6"
                      />
                    ) : null}
                  </div>
                </div>

                {/* Text */}
                <p className="text-sm text-muted-foreground text-center">
                  Connect{" "}
                  <span className="font-medium text-foreground">AssistCX</span>{" "}
                  to
                  <span className="font-medium text-foreground">
                    {data?.name}
                  </span>
                </p>
              </div>

              <div className="space-y-3 p-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  Available Connectors
                </p>
                {data?.supported_auth_schemas?.map(
                  (schema: string, index: number) => (
                    <div
                      key={index}
                      className="cursor-pointer flex gap-3 w-full min-w-0 border p-4 rounded-md hover:bg-muted/50 transition"
                      onClick={() => handleOpenConnection(data, schema)}
                    >
                      <div className="p-1.5 rounded-full w-fit h-fit shrink-0 bg-primary/10">
                        {connectionIcon ? (
                          <Image
                            src={connectionIcon}
                            alt="provider"
                            width={24}
                            height={24}
                            className="h-auto w-6"
                          />
                        ) : null}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <p className="font-medium text-foreground/90 leading-tight">
                          {schema.replaceAll("_", " ")}
                        </p>

                        {/* optional description */}
                        <p className="text-xs text-muted-foreground">
                          {data.name} authentication
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </DialogContent>
        ) : (
          <ConnectionsDetailsDialog
            detailIntegration={selectedIntegration}
            selectedSchema={selectedSchema}
            onBack={() => setStep("list")}
            onSubmitData={handleSubmit}
            onOpenChange={onOpenChange}
            formLoading={formLoading}
            setMode={setMode}
          />
        )}
      </Dialog>
    </>
  );
};

export default CreateNewConnectionDialog;
