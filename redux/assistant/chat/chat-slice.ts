import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CollectionData {
  id: string;
  name: string;
  description: string;
  index_name: string;
  icon?: string;
  availability?: string;
}
export interface AttachmentData {
  id: string;
  name: string;
}

interface ChatState {
  input: string;
  mode: string;
  chat_id: string;
}

const initialState: ChatState = {
  input: "",
  mode: "",
  chat_id: "",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatData(
      state,
      action: PayloadAction<{
        input: string;
        // mode: string;
        chat_id: string;
      }>,
    ) {
      state.input = action.payload.input;
      state.chat_id = action.payload.chat_id;
      // state.mode = action.payload.mode;
    },
    resetChatData(state) {
      state.input = "";
      state.mode = "";
      state.chat_id = "";
    },

    resetMode(state) {
      state.mode = "";
    },
    setMode(state, action: PayloadAction<string>) {
      state.mode = action.payload;
    },
  },
});

export const { setChatData, resetChatData, setMode, resetMode } =
  chatSlice.actions;
export default chatSlice.reducer;
