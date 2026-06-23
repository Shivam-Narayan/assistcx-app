import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConfigState {
  backendUrl: string;
}

const initialState: ConfigState = {
  backendUrl: '',
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setBackendUrl(state, action: PayloadAction<string>) {
      state.backendUrl = action.payload;
    },
  },
});

export const { setBackendUrl } = configSlice.actions;

export default configSlice.reducer;
