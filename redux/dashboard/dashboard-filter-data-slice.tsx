import { DashboardFilters } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardFiltersState {
  filters: DashboardFilters;
}

const initialState: DashboardFiltersState = {
  filters: {},
};

const dashboardFiltersSlice = createSlice({
  name: "DashboardFilters",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<DashboardFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { setFilters, clearFilters } = dashboardFiltersSlice.actions;
export default dashboardFiltersSlice.reducer;
