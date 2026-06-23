import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2, SendHorizontal, X } from "lucide-react";
import Image from "next/image";

const ConnectionDialog = ({
  isOpen,
  onOpenChange,
  authList,
  handlePickFromCatalog,
  handleConnectionBack,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  authList: any;
  handlePickFromCatalog: (item: any) => void;
  handleConnectionBack: () => void;
}) => {
  return (
    <DialogContent className="flex flex-col sm:max-w-xl p-0 gap-2">
      <DialogHeader className="sticky rounded-lg top-0 z-10 flex px-4 py-3 flex-row justify-between items-center bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleConnectionBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-full">
            <DialogTitle>New Connection</DialogTitle>
          </div>
        </div>

        <DialogClose>
          <div
            className="p-1 rounded-md cursor-pointer hover:bg-secondary"
            onClick={handleConnectionBack}
          >
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
              <img
                src={authList.logo_url}
                alt={authList.name}
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>

          {/* Text */}
          <p className="text-sm text-muted-foreground text-center">
            Connect{" "}
            <span className="font-medium text-foreground">AssistCX</span> to
            <span className="font-medium text-foreground">
              {" "}
              {authList.name}
            </span>
          </p>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            Available Connectors
          </p>
          {authList?.supported_auth_schemas?.map(
            (schema: string, index: number) => (
              <div
                key={index}
                className="cursor-pointer flex gap-3 w-full min-w-0 border p-4 rounded-md hover:bg-muted/50 transition"
                onClick={() =>
                  handlePickFromCatalog({
                    provider: authList,
                    schema,
                  })
                }
              >
                <div className="p-1.5 rounded-full w-fit h-fit shrink-0 bg-primary/10">
                  <img
                    src={authList.logo_url}
                    alt={authList.name}
                    className="w-5 h-5 object-contain"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <p className="font-medium text-foreground/90 leading-tight">
                    {schema.replaceAll("_", " ")}
                  </p>

                  {/* optional description */}
                  <p className="text-xs text-muted-foreground">
                    {authList.name} authentication
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default ConnectionDialog;
