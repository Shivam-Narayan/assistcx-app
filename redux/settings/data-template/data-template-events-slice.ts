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

const dataTemplateEvent = createSlice({
  name: "dataTemplateEvent",
  initialState,
  reducers: {
    handleDataTemplateEvents: (state, action: PayloadAction<string>) => {
      return {
        value: {
          userEvent: action.payload,
        },
      };
    },
  },
});

export const { handleDataTemplateEvents } = dataTemplateEvent.actions;
export default dataTemplateEvent.reducer;
