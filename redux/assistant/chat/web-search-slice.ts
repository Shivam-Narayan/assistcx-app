import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WebSearchState {
  enabled: boolean;
}

const initialState: WebSearchState = {
  enabled: false,
};

const webSearchSlice = createSlice({
  name: "web-search",
  initialState,
  reducers: {
    setWebSearchEnabled(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },
    toggleWebSearch(state) {
      state.enabled = !state.enabled;
    },
    resetWebSearch(state) {
      state.enabled = false;
    },
  },
});

export const { setWebSearchEnabled, toggleWebSearch, resetWebSearch } =
  webSearchSlice.actions;
export default webSearchSlice.reducer;
