import {
  errorMessageHandler,
  successMessageHandler,
} from "@/helper/helper-function";
import { axiosAuth } from "@/lib/hook/useAxiosAuth";
import { setIsRetry } from "@/redux/new-inbox/inbox-email-slice";
import { IEmailData } from "@/types/types";
import { Inbox as InboxIcon } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useAgentAndTaskDetails } from "../../hooks/useAgentAndTaskDetails";
import { useEmailDetailPolling } from "../../hooks/useEmailDetailPolling";
import { EmailDetail } from "../inbox/email-detail";
import { TaskList } from "../inbox/task-list";
import { EmptyState } from "@/components/empty-state/empty-state";

interface EmailDetailContainerProps {
  emailData: IEmailData[];
  selectedEmailId: string | null;
  onArchive: () => void;
  onDelete: () => void;
  onOpenAttachment: (attachment: any) => void;
}

const EmptyEmailDetailView: React.FC = () => {
  return (
    <EmptyState
      variant="fullpage"
      title="Select an email to view details."
      icon={InboxIcon}
    />
  );
};

export const EmailDetailContainer: React.FC<EmailDetailContainerProps> = ({
  emailData,
  selectedEmailId,
  onArchive,
  onDelete,
  onOpenAttachment,
}) => {
  // Memoize selected email

  const selectedEmailData = useMemo(
    () => emailData.find((email) => email.id === selectedEmailId),
    [emailData, selectedEmailId],
  );
  const dispatch = useDispatch();
  const { selectedEmail } = useEmailDetailPolling({
    selectedEmailId: selectedEmailId ?? "",
    selectedEmailData: selectedEmailData as IEmailData,
  });

  // emaildata means  all emails in the inbox

  const handleRetryEmail = async (emailId: string) => {
    let API_ENDPOINT_PATH = `/emails/${emailId}/reprocess`;
    try {
      const result = await axiosAuth.post(API_ENDPOINT_PATH);
      if (result?.status === 200) {
        successMessageHandler(result.data.message);
        dispatch(setIsRetry(true));
      }
    } catch (error: any) {
      errorMessageHandler(error.response.data.detail);
    }
  };

  // Memoize callback functions
  const handleArchive = useCallback(
    (id: string) => {
      onArchive();
    },
    [onArchive],
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete();
    },
    [onDelete],
  );

  const handleOpenAttachment = useCallback(
    (attachment: any) => {
      onOpenAttachment(attachment);
    },
    [onOpenAttachment],
  );

  const { agentDetails, taskExecutionDetails, isTaskListLoading } =
    useAgentAndTaskDetails(selectedEmail);

  if (!selectedEmail) {
    return <EmptyEmailDetailView />;
  }

  return (
    <div className="p-6">
      <EmailDetail
        selectedEmail={selectedEmail}
        assignedAgent={agentDetails}
        onRetry={handleRetryEmail}
        onArchive={handleArchive}
        onDelete={handleDelete}
        isDetailsHide={false}
        handleOpenAttachmentEvent={handleOpenAttachment}
        renderFrom="email-details"
      />

      <TaskList
        assignedAgent={agentDetails}
        tasks={taskExecutionDetails}
        handleOpenAttachmentEvent={handleOpenAttachment}
        isTaskListLoading={isTaskListLoading}
      />
    </div>
  );
};
