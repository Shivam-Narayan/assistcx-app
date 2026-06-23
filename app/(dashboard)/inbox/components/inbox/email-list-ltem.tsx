import { JumpingLoadingAnimation } from "@/components/JumpingLoadingAnimation";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusColor, UTCToLocalTimezon } from "@/helper/helper-function";
import type { IEmailData } from "@/types/types";
import { Paperclip } from "lucide-react";

interface EmailListItemProps {
  email: IEmailData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  checkList: string[];
  onChecklistChange: (emailId: string) => void;
  hasActiveFilters: any;
}

export function EmailListItem({
  email,
  isSelected,
  onSelect,
  checkList,
  onChecklistChange,
  hasActiveFilters,
}: EmailListItemProps) {
  const isChecked = checkList.includes(email.id);

  const isEmailsExecuting =
    email?.status === "QUEUED" || email?.status === "EXECUTING";
  return (
    <div
      key={email.id}
      onClick={() => onSelect(email.id)}
      className={`py-3 px-3 rounded-md border cursor-pointer hover:bg-muted ${
        isSelected
          ? `shadow-sm  bg-muted border-muted-foreground
           `
          : ""
      }`}
    >
      <div className="flex flex-col justify-start items-start xl:flex-row   xl:justify-between xl:items-center mb-2 xl:mb-1">
        <span
          className={`font-semibold  text-sm xl:text-base text-foreground truncate`}
          title={email.sender_name}
        >
          {email.sender_name}
        </span>
        <span className="text-xs text-muted-foreground">
          {UTCToLocalTimezon(email.created_at)}
        </span>
      </div>
      <p className="text-xs xl:text-sm text-foreground/80 font-medium truncate">
        {email.subject}
      </p>
      <p className="text-xs text-muted-foreground truncate h-4">
        {email.email_body
          .replace(/[#*_`>\\]/g, "")
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 200)}
      </p>
      <div className="mt-2 flex items-center justify-between flex-wrap gap-y-1">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <Badge
            variant="outline"
            className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(
              email?.status
            )}`}
          >
            {isEmailsExecuting && (
              <JumpingLoadingAnimation
                className="w-3 h-3"
                color={
                  email?.status === "QUEUED" ? "bg-yellow-500" : "bg-blue-500"
                }
              />
            )}
            <span>
              {email?.status
                ? email.status.charAt(0).toUpperCase() +
                  email.status.slice(1).toLowerCase()
                : "NA"}
            </span>
          </Badge>

          {email?.agent_task_counts?.TOTAL > 0 && (
            <Badge
              variant="outline"
              className={`px-2 py-0.5 text-xs border-primary/30 text-primary bg-primary/10 `}
            >
              {email?.agent_task_counts?.TOTAL} Task
              {email?.agent_task_counts?.TOTAL > 1 ? "s" : ""}
            </Badge>
          )}
          {email?.attachment_details?.total > 0 && (
            <Badge
              variant="outline"
              className="px-1.5 py-0.5 text-xs border-muted-foreground/20 bg-muted/70"
            >
              <Paperclip className="w-3 h-3 mr-1" />{" "}
              {email?.attachment_details?.total}
            </Badge>
          )}
        </div>

        {/*  Checkbox */}
        {hasActiveFilters && (
          <Checkbox
            checked={isChecked}
            onCheckedChange={() => onChecklistChange(email.id)}
            className="w-4 h-4 bg-gray-100 border-gray-300 rounded ml-auto cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
}
