import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RolePermissionsPayload = {
  modules: Record<string, { level: string }>;
};

type RolesData = {
  id?: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  role_type?: string;
  role_permissions?: RolePermissionsPayload;
  default_role: boolean;
};
type RolesState = {
  value: RolesData;
};

const initialState = {
  value: {
    id: "",
    name: "",
    description: "",
    created_at: "",
    updated_at: "",
    role_type: "",
    role_permissions: { modules: {} },
    default_role: false,
  } as RolesData,
} as RolesState;

const rolesDataSlice = createSlice({
  name: "rolesDataSlice",
  initialState: initialState,
  reducers: {
    handleRolesData: (state, action: PayloadAction<RolesData>) => {
      return {
        value: action.payload,
      };
    },
  },
});

export const { handleRolesData } = rolesDataSlice.actions;
export default rolesDataSlice.reducer;
