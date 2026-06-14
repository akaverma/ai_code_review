"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const MIN_PERCENT = 30;
const MAX_PERCENT = 70;
const DESKTOP_QUERY = "(min-width: 1024px)";

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
}

/**
 * A two-pane layout. On large screens it's a horizontal split with a
 * draggable divider; on small screens the panes stack vertically.
 *
 * Renders each pane exactly once (rather than once per breakpoint) so
 * components like Monaco only ever mount a single instance.
 */
export function SplitPane({ left, right }: SplitPaneProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    setLeftWidth(Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, percent)));
  }, []);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback(() => {
    draggingRef.current = true;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove, handlePointerUp]);

  return (
    <div ref={containerRef} className="flex flex-1 flex-col gap-4 lg:h-full lg:flex-row lg:gap-0">
      <div
        className="min-h-[50vh] lg:h-full lg:min-h-0"
        style={isDesktop ? { width: `${leftWidth}%` } : undefined}
      >
        {left}
      </div>

      {isDesktop && (
        <button
          type="button"
          aria-label="Resize panes"
          onPointerDown={handlePointerDown}
          className="w-1.5 shrink-0 cursor-col-resize self-stretch bg-border transition-colors hover:bg-primary/50"
        />
      )}

      <div
        className="min-h-[50vh] lg:h-full lg:min-h-0 lg:flex-1"
        style={isDesktop ? { width: `${100 - leftWidth}%` } : undefined}
      >
        {right}
      </div>
    </div>
  );
}
