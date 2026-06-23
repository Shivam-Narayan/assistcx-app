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

const userGroupEvent = createSlice({
  name: "userGroupEvent",
  initialState,
  reducers: {
    handleUserGroupEvents: (state, action: PayloadAction<string>) => {
      return {
        value: {
          userEvent: action.payload,
        },
      };
    },
  },
});

export const { handleUserGroupEvents } = userGroupEvent.actions;
export default userGroupEvent.reducer;
