/**
 * Renders the raw text Claude is streaming back, before it has been
 * parsed into structured issues. Shows a blinking cursor at the end to
 * make the token-by-token arrival feel alive.
 */
export function StreamingText({ text }: { text: string }) {
  return (
    <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-muted p-3 font-mono text-xs leading-relaxed text-muted-foreground scrollbar-thin">
      {text}
      <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-muted-foreground/70 align-middle" />
    </pre>
  );
}
