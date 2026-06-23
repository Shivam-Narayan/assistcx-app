import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ClipboardCheck, MailCheck, Zap } from "lucide-react";

interface DashboardCardData {
  email_count: number;
  executing_count: number;
  failed_count: number;
  successful_count: number;
  task_count: number;
  success_rate?: number;
  time_saved?: number;
}

interface StatesCardProps {
  cardDetails: DashboardCardData | null;
}

export default function StatsCards({ cardDetails }: StatesCardProps) {
  // const hours = secondsToHours(cardDetails?.time_saved || 0);
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="group rounded-lg border bg-card text-card-foreground shadow-xs gap-0 p-0">
          <CardHeader className=" p-4 xl:p-6 flex flex-row items-center justify-between space-y-0  pb-2 xl:pb-2">
            <CardTitle className="tracking-tight text-sm font-medium">
              Total Emails
            </CardTitle>
            <MailCheck
              className={`h-8 w-8 p-1.5 rounded-lg text-muted-foreground text-primary bg-primary/10 `}
            />
          </CardHeader>
          <CardContent className="p-4 xl:p-6 pt-0 xl:pt-0">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-primary">
                {cardDetails ? cardDetails.email_count : ""}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg border bg-card text-card-foreground shadow-xs gap-0 p-0 group">
          <CardHeader className="p-4 xl:p-6 flex flex-row items-center justify-between space-y-0 pb-2 xl:pb-2">
            <CardTitle className="tracking-tight text-sm font-medium">
              Tasks Processed
            </CardTitle>
            <ClipboardCheck
              className={`h-8 w-8 p-1.5 rounded-lg text-muted-foreground text-primary bg-primary/10 `}
            />
          </CardHeader>
          <CardContent className="p-4 xl:p-6 pt-0 xl:pt-0">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-primary">
                {cardDetails ? cardDetails.task_count : ""}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg border bg-card text-card-foreground shadow-xs gap-0 p-0 group">
          <CardHeader className="p-4 xl:p-6 flex flex-row items-center justify-between space-y-0 pb-2 xl:pb-2">
            <CardTitle className="tracking-tight text-sm font-medium">
              Successful Tasks
            </CardTitle>
            <CheckCircle
              className={`h-8 w-8 p-1.5 rounded-lg text-muted-foreground text-primary bg-primary/10 `}
            />
          </CardHeader>
          <CardContent className="p-4 xl:p-6 pt-0 xl:pt-0">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-primary">
                {cardDetails ? cardDetails.successful_count : ""}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg border bg-card text-card-foreground shadow-xs gap-0 p-0 group">
          <CardHeader className="p-4 xl:p-6 flex flex-row items-center justify-between space-y-0 pb-2 xl:pb-2">
            <CardTitle className="tracking-tight text-sm font-medium">
              Success Rate
            </CardTitle>
            <Zap
              className={`h-8 w-8 p-1.5 rounded-lg text-muted-foreground text-primary bg-primary/10 `}
            />
          </CardHeader>
          <CardContent className="p-6 pt-0 xl:pt-0">
            {cardDetails && (
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-primary">
                  {cardDetails?.success_rate
                    ? cardDetails.success_rate.toFixed(2)
                    : 0}
                  <span className="text-lg text-muted-foreground  font-normal">
                    %
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* <Card className="rounded-lg border bg-card text-card-foreground shadow-xs gap-0 p-0">
          <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="tracking-tight text-sm font-medium">
              Time Saved
            </CardTitle>
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {hours === 0 ? (
                  "N/A"
                ) : (
                  <>
                    {hours}
                    <span className="text-lg text-muted-foreground font-normal">
                      hours
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </>
  );
}
