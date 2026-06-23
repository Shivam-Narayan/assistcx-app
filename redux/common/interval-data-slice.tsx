import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RefreshEvents = {
  intervalSec: string;
};

type InitialState = {
  value: RefreshEvents;
};

const initialState: InitialState = {
  value: {
    intervalSec: "Off",
  },
};

const intervalDataTriggerEvent = createSlice({
  name: "intervalDataTriggerEvent",
  initialState,
  reducers: {
    handleIntervalDataEvents: (state, action: PayloadAction<string>) => {
      return {
        value: {
          intervalSec: action.payload,
        },
      };
    },
  },
});

export const { handleIntervalDataEvents } = intervalDataTriggerEvent.actions;
export default intervalDataTriggerEvent.reducer;
