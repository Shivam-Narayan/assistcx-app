import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserEvents = {
  userEvent: string;
};
type InitialState = {
  value: UserEvents;
};

const initialState = {
  value: {
    userEvent: "",
  } as UserEvents,
} as InitialState;

const classGroupEvent = createSlice({
  name: "classGroupEvent",
  initialState,
  reducers: {
    handleClassGroupEvents: (state, action: PayloadAction<string>) => {
      return {
        value: {
          userEvent: action.payload,
        },
      };
    },
  },
});

export const { handleClassGroupEvents } = classGroupEvent.actions;
export default classGroupEvent.reducer;
