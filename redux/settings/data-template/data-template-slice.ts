import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DataTemplate = {
  id: string;
  name?: string;
  template_class: string;
  description?: string;
  document_instructions?: string[];
  data_schema: [];
};
type DataTemplateState = {
  value: DataTemplate;
};

const initialDataTemplateState = {
  value: {
    id: "",
    name: "",
    template_class: "",
    document_instructions: [],
    description: "",
    data_schema: [],
  } as DataTemplate,
} as DataTemplateState;

const DataTemplateSlice = createSlice({
  name: "DataTemplateSlice",
  initialState: initialDataTemplateState,
  reducers: {
    handleDataTemplate: (state, action: PayloadAction<DataTemplate>) => {
      return {
        value: action.payload,
      };
    },
  },
});

export const { handleDataTemplate } = DataTemplateSlice.actions;
export default DataTemplateSlice.reducer;
