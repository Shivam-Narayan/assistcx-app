import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_PERMISSIONS, UserPermissions } from "@/lib/permissions";

type InitialState = {
  value: {
    permissionsRole: UserPermissions;
  };
};

const initialState: InitialState = {
  value: {
    permissionsRole: DEFAULT_PERMISSIONS,
  },
};

const permissionsSlice = createSlice({
  name: "permissionsSlice",
  initialState,
  reducers: {
    handlePermissionRole: (
      state,
      action: PayloadAction<UserPermissions>
    ) => {
      state.value.permissionsRole = action.payload;
    },
  },
});

export const { handlePermissionRole } = permissionsSlice.actions;
export default permissionsSlice.reducer;
