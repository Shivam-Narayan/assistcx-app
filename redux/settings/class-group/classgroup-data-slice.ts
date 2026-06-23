import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ClassGroupData = {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  intent_uuid?: string;
  class_schema: any;
};

type ClassGroupState = {
  value: ClassGroupData;
};

const initialClassGroupState = {
  value: {
    id: "",
    name: "",
    class_schema: [],
    description: "",
    created_at: "",
    intent_uuid: "",
  } as ClassGroupData,
} as ClassGroupState;

const classGroupDataSlice = createSlice({
  name: "classGroupDataSlice",
  initialState: initialClassGroupState,
  reducers: {
    handleClassGroupData: (state, action: PayloadAction<ClassGroupData>) => {
      return {
        value: action.payload,
      };
    },
  },
});

export const { handleClassGroupData } = classGroupDataSlice.actions;
export default classGroupDataSlice.reducer;
