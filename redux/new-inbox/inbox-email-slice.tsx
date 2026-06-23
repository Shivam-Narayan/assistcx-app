import { IEmailData } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InboxEmailState {
  emails: IEmailData[];
  selectedEmailId: string | null;
  currentPage: number;
  hasMore: boolean;
  totalEmails: number | null;
  isLoading: boolean;
  isRetry?: boolean;
}

const initialState: InboxEmailState = {
  emails: [],
  selectedEmailId: null,
  currentPage: 1,
  hasMore: true,
  totalEmails: null,
  isLoading: false,
  isRetry: false,
};

const inboxEmailSlice = createSlice({
  name: "inboxEmail",
  initialState,
  reducers: {
    setEmails: (state, action: PayloadAction<IEmailData[]>) => {
      // Merge new emails with existing ones, avoiding duplicates
      const merged = [...state.emails, ...action.payload];
      // Create a map to deduplicate emails
      const emailMap = new Map(merged.map((email) => [email.id, email]));
      // Convert back to array and sort by received_at in descending order
      state.emails = Array.from(emailMap.values()).sort(
        (a, b) =>
          new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
      );
    },
    // action for polling
    replaceEmails: (state, action: PayloadAction<IEmailData[]>) => {
      state.emails = action.payload;
    },
    replaceEmailById: (
      state,
      action: PayloadAction<{ id: string; updatedEmail: IEmailData }>
    ) => {
      const { id, updatedEmail } = action.payload;
      const index = state.emails.findIndex((email) => email.id === id);
      if (index !== -1) {
        // Replace existing email with updated data
        state.emails[index] = updatedEmail;
      }
    },
    setSelectedEmailId: (state, action: PayloadAction<string | null>) => {
      state.selectedEmailId = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setTotalEmails: (state, action: PayloadAction<number | null>) => {
      state.totalEmails = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsRetry: (state, action: PayloadAction<boolean>) => {
      state.isRetry = action.payload;
    },

    resetEmailState: (state) => {
      state.emails = [];
      state.selectedEmailId = null;
      state.currentPage = 1;
      state.hasMore = true;
      state.totalEmails = null;
      state.isLoading = false;
    },
  },
});

export const {
  setEmails,
  replaceEmails,
  replaceEmailById,
  setSelectedEmailId,
  setCurrentPage,
  setHasMore,
  setTotalEmails,
  setIsLoading,
  resetEmailState,
  setIsRetry,
} = inboxEmailSlice.actions;

export default inboxEmailSlice.reducer;
