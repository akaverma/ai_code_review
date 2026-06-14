# CLAUDE.md

This file is a build log and reference for the **AI-Powered Code Review Dashboard**.
It documents every file/folder that was created, modified, or deleted while building
this project, why each piece exists, and the architectural decisions that shape it.
Keep this file up to date whenever the project structure changes.

---

## 1. Project Overview

A Next.js 14 (App Router) dashboard where a user pastes or uploads source code,
picks a language and a review type, and gets a streamed, AI-generated code review
from Gemini (`gemini-1.5-flash`). Results are parsed into a structured JSON shape
(summary, score, issues, positives, refactored snippet) and rendered as an
interactive UI: a score ring, severity-coded issue cards, and a history sidebar
backed by `redux-persist`/`localStorage`.

## 2. Tech Stack

- **Framework**: Next.js 14.2.35 (App Router, Node runtime for the API route)
- **Language**: TypeScript (strict mode)
- **State**: Redux Toolkit + `react-redux` + `redux-persist`
- **Styling**: Tailwind CSS v3 (HSL CSS variables, dark mode via `.dark` class)
- **UI primitives**: hand-written shadcn-style components using `class-variance-authority`
- **Editor**: Monaco via `@monaco-editor/react` (dynamic import, `ssr: false`)
- **Animation**: Framer Motion
- **AI**: `@google/generative-ai`, model `gemini-1.5-flash`, native streaming via `generateContentStream`
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E)
- **Tooling**: ESLint (`next/core-web-vitals` + `next/typescript` + `prettier`), Prettier

## 3. Key Architectural Decisions (and why)

These decisions were made because the locally-installed package versions differ
from the versions assumed by the original spec / training data. Each one was a
deliberate substitution to keep the stack stable and internally consistent.

1. **Next.js pinned to 14.2.35** (not the auto-installed Next 16). Next 16 ships
   with React 19, Tailwind v4, and a generated `AGENTS.md` warning about breaking
   changes — too risky to build a large app against blind. The project was
   re-scaffolded with `create-next-app@14`.
2. **No `src/` directory.** `create-next-app` defaults to `src/app`; this was
   moved back to `./app` and `tsconfig.json` path alias changed from
   `"@/*": ["./src/*"]` to `"@/*": ["./*"]`.
3. **Manual streaming instead of Vercel AI SDK.** The installed `ai` package
   (v6) has a very different API from the one assumed in the spec. Streaming is
   implemented directly with the AI provider's SDK, piped into a native
   `ReadableStream`, returned as a plain `Response`. This is simpler to audit
   and has zero dependency on an SDK whose API may shift again.
4. **AI provider: Google Gemini (`gemini-1.5-flash`).** The project originally
   used `@anthropic-ai/sdk` (Claude). It was swapped for `@google/generative-ai`
   — `lib/anthropic.ts` was deleted and replaced by `lib/gemini.ts`, which
   exports a `GoogleGenerativeAI` client (`GEMINI_API_KEY`), `GEMINI_MODEL =
"gemini-1.5-flash"`, and `MAX_REVIEW_TOKENS`. `app/api/review/route.ts` now
   calls `model.generateContentStream(...)` with `systemInstruction` set to
   `buildSystemPrompt(reviewType)` and the user prompt as the single message
   content; an `AbortController` passed via `requestOptions.signal` replaces
   `claudeStream.controller.abort()` for the `cancel()` path. The JSON
   response schema (`summary`, `score`, `issues[]`, `positives[]`,
   `refactoredSnippet`), `lib/prompts.ts`, `lib/parsers.ts`, Redux state, and
   all UI/streaming components are unchanged — only the provider in the API
   route changed.
5. **No shadcn CLI.** `npx shadcn@latest init` targets Tailwind v4 + `@base-ui`,
   which is incompatible with this project's Tailwind v3 setup. All
   `components/ui/*` primitives (Button, Card, Badge, Select, Tabs, Separator)
   are hand-written using `class-variance-authority` + Tailwind, following
   shadcn's visual conventions and CSS variable naming (`--primary`,
   `--destructive`, etc.), plus two custom tokens (`--warning`, `--success`) for
   severity coloring.
6. **Custom GitHub icon.** `lucide-react` v1.18 removed brand icons (`Github`,
   `Gitlab`, ...). `components/layout/GithubIcon.tsx` is a small inline SVG used
   in the navbar instead.
7. **SSR-safe redux-persist.** `store/storage.ts` returns a no-op storage
   implementation on the server and the real `redux-persist/lib/storage` (backed
   by `localStorage`) on the client, avoiding "window is not defined" errors.
8. **Theme flash avoidance.** `lib/theme-script.ts` exports a small script string
   that's inlined into `<head>` in `app/layout.tsx`. It reads the persisted theme
   from `localStorage` before React hydrates, so there's no light/dark flash.
9. **Selective persistence.** Only the `history` and `ui` slices are persisted
   (`whitelist: ["history", "ui"]`); the in-progress `review` slice (streaming
   text, current code) is intentionally NOT persisted.
