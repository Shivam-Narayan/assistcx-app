"use client";

import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CopyToClipboard from "@/components/copy-to-clipboard";
import { getIconSvg } from "@/components/icon-manager/icon-render-component";
import Image from "next/image";
import DefaultIcon from "@/public/icon1.png";

interface ProfileCardProps {
  agentId?: string | null;
}

const IdentityCard = ({ agentId }: ProfileCardProps) => {
  const { getValues } = useFormContext();

  const identity = getValues("identity");

  const { name, goal, style, description, icon } = identity || {};

  const agentIconSrc = getIconSvg(
    typeof icon === "string" ? icon : "",
    "agent_icons",
  );

  return (
    <Card className="overflow-hidden shadow-none pt-0! pb-0 gap-4">
      <CardHeader className="bg-slate-100 py-4 px-4 gap-0">
        <div className="flex items-center gap-4">
          {typeof agentIconSrc === "string" &&
          agentIconSrc.startsWith("<svg") ? (
            <div
              className="size-12 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center p-1.5"
              dangerouslySetInnerHTML={{ __html: agentIconSrc }}
            />
          ) : (
            <div className="size-12 rounded-md bg-primary/10 flex items-center justify-center p-1.5">
              <Image src={DefaultIcon} alt="Agent" width={20} height={20} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold">
              {name || "—"}
            </CardTitle>
            {goal && <p className="text-sm text-muted-foreground">{goal}</p>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4">
        {style && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Style</h3>
            <p className="text-sm text-slate-600">{style}</p>
          </div>
        )}

        {description && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Description
            </h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        )}
      </CardContent>

      {agentId != null && agentId !== "" && (
        <CardFooter className="border-t border-slate-100 px-4 !pt-2 !pb-2 flex items-center gap-1.5 [.border-t]:!pt-2">
          <span className="font-mono text-[11px] text-muted-foreground truncate min-w-0">
            Agent ID: {agentId}
          </span>
          <CopyToClipboard
            text={agentId}
            tooltipLabel="Copy agent ID"
            className="!h-2 !w-2 rounded-md"
          />
        </CardFooter>
      )}
    </Card>
  );
};

export default IdentityCard;
