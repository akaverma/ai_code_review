"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES, SCORE_THRESHOLDS } from "@/lib/constants";
import { cn, formatDate, truncate } from "@/lib/utils";
import type { ReviewHistoryItem } from "@/types";

function scoreBadgeVariant(score: number): "success" | "warning" | "critical" {
  if (score >= SCORE_THRESHOLDS.good) return "success";
  if (score >= SCORE_THRESHOLDS.fair) return "warning";
  return "critical";
}

interface HistoryItemProps {
  item: ReviewHistoryItem;
  onSelect: (item: ReviewHistoryItem) => void;
  onRemove: (id: string) => void;
}

export function HistoryItem({ item, onSelect, onRemove }: HistoryItemProps) {
  const languageLabel =
    LANGUAGES.find((lang) => lang.value === item.language)?.label ?? item.language;
  const firstIssue = item.result.issues[0]?.title;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex w-full flex-col gap-1.5 rounded-md border p-3 text-left transition-colors hover:bg-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{languageLabel}</Badge>
          <Badge variant={scoreBadgeVariant(item.result.score)}>{item.result.score}/100</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
          <span
            role="button"
            aria-label="Remove from history"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(item.id);
            }}
            className={cn(
              "rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            )}
          >
            <X className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
      {firstIssue && <p className="text-sm text-muted-foreground">{truncate(firstIssue, 80)}</p>}
    </button>
  );
}
