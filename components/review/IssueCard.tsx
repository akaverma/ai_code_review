"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/review/SeverityBadge";
import { CATEGORY_LABELS, SEVERITY_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ReviewIssue } from "@/types";

export function IssueCard({ issue }: { issue: ReviewIssue }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopySuggestion(event: React.MouseEvent) {
    event.stopPropagation();
    await navigator.clipboard.writeText(issue.suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card
      className={cn(
        "border-l-4 transition-shadow hover:shadow-md",
        SEVERITY_CONFIG[issue.severity].borderClass
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <Badge variant="outline">{CATEGORY_LABELS[issue.category]}</Badge>
            {issue.line !== null && (
              <span className="text-xs text-muted-foreground">Line {issue.line}</span>
            )}
          </div>
          <p className="text-sm font-medium leading-snug">{issue.title}</p>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4 text-sm">
              <p className="text-muted-foreground">{issue.description}</p>

              {issue.codeSnippet && (
                <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                  <code>{issue.codeSnippet}</code>
                </pre>
              )}

              {issue.suggestion && (
                <div className="rounded-md border bg-muted/50 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Suggested fix
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySuggestion}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p>{issue.suggestion}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
