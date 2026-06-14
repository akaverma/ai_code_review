"use client";

import { History, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { LanguageSelector } from "@/components/editor/LanguageSelector";
import { Select } from "@/components/ui/select";
import { SplitPane } from "@/components/layout/SplitPane";
import { Sidebar } from "@/components/layout/Sidebar";
import { ReviewPanel } from "@/components/review/ReviewPanel";
import { REVIEW_TYPES } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCode, setLanguage, setReviewType } from "@/store/slices/reviewSlice";
import { sidebarToggled } from "@/store/slices/uiSlice";
import { useReview } from "@/hooks/useReview";
import type { Language, ReviewType } from "@/types";

export default function ReviewPage() {
  const dispatch = useAppDispatch();
  const { code, language, reviewType } = useAppSelector((state) => state.review);
  const { status, runReview, cancelReview } = useReview();
  const isStreaming = status === "streaming";

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        <LanguageSelector value={language} onChange={(value) => dispatch(setLanguage(value))} />

        <Select
          aria-label="Review type"
          value={reviewType}
          onChange={(event) => dispatch(setReviewType(event.target.value as ReviewType))}
        >
          {REVIEW_TYPES.map((type) => (
            <option key={type.value} value={type.value} title={type.description}>
              {type.label}
            </option>
          ))}
        </Select>

        <EditorToolbar
          code={code}
          onClear={() => dispatch(setCode(""))}
          onUpload={(uploadedCode, detectedLanguage) => {
            dispatch(setCode(uploadedCode));
            if (detectedLanguage) dispatch(setLanguage(detectedLanguage as Language));
          }}
        />

        <div className="ml-auto flex items-center gap-2">
          {isStreaming ? (
            <Button onClick={cancelReview} variant="destructive" size="sm">
              <Square className="h-3.5 w-3.5" />
              Stop
            </Button>
          ) : (
            <Button onClick={runReview} disabled={!code.trim()} size="sm">
              <Play className="h-3.5 w-3.5" />
              Review Code
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => dispatch(sidebarToggled())}>
            <History className="h-3.5 w-3.5" />
            History
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-3">
        <SplitPane
          left={
            <CodeEditor
              value={code}
              language={language}
              onChange={(value) => dispatch(setCode(value))}
            />
          }
          right={
            <Card className="h-full overflow-y-auto scrollbar-thin">
              <ReviewPanel />
            </Card>
          }
        />
      </div>

      <Sidebar />
    </div>
  );
}
