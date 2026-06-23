import { combineReducers, createSlice, PayloadAction } from "@reduxjs/toolkit";

type ToolsFilterData = {
  id: string;
  label: string;
};
type toolsFilter = {
  filterData: ToolsFilterData[];
};
type ToolsFilterState = {
  value: toolsFilter;
};
const initialToolsFilterState = {
  value: {
    filterData: [],
  } as toolsFilter,
} as ToolsFilterState;

const ToolsFilterSlice = createSlice({
  name: "ToolsFilterSlice",
  initialState: initialToolsFilterState,
  reducers: {
    handleToolsFilters: (state, action: PayloadAction<toolsFilter>) => {
      return {
        value: action.payload,
      };
    },
  },
});
export const { handleToolsFilters } = ToolsFilterSlice.actions;

type FunctionFilterData = {
  id: string;
  label: string;
};
type functionFilter = {
  functionFilterData: FunctionFilterData[];
};
type FunctionFilterState = {
  value: functionFilter;
};
const initialFunctionFilterState = {
  value: {
    functionFilterData: [],
  } as functionFilter,
} as FunctionFilterState;

const FunctionFilterSlice = createSlice({
  name: "FunctionFilterSlice",
  initialState: initialFunctionFilterState,
  reducers: {
    handleFunctionFilters: (state, action: PayloadAction<functionFilter>) => {
      return {
        value: action.payload,
      };
    },
  },
});
export const { handleFunctionFilters } = FunctionFilterSlice.actions;

/** Create/Edit Tools data */
type toolsData = {
  id: string;
  name: string;
  action: string;
  function: string;
  description: string;
  api_type: string;
  method: string;
  endpoint: string;
  content_type: string;
  body_template: string;
  headers: {};
  path_params: {};
  query_params: {};
  auth_config: {
    username?: string;
    password?: string;
    token?: string;
    client_id?: string;
    client_secret?: string;
    token_url?: string;
    scope?: string;
    api_key_name?: string;
    api_key?: string;
    api_key_location?: string;
  };
  icon: string;
  auth_type: string;
  is_default: boolean;
  integration_key?: string;
  custom_fields?: any[] | null;
};
type ToolsDataState = {
  value: toolsData;
};

const initialToolsDataState = {
  value: {
    id: "",
    name: "",
    action: "",
    function: "",
    description: "",
    api_type: "",
    method: "",
    endpoint: "",
    content_type: "",
    body_template: "",
    headers: {},
    path_params: {},
    query_params: {},
    auth_config: {
      username: "",
      password: "",
      token: "",
      client_id: "",
      client_secret: "",
      token_url: "",
      scope: "",
      api_key_name: "",
      api_key: "",
      api_key_location: "",
    },
    icon: "",
    is_default: false,

    auth_type: "",
  } as toolsData,
} as ToolsDataState;

const ToolsDataSlice = createSlice({
  name: "ToolsDataSlice",
  initialState: initialToolsDataState,
  reducers: {
    handleToolsData: (state, action: PayloadAction<toolsData>) => {
      return {
        value: action.payload,
      };
    },
  },
});
export const { handleToolsData } = ToolsDataSlice.actions;
/** End Tools data */

type resetFilterEvents = {
  resetEvent: boolean;
};

type InitialState = {
  value: resetFilterEvents;
};

const initialState: InitialState = {
  value: {
    resetEvent: false,
  },
};

const resetTriggerEvent = createSlice({
  name: "resetTriggerEvent",
  initialState,
  reducers: {
    handleResetFilterEvents: (state, action: PayloadAction<boolean>) => {
      return {
        value: {
          resetEvent: action.payload,
        },
      };
    },
  },
});

export const { handleResetFilterEvents } = resetTriggerEvent.actions;

type toolUpdatedEvent = {
  toolUpdatedEvent: boolean;
};

type ToolUpdatedinitialState = {
  value: toolUpdatedEvent;
};

const toolUpdatedInitialState: ToolUpdatedinitialState = {
  value: {
    toolUpdatedEvent: false,
  },
};

const triggerToolUpdateEvent = createSlice({
  name: "triggerToolUpdateEvent",
  initialState: toolUpdatedInitialState,
  reducers: {
    handleToolUpdateEvents: (state, action: PayloadAction<boolean>) => {
      return {
        value: {
          toolUpdatedEvent: action.payload,
        },
      };
    },
  },
});

export const { handleToolUpdateEvents } = triggerToolUpdateEvent.actions;

export default combineReducers({
  toolsFiltersReducer: ToolsFilterSlice.reducer,
  functionFiltersReducer: FunctionFilterSlice.reducer,
  toolsDataReducer: ToolsDataSlice.reducer,
  resetFilterReducer: resetTriggerEvent.reducer,
  triggerToolUpdateReducer: triggerToolUpdateEvent.reducer,
});
