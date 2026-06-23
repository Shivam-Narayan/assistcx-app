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

const teamMembersEvent = createSlice({
  name: "teamMembersEvent",
  initialState,
  reducers: {
    handleTeamMembersEvents: (state, action: PayloadAction<string>) => {
      return {
        value: {
          userEvent: action.payload,
        },
      };
    },
  },
});

export const { handleTeamMembersEvents } = teamMembersEvent.actions;
export default teamMembersEvent.reducer;
