"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Language } from "@/types";
import { LANGUAGES } from "@/lib/constants";
import { useAppSelector } from "@/store/hooks";

// Monaco depends on `window`, so it must never be rendered during SSR.
const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  language: Language;
  onChange: (value: string) => void;
}

/** Maps our app's `Language` type to the language id Monaco expects. */
function toMonacoLanguage(language: Language): string {
  return LANGUAGES.find((entry) => entry.value === language)?.monacoId ?? "plaintext";
}

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  const theme = useAppSelector((state) => state.ui.theme);
  const monacoLanguage = useMemo(() => toMonacoLanguage(language), [language]);

  return (
    <div className="h-full w-full overflow-hidden rounded-md border">
      <MonacoEditor
        height="100%"
        language={monacoLanguage}
        value={value}
        theme={theme === "dark" ? "vs-dark" : "light"}
        onChange={(newValue) => onChange(newValue ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          automaticLayout: true,
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
