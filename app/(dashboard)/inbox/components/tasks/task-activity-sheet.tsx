import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { TaskActivityCard } from "./activity-card";

interface HistoryProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskDetails: any;
}
const TaskActivitySheet = ({
  isOpen,
  onOpenChange,
  taskDetails,
}: HistoryProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-3xl p-0 overflow-auto bg-background">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-white dark:bg-slate-800">
          <SheetTitle className="text-lg font-medium"> Activity Log</SheetTitle>
          <SheetClose asChild>
            <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
              <X className="h-5 w-5" />
            </div>
          </SheetClose>
        </SheetHeader>
        <div className="grow overflow-y-auto p-5 pt-1">
          <TaskActivityCard taskId={taskDetails?.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskActivitySheet;
