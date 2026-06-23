import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TeamMembers = {
  id: string;
  first_name?: string;
  last_name: string;
  email?: string;
  created_at?: string;
  account_status: string;
  last_login: string;
  password?: string;
  role_id: string;
  data_access?: any;
  user_group_ids?: any;
  user_group_keys?: any;
};
type TeamMembersState = {
  value: TeamMembers;
};

const initialTeamMembersState = {
  value: {
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    created_at: "",
    account_status: "",
    last_login: "",
    password: "",
    role_id: "",
    user_group_ids: [],
    user_group_keys: [],
    data_access: null,
  } as TeamMembers,
} as TeamMembersState;

const TeamMemberSlice = createSlice({
  name: "TeamMemberSlice",
  initialState: initialTeamMembersState,
  reducers: {
    handleTeamMembersData: (state, action: PayloadAction<TeamMembers>) => {
      return {
        value: action.payload,
      };
    },
  },
});

export const { handleTeamMembersData } = TeamMemberSlice.actions;
export default TeamMemberSlice.reducer;
