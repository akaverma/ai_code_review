"use client";

import { Select } from "@/components/ui/select";
import { LANGUAGES } from "@/lib/constants";
import type { Language } from "@/types";

interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <Select
      aria-label="Select language"
      value={value}
      onChange={(event) => onChange(event.target.value as Language)}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </Select>
  );
}
