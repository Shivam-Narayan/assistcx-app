import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AttachmentData } from "./chat-slice"; // or update path if types are elsewhere

interface AttachmentCollectionState {
  selected: AttachmentData[] | null;
}

const initialState: AttachmentCollectionState = {
  selected: null,
};

export const attachmentSlice = createSlice({
  name: "attachment-collection",
  initialState,
  reducers: {
    setSelectedAttchmentCollections: (
      state,
      action: PayloadAction<AttachmentData[] | null>
    ) => {
      state.selected = action.payload;
    },
    addAttchmentCollection: (state, action: PayloadAction<AttachmentData>) => {
      if (state.selected === null) {
        state.selected = [action.payload];
      } else if (!state.selected.find((c) => c.id === action.payload.id)) {
        state.selected.push(action.payload);
      }
    },
    removeAttchmentCollection: (state, action: PayloadAction<string>) => {
      if (state.selected !== null)
        state.selected = state.selected.filter((c) => c.id !== action.payload);
    },
    clearAttchmentCollections: (state) => {
      state.selected = null;
    },
  },
});

export const {
  setSelectedAttchmentCollections,
  addAttchmentCollection,
  removeAttchmentCollection,
  clearAttchmentCollections,
} = attachmentSlice.actions;

export default attachmentSlice.reducer;
