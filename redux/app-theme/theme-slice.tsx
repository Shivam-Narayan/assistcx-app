import { colorThemes } from "@/helper/theme-helper";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ColorTheme = string;

interface ThemeState {
  colorTheme: string;
}

const loadFromLocalStorage = (): ThemeState => {
  if (typeof window === "undefined") {
    return { colorTheme: colorThemes[0].color };
  }

  try {
    const savedColorTheme = localStorage.getItem(
      "app-color-theme"
    ) as ColorTheme;

    return {
      colorTheme: savedColorTheme || colorThemes[0].color,
    };
  } catch {
    return { colorTheme: colorThemes[0].color };
  }
};

const initialState: ThemeState = loadFromLocalStorage();

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setColorTheme: (state, action: PayloadAction<ColorTheme>) => {
      state.colorTheme = action.payload;
      localStorage.setItem("app-color-theme", action.payload);
    },
  },
});

export const { setColorTheme } = themeSlice.actions;

export default themeSlice.reducer;
