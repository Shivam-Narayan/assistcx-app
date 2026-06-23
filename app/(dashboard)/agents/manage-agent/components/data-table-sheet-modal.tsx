import { DynamicTable } from "@/app/(dashboard)/data-tables/types/table-types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import ViewDataTable from "./view-data-table";

interface DataTableSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: DynamicTable | null;
}

const DataTableSheetModal = ({
  isOpen,
  onClose,
  table,
}: DataTableSheetModalProps) => {
  const router = useRouter();
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-2xl p-0 overflow-auto gap-0">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-background">
          <div className="w-full flex justify-start items-center space-x-2 divide-x">
            <SheetTitle className="px-3 text-lg font-medium">
              Data Table
            </SheetTitle>
          </div>
          <Button
            className="w-auto min-w-auto mr-2 cursor-pointer"
            onClick={() =>
              window.open(
                `/data-tables/${table?.id}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
            Visit Table
          </Button>
          <SheetClose asChild>
            <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
              <X className="h-5 w-5" />
            </div>
          </SheetClose>
        </SheetHeader>

        <div className="grow overflow-y-auto">
          <div className="grid gap-5 px-4 py-4">
            {table && <ViewDataTable table={table} />}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DataTableSheetModal;
