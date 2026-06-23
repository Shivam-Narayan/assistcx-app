"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INTEGRATION_ICON_SRC } from "@/lib/constants";
import { Link, Plug } from "lucide-react";
import Image from "next/image";
import { useConnections } from "../hook/useConnections";

type PropsActivecard = {
  provider: any;
  connectionActions: ReturnType<typeof useConnections>;
};

const ActiveProviderCard = ({
  provider,
  connectionActions,
}: PropsActivecard) => {
  const { handleViewDetails } = connectionActions;

  const connectionIcon =
    provider?.key && INTEGRATION_ICON_SRC[provider.key]
      ? INTEGRATION_ICON_SRC[provider.key]
      : undefined;

  return (
    <>
      <Card
        key={provider.key}
        className={`group rounded-lg w-full py-3 transition-all duration-300 flex flex-col gap-4 relative  `}
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
            {provider?.is_active && (
              <div className="flex items-center justify-end gap-2">
                <Badge
                  variant="default"
                  className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15"
                >
                  Active
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex !px-4 flex-1 flex-col justify-between p-0 space-y-3">
          <p className="text-wrap text-sm text-muted-foreground line-clamp-2 overflow-hidden">
            {provider?.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {provider?.tags?.length > 0 &&
              provider.tags.map((tag: string) => (
                <Badge variant="secondary" key={tag} className="text-[10px]">
                  <span>{tag.replace("_", " ").toUpperCase()}</span>
                </Badge>
              ))}
          </div>
        </CardContent>

        <CardFooter className="!pt-3 flex justify-between items-center border-t px-4">
          <div className="flex gap-2 items-center text-sm ">
            <Link className="h-4 w-4 " />
            {`${provider?.connections_count} connections `}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(provider)}
            className="h-7 px-3 text-xs font-medium  cursor-pointer"
          >
            <Plug className="h-4 w-4" />
            Manage
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
export default ActiveProviderCard;
