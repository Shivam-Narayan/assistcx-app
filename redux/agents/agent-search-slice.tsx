import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  searchText: string;
}

const initialState: SearchState = {
  searchText: "",
};

const searchAgentSlice = createSlice({
  name: "searchAgent",
  initialState,
  reducers: {
    setSearchAgentText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
    },

    resetSearchAgentText: () => initialState,
  },
});

export const { setSearchAgentText, resetSearchAgentText } =
  searchAgentSlice.actions;
export default searchAgentSlice.reducer;
