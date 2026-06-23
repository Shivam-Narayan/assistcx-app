import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserData = {
  userData: object;
};

type InitialState = {
  value: UserData;
};

const initialState: InitialState = {
  value: {
    userData: {},
  },
};

const userDetailsSlice = createSlice({
  name: "userDetailsSlice",
  initialState,
  reducers: {
    handleUserDetails: (state, action: PayloadAction<object>) => {
      return {
        value: {
          userData: action.payload,
        },
      };
    },
  },
});

export const { handleUserDetails } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
