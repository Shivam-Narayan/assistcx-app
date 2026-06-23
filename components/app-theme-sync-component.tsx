"use client";

import { hexToHSL } from "@/helper/helper-function";
import { colorThemes } from "@/helper/theme-helper";
import { useSyncConfigurationTheme } from "@/lib/hook/useSyncConfigurationTheme";
import { setColorTheme } from "@/redux/app-theme/theme-slice";
import { RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export function ThemeSync() {
  const dispatch = useDispatch();
  const { colorTheme } = useSelector((state: RootState) => state.themeSlice);
  useSyncConfigurationTheme();

  useEffect(() => {
    const slate = colorThemes.find((t) => t.name === "slate")!;
    const hsl = hexToHSL(slate.color);
    const hslString =
      typeof hsl === "string" ? hsl : `${hsl.h} ${hsl.s}% ${hsl.l}%`;
    const savedColorTheme =
      localStorage.getItem("app-color-theme") || `${hslString}`;
    dispatch(setColorTheme(savedColorTheme));
  }, [dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-color-theme", colorTheme);
    colorTheme && localStorage.setItem("app-color-theme", colorTheme);

    if (colorTheme) {
      root.style.setProperty("--primary", colorTheme);
      let foreground: string;
      if (colorTheme === colorThemes[0].color) {
        foreground = "210 40% 98%";
        return;
      } else {
        foreground = "0 0% 100%";
      }
      root.style.setProperty("--primary-foreground", foreground);
    }
  }, [colorTheme]);

  return null;
}
