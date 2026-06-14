"use client";

import { motion } from "framer-motion";
import { AlertCircle, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssueList } from "@/components/review/IssueList";
import { ReviewSkeleton } from "@/components/review/ReviewSkeleton";
import { StreamingText } from "@/components/review/StreamingText";
import { SummaryCard } from "@/components/review/SummaryCard";
import { useReview } from "@/hooks/useReview";

export function ReviewPanel() {
  const { status, streamedText, parsedResult, error, runReview } = useReview();

  if (status === "idle") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
        <Sparkles className="h-8 w-8" />
        <p className="text-sm">
          Paste your code on the left and click <strong>Review Code</strong> to get started.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium">Review failed</p>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        <Button onClick={runReview} variant="outline" size="sm">
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (status === "streaming") {
    return (
      <div className="flex flex-col gap-4 p-4">
        <StreamingText text={streamedText} />
        <ReviewSkeleton />
      </div>
    );
  }

  // status === "complete"
  if (!parsedResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 p-4"
    >
      <SummaryCard
        summary={parsedResult.summary}
        score={parsedResult.score}
        positives={parsedResult.positives}
      />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
          Issues ({parsedResult.issues.length})
        </h3>
        <IssueList issues={parsedResult.issues} />
      </div>

      {parsedResult.refactoredSnippet && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Suggested Refactor</h3>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
            <code>{parsedResult.refactoredSnippet}</code>
          </pre>
        </div>
      )}
    </motion.div>
  );
}
