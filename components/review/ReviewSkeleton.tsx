import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

/** Placeholder cards shown while the review is streaming in. */
export function ReviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <Pulse className="h-28 w-28 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-5/6" />
            <Pulse className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      {[0, 1, 2].map((index) => (
        <div key={index} className="space-y-2 rounded-lg border p-4">
          <div className="flex gap-2">
            <Pulse className="h-5 w-20" />
            <Pulse className="h-5 w-24" />
          </div>
          <Pulse className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
