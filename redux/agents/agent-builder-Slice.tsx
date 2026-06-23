import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ToolItem {
  label: string;
  value: string;
  description?: string;
}

interface AgentBuilderFormState {
  agentName: string;
  business_usecase: string;
  tools: ToolItem[];
}

const initialState: AgentBuilderFormState = {
  agentName: "",
  business_usecase: "",
  tools: [],
};

const agentBuilderFormSlice = createSlice({
  name: "agentBuilderFormData",
  initialState,
  reducers: {
    setAgentBuilderForm(state, action: PayloadAction<AgentBuilderFormState>) {
      return { ...state, ...action.payload };
    },
    resetAgentBuilderForm() {
      return initialState;
    },
  },
});

export const { setAgentBuilderForm, resetAgentBuilderForm } =
  agentBuilderFormSlice.actions;

export default agentBuilderFormSlice.reducer;
