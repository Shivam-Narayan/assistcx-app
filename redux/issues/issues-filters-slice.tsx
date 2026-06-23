import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AppliedFilters {
  tags?: string[];
  user?: string[];
  date_range?: {
    from: string;
    to: string;
  };
}

interface IssuesFiltersState {
  appliedFilters: AppliedFilters;
}

const initialState: IssuesFiltersState = {
  appliedFilters: {},
};

const issuesFiltersSlice = createSlice({
  name: "issuesFilters",
  initialState,
  reducers: {
    setAppliedFilters(state, action: PayloadAction<AppliedFilters>) {
      state.appliedFilters = action.payload;
    },

    clearAppliedFilters(state) {
      state.appliedFilters = {};
    },
  },
});

export const { setAppliedFilters, clearAppliedFilters } =
  issuesFiltersSlice.actions;

export default issuesFiltersSlice.reducer;
