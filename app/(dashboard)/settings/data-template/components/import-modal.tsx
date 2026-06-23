import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import FileUpload from "@/components/file-upload";

interface FileUploadProps {
  File: File;
}
interface ImportModalProps {
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  handleImportDataTemplate: (files: FileUploadProps[]) => void;
  isImportLoading: boolean;
}
export const ImportModal = ({
  isImportModalOpen,
  setIsImportModalOpen,
  handleImportDataTemplate,
  isImportLoading,
}: ImportModalProps) => {
  return (
    <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
      <DialogContent className="flex flex-col p-0 overflow-auto gap-2 sm:max-w-xl">
        <DialogHeader className="sticky top-0 z-10 flex px-4 pt-3 flex-row justify-between items-center space-y-0 bg-background">
          <div className="w-full">
            <DialogTitle>Import Data Template</DialogTitle>
          </div>
          <DialogClose>
            <div
              className="p-1 rounded-md cursor-pointer hover:bg-secondary"
              onClick={(setIsImportModalOpen) => !setIsImportModalOpen}
            >
              <X />
            </div>
          </DialogClose>
        </DialogHeader>
        <DialogDescription className="px-4 pb-2">
          Upload a JSON file containing the template configuration to deploy it
          in the environment.
        </DialogDescription>
        <div className="px-5 pb-5">
          {
            <FileUpload
              text={"Drag and drop your file here or click to browse."}
              subText={"Click to upload file (file should be JSON)"}
              multiple={false}
              accept={{ "application/json": [] }}
              handleImportAgent={handleImportDataTemplate}
              isLoading={isImportLoading}
              buttonText={"Import Data Template"}
            />
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};
