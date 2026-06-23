import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import HeaderHoverCard from "@/components/header";
import { SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Upload, X } from "lucide-react";

interface AddEditHeaderProps {
  setIsImportModalOpen: (open: boolean) => void;
  handleResetForm: () => void;
}
export const AddEditHeader = ({
  setIsImportModalOpen,
  handleResetForm,
}: AddEditHeaderProps) => {
  return (
    <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
      <div className="w-full flex justify-start items-center space-x-2 divide-x">
        <SheetTitle className="sr-only">Data Template</SheetTitle>
        <HeaderHoverCard
          title="Data Template"
          message="Configure data templates and define data schema to perform intelligent data extraction from different documents"
          type="sheet"
        />
      </div>

      <ConditionalTooltip
        content="Import"
        alwaysShow={true}
        align="center"
        showArrow={true}
      >
        <div
          onClick={() => setIsImportModalOpen(true)}
          className="p-2 rounded-md cursor-pointer hover:bg-secondary"
        >
          <Upload className="h-5 w-5" />
        </div>
      </ConditionalTooltip>

      <SheetClose asChild>
        <div
          className="p-2 rounded-md cursor-pointer hover:bg-secondary"
          onClick={handleResetForm}
        >
          <X className="h-5 w-5" />
        </div>
      </SheetClose>
    </SheetHeader>
  );
};
