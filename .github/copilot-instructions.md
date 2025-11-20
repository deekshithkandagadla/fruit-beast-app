# Copilot Instructions — fruit-beast-app

This file helps an AI agent be productive quickly in this repository. It merges existing notes with concrete, discoverable patterns and examples from the codebase.

Quick facts
- Framework: React (Vite) — entry `src/main.jsx`, root `src/App.jsx`.
- Styling: Tailwind CSS (see `tailwind.config.js`, `postcss.config.js`) — utilities used throughout `src/*.jsx`.
- Hosting / backend: Firebase (Firestore) — client init in `src/firebase.js` (exports `db`, `auth`).
- Scripts: see `package.json` (dev/build/preview/lint). Use `npm run dev` to start.

Key integration points & patterns
- Firestore collection: `fruitLogs` (queries in `src/App.jsx` — onSnapshot + ordering by `date`). Use this name when adding server-side rules or mock data.
- Camera / uploads: `CameraView` in `src/App.jsx` uses `navigator.mediaDevices.getUserMedia` and produces PNG files. File-to-base64 helper `toBase64(file)` is used to send image bytes to AI services.
- AI integrations: image/text calls expect an env var `VITE_GEMINI_API_KEY` (used in `vite.config.js` define and in `src/App.jsx`). Keep secrets out of the repo and set them in the environment or deployment pipeline.
- Gemini endpoints are called directly from the client in this app (note: for production, route through a secure server to protect API keys).

Developer workflows (concrete)
- Install: `npm install`
- Start dev server: `npm run dev` (Vite + React HMR)
- Build production: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint` (eslint configured; failures are treated as errors by `--max-warnings 0`)
- Tailwind init helper: `npm run tailwind-init`

Project-specific conventions
- Components live directly under `src/` (e.g., `FruitLogForm.jsx`, `FruitLogList.jsx`, `ZipCodeDialog.jsx`). Follow existing naming and default-export pattern.
- UI uses Tailwind utility classes; prefer adding small JSX helper components (see `BoldRenderer` in `src/App.jsx`) instead of creating global CSS classes unless necessary.
- No test runner configured. If you add tests, document scripts in `package.json` and keep them opt-in.

Examples (copyable guidance for edits)
- To add a new component and render it: create `src/MyWidget.jsx` (default export), then import in `src/App.jsx` and add to the main render tree.
- To read/write logs to Firestore: use `collection(db, 'fruitLogs')`, `addDoc(...)` and `onSnapshot(query(collection(db, 'fruitLogs'), orderBy('date', 'desc')))` — see `App.jsx` for exact usage.
- To call Gemini from local dev: set env var in a `.env` file (Vite reads VITE_ prefixed vars) as `VITE_GEMINI_API_KEY=your_key_here` and run `npm run dev`.

Safety & operational notes for AI agents
- Do not commit secrets (API keys) — the repo currently includes a placeholder Firebase config in `src/firebase.js`; real credentials should be provided via environment or CI.
- The app currently talks to generative APIs directly from the client. If you propose changes that move API keys to server code, note suggested secure design and file locations.

Files to consult for context (most relevant)
- `src/App.jsx` — primary application logic, UI flows, AI prompts, and Firestore usage (main reference for behavior)
- `src/firebase.js` — Firebase initialization and exported `db`/`auth`
- `package.json` — scripts and dependency versions (React 19, Vite, Tailwind)
- `vite.config.js` — Vite plugin usage and env defines
- `tailwind.config.js`, `postcss.config.js` — styling config

When updating this file
- Preserve the “Quick facts” and concrete examples above. Keep guidance short (20–50 lines). Add one-line references to new files if you add behavior that affects runtime (e.g., server proxies, new env vars).

If anything here is unclear or you'd like more examples (e.g., typical Firestore rules, suggested server proxy for Gemini calls, or a sample `.env` template), tell me which area to expand and I'll update this file.
