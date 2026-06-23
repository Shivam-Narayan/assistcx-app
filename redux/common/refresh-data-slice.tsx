import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RefreshEvents = {
  isRefresh: boolean;
};

type InitialState = {
  value: RefreshEvents;
};

const initialState: InitialState = {
  value: {
    isRefresh: false,
  },
};

const refreshDataTriggerEvent = createSlice({
  name: "refreshDataTriggerEvent",
  initialState,
  reducers: {
    handleRefreshDataEvents: (state, action: PayloadAction<boolean>) => {
      return {
        value: {
          isRefresh: action.payload,
        },
      };
    },
  },
});

export const { handleRefreshDataEvents } = refreshDataTriggerEvent.actions;
export default refreshDataTriggerEvent.reducer;
