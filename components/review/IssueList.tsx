"use client";

import { motion } from "framer-motion";
import { IssueCard } from "@/components/review/IssueCard";
import type { ReviewIssue } from "@/types";

const SEVERITY_ORDER: Record<ReviewIssue["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function IssueList({ issues }: { issues: ReviewIssue[] }) {
  if (issues.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        No issues found — nice work!
      </p>
    );
  }

  const sortedIssues = [...issues].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return (
    <div className="flex flex-col gap-3">
      {sortedIssues.map((issue, index) => (
        <motion.div
          key={issue.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05 }}
        >
          <IssueCard issue={issue} />
        </motion.div>
      ))}
    </div>
  );
}
