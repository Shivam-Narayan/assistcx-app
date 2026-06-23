"use client";
import { Button } from "@/components/ui/button";
import { hslStringToHex } from "@/helper/helper-function";
import { setColorTheme } from "@/redux/app-theme/theme-slice";
import { RootState } from "@/redux/store";
import { Loader2, Palette, Pencil } from "lucide-react";
import { useSelector } from "react-redux";

export function ThemeHeader({
  themeColor,
  isEdit,
  setIsEdit,
  setOpenConfirmation,
  isLoading,
  loading,
  isOrganizationUpdate = true,
}: {
  themeColor: string;
  isEdit: boolean;
  setIsEdit: (v: boolean) => void;
  setOpenConfirmation: (v: boolean) => void;
  isLoading: boolean;
  loading: boolean;
  isOrganizationUpdate?: boolean;
}) {
  const hex = hslStringToHex(themeColor);
  const { colorTheme } = useSelector((state: RootState) => state.themeSlice);

  return (
    <div className="flex flex-row justify-between items-start w-full">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-secondary shrink-0">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <p className="text-base font-semibold">Theme</p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 border rounded-md text-xs text-muted-foreground">
              <div
                className="w-3 h-3 rounded-sm border"
                style={{ backgroundColor: hex }}
              />
              {hex}
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-normal">
            Select your preferred color theme for the application
          </p>
        </div>
      </div>
      <div className="flex items-center gap-x-4">
        {isOrganizationUpdate &&
          (!isEdit ? (
            <div
              className="p-2 rounded-md cursor-pointer hover:bg-secondary"
              onClick={() => setIsEdit(true)}
            >
              <Pencil size={18} />
            </div>
          ) : (
            <div className="space-x-2">
              <Button
                onClick={() => {
                  setIsEdit(false);
                  setColorTheme(colorTheme);
                }}
                variant="secondary"
                size="sm"
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setOpenConfirmation(true)}
                disabled={isLoading || loading}
                size="sm"
                className="cursor-pointer"
              >
                {(isLoading || loading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Apply
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
