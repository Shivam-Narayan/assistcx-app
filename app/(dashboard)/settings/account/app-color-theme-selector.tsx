"use client";

import CustomColorPickerDropdown from "@/app/(dashboard)/settings/account/component/custom-color-picker-dropdown";
import { ThemeHeader } from "@/app/(dashboard)/settings/account/component/theme-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  errorMessageHandler,
  hexToHSL,
  hslStringToHex,
  successMessageHandler,
} from "@/helper/helper-function";
import { colorThemes } from "@/helper/theme-helper";
import * as url from "@/helper/url-helper";
import useAxiosAuth from "@/lib/hook/useAxiosAuth";
import { setColorTheme } from "@/redux/app-theme/theme-slice";
import { RootState } from "@/redux/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmationDialog } from "../../../../components/confirmation-modal";
import { ThemeWatch } from "./component/theme-watch";

const DEFAULT_SLATE_THEME = colorThemes.find((t) => t.name === "slate")!.color;
const DEFAULT_HEX_COLOR = "#3b82f6";

// Utility function to apply theme to DOM
const applyThemeToDOM = (theme: string) => {
  const root = document.documentElement;
  const isPresetTheme = colorThemes.some((t) => t.color === theme);

  if (isPresetTheme) {
    root.style.setProperty("--primary", theme);
    const foreground =
      theme === DEFAULT_SLATE_THEME ? "210 40% 98%" : "0 0% 100%";
    root.style.setProperty("--primary-foreground", foreground);
  } else {
    root.setAttribute("data-color-theme", theme);
  }
};

export function ColorThemeSelector({
  isOrganizationUpdate,
  configData,
  getConfigurationData,
}: {
  isOrganizationUpdate: boolean;
  configData: Record<string, any>;
  getConfigurationData: () => Promise<void>;
}) {
  const dispatch = useDispatch();
  const { colorTheme } = useSelector((state: RootState) => state.themeSlice);
  const { axiosAuth, loading } = useAxiosAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [themeColor, setThemeColor] = useState<string>(
    () => colorTheme || DEFAULT_SLATE_THEME,
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const customPrimaryHex = useMemo(
    () => hslStringToHex(colorTheme || DEFAULT_HEX_COLOR),
    [colorTheme],
  );
  const [tempColor, setTempColor] = useState<string>(customPrimaryHex);
  const isThemeExist = useMemo(
    () => colorThemes.some((t) => t.color === themeColor),
    [themeColor],
  );
  useEffect(() => {
    if (!colorTheme) {
      dispatch(setColorTheme(DEFAULT_SLATE_THEME));
    }
  }, [colorTheme, dispatch]);

  useEffect(() => {
    if (!isOrganizationUpdate) {
      setIsEdit(false);
    }
  }, [isOrganizationUpdate]);

  // Sync themeColor with Redux colorTheme, apply to DOM, and update tempColor
  useEffect(() => {
    const activeTheme = colorTheme || DEFAULT_SLATE_THEME;
    if (!isEdit) {
      setThemeColor(activeTheme);
    }
    applyThemeToDOM(activeTheme);
    if (isDropdownOpen) {
      setTempColor(customPrimaryHex);
    }
  }, [colorTheme, isEdit, isDropdownOpen, customPrimaryHex]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleColorChange = useCallback(
    (theme: { name: string; color: string }) => {
      setThemeColor(theme.color);
    },
    [],
  );

  const handleSaveCustomColor = useCallback(() => {
    const hsl = hexToHSL(tempColor);
    const hslString = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
    setThemeColor(hslString);
    setIsDropdownOpen(false);
  }, [tempColor]);

  const handleThemeSelect = useCallback(async () => {
    if (loading) return;

    const dataModal = {
      preferences: {
        default_llm: configData?.preferences?.default_llm || "",
        fast_llm: configData?.preferences?.fast_llm || "",
        default_email: configData?.preferences?.default_email || "",
        theme: themeColor,
        platform_alert_recipients:
          configData?.preferences?.platform_alert_recipients,
      },
    };

    try {
      setLoading(true);
      const result = await axiosAuth.post(url.POST_CONFIGURATION, dataModal);

      if (result?.status === 200) {
        successMessageHandler("Theme updated successfully");
        getConfigurationData();
        dispatch(setColorTheme(themeColor));
        setIsEdit(false);
        applyThemeToDOM(themeColor);
      }
    } catch (error) {
      errorMessageHandler(error);
    } finally {
      setLoading(false);
      setOpenConfirmation(false);
    }
  }, [
    loading,
    configData,
    themeColor,
    axiosAuth,
    getConfigurationData,
    dispatch,
  ]);

  return (
    <>
      <div className="flex justify-center pb-4">
        <Card className="w-160 p-0 gap-0">
          <CardHeader className="px-4 py-4!">
            <CardTitle className="flex flex-row justify-between items-start w-full">
              <ThemeHeader
                themeColor={themeColor}
                isEdit={isEdit}
                setIsEdit={setIsEdit}
                setOpenConfirmation={setOpenConfirmation}
                isLoading={isLoading}
                loading={loading}
                isOrganizationUpdate={isOrganizationUpdate}
              />
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pb-4">
            <TooltipProvider>
              <div className="flex flex-wrap gap-3 justify-center items-center">
                {!isThemeExist && (
                  <ThemeWatch
                    color={themeColor}
                    label="Custom"
                    selected={true}
                    onClick={() =>
                      handleColorChange({
                        name: "custom",
                        color: themeColor,
                      })
                    }
                  />
                )}

                {colorThemes.map((theme) => (
                  <ThemeWatch
                    key={theme.name}
                    color={theme.color}
                    label={theme.label}
                    selected={themeColor === theme.color}
                    onClick={() => isEdit && handleColorChange(theme)}
                  />
                ))}

                {isEdit && (
                  <CustomColorPickerDropdown
                    tempColor={tempColor}
                    setTempColor={setTempColor}
                    isDropdownOpen={isDropdownOpen}
                    setIsDropdownOpen={setIsDropdownOpen}
                    handleSaveCustomColor={handleSaveCustomColor}
                  />
                )}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={openConfirmation}
        confirm={handleThemeSelect}
        cancel={() => setOpenConfirmation(false)}
        title="Are you sure you want to apply this theme everywhere?"
        description="This action cannot be undone"
      />
    </>
  );
}
