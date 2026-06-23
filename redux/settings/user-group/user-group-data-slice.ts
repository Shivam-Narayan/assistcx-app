import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserGroupData = {
  id?: number | null;
  name?: string;
  description?: string;
  created_at?: string;
  data_access?: any;
};
type UserGroupState = {
  value: UserGroupData;
};

const initialUserGroupState = {
  value: {
    id: undefined,
    name: "",
    description: "",
    created_at: "",
    data_access: {},
  } as UserGroupData,
} as UserGroupState;

const userGroupDataSlice = createSlice({
  name: "userGroupDataSlice",
  initialState: initialUserGroupState,
  reducers: {
    handleUserGroupData: (state, action: PayloadAction<UserGroupData>) => {
      return {
        value: action.payload,
      };
    },
  },
});

export const { handleUserGroupData } = userGroupDataSlice.actions;
export default userGroupDataSlice.reducer;
