import { InboxFilters } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InboxFiltersState {
  filters: InboxFilters;
}

const initialState: InboxFiltersState = {
  filters: {},
};

const inboxFiltersSlice = createSlice({
  name: "inboxFilters",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<InboxFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { setFilters, clearFilters } = inboxFiltersSlice.actions;
export default inboxFiltersSlice.reducer;
