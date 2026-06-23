"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

interface ContextMenuActionsProps {
  handleEditAgents: (index: number) => void;
  handleRouteToAgentDetails: () => void;
  index: number;
  isUpdateAgents: boolean;
}
export function ContextMenuActions({
  handleEditAgents,
  handleRouteToAgentDetails,
  index,
  isUpdateAgents,
}: ContextMenuActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex h-5 w-8 p-0 absolute -mt-5 data-[state=open]:bg-muted outline-hidden ring-0 focus-visible:ring-0`}
        >
          <DotsHorizontalIcon className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            handleRouteToAgentDetails();
          }}
        >
          View Agent
        </DropdownMenuItem>
        {isUpdateAgents && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              handleEditAgents(index);
            }}
          >
            Edit Agent
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
