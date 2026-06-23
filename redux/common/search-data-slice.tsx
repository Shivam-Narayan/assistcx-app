import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SearchData = {
  searchData: string;
};

type InitialState = {
  value: SearchData;
};

const initialState: InitialState = {
  value: {
    searchData: "",
  },
};

const searchDataSlice = createSlice({
  name: "searchDataSlice",
  initialState,
  reducers: {
    handleSearchData: (state, action: PayloadAction<string>) => {
      return {
        value: {
          searchData: action.payload,
        },
      };
    },
    reset: () => initialState,
  },
});

export const { handleSearchData, reset } = searchDataSlice.actions;
export default searchDataSlice.reducer;
