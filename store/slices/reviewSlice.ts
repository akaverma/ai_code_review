import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CurrentReviewState, Language, ReviewResult, ReviewType } from "@/types";

const initialState: CurrentReviewState = {
  code: "",
  language: "javascript",
  reviewType: "full",
  status: "idle",
  streamedText: "",
  parsedResult: null,
  error: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setReviewType(state, action: PayloadAction<ReviewType>) {
      state.reviewType = action.payload;
    },
    /** Called once when a new review request is sent. */
    reviewStarted(state) {
      state.status = "streaming";
      state.streamedText = "";
      state.parsedResult = null;
      state.error = null;
    },
    /** Called for every chunk of text received from the stream. */
    reviewChunkReceived(state, action: PayloadAction<string>) {
      state.streamedText += action.payload;
    },
    /** Called once the stream ends and the final JSON has been parsed. */
    reviewCompleted(state, action: PayloadAction<ReviewResult>) {
      state.status = "complete";
      state.parsedResult = action.payload;
    },
    reviewFailed(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    /** Restores a past review (from history) into the editor. */
    reviewLoaded(
      state,
      action: PayloadAction<{
        code: string;
        language: Language;
        reviewType: ReviewType;
        result: ReviewResult;
      }>
    ) {
      state.code = action.payload.code;
      state.language = action.payload.language;
      state.reviewType = action.payload.reviewType;
      state.status = "complete";
      state.parsedResult = action.payload.result;
      state.streamedText = "";
      state.error = null;
    },
    reviewReset(state) {
      state.status = "idle";
      state.streamedText = "";
      state.parsedResult = null;
      state.error = null;
    },
  },
});

export const {
  setCode,
  setLanguage,
  setReviewType,
  reviewStarted,
  reviewChunkReceived,
  reviewCompleted,
  reviewFailed,
  reviewLoaded,
  reviewReset,
} = reviewSlice.actions;

export default reviewSlice.reducer;
