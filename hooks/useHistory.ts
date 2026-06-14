"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { historyCleared, historyItemRemoved } from "@/store/slices/historySlice";
import { reviewLoaded } from "@/store/slices/reviewSlice";
import type { ReviewHistoryItem } from "@/types";

/** Reads persisted review history and provides actions to load/remove/clear it. */
export function useHistory() {
  const dispatch = useAppDispatch();
  const reviews = useAppSelector((state) => state.history.reviews);

  /** Restores a past review into the current editor + review panel. */
  const loadReview = useCallback(
    (item: ReviewHistoryItem) => {
      dispatch(
        reviewLoaded({
          code: item.code,
          language: item.language,
          reviewType: item.reviewType,
          result: item.result,
        })
      );
    },
    [dispatch]
  );

  const removeReview = useCallback(
    (id: string) => {
      dispatch(historyItemRemoved(id));
    },
    [dispatch]
  );

  const clearHistory = useCallback(() => {
    dispatch(historyCleared());
  }, [dispatch]);

  return { reviews, loadReview, removeReview, clearHistory };
}
