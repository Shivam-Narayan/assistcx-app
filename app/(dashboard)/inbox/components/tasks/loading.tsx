"use client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  ArrowLeft,
  ChevronDown,
  History,
  MoreVertical,
  RefreshCcw,
  SquarePen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const Loading = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex items-center justify-between p-4 border-b dark:border-slate-700 bg-card sticky top-0 z-10">
        {/* Left Side: Back button and Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className={`h-8 cursor-pointer transition-colors`}
            onClick={() => router.push("/inbox")}
          >
            <ArrowLeft className="h-5 w-5" />

            <span className="sr-only">Back to Inbox</span>
          </Button>
          <h2 className="text-xl font-semibold truncate max-w-xs md:max-w-sm">
            Task Details
          </h2>
        </div>

        {/* Right Side: Attempt selector, Status and Actions Menu */}
        <div className="flex items-center gap-3">
          {/* Attempt selector */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-8 text-muted-foreground focus-visible:ring-0 focus:outline-hidden focus-visible:outline-hidden"
              >
                <History className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Attempt</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-auto p-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mb-1">
                Previous Attempts
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 ring-0 outline-hidden focus-visible:ring-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open actions menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span>Retry Task</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SquarePen className="mr-2 h-4 w-4" />
                <span>Change Status</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" />
                <span>Archive Task</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    </div>
  );
};

export default Loading;
