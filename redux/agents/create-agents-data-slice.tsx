import { normalizeSuccessCriteria } from "@/helper/helper-function";
import { normalizeActions, normalizeTools } from "@/helper/helper-function";
import { createSlice, PayloadAction, combineReducers } from "@reduxjs/toolkit";

/** Agent Basic Information data */
type agentBasicInfoTemplate = {
  name: string;
  goal: string;
  style: string;
  description: string;
  icon: string;
};

type AgentoutputProps = {
  name: string;
  description: string;
  data_type: string;
};
type AgentOutputSliceState = {
  value: AgentoutputProps[];
};
export interface StepData {
  id: number;
  step_name: string;
  action: any;
  expected_outcome: string;
  tool?: any;
  rules: string[] | [];
  condition: string | null;
}

interface AgentPlanningState {
  steps: StepData[];
}

type AgentBasicInfoState = {
  value: agentBasicInfoTemplate;
};

const initialAgentBasicInfoState: AgentBasicInfoState = {
  value: {
    name: "",
    goal: "",
    style: "",
    description: "",
    icon: "",
  },
};

const AgentBasicInfoSlice = createSlice({
  name: "AgentBasicInfoSlice",
  initialState: initialAgentBasicInfoState,
  reducers: {
    handleAgentBasicInfo: (
      state,
      action: PayloadAction<agentBasicInfoTemplate>,
    ) => {
      return {
        value: action.payload,
      };
    },
  },
});
export const { handleAgentBasicInfo } = AgentBasicInfoSlice.actions;

// agent output data

const initialAgentOutputState: AgentOutputSliceState = {
  value: [],
};

const AgentOutputSlice = createSlice({
  name: "AgentOutputSlice",
  initialState: initialAgentOutputState,
  reducers: {
    handleAgentOutputInfo: (
      state,
      action: PayloadAction<AgentoutputProps[]>,
    ) => {
      state.value = action.payload;
    },
  },
});

export const { handleAgentOutputInfo } = AgentOutputSlice.actions;

// agent Planning

const initialAgentPlanningState: AgentPlanningState = {
  steps: [],
};
const AgentPlanningSlice = createSlice({
  name: "AgentPlanningSlice",
  initialState: initialAgentPlanningState,
  reducers: {
    handleAgentPlanningReducer: (state, action: PayloadAction<StepData[]>) => {
      state.steps = action.payload.map((planningStep, index) => ({
        id: index,
        step_name: planningStep.step_name || "",
        action: planningStep.action
          ? normalizeActions(planningStep.action)
          : [],
        expected_outcome: planningStep.expected_outcome || "",
        rules: planningStep.rules || [],
        condition: planningStep.condition || "",
        tool: planningStep.tool ? normalizeTools(planningStep.tool) : [],
      }));
    },
    addStep: (state, action: PayloadAction<StepData>) => {
      state.steps.push(action.payload);
    },
    setSteps: (state, action: PayloadAction<StepData[]>) => {
      state.steps = action.payload;
    },
    updateStep: (
      state,
      action: PayloadAction<{ id: number; data: Partial<StepData> }>,
    ) => {
      const index = state.steps.findIndex((s) => s.id === action.payload.id);
      if (index >= 0) {
        state.steps[index] = { ...state.steps[index], ...action.payload.data };
      }
    },
    removeStep: (state, action: PayloadAction<number>) => {
      state.steps = state.steps.filter((s) => s.id !== action.payload);
    },
    reorderSteps: (
      state,
      action: PayloadAction<{ oldIndex: number; newIndex: number }>,
    ) => {
      const [moved] = state.steps.splice(action.payload.oldIndex, 1);
      state.steps.splice(action.payload.newIndex, 0, moved);
    },
    resetSteps: (state) => {
      state.steps = [];
    },
  },
});

export const {
  handleAgentPlanningReducer,
  setSteps,
  addStep,
  updateStep,
  removeStep,
  reorderSteps,
  resetSteps,
} = AgentPlanningSlice.actions;

/** Agent Rules data */
type agentRuleInterface = {
  id: number;
  rule: string;
};

export type agentRulesTemplate = {
  instructions: string;
  success_criteria: any;
  rules: agentRuleInterface[];
};
type AgentRulesState = {
  value: agentRulesTemplate;
};

const initialAgentRulesState: AgentRulesState = {
  value: {
    instructions: "",
    success_criteria: [],
    rules: [],
  },
};

const AgentRulesSlice = createSlice({
  name: "AgentRulesSlice",
  initialState: initialAgentRulesState,
  reducers: {
    handleAgentRules: (state, action: PayloadAction<agentRulesTemplate>) => {
      state.value = {
        ...action.payload,
        success_criteria: normalizeSuccessCriteria(
          action.payload.success_criteria,
          "response",
        ),
      };
    },
  },
});
export const { handleAgentRules } = AgentRulesSlice.actions;

/** Agent Tools data */
type toolsSelectionTemplate = {
  name: string;
  action: string;
  function: string;
  description: string;
  selection: boolean;
  api_type: string;
  icon: string;
  id: string;
};
type AgentTemplateState = {
  value: toolsSelectionTemplate[];
};

const initialToolsSelectionState: AgentTemplateState = {
  value: [],
};

const ToolsSelectionSlice = createSlice({
  name: "ToolsSelectionSlice",
  initialState: initialToolsSelectionState,
  reducers: {
    handleToolsSelection: (
      state,
      action: PayloadAction<toolsSelectionTemplate[]>,
    ) => {
      return {
        value: action.payload,
      };
    },
  },
});
export const { handleToolsSelection } = ToolsSelectionSlice.actions;

/** Agent Data Template */
type AgentDataTemplateState = {
  value: any;
};

