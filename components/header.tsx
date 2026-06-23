import React from "react";
import { InfoIcon } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "./ui/button";

export interface emptyDataInteface {
  title: string;
  message: string;
  type?: string;
  isRequired?: boolean;
}
const HeaderHoverCard = ({
  title,
  message,
  type,
  isRequired,
}: emptyDataInteface) => {
  return (
    <HoverCard>
      <div className="flex flex-row items-center justify-start gap-2">
        {type == "page" ? (
          <h5 className="text-2xl font-semibold tracking-tight">
            {title}{" "}
            {isRequired == true && (
              <span className="text-destructive text-lg leading-4">*</span>
            )}
          </h5>
        ) : null}

        {type == "sheet" ? (
          <h2 className="text-foreground pl-3 text-xl font-semibold">
            {title}{" "}
            {isRequired == true && (
              <span className="text-destructive text-lg leading-4">*</span>
            )}
          </h2>
        ) : null}

        {type == "field" ? (
          <label
            className={`${isRequired ? "required" : ""} text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground`}
          >
            {title}{" "}
          </label>
        ) : null}

        {type == "card" ? (
          <h3 className="text-lg font-medium leading-none tracking-tight flex gap-1 items-center">
            {title}{" "}
            {isRequired == true && (
              <span className="text-destructive text-lg leading-4">*</span>
            )}
          </h3>
        ) : null}

        {type == "cardSub" ? (
          <h3 className="text-xl leading-none tracking-tight flex gap-3 items-center font-medium">
            {title}{" "}
            {isRequired == true && (
              <span className="text-destructive text-lg leading-4">*</span>
            )}
          </h3>
        ) : null}

        {type == "access" ? (
          <span>
            {title}{" "}
            {isRequired == true && (
              <span className="text-destructive text-lg leading-4">*</span>
            )}
          </span>
        ) : null}

        {type == "data" ? (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
            {title}{" "}
            {isRequired == true && (
              <span className="text-destructive text-lg leading-4">*</span>
            )}
          </label>
        ) : null}

        {type == undefined ? (
          <div className="text-xl font-semibold">
            {title}{" "}
            {isRequired == true && (
              <span className="text-destructive text-lg leading-4">*</span>
            )}
          </div>
        ) : null}

        <HoverCardTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className="h-auto w-auto has-[>svg]:px-0 cursor-pointer flex-shrink-0 focus:outline-none focus:ring-0 p-0"
            aria-label={`Info: ${title}`}
            tabIndex={-1}
          >
            <InfoIcon className="w-4 h-4 cursor-pointer" strokeWidth={1.5} />
          </Button>
        </HoverCardTrigger>
      </div>
      <HoverCardContent className="w-80 p-3.5 z-[100]">
        <div className="flex space-x-3">
          <div className="space-y-1">
            <p
              className="text-sm text-secondary-foreground"
              dangerouslySetInnerHTML={{ __html: message }}
            />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default HeaderHoverCard;
