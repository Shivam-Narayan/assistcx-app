import { getStatusColor, UTCToLocalTimezon } from "@/helper/helper-function";
import { ClipboardList, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CopyToClipboard from "../copy-to-clipboard";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../empty-state/empty-state";

interface TaskProgress {
  status: "QUEUED" | "EXECUTING" | "SUCCESSFUL" | string;
  timestamp: string;
}

interface IssueTask {
  title: string;
  description: string;
  completed_at: string;
  id: string;
  email_data_id: string;
  created_at: string;
  progress: TaskProgress[];
}

interface IssueTaskCardProps {
  data: IssueTask[];
  loadingTasks: boolean;
  checkTaskId: string;
}

export const IssueTaskCard = ({
  data,
  loadingTasks,
  checkTaskId,
}: IssueTaskCardProps) => {
  const router = useRouter();
  const getLatestStatus = (progress: TaskProgress[]) => {
    if (!progress || progress.length === 0) return;
    return progress[progress.length - 1].status;
  };

  if (loadingTasks) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-260px)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        variant="card"
        compact
        icon={<ClipboardList />}
        title="No Tasks Available"
        description="There are currently no tasks linked to this item. Tasks will appear here once created or generated through system processing."
      />
    );
  }

  return (
    <div className="flex flex-col space-y-5">
      {data.map((item) => {
        const latestStatus = getLatestStatus(item.progress);

        return (
          <Card
            key={item.id}
            className="relative group shadow-xs p-0 gap-0 rounded-md transition-shadow hover:shadow-md border bg-white dark:bg-slate-800"
          >
            <CardHeader
              onClick={
                checkTaskId !== item.id
                  ? () => router.push(`/inbox/tasks/${item.id}`)
                  : undefined
              }
              className={`py-3! px-3 gap-0 rounded-t-md border-b transition-all duration-150 ease-in-out bg-muted/50 dark:bg-slate-700/30 dark:border-slate-700 hover:bg-muted dark:hover:bg-slate-600/80
                 ${checkTaskId !== item.id ? "cursor-pointer" : "cursor-default"}
                `}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-medium text-gray-800 dark:text-slate-200 line-clamp-1">
                    {item.title || "NA"}
                  </CardTitle>

                  {latestStatus && (
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(
                        latestStatus,
                      )} h-7 xl:h-8 text-xs xl:text-sm px-2 py-1 flex items-center gap-1 font-normal shrink-0`}
                    >
                      <span className="leading-none">{latestStatus}</span>
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-xs text-muted-foreground dark:text-slate-400">
                  <p className="pr-1">Task ID: {item.id}</p>
                  <CopyToClipboard text={item.id} tooltipLabel="Copy task ID" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 flex flex-col gap-3 md:p-4 text-gray-700 dark:text-slate-300">
              <p className="text-sm line-clamp-2">{item.description}</p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground dark:text-slate-400">
                    Created:{" "}
                  </span>
                  <span className="font-medium">
                    {" "}
                    {UTCToLocalTimezon(item.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-slate-400">
                    Completed:{" "}
                  </span>
                  <span className="font-medium">
                    {item.completed_at
                      ? UTCToLocalTimezon(item.completed_at)
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
