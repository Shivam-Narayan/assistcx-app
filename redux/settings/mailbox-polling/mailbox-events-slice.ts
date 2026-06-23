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

const mailboxPolling = createSlice({
  name: "mailboxPolling",
  initialState,
  reducers: {
    handleUserEvents: (state, action: PayloadAction<string>) => {
      return {
        value: {
          userEvent: action.payload,
        },
      };
    },
  },
});

export const { handleUserEvents } = mailboxPolling.actions;
export default mailboxPolling.reducer;
