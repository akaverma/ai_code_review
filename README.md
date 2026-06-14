# AI-Powered Code Review Dashboard

A production-grade code review tool that streams real-time, AI-generated
feedback from Gemini. Paste or upload code, pick a language and review type,
and get a severity-ranked breakdown of issues, an overall score, and concrete
fix suggestions — all streamed token-by-token as Gemini generates them.

## Features

- **Real-time streaming review** — responses stream directly from Gemini as they're generated
- **4 review modes** — Full Review, Security Audit, Performance Check, Quick Scan
- **Severity-coded issues** — critical / warning / info, each with a category
  (security, performance, maintainability, readability, bug, best-practice),
  line number, description, and a concrete suggested fix
- **Animated score ring** — 0-100 score with color thresholds (success / warning / destructive)
- **Multi-language support** — JavaScript, TypeScript, JSX, TSX, Python, Go, Java, CSS
- **Monaco-based editor** — syntax highlighting, file upload, language auto-detection
- **Persisted review history** — last 25 reviews saved locally via `redux-persist`,
  revisit any past review and reload it into the editor
- **Dark / light mode** — persisted, with no flash-of-wrong-theme on load
- **Responsive split-pane layout** — resizable on desktop, stacked on mobile

## Tech Stack

| Layer     | Choice                                                                             |
| --------- | ---------------------------------------------------------------------------------- |
| Framework | Next.js 14 (App Router), TypeScript (strict)                                       |
| State     | Redux Toolkit, React Redux, redux-persist                                          |
| Styling   | Tailwind CSS v3, hand-written shadcn-style primitives (`class-variance-authority`) |
| Editor    | Monaco (`@monaco-editor/react`, dynamic import)                                    |
| AI        | Google Gemini (`gemini-1.5-flash`), streaming via `@google/generative-ai`          |
| Animation | Framer Motion                                                                      |
| Testing   | Jest + React Testing Library, Playwright                                           |
| Tooling   | ESLint, Prettier                                                                   |

See [CLAUDE.md](./CLAUDE.md) for the full build log, folder structure, and the
reasoning behind specific architectural decisions.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API key

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and set your Gemini API key:

```
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to **Review**, paste
some code, choose a language and review type, and click **Review Code**.

## Available Scripts

| Script                 | Description                      |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the Next.js dev server     |
| `npm run build`        | Production build                 |
| `npm run start`        | Run the production build         |
| `npm run lint`         | ESLint                           |
| `npm run format`       | Format all files with Prettier   |
| `npm run format:check` | Check formatting without writing |
| `npm test`             | Run Jest unit tests              |
| `npm run test:watch`   | Run Jest in watch mode           |
| `npm run test:e2e`     | Run Playwright E2E tests         |

## Project Structure

```
app/                  Routes (landing, review, history, API route)
components/           UI components (editor, review, history, layout, ui)
hooks/                Custom React hooks (useReview, useHistory, useTheme, useMediaQuery)
lib/                   Gemini client, prompts, response parsing, constants, utils
store/                Redux store, slices, persistence setup
types/                Shared TypeScript types
tests/unit/           Jest + React Testing Library tests
tests/e2e/            Playwright end-to-end tests
```

## How It Works

1. The user pastes/uploads code, picks a `language` and `reviewType`, and clicks
   **Review Code**.
2. The client POSTs `{ code, language, reviewType }` to `/api/review`.
3. The API route builds a system prompt (instructing Gemini to act as a senior
   reviewer and return a strict JSON schema) and streams Gemini's response back
   as plain text.
4. The client appends each chunk to Redux state (`streamedText`), rendering it
   live in a `<StreamingText />` view.
5. Once the stream ends, the accumulated text is parsed (`lib/parsers.ts`) into a
   `ReviewResult` — summary, score, issues, positives, and an optional refactored
   snippet — and rendered as a score ring + sorted issue list.
6. The completed review is saved to the persisted history sidebar.

## Testing

```bash
npm test          # unit tests (Jest + RTL)
npm run test:e2e  # end-to-end tests (Playwright)
```

Unit tests cover the Redux `reviewSlice`, the response parser (`lib/parsers.ts`),
and the `IssueCard` / `SummaryCard` components. E2E tests cover the full review
flow (with a mocked `/api/review`), history persistence/reload, and theme toggling.

## Deployment

This app is ready to deploy on [Vercel](https://vercel.com/new). Set the
`GEMINI_API_KEY` environment variable in your project settings — the
`/api/review` route runs on the Node.js runtime and requires it at request time.
