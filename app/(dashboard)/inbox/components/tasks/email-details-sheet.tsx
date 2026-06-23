import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmailDetail } from "../inbox/email-detail";
import { TaskList } from "../inbox/task-list";
import { IAgentDetails, IAttachmentDetails } from "@/types/types";
import { X } from "lucide-react";

interface EmailDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emailData: any;
  agentDetails: IAgentDetails | null;
  taskExecutionDetails: any[];
  onOpenAttachment: (attachment: IAttachmentDetails) => void;
  isDetailsHide: boolean;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  isTaskListLoading: boolean;
}

export const EmailDetailsSheet: React.FC<EmailDetailsSheetProps> = ({
  isOpen,
  onOpenChange,
  emailData,
  agentDetails,
  taskExecutionDetails,
  onOpenAttachment,
  isDetailsHide,
  onArchive = () => {},
  onDelete = () => {},
  isTaskListLoading,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full max-w-xl sm:max-w-3xl p-0 overflow-auto bg-background">
        <SheetHeader className="sticky top-0 z-10 flex p-3 flex-row justify-between items-center border-b space-y-0 bg-white dark:bg-slate-800">
          <SheetTitle className="text-lg font-medium">
            {emailData?.subject || "Email Details"}
          </SheetTitle>
          <SheetClose asChild>
            <div className="p-2 rounded-md cursor-pointer hover:bg-secondary">
              <X className="h-5 w-5" />
            </div>
          </SheetClose>
        </SheetHeader>
        <div className="grow overflow-y-auto p-5 pt-1">
          {emailData && (
            <>
              <EmailDetail
                selectedEmail={emailData}
                assignedAgent={agentDetails}
                onRetry={() => {}}
                onArchive={onArchive}
                onDelete={onDelete}
                isDetailsHide={isDetailsHide}
                handleOpenAttachmentEvent={onOpenAttachment}
                renderFrom="task-details"
              />
              <TaskList
                assignedAgent={agentDetails}
                tasks={taskExecutionDetails}
                handleOpenAttachmentEvent={onOpenAttachment}
                isTaskListLoading={isTaskListLoading}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
