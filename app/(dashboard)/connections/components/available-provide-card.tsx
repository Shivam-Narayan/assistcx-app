import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";
import Image from "next/image";
import { useConnections } from "../hook/useConnections";
type PropsAvailbe = {
  provider: any;
  connectionActions: ReturnType<typeof useConnections>;
};

const AvailableProviderCard = ({
  provider,
  connectionActions,
}: PropsAvailbe) => {
  const { handleViewDetails } = connectionActions;

  const connectionIcon =
    provider?.key && INTEGRATION_ICON_SRC[provider.key]
      ? INTEGRATION_ICON_SRC[provider.key]
      : undefined;

  return (
    <>
      <Card
        key={provider.key}
        onClick={() => handleViewDetails(provider)}
        className={`group rounded-lg w-full py-3 cursor-pointer transition-all duration-300 flex flex-col gap-4 relative group transition-colors hover:bg-muted/50`}
      >
        <CardHeader className="shrink-0 p-0 gap-0 px-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-row items-center justify-end">
              <div
                className={`p-2 rounded-full w-fit h-fit bg-primary/10 text-primary `}
              >
                {connectionIcon ? (
                  <Image
                    src={connectionIcon}
                    alt="provider"
                    width={24}
                    height={24}
                    className="h-auto w-6"
                  />
                ) : null}
              </div>

              <div className="flex flex-col ml-3 max-w-xs">
                <CardTitle className="font-semibold tracking-tight text-lg">
                  {provider.name}
                </CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex !px-4 flex-1 flex-col justify-between p-0 space-y-2">
          <p className="text-wrap text-sm text-muted-foreground line-clamp-2 overflow-hidden">
            {provider?.description}
          </p>

          <div className="flex flex-wrap gap-2 ">
            {provider?.tags?.length > 0 &&
              provider.tags.map((tag: any, i: any) => (
                <Badge variant="secondary" key={i} className="text-[10px]">
                  <span>{tag.replace("_", " ").toUpperCase()}</span>
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default AvailableProviderCard;
