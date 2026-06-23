import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CollectionData } from "../chat/chat-slice"; // or update path if types are elsewhere

interface CollectionState {
  selected: CollectionData[] | null;
}

const initialState: CollectionState = {
  selected: null,
};

export const taskCollectionSlice = createSlice({
  name: "task-collection",
  initialState,
  reducers: {
    setTaskSelectedCollections: (
      state,
      action: PayloadAction<CollectionData[] | null>
    ) => {
      state.selected = action.payload;
    },
    addTaskCollection: (state, action: PayloadAction<CollectionData>) => {
      if (state.selected === null) {
        state.selected = [action.payload];
      } else if (!state.selected.find((c) => c.id === action.payload.id)) {
        state.selected.push(action.payload);
      }
    },
    removeTaskCollection: (state, action: PayloadAction<string>) => {
      if (state.selected !== null) {
        state.selected = state.selected.filter((c) => c.id !== action.payload);
      }
    },
    clearTaskCollections: (state) => {
      state.selected = null;
    },
  },
});

export const {
  setTaskSelectedCollections,
  addTaskCollection,
  removeTaskCollection,
  clearTaskCollections,
} = taskCollectionSlice.actions;

export default taskCollectionSlice.reducer;
