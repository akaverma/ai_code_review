import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ReviewHistoryItem } from "@/types";
import { MAX_HISTORY_ITEMS } from "@/lib/constants";

interface HistoryState {
  reviews: ReviewHistoryItem[];
  selectedId: string | null;
}

const initialState: HistoryState = {
  reviews: [],
  selectedId: null,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    /** Adds a completed review to the front of history, capping the list size. */
    historyItemAdded(state, action: PayloadAction<ReviewHistoryItem>) {
      state.reviews.unshift(action.payload);
      if (state.reviews.length > MAX_HISTORY_ITEMS) {
        state.reviews.length = MAX_HISTORY_ITEMS;
      }
    },
    historyItemSelected(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    historyItemRemoved(state, action: PayloadAction<string>) {
      state.reviews = state.reviews.filter((review) => review.id !== action.payload);
      if (state.selectedId === action.payload) {
        state.selectedId = null;
      }
    },
    historyCleared(state) {
      state.reviews = [];
      state.selectedId = null;
    },
  },
});

export const { historyItemAdded, historyItemSelected, historyItemRemoved, historyCleared } =
  historySlice.actions;

export default historySlice.reducer;
