import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
  searchText: string;
}

const initialState: SearchState = {
  searchText: "",
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
    },
    resetSearchState: () => initialState,
  },
});

export const { setSearchText, resetSearchState } = searchSlice.actions;
export default searchSlice.reducer;
