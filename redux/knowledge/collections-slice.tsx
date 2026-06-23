import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CollectionItem } from "@/types/types";

interface UploadFile {
  name: string;
  status: string;
}
interface CollectionsState {
  searchText: string;
  collectionList: CollectionItem[];
  uploadFileList: UploadFile[]; // Adjust type as needed
  deleteButtonVisible: boolean;
  selectedFiles: string[];
}

const initialState: CollectionsState = {
  searchText: "",
  collectionList: [],
  uploadFileList: [],
  deleteButtonVisible: false,
  selectedFiles: [],
};

const collectionsSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    setSearchFileText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
    },
    resetSearchFileState(state) {
      state.searchText = "";
    },
    setCollectionList(state, action: PayloadAction<CollectionItem[]>) {
      state.collectionList = action.payload;
    },
    setUploadFileList(state, action: PayloadAction<any[]>) {
      state.uploadFileList = action.payload.map((file) => ({
        name: file.name,
        status: "", // or 'pending'
      }));
    },

    removeFileFromRedux(state, action: PayloadAction<string>) {
      state.uploadFileList = state.uploadFileList.filter(
        (file) => file.name !== action.payload
      );
    },

    emptyUploadFileList(state) {
      state.uploadFileList = [];
    },

    setDeleteButtonVisibility(state, action: PayloadAction<boolean>) {
      state.deleteButtonVisible = action.payload;
    },

    setSelectedFiles(state, action: PayloadAction<string[]>) {
      state.selectedFiles = action.payload;
      state.deleteButtonVisible = action.payload.length > 0;
    },
    clearSelectedFiles(state) {
      state.selectedFiles = [];
      state.deleteButtonVisible = false;
    },
  },
});

export const {
  setSearchFileText,
  resetSearchFileState,
  setCollectionList,
  setUploadFileList,
  removeFileFromRedux,
  emptyUploadFileList,
  setDeleteButtonVisibility,
  setSelectedFiles,
  clearSelectedFiles,
} = collectionsSlice.actions;

export default collectionsSlice.reducer;
