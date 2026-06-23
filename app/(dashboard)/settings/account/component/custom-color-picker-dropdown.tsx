"use client";

import ConditionalTooltip from "@/components/conditional-tooltip-renderer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { HexColorPicker } from "react-colorful";

interface Props {
  tempColor: string;
  setTempColor: (color: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (v: boolean) => void;
  handleSaveCustomColor: () => void;
}

export default function CustomColorPickerDropdown({
  tempColor,
  setTempColor,
  isDropdownOpen,
  setIsDropdownOpen,
  handleSaveCustomColor,
}: Props) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <ConditionalTooltip
      content="Custom Color"
      alwaysShow={true}
      align="center"
      showArrow={true}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group transition-all cursor-pointer h-10 w-10 rounded-md border hover:scale-110 hover:shadow-sm flex items-center justify-center text-lg font-bold">
            +
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="p-4 w-auto"
          align="end"
          sideOffset={5}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="space-y-3"
          >
            <HexColorPicker
              color={tempColor}
              onChange={setTempColor}
              style={{ width: "100%", height: "160px" }}
            />

            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-md border shrink-0"
                style={{ backgroundColor: tempColor }}
              />
              <Input
                value={tempColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.match(/^#?[0-9a-fA-F]{0,6}$/)) {
                    setTempColor(val.startsWith("#") ? val : `#${val}`);
                  }
                }}
                className="h-8 text-xs font-mono"
                maxLength={7}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveCustomColor();
              }}
            >
              Apply Color
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </ConditionalTooltip>
  );
}