10. **Monaco loaded via dynamic import (`ssr: false`)** since it depends on
    browser-only APIs (`window`, `navigator`).
11. **`SplitPane` renders each pane exactly once** (using `useMediaQuery` to
    detect desktop vs. mobile layout) to avoid double-mounting the Monaco editor.

## 4. Folder Structure

```
app/
  api/review/route.ts        Streaming POST endpoint that calls Gemini
  layout.tsx                 Root layout: fonts, theme script, StoreProvider, Navbar
  page.tsx                   Landing page
  globals.css                Tailwind v3 directives + HSL CSS variable theme
  history/page.tsx            History page (wraps HistoryList)
  review/page.tsx             Main review workspace (editor + review panel)
  review/[id]/page.tsx        Read-only view of a single history item

components/
  editor/      CodeEditor, EditorToolbar, LanguageSelector
  review/      SeverityBadge, IssueCard, IssueList, SummaryCard,
               StreamingText, ReviewSkeleton, ReviewPanel
  history/     HistoryItem, HistoryList
  layout/      Navbar, Sidebar, ThemeToggle, SplitPane, GithubIcon
  ui/          button, card, badge, select, tabs, separator (hand-written primitives)

hooks/
  useReview.ts      Runs/cancels the streaming review request, dispatches Redux actions
  useHistory.ts     Load / remove / clear history items
  useTheme.ts       Toggles the `dark` class on <html>, syncs with Redux ui slice
  useMediaQuery.ts  SSR-safe matchMedia hook

lib/
  gemini.ts         Gemini client instance + model/token constants
  prompts.ts        System/user prompt builders + response JSON schema
  parsers.ts        Parses & validates Gemini's JSON response into ReviewResult
  constants.ts      Languages, review types, severity config, category labels
  utils.ts          cn(), formatDate(), truncate(), generateId()
  theme-script.ts   Inline pre-hydration theme script

store/
  index.ts          configureStore + persistReducer (whitelist: history, ui)
  storage.ts        SSR-safe storage adapter for redux-persist
  hooks.ts          Typed useAppDispatch / useAppSelector
  StoreProvider.tsx Client component wrapping <Provider> + <PersistGate>
  slices/
    reviewSlice.ts   Current in-progress review (code, language, status, stream, result)
    historySlice.ts  Saved review history (capped at MAX_HISTORY_ITEMS = 25)
    uiSlice.ts       Theme, sidebar open state, active tab

types/index.ts        All shared TypeScript types/interfaces

tests/
  unit/   reviewSlice, parsers, IssueCard, SummaryCard (Jest + RTL)
  e2e/    review-flow, history (Playwright, mocked /api/review + seeded localStorage)

.github/workflows/
  ci.yml          lint, typecheck, format check, jest, build
  playwright.yml  installs chromium, runs Playwright E2E suite
```

## 5. API Contract — `POST /api/review`

Request body:

```json
{ "code": "...", "language": "javascript", "reviewType": "full" }
```

- Validates `language` against `VALID_LANGUAGES`, `reviewType` against
  `VALID_REVIEW_TYPES`, and enforces `MAX_CODE_LENGTH = 20_000` characters.
- Requires `GEMINI_API_KEY` to be set (returns 500 with a clear error otherwise).
- Calls `model.generateContentStream(...)` (model = `gemini-1.5-flash`) with
  `systemInstruction` set to `buildSystemPrompt(reviewType)` and a single user
  message built by `buildUserPrompt({code, language})`.
- Streams raw text chunks (`chunk.text()` from `geminiStream.stream`) back to the
  client as `text/plain` via a `ReadableStream`. Aborting the request triggers an
  `AbortController` passed via `requestOptions.signal`.
- The client (`hooks/useReview.ts`) accumulates the streamed text, then runs it
  through `lib/parsers.ts#parseReviewResponse` to produce a `ReviewResult`
  matching the schema in `lib/prompts.ts#RESPONSE_SCHEMA`.

## 6. Redux State Shape

- **review**: `{ code, language, reviewType, status, streamedText, parsedResult, error }`
  — not persisted.
- **history**: `{ reviews: ReviewHistoryItem[], selectedId }` — persisted, capped at 25 items.
- **ui**: `{ theme: "dark" | "light", sidebarOpen, activeTab }` — persisted.

## 7. Build Log

Chronological summary of file creation/modification/deletion during the build:

1. **Scaffold**: re-initialized with `create-next-app@14` (TS, Tailwind, ESLint,
   App Router, no `src/`). Moved `app/` out of `src/`, updated `tsconfig.json`.
2. **Config**: rewrote `tailwind.config.ts` (HSL color tokens incl. `warning`/`success`,
   `tailwindcss-animate`), `app/globals.css` (CSS variables for light/dark themes),
   `.eslintrc.json`, added `.prettierrc.json` / `.prettierignore`, `.env.local.example`.
