"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IssueList } from "@/components/review/IssueList";
import { SummaryCard } from "@/components/review/SummaryCard";
import { LANGUAGES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { useHistory } from "@/hooks/useHistory";

export default function ReviewResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { loadReview } = useHistory();
  const item = useAppSelector((state) =>
    state.history.reviews.find((review) => review.id === params.id)
  );

  if (!item) {
    return (
      <div className="container max-w-3xl py-8 text-center">
        <p className="text-muted-foreground">
          This review could not be found. It may have been removed from history.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/history")}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to History
        </Button>
      </div>
    );
  }

  const languageLabel =
    LANGUAGES.find((lang) => lang.value === item.language)?.label ?? item.language;

  return (
    <div className="container max-w-3xl space-y-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to History
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{languageLabel}</Badge>
        <span className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</span>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => {
            loadReview(item);
            router.push("/review");
          }}
        >
          <FileCode className="h-3.5 w-3.5" />
          Open in Editor
        </Button>
      </div>

      <SummaryCard
        summary={item.result.summary}
        score={item.result.score}
        positives={item.result.positives}
      />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          Issues ({item.result.issues.length})
        </h2>
        <IssueList issues={item.result.issues} />
      </div>

      {item.result.refactoredSnippet && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Suggested Refactor</h2>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
            <code>{item.result.refactoredSnippet}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