const initialAgentDataTemplateState: AgentDataTemplateState = {
  value: {
    data_template: [],
    class_groups: [],
    folder_name: "",
    mailbox: "",
    intent_class: "",
    bucket_name: "",
    mount_path: "",
    storage_type: "",
    assignment_type: "",
    external_task_api: false,
    split_task_by_records: false,
    split_task_by_attachments: false,
    vision_data_extraction: false,
    automate_task_retry: false,
    agent_llm: "",
    allow_task_followup: false,
    allow_human_review: false,
  },
};

const AgentDataTemplateSlice = createSlice({
  name: "AgentDataTemplateSlice",
  initialState: initialAgentDataTemplateState,
  reducers: {
    handleAgentDataTemplate: (state, action: PayloadAction<any>) => {
      return {
        value: action.payload,
      };
    },
  },
});
export const { handleAgentDataTemplate } = AgentDataTemplateSlice.actions;

/** Agent Data Template Enhance */
type agentDataTemplateEnhanced = {
  data_template: any;
  class_groups: any;
  folder_name: string;
  mailbox?: string;
  intent_class?: string;
  bucket_name: string;
  mount_path: string;
  storage_type?: string;
  assignment_type?: string;
  external_task_api?: boolean;
  split_task_by_records: boolean;
  split_task_by_attachments: boolean;
  vision_data_extraction: boolean;
  automate_task_retry: boolean;
  agent_llm?: string;
  allow_task_followup: boolean;
  allow_human_review: boolean;
};
type AgentDataTemplateEnhanceState = {
  value: agentDataTemplateEnhanced;
};

const initialAgentDataTemplateEnhanceState: AgentDataTemplateEnhanceState = {
  value: {
    data_template: [],
    class_groups: [],
    folder_name: "",
    mailbox: "",
    intent_class: "",
    bucket_name: "",
    mount_path: "",
    storage_type: "",
    assignment_type: "",
    external_task_api: false,
    split_task_by_records: false,
    split_task_by_attachments: false,
    vision_data_extraction: false,
    automate_task_retry: false,
    agent_llm: "",
    allow_task_followup: false,
    allow_human_review: false,
  },
};

const AgentDataTemplateEnhanceSlice = createSlice({
  name: "AgentDataTemplateEnhanceSlice",
  initialState: initialAgentDataTemplateEnhanceState,
  reducers: {
    handleAgentDataTemplateEnhance: (
      state,
      action: PayloadAction<agentDataTemplateEnhanced>,
    ) => {
      return {
        value: action.payload,
      };
    },
  },
});
export const { handleAgentDataTemplateEnhance } =
  AgentDataTemplateEnhanceSlice.actions;

/** Agent Settings (Only flags) */
type agentSettings = {
  split_task_by_records: boolean;
  split_task_by_attachments: boolean;
  vision_data_extraction: boolean;
  automate_task_retry: boolean;
  agent_llm?: string;
  allow_task_followup: boolean;
  allow_human_review: boolean;
};
type AgentSettingsState = {
  value: agentSettings;
};

const initialAgentSettingsState: AgentSettingsState = {
  value: {
    split_task_by_records: false,
    split_task_by_attachments: false,
    vision_data_extraction: false,
    automate_task_retry: false,
    agent_llm: "",
    allow_task_followup: false,
    allow_human_review: false,
  },
};

const AgentSettingsSlice = createSlice({
  name: "AgentSettingsSlice",
  initialState: initialAgentSettingsState,
  reducers: {
    handleAgentSettings: (state, action: PayloadAction<agentSettings>) => {
      return {
        value: action.payload,
      };
    },
  },
});
export const { handleAgentSettings } = AgentSettingsSlice.actions;

/** Tools Event */
type UserEvents = {
  userEvent: string;
};
type InitialState = {
  value: UserEvents;
};

const initialState: InitialState = {
  value: {
    userEvent: "",
  },
};

const ToolsEvent = createSlice({
  name: "ToolsEvent",
  initialState,
  reducers: {
    handleToolsEvents: (state, action: PayloadAction<string>) => {
      return {
        value: {
          userEvent: action.payload,
        },
      };
    },
  },
});
export const { handleToolsEvents } = ToolsEvent.actions;

/** Agent Knowledge Selection */
type knowledgeSelectionTemplate = {
  name: string;
  action: string;
  availability: string;
  function: string;
  description: string;
  selection: boolean;
  api_type: string;
  icon: string;
  collection_id: string;
  index_name: string;
};

type AgentKnowledgeState = {
  value: knowledgeSelectionTemplate[];
};

const initialAgentKnowledgeState: AgentKnowledgeState = {
  value: [],
};

const AgentKnowledgeSlice = createSlice({
  name: "AgentKnowledgeSlice",
  initialState: initialAgentKnowledgeState,
  reducers: {
    handleKnowledgeSelection: (
      state,
      action: PayloadAction<knowledgeSelectionTemplate[]>,
    ) => {
      return {
        value: action.payload,
      };
    },
  },
});
export const { handleKnowledgeSelection } = AgentKnowledgeSlice.actions;

/** Root Reducer */
export default combineReducers({
  toolsSelectionReducer: ToolsSelectionSlice.reducer,
  agentBasicInfoReducer: AgentBasicInfoSlice.reducer,
  agentOutputReducer: AgentOutputSlice.reducer,
  agentPlanningReducer: AgentPlanningSlice.reducer,
  agentRulesReducer: AgentRulesSlice.reducer,
  agentDataTemplateReducer: AgentDataTemplateSlice.reducer,
  agentSettingsReducer: AgentSettingsSlice.reducer,
  toolsEventReducer: ToolsEvent.reducer,
  agentKnowledgeReducer: AgentKnowledgeSlice.reducer,
});