3. **Types**: created `types/index.ts` with all shared interfaces (`ReviewResult`,
   `ReviewIssue`, `Severity`, `IssueCategory`, `ReviewType`, `ReviewHistoryItem`,
   `ReviewRequest`, `CurrentReviewState`, `StreamingState`, etc.).
4. **lib/**: created `constants.ts`, `utils.ts`, `anthropic.ts`, `prompts.ts`,
   `parsers.ts`, `theme-script.ts`.
5. **Redux store**: created `store/slices/{reviewSlice,historySlice,uiSlice}.ts`,
   `store/storage.ts`, `store/index.ts`, `store/hooks.ts`, `store/StoreProvider.tsx`.
6. **API route**: created `app/api/review/route.ts` (streaming AI integration,
   originally Claude — later swapped for Gemini, see item 20).
7. **UI primitives**: created `components/ui/{button,card,badge,select,tabs,separator}.tsx`.
   Initial attempt used the `shadcn` CLI; it was uninstalled
   (`npm uninstall shadcn @base-ui/react tw-animate-css`, removed `components.json`)
   because it generated a Tailwind-v4/oklch theme incompatible with this project.
8. **Editor components**: created `components/editor/{CodeEditor,LanguageSelector,EditorToolbar}.tsx`.
9. **Review components**: created `components/review/{SeverityBadge,IssueCard,IssueList,
SummaryCard,StreamingText,ReviewSkeleton,ReviewPanel}.tsx`.
10. **Hooks**: created `hooks/{useReview,useHistory,useTheme,useMediaQuery}.ts`.
11. **Layout components**: created `components/layout/{Navbar,Sidebar,ThemeToggle,
SplitPane,GithubIcon}.tsx`. `GithubIcon.tsx` was added after discovering
    `lucide-react` v1.18 removed the `Github` export.
12. **Pages**: created/rewrote `app/page.tsx` (landing), `app/review/page.tsx`
    (main workspace), `app/review/[id]/page.tsx` (history detail), `app/history/page.tsx`.
13. **History components**: created `components/history/{HistoryItem,HistoryList}.tsx`.
14. **Root layout**: rewrote `app/layout.tsx` — local Geist fonts via `next/font/local`
    (Google font versions unavailable for Next 14.2.35), inline theme script, `StoreProvider`, `Navbar`.
15. **Testing setup**: created `jest.config.ts`, `jest.setup.ts`,
    `tests/unit/{reviewSlice,parsers,IssueCard,SummaryCard}.test.ts(x)`.
16. **E2E setup**: created `playwright.config.ts`,
    `tests/e2e/{review-flow,history}.spec.ts`.
17. **CI**: created `.github/workflows/ci.yml` and `.github/workflows/playwright.yml`.
18. **Fixes**:
    - `select.tsx`: changed `interface SelectProps extends ... {}` to
      `type SelectProps = SelectHTMLAttributes<HTMLSelectElement>` (ESLint
      `no-empty-object-type`).
    - `button.tsx`: exported `buttonVariants` so `app/page.tsx` can style a
      `<Link>` as a button via `cn(buttonVariants({ size: "lg" }))` (no `asChild` support).
    - Ran `prettier --write .` to fix formatting across 24 files.
19. **Docs**: created this `CLAUDE.md` and rewrote `README.md`.
20. **AI provider migration (Claude → Gemini)**: ran `npm uninstall
@anthropic-ai/sdk` and `npm install @google/generative-ai`. Deleted
    `lib/anthropic.ts`, created `lib/gemini.ts` (exports `gemini`
    (`GoogleGenerativeAI` client), `GEMINI_MODEL = "gemini-1.5-flash"`,
    `MAX_REVIEW_TOKENS`). Rewrote `app/api/review/route.ts` to use
    `model.generateContentStream(...)` with `systemInstruction` and an
    `AbortController`-based `cancel()`. Updated `.env.local.example` to
    `GEMINI_API_KEY`, and updated `.github/workflows/{ci,playwright}.yml` to set
    `GEMINI_API_KEY` for builds. No changes to `lib/prompts.ts`,
    `lib/parsers.ts`, Redux slices, hooks, or any UI components — the JSON
    response schema and streaming UX are unchanged.

## 8. Verification Status

- `npx tsc --noEmit` — passes
- `npm run lint` — passes, 0 warnings
- `npm run format:check` — passes
- `npx jest` — 29/29 tests pass across 4 suites
- `npm run build` — succeeds, all 6 routes compile (`/`, `/_not-found`, `/api/review`,
  `/history`, `/review`, `/review/[id]`)
- `npm run test:e2e` — Playwright suite written but not run in this environment.

## 9. Maintenance Notes

- When adding a new file or folder, add a one-line entry to the Build Log (§7)
  describing what it does and why it was added.
- When deleting a file, remove its entry from the Folder Structure (§4) and add
  a short Build Log note explaining the removal.
- Keep §3 (Architectural Decisions) updated if a dependency substitution is
  replaced with the "standard" approach in the future (e.g. if shadcn CLI
  becomes compatible with Tailwind v3 again).
