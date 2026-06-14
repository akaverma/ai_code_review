"use client";

import { useRouter } from "next/navigation";
import { HistoryList } from "@/components/history/HistoryList";

export default function HistoryPage() {
  const router = useRouter();

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="mb-1 text-2xl font-bold">Review History</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Past reviews are stored locally in your browser. Click any review to reload it in the
        editor.
      </p>
      <HistoryList onSelect={() => router.push("/review")} />
    </div>
  );
}
