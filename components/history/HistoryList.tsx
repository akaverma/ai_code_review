"use client";

import { Button } from "@/components/ui/button";
import { HistoryItem } from "@/components/history/HistoryItem";
import { useHistory } from "@/hooks/useHistory";

interface HistoryListProps {
  /** Called after a past review is loaded — used to e.g. navigate to /review. */
  onSelect?: () => void;
}

export function HistoryList({ onSelect }: HistoryListProps) {
  const { reviews, loadReview, removeReview, clearHistory } = useHistory();

  if (reviews.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        No reviews yet. Run a review to see it appear here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {reviews.length} saved review{reviews.length === 1 ? "" : "s"}
        </p>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          Clear history
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {reviews.map((item) => (
          <HistoryItem
            key={item.id}
            item={item}
            onRemove={removeReview}
            onSelect={(selected) => {
              loadReview(selected);
              onSelect?.();
            }}
          />
        ))}
      </div>
    </div>
  );
}
