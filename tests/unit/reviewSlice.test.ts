import reviewReducer, {
  reviewChunkReceived,
  reviewCompleted,
  reviewFailed,
  reviewLoaded,
  reviewReset,
  reviewStarted,
  setCode,
  setLanguage,
  setReviewType,
} from "@/store/slices/reviewSlice";
import type { CurrentReviewState, ReviewResult } from "@/types";

const initialState: CurrentReviewState = {
  code: "",
  language: "javascript",
  reviewType: "full",
  status: "idle",
  streamedText: "",
  parsedResult: null,
  error: null,
};

const sampleResult: ReviewResult = {
  summary: "Looks mostly fine.",
  score: 80,
  issues: [],
  positives: ["Good naming"],
  refactoredSnippet: null,
};

describe("reviewSlice", () => {
  it("returns the initial state", () => {
    expect(reviewReducer(undefined, { type: "@@init" })).toEqual(initialState);
  });

  it("setCode updates the code", () => {
    const state = reviewReducer(initialState, setCode("const x = 1;"));
    expect(state.code).toBe("const x = 1;");
  });

  it("setLanguage updates the language", () => {
    const state = reviewReducer(initialState, setLanguage("python"));
    expect(state.language).toBe("python");
  });

  it("setReviewType updates the review type", () => {
    const state = reviewReducer(initialState, setReviewType("security"));
    expect(state.reviewType).toBe("security");
  });

  it("reviewStarted resets streaming state and sets status to streaming", () => {
    const dirtyState: CurrentReviewState = {
      ...initialState,
      streamedText: "old text",
      parsedResult: sampleResult,
      error: "old error",
    };
    const state = reviewReducer(dirtyState, reviewStarted());
    expect(state.status).toBe("streaming");
    expect(state.streamedText).toBe("");
    expect(state.parsedResult).toBeNull();
    expect(state.error).toBeNull();
  });

  it("reviewChunkReceived appends to streamedText", () => {
    let state = reviewReducer(initialState, reviewChunkReceived("Hello "));
    state = reviewReducer(state, reviewChunkReceived("world"));
    expect(state.streamedText).toBe("Hello world");
  });

  it("reviewCompleted sets status to complete and stores the parsed result", () => {
    const state = reviewReducer(
      { ...initialState, status: "streaming" },
      reviewCompleted(sampleResult)
    );
    expect(state.status).toBe("complete");
    expect(state.parsedResult).toEqual(sampleResult);
  });

  it("reviewFailed sets status to error and stores the message", () => {
    const state = reviewReducer(
      { ...initialState, status: "streaming" },
      reviewFailed("Network error")
    );
    expect(state.status).toBe("error");
    expect(state.error).toBe("Network error");
  });

  it("reviewLoaded restores a past review into the current state", () => {
    const state = reviewReducer(
      initialState,
      reviewLoaded({
        code: "print('hi')",
        language: "python",
        reviewType: "quick",
        result: sampleResult,
      })
    );
    expect(state.code).toBe("print('hi')");
    expect(state.language).toBe("python");
    expect(state.reviewType).toBe("quick");
    expect(state.status).toBe("complete");
    expect(state.parsedResult).toEqual(sampleResult);
  });

  it("reviewReset clears streaming state back to idle", () => {
    const completedState: CurrentReviewState = {
      ...initialState,
      status: "complete",
      streamedText: "some text",
      parsedResult: sampleResult,
    };
    const state = reviewReducer(completedState, reviewReset());
    expect(state.status).toBe("idle");
    expect(state.streamedText).toBe("");
    expect(state.parsedResult).toBeNull();
    expect(state.error).toBeNull();
  });
});
