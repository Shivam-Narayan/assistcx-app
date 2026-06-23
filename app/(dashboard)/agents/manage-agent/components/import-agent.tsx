"use client";
import FileUpload from "@/components/file-upload";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
interface ImportAgentCompProps {
  isOpen: any;
  onClose: any;
  handleImportAgent: any;
  isLoading?: boolean;
  isPopup?: boolean;
  buttonText?: string;
}

const ImportAgentComponent = ({
  isOpen,
  onClose,
  handleImportAgent,
  isLoading,
  isPopup = true,
  buttonText,
}: ImportAgentCompProps) => {
  const RenderDialog = ({
    isLoading,
    handleImportAgent,
  }: {
    isLoading?: boolean;
    handleImportAgent: any;
  }) => {
    return (
      <>
        <DialogDescription className="px-4 pb-2">
          Upload a JSON file containing the agent configuration to deploy the
          agent in the environment.
        </DialogDescription>

        <div className="px-5 pb-5">
          <FileUpload
            text={"Drag and drop your file here or click to browse."}
            subText={"Click to upload file (file should be JSON)"}
            multiple={false}
            accept={{ "application/json": [] }}
            handleImportAgent={handleImportAgent}
            isLoading={isLoading}
            buttonText={buttonText}
          />
        </div>
      </>
    );
  };

  return isPopup ? (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-0 overflow-auto gap-2 sm:max-w-xl">
        <DialogHeader className="sticky top-0 z-10 flex px-4 pt-3 flex-row justify-between items-center space-y-0 bg-background">
          <div className="w-full">
            <DialogTitle>Import Agent</DialogTitle>
          </div>
          <DialogClose asChild>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary"
              onClick={() => onClose(false)}
            >
              <X />
            </div>
          </DialogClose>
        </DialogHeader>
        <RenderDialog
          handleImportAgent={handleImportAgent}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  ) : (
    <RenderDialog handleImportAgent={handleImportAgent} isLoading={isLoading} />
  );
};

export default ImportAgentComponent;
