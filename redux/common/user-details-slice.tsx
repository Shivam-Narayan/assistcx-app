import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type User = {
  email: string;
  first_name: string;
  last_name: string;
  user_id: string;
  password: string | null;
  user_config: object;
  role_id: string;
  data_access: any;
  user_group_ids: any;
  id: string;
  role_key: string;
  user_group_keys: any;
  account_status: string;
  last_login: string;
  created_at: string;
  updated_at: string;
};

type UserData = {
  userData: User;
};

type InitialState = {
  value: UserData;
};

const initialState: InitialState = {
  value: {
    userData: {} as User,
  },
};

const userDetailsSlice = createSlice({
  name: "userDetailsSlice",
  initialState,
  reducers: {
    handleUserDetails: (state, action: PayloadAction<User>) => {
      state.value.userData = action.payload;
    },
  },
});

export const { handleUserDetails } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
