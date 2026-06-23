import { InfoIcon } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "./ui/button";

export const InfoIconWithMessage = ({ content }: { content: string }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <Button
        variant="ghost"
        type="button"
        className="h-auto w-auto has-[>svg]:px-0 cursor-pointer flex-shrink-0 focus:outline-none focus:ring-0 p-0"
        aria-label={`Info: ${content}`}
        tabIndex={-1}
      >
        <InfoIcon className="w-4 h-4 cursor-pointer" strokeWidth={1.5} />
      </Button>
    </HoverCardTrigger>
    <HoverCardContent className="w-80 p-3.5 z-[100]">
      <div className="flex space-x-3">
        <div className="space-y-1">
          <p
            className="text-sm text-secondary-foreground"
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
);
