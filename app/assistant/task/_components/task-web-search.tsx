"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { setWebSearchEnabled } from "@/redux/assistant/task/task-web-search-slice";
import { useAppSelector } from "@/redux/store";
import { Globe } from "lucide-react";
import { useDispatch } from "react-redux";

export default function TaskWebSearch() {
  const enabled = useAppSelector(
    (state) => state.taskWebSearchReducer?.enabled,
  );
  const dispatch = useDispatch();

  return (
    <>
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 rounded-full bg-muted border">
              <Globe className="h-5 w-5 text-primary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="flex items-center justify-between gap-2 px-2 h-9">
              <span className="text-sm">Web Search</span>
              <Switch
                checked={enabled}
                onCheckedChange={(value) =>
                  dispatch(setWebSearchEnabled(value))
                }
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="hidden sm:flex w-full min-w-max items-center gap-2 rounded-full bg-background text-sm text-muted-foreground px-3 h-8 border shadow-none">
        <span className="mb-0">Web Search</span>
        <Switch
          className="cursor-pointer"
          checked={enabled}
          onCheckedChange={(value) => dispatch(setWebSearchEnabled(value))}
        />
      </div>
    </>
  );
}
