import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CollectionData } from "./chat-slice"; // or update path if types are elsewhere

interface CollectionState {
  selected: CollectionData[] | null;
}

const initialState: CollectionState = {
  selected: null,
};

export const collectionSlice = createSlice({
  name: "collection",
  initialState,
  reducers: {
    setSelectedCollections: (
      state,
      action: PayloadAction<CollectionData[] | null>
    ) => {
      state.selected = action.payload;
    },
    addCollection: (state, action: PayloadAction<CollectionData>) => {
      if (state.selected === null) {
        state.selected = [action.payload];
      } else if (!state.selected.find((c) => c.id === action.payload.id)) {
        state.selected.push(action.payload);
      }
    },
    removeCollection: (state, action: PayloadAction<string>) => {
      if (state.selected !== null)
        state.selected = state.selected.filter((c) => c.id !== action.payload);
    },
    clearCollections: (state) => {
      state.selected = null;
    },
  },
});

export const {
  setSelectedCollections,
  addCollection,
  removeCollection,
  clearCollections,
} = collectionSlice.actions;

export default collectionSlice.reducer;
