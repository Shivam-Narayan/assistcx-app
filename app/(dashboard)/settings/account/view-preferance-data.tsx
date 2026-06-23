import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import InfoRow from "./preferance-info";

const ViewPreferanceData = ({
  configData,
  platformAlertRecipients,
  isLoadingData,
}: any) => {
  const recipientsRaw = configData?.preferences?.platform_alert_recipients;

  const recipients = Array.isArray(recipientsRaw)
    ? recipientsRaw
    : recipientsRaw
      ? [recipientsRaw]
      : [];

  const normalizeUser = (user: any) => ({
    id: user?.id || user?.user_id,
    email: user?.email || user?.email_id,
    name:
      user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
  });

  const normalizedRecipients = recipients.map(normalizeUser);

  return (
    <>
      <InfoRow
        label="Default LLM Model"
        value={configData?.preferences?.default_llm}
        isLoading={isLoadingData}
      />
      <InfoRow
        label="Fast LLM Model"
        value={configData?.preferences?.fast_llm}
        isLoading={isLoadingData}
      />
      <InfoRow
        label="Default Email"
        value={configData?.preferences?.default_email || "N/A"}
        isLoading={isLoadingData}
      />

      {normalizedRecipients?.length > 0 && (
        <div className="flex items-center px-4 py-2.5">
          <div className="w-56 shrink-0 text-sm text-muted-foreground">
            Platform Alert Recipients
          </div>
          {isLoadingData ? (
            <div className="w-2/5 flex gap-2">
              <Skeleton className="h-6 w-40" />
            </div>
          ) : (
            <div className="w-3/5 flex gap-2 overflow-hidden whitespace-nowrap">
              {normalizedRecipients?.slice(0, 1).map((ele: any, i: number) => (
                <ConditionalTooltip
                  content={ele?.email?.toLowerCase()}
                  align="center"
                >
                  <Badge variant="outline" className="max-w-[230px] text-sm">
                    <span className="block truncate whitespace-nowrap overflow-hidden max-w-[230px]">
                      {ele?.email?.toLowerCase()}
                    </span>
                  </Badge>
                </ConditionalTooltip>
              ))}

              {normalizedRecipients?.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge variant="outline" className="text-sm cursor-pointer">
                      +{normalizedRecipients.length - 1} more
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="
    no-arrow bg-white text-black border border-gray-200 rounded-md shadow-md
    max-h-[200px] overflow-y-auto scrollbar-thin w-fit
  "
                  >
                    <div className="flex flex-col gap-2 p-2">
                      {normalizedRecipients
                        .slice(1)
                        .map((ele: any, idx: number) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-sm whitespace-nowrap"
                          >
                            {ele?.email?.toLowerCase()}
                          </Badge>
                        ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ViewPreferanceData;
