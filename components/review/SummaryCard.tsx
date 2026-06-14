"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SCORE_THRESHOLDS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const RADIUS = 40;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColorClass(score: number): string {
  if (score >= SCORE_THRESHOLDS.good) return "stroke-success text-success";
  if (score >= SCORE_THRESHOLDS.fair) return "stroke-warning text-warning";
  return "stroke-destructive text-destructive";
}

interface SummaryCardProps {
  summary: string;
  score: number;
  positives: string[];
}

export function SummaryCard({ summary, score, positives }: SummaryCardProps) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const colorClass = scoreColorClass(score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Assessment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE_WIDTH}
              className="stroke-muted"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              className={colorClass}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", colorClass)}>{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <p className="text-sm leading-relaxed">{summary}</p>
          {positives.length > 0 && (
            <ul className="space-y-1">
              {positives.map((positive, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-success">
                  <span aria-hidden className="mt-0.5">
                    ✓
                  </span>
                  <span className="text-foreground">{positive}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
