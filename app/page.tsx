import Link from "next/link";
import { Code2, History, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Real-time AI review",
    description:
      "Streamed token-by-token from Claude, so feedback appears as it's generated — no waiting on a spinner.",
  },
  {
    icon: ShieldCheck,
    title: "Severity-ranked issues",
    description:
      "Every finding is tagged critical, warning, or info, with a category like security or performance.",
  },
  {
    icon: Zap,
    title: "Multiple review modes",
    description:
      "Run a full review, a focused security audit, a performance check, or a quick top-3 scan.",
  },
  {
    icon: History,
    title: "Persisted history",
    description:
      "Past reviews are saved locally so you can revisit scores and feedback at any time.",
  },
];

export default function HomePage() {
  return (
    <div className="container max-w-5xl py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          AI-Powered Code Review, <span className="text-primary">Streamed Live</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Paste your code, pick a language, and get structured, actionable feedback from Claude —
          complete with severity levels, line numbers, and concrete fixes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/review" className={cn(buttonVariants({ size: "lg" }))}>
            <Code2 className="h-4 w-4" />
            Start a Review
          </Link>
          <Link href="/history" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            View History
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <feature.icon className="h-5 w-5 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
