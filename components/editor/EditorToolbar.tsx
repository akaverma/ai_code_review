"use client";

import { useRef, useState } from "react";
import { Check, Copy, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXTENSION_LANGUAGE_MAP } from "@/lib/constants";
import type { Language } from "@/types";

interface EditorToolbarProps {
  code: string;
  onClear: () => void;
  onUpload: (code: string, language: Language | null) => void;
}

/** Returns the detected language for a filename, or null if unknown. */
function detectLanguage(filename: string): Language | null {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) return null;
  return EXTENSION_LANGUAGE_MAP[extension] ?? null;
}

export function EditorToolbar({ code, onClear, onUpload }: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    onUpload(text, detectLanguage(file.name));

    // Reset so the same file can be selected again later.
    event.target.value = "";
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.jsx,.ts,.tsx,.py,.go,.java,.css,.mjs,.cjs"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        title="Upload a file"
      >
        <Upload className="h-3.5 w-3.5" />
        Upload
      </Button>
      <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!code} title="Copy code">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear} disabled={!code} title="Clear editor">
        <Trash2 className="h-3.5 w-3.5" />
        Clear
      </Button>
    </div>
  );
}
