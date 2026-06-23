"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as Icon from "lucide-react";
import { useState } from "react";
import { SearchOption } from "./types";

export const searchOptions: SearchOption[] = [
  {
    value: "search",
    label: "Search",
    description: "Advanced search and reasoning",
    icon: "SearchCheck",
  },
  {
    value: "research",
    label: "Research",
    description: "research and analysis",
    icon: "BookOpen",
  },
];

export default function DeepSearchSelector({
  mode,
  setMode,
}: {
  mode: SearchOption;
  setMode: (mode: SearchOption) => void;
}) {
  const [open, setOpen] = useState(false);

  const SelectedIcon = Icon[mode.icon] as React.ElementType;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="Select mode"
          className="rounded-full gap-2 bg-muted text-sm font-medium px-4 py-2 shadow-none border w-auto sm:w-auto"
        >
          <SelectedIcon className="text-muted-foreground" />
          <span className="hidden  sm:inline-flex">{mode.label}</span>
          <Icon.ChevronDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] rounded-xl p-1 shadow-xl">
        <Command>
          <CommandList>
            <CommandEmpty>No result found.</CommandEmpty>
            <CommandGroup>
              {searchOptions.map((option) => {
                const isSelected = mode.value === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      setMode(option);
                      setOpen(false);
                    }}
                    className="py-2 px-3 flex flex-col items-start rounded-md gap-0.5"
                  >
                    <div className="flex items-center w-full gap-2">
                      {isSelected ? (
                        <Icon.Check className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
