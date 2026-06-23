import { SmartContentViewer } from "@/components/smart-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AgentOutputMainData,
  ExecutionMessage,
  ReviewHistoryItem,
} from "@/types/types";
import type { Dispatch, SetStateAction } from "react";
import {
  Check,
  ClipboardList,
  Pencil,
  ShieldAlert,
  X,
  ZapIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useExecutionActions } from "../../hooks/useExecutionAction";
import { EditAction } from "./editAction";
import { Feedback } from "./feedback";

function PendingReviewQuestionBanner({ question }: { question?: string }) {
  const text = question?.trim();
  if (!text) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/[0.06] px-4 py-3.5 text-left dark:border-primary/25 dark:bg-primary/10">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Question
        </p>
        <p className="text-sm font-medium leading-relaxed text-foreground">
          {text}
        </p>
      </div>
    </div>
  );
}

function ReviewRulesAccordion({ rules }: { rules: string[] | undefined }) {
  if (!rules?.length) return null;

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-slate-50 dark:border-gray-700 dark:bg-slate-700/40">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="rules" className="border-0">
          <AccordionTrigger className="w-full px-4 py-3 text-left transition-colors hover:bg-slate-100/80 hover:no-underline dark:hover:bg-slate-600/30 [&[data-state=open]>svg]:rotate-180">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ClipboardList
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              Review rules
            </span>
          </AccordionTrigger>
          <AccordionContent className="border-t border-gray-200 px-4 py-4 dark:border-gray-600">
            <ul className="flex flex-col gap-3 text-sm leading-relaxed text-gray-700 dark:text-slate-300">
              {rules.map((rule, index) => (
                <li
                  key={`${rule}-${index}`}
                  className="relative pl-4 before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-gray-400 dark:before:bg-slate-500"
                >
                  {rule}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export const ExecutionActions = ({
  executionLog,
  setAgentOutputData,
  agentOutputData,
  taskStatus,
  setIsCustomTaskLoading,
  setTaskStatus,
  setExecutionLog,
  pendingReview,
  setPendingReview,
  setReviewHistory,
  getTaskInformation,
}: {
  executionLog: ExecutionMessage[];
  setAgentOutputData: (agentOutputData: AgentOutputMainData | null) => void;
  agentOutputData: AgentOutputMainData | null;
  taskStatus?: string | null;
  setIsCustomTaskLoading: (isLoading: boolean) => void;
  setTaskStatus: (status: string | null) => void;
  setExecutionLog: (executionLog: ExecutionMessage[]) => void;
  pendingReview: any;
  setPendingReview: (actionRequired: any) => void;
  setReviewHistory: Dispatch<SetStateAction<ReviewHistoryItem[]>>;
  getTaskInformation: () => Promise<void>;
}) => {
  const params = useParams() as { task_id: string };
  const { task_id: taskId } = params;
  const { tool_name, tool_call_id, tool_args, review_rules, question } =
    pendingReview;

  const {
    editingCallId,
    editedArgs,
    isRejecting,
    jsonValidity,
    isEditOpen,
    selectedCall,
    isResponseLoading,
    setIsRejecting,
    setIsEditOpen,
    setEditingCallId,
    setEditedArgs,
    setJsonValidity,
    handleCancel,
    handleUpdate,
    handleResponse,
    openEdit,
  } = useExecutionActions({
    taskId,
    executionLog,
    agentOutputData,
    pendingReview,
    getTaskInformation,
    setAgentOutputData,
    setIsCustomTaskLoading,
    setTaskStatus,
    setExecutionLog,
    setPendingReview,
    setReviewHistory,
  });

  return (
    <Card className="p-0 gap-0 shadow-xs overflow-hidden divide-y transition-colors border bg-white dark:bg-slate-800">
      <CardHeader className="px-4 py-3 gap-0">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-gray-800 dark:text-slate-400" />
          <CardTitle className="text-base xl:text-lg text-gray-800 dark:text-slate-200">
            Action Required!
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-3 xl:p-5 text-gray-700 dark:text-slate-300 flex flex-col gap-4">
        <PendingReviewQuestionBanner question={question} />

        <div className="space-y-3">
          <div
            key={tool_call_id}
            className={cn(
              "p-3 border rounded-md bg-slate-50 dark:bg-slate-700/40 border-gray-200 dark:border-gray-700",
            )}
          >
            <p className="font-medium flex items-center gap-2 text-primary/90 mb-2">
              <ZapIcon className="h-4 w-4" strokeWidth={2} />
              <code className="font-semibold">{tool_name}</code>
            </p>
            <div className="prose prose-sm dark:prose-invert max-w-none reset-prose">
              <SmartContentViewer
                content={tool_args}
                className="bg-background!"
                expandView={true}
              />
            </div>
          </div>
        </div>

        <ReviewRulesAccordion rules={review_rules} />

        {!isRejecting && (
          <div className="flex gap-2">
            {!editingCallId && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResponse("approve")}
                  disabled={isResponseLoading}
                  className="cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(tool_call_id)}
                  disabled={isResponseLoading}
                  className="cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRejecting(true)}
                  disabled={isResponseLoading}
                  className="cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </>
            )}
          </div>
        )}

        {isRejecting && (
          <Feedback
            setIsFeedback={() => setIsRejecting(false)}
            onSubmit={(text) =>
              handleResponse("reject", { feedbackText: text })
            }
            placeholder="Enter your reason for rejection..."
            tips="Provide your reason for rejecting the agent's tool call."
            actionLabel="Reject"
          />
        )}

        <EditAction
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          call={selectedCall}
          value={editingCallId ? editedArgs[editingCallId] : ""}
          isValid={editingCallId ? (jsonValidity[editingCallId] ?? true) : true}
          onChange={(val: string) =>
            editingCallId &&
            setEditedArgs((prev) => ({ ...prev, [editingCallId]: val }))
          }
          onUpdate={() => {
            handleUpdate(editingCallId || "");
            handleResponse("edit", { editedCallId: editingCallId! });
          }}
          setJsonValidity={setJsonValidity}
          editingCallId={editingCallId}
          handleCancel={handleCancel}
          setEditingCallId={setEditingCallId}
        />
      </CardContent>
    </Card>
  );
};
